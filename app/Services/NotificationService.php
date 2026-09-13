<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Notifications\DatabaseNotification;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Spatie\Permission\Exceptions\RoleDoesNotExist;

class NotificationService
{
    /**
     * Send a system notification to every user holding the given permission.
     *
     * @param  array<string, mixed>  $data
     */
    public function notifyPermission(string $permission, array $data, ?int $exceptUserId = null): void
    {
        try {
            $users = User::permission($permission)->get();
        } catch (PermissionDoesNotExist) {
            return;
        }

        foreach ($users as $user) {
            if ($exceptUserId !== null && $user->id === $exceptUserId) {
                continue;
            }

            $this->send($user, $data);
        }
    }

    /**
     * Send a system notification to every user with the super-admin role.
     *
     * @param  array<string, mixed>  $data
     */
    public function notifySuperAdmins(array $data, ?int $exceptUserId = null): void
    {
        try {
            $users = User::role('super-admin')->get();
        } catch (RoleDoesNotExist) {
            return;
        }

        foreach ($users as $user) {
            if ($exceptUserId !== null && $user->id === $exceptUserId) {
                continue;
            }

            $this->send($user, $data);
        }
    }

    /**
     * Notify stock watchers when a product reaches or drops below its minimum stock.
     */
    public function checkLowStock(Product $product): void
    {
        if ($product->min_stock <= 0 || $product->stock > $product->min_stock) {
            return;
        }

        // Skip when an unread low-stock notification for this product already exists.
        $alreadyNotified = DatabaseNotification::whereNull('read_at')
            ->where('data->type', 'low_stock')
            ->where('data->meta->product_id', $product->id)
            ->exists();

        if ($alreadyNotified) {
            return;
        }

        $this->notifyPermission('stock-mutations-access', [
            'type' => 'low_stock',
            'title' => 'Stok menipis: '.$product->title,
            'message' => "Sisa {$product->stock} (min {$product->min_stock})",
            'url' => route('products.index'),
            'meta' => ['product_id' => $product->id],
        ]);
    }

    /**
     * Deliver the payload to a single user as a database notification.
     *
     * @param  array<string, mixed>  $data
     */
    private function send(User $user, array $data): void
    {
        $user->notify(new SystemNotification(
            type: $data['type'],
            title: $data['title'],
            message: $data['message'],
            url: $data['url'] ?? null,
            meta: $data['meta'] ?? [],
        ));
    }
}
