<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\CashierShiftService;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Tests\TestCase;

/**
 * Guards the offline-sync path from the POS page.
 *
 * Found by driving the real app in a browser: POST /api/v1/pos/transactions/sync
 * returned 401, because the POS page is session-authenticated and auth:sanctum
 * only accepted a Bearer token. Queued offline sales were stranded in IndexedDB
 * forever, silently. PosTransactionSyncTest did not catch it because
 * Sanctum::actingAs() fakes a token.
 *
 * NOTE: a feature test cannot reproduce the 401. With the browser's Referer and
 * Origin headers the test still passes whether or not Sanctum::stateful() is
 * registered, because the test harness treats the request as stateful by
 * another path. Verified directly over HTTP instead: 401 without the middleware,
 * 200 with it, same port. So the regression guard here asserts the middleware is
 * actually registered rather than pretending to be an end-to-end reproduction.
 */
class PosOfflineSyncSessionTest extends TestCase
{
    use RefreshDatabase;

    private User $cashier;

    private Warehouse $warehouse;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
        $this->seed(UserSeeder::class);

        $this->cashier = User::where('email', 'cashier.nelsha@gmail.com')->firstOrFail();
        $this->warehouse = Warehouse::firstOrCreate(
            ['code' => 'PUSAT'],
            ['name' => 'Gudang Pusat', 'type' => 'main', 'is_active' => true, 'sort_order' => 0]
        );

        $category = Category::firstOrCreate(['name' => 'Umum'], ['description' => 'umum']);

        $this->product = Product::firstOrCreate(
            ['title' => 'Produk Offline Sync'],
            [
                'image' => null,
                'barcode' => 'OFFLINE-SYNC-1',
                'sku' => 'OFFLINE-SYNC-1',
                'description' => 'produk untuk uji sinkronisasi offline',
                'category_id' => $category->id,
                'buy_price' => 10000,
                'sell_price' => 15000,
                'stock' => 20,
                'tax_rate' => 0,
            ]
        );

        $this->product->warehouses()->syncWithoutDetaching([
            $this->warehouse->id => ['stock' => 20],
        ]);

        app(CashierShiftService::class)->openShift(
            $this->cashier,
            $this->cashier,
            0,
            null,
            $this->warehouse->id
        );
    }

    public function test_api_group_registers_sanctum_stateful_middleware(): void
    {
        // Removing $middleware->statefulApi() from bootstrap/app.php breaks offline
        // sync from the POS page. This locks that line in place.
        $groups = app(Kernel::class)->getMiddlewareGroups();

        $this->assertContains(
            EnsureFrontendRequestsAreStateful::class,
            $groups['api'] ?? [],
            'the api group must be stateful, otherwise offline sync 401s'
        );
    }

    public function test_pos_sync_accepts_a_plain_session_cookie_without_a_bearer_token(): void
    {
        $this->cashier->markEmailAsVerified();

        // Log in the way the browser does: web session, no API token.
        $this->actingAs($this->cashier);

        $this->assertNull(
            $this->cashier->currentAccessToken(),
            'precondition: this test must not carry an API token'
        );

        // axios sends Referer/Origin on every request; Sanctum decides whether a
        // request is a "frontend" request from those headers, so a bare postJson
        // does not reproduce what the POS page actually does.
        $response = $this->withHeaders([
            'Referer' => config('app.url').'/dashboard/transactions',
            'Origin' => config('app.url'),
            'X-Requested-With' => 'XMLHttpRequest',
        ])->postJson('/api/v1/pos/transactions/sync', [
            'transactions' => [[
                'queue_id' => 1,
                'client_uuid' => '11111111-2222-3333-4444-555555555555',
                'customer_id' => null,
                'items' => [[
                    'product_id' => $this->product->id,
                    'qty' => 2,
                ]],
                'payment_method' => 'cash',
                'grand_total' => 30000,
                'cash' => 30000,
            ]],
        ]);

        // Before Sanctum::stateful() this was 401 and the row stayed queued forever.
        $response->assertOk();

        $results = $response->json('data.results');
        $this->assertCount(1, $results);
        $this->assertContains(
            $results[0]['status'],
            ['synced', 'pending_approval', 'duplicate'],
            'a queued sale with stock available must sync, not fail'
        );
    }

    public function test_pos_sync_still_rejects_guests(): void
    {
        $this->postJson('/api/v1/pos/transactions/sync', [
            'transactions' => [],
        ])->assertUnauthorized();
    }
}
