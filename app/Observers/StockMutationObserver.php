<?php

namespace App\Observers;

use App\Models\StockMutation;
use App\Services\NotificationService;

class StockMutationObserver
{
    /**
     * Reference types whose flows already emit their own notification.
     *
     * @var array<int, string>
     */
    private const SKIPPED_REFERENCE_TYPES = ['stock_transfer', 'product_create'];

    /**
     * Handle the StockMutation "created" event.
     */
    public function created(StockMutation $mutation): void
    {
        if (in_array($mutation->reference_type, self::SKIPPED_REFERENCE_TYPES, true)) {
            return;
        }

        $mutation->loadMissing('product');
        $product = $mutation->product;

        if (! $product) {
            return;
        }

        $service = app(NotificationService::class);

        $service->notifyPermission('stock-mutations-access', [
            'type' => 'stock_mutation',
            'title' => 'Mutasi stok: '.$product->title,
            'message' => "{$mutation->mutation_type} {$mutation->qty} (stok {$mutation->stock_before} -> {$mutation->stock_after})",
            'url' => route('stock-mutations.index'),
            'meta' => [
                'stock_mutation_id' => $mutation->id,
                'product_id' => $product->id,
            ],
        ]);

        $service->checkLowStock($product);
    }
}
