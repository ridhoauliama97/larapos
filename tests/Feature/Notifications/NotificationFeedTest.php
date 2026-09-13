<?php

namespace Tests\Feature\Notifications;

use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\SystemNotification;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Auth\Events\Failed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class NotificationFeedTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class, UserSeeder::class]);
    }

    public function test_feed_returns_unread_count_and_notifications_for_authenticated_user(): void
    {
        $admin = $this->admin();

        $admin->notify(new SystemNotification(
            type: 'transaction',
            title: 'Transaksi baru TRX-FEED-1',
            message: 'Total 25000',
            url: route('transactions.history'),
            meta: ['transaction_id' => 1],
        ));

        $admin->notify(new SystemNotification(
            type: 'low_stock',
            title: 'Stok menipis: Produk Feed',
            message: 'Sisa 1 (min 5)',
            url: route('products.index'),
            meta: ['product_id' => 1],
        ));

        $admin->notifications()
            ->where('data->title', 'Stok menipis: Produk Feed')
            ->firstOrFail()
            ->markAsRead();

        $response = $this->actingAs($admin)->getJson(route('notifications.feed'));

        $response->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonCount(2, 'notifications')
            ->assertJsonStructure([
                'unread_count',
                'notifications' => [
                    ['id', 'type', 'title', 'message', 'url', 'read_at', 'created_at'],
                ],
            ]);

        $notifications = collect($response->json('notifications'));

        $this->assertTrue($notifications->pluck('title')->contains('Transaksi baru TRX-FEED-1'));
        $this->assertTrue($notifications->pluck('title')->contains('Stok menipis: Produk Feed'));

        $readNotification = $notifications->firstWhere('title', 'Stok menipis: Produk Feed');
        $this->assertNotNull($readNotification['read_at']);
        $this->assertNotNull($notifications->firstWhere('title', 'Transaksi baru TRX-FEED-1')['created_at']);
    }

    public function test_transaction_observer_notifies_reports_access_users_and_reports_low_stock(): void
    {
        $admin = $this->admin();
        $cashier = $this->cashier();
        $product = $this->createProduct(stock: 5, minStock: 5);

        DB::transaction(function () use ($cashier, $product) {
            $transaction = Transaction::create([
                'cashier_id' => $cashier->id,
                'invoice' => 'TRX-'.Str::upper(Str::random(8)),
                'cash' => 15000,
                'change' => 0,
                'discount' => 0,
                'grand_total' => 15000,
                'payment_method' => 'cash',
                'payment_status' => 'paid',
            ]);

            $transaction->details()->create([
                'product_id' => $product->id,
                'qty' => 1,
                'price' => 15000,
            ]);
        });

        $transactionNotification = $admin->notifications()
            ->where('data->type', 'transaction')
            ->first();

        $this->assertNotNull($transactionNotification);
        $this->assertStringContainsString('Transaksi baru TRX-', $transactionNotification->data['title']);
        $this->assertSame('Total 15000', $transactionNotification->data['message']);
        $this->assertSame(route('transactions.history'), $transactionNotification->data['url']);

        $lowStockNotification = $admin->notifications()
            ->where('data->type', 'low_stock')
            ->where('data->meta->product_id', $product->id)
            ->first();

        $this->assertNotNull($lowStockNotification);
        $this->assertSame('Stok menipis: '.$product->title, $lowStockNotification->data['title']);
        $this->assertSame('Sisa 5 (min 5)', $lowStockNotification->data['message']);
    }

    public function test_failed_login_event_notifies_super_admins(): void
    {
        $admin = $this->admin();
        $cashier = $this->cashier();

        event(new Failed('web', null, ['email' => 'intruder@example.test']));

        $notification = $admin->notifications()->first();

        $this->assertNotNull($notification);
        $this->assertSame('security', $notification->data['type']);
        $this->assertSame('Percobaan login gagal', $notification->data['title']);
        $this->assertStringContainsString('intruder@example.test', $notification->data['message']);
        $this->assertStringContainsString('dari IP', $notification->data['message']);
        $this->assertSame(route('audit-logs.index'), $notification->data['url']);
        $this->assertSame(0, $cashier->notifications()->count());
    }

    public function test_mark_read_and_mark_all_read_update_the_current_user_notifications(): void
    {
        $admin = $this->admin();

        $admin->notify(new SystemNotification(type: 'transaction', title: 'Notifikasi Satu', message: 'Total 1'));
        $admin->notify(new SystemNotification(type: 'transaction', title: 'Notifikasi Dua', message: 'Total 2'));

        $notification = $admin->notifications()
            ->where('data->title', 'Notifikasi Satu')
            ->firstOrFail();

        $this->actingAs($admin)
            ->postJson(route('notifications.read', $notification->id))
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertNotNull($notification->fresh()->read_at);
        $this->assertSame(1, $admin->unreadNotifications()->count());

        $this->actingAs($admin)
            ->postJson(route('notifications.read.all'))
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertSame(0, $admin->unreadNotifications()->count());

        $this->actingAs($admin)
            ->postJson(route('notifications.read', (string) Str::uuid()))
            ->assertNotFound();
    }

    private function admin(): User
    {
        return User::where('email', 'admin.nelsha@gmail.com')->firstOrFail();
    }

    private function cashier(): User
    {
        return User::where('email', 'cashier.nelsha@gmail.com')->firstOrFail();
    }

    private function createProduct(int $stock = 25, int $minStock = 0): Product
    {
        $category = Category::create([
            'name' => 'Kategori Notifikasi',
            'description' => 'Kategori pengujian notifikasi',
            'image' => 'category.png',
        ]);

        return Product::create([
            'category_id' => $category->id,
            'image' => 'product.png',
            'barcode' => 'BRCD-'.Str::upper(Str::random(10)),
            'title' => 'Produk Notifikasi',
            'description' => 'Deskripsi produk notifikasi.',
            'buy_price' => 1000,
            'sell_price' => 2000,
            'stock' => $stock,
            'min_stock' => $minStock,
            'tax_rate' => 0,
        ]);
    }
}
