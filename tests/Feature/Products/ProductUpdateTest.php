<?php

namespace Tests\Feature\Products;

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductUpdateTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class, UserSeeder::class]);

        $this->admin = User::where('email', 'admin.nelsha@gmail.com')->firstOrFail();
        $this->admin->markEmailAsVerified();

        $this->category = Category::create([
            'name' => 'Kategori Test',
            'image' => 'categories/test.jpg',
            'description' => 'Kategori untuk test',
        ]);
    }

    private function payload(Product $product, array $overrides = []): array
    {
        return array_merge([
            '_method' => 'PUT',
            'image' => '',
            'barcode' => $product->barcode,
            'sku' => $product->sku,
            'title' => 'Nama Produk Baru',
            'description' => 'Deskripsi baru.',
            'category_id' => $this->category->id,
            'buy_price' => 5000,
            'sell_price' => 10000,
            'min_stock' => '',
            'max_stock' => '',
            'tax_type' => 'exclusive',
            'tax_rate' => '11',
            'is_composite' => false,
            'components' => [],
            'units' => [],
        ], $overrides);
    }

    public function test_update_with_form_payload_succeeds(): void
    {
        Storage::fake('local');

        $product = Product::create([
            'image' => 'product.png',
            'barcode' => 'BRCD-UPDATE-1',
            'sku' => 'sku-update-1',
            'title' => 'Nama Lama',
            'description' => 'Deskripsi lama.',
            'category_id' => $this->category->id,
            'buy_price' => 1000,
            'sell_price' => 2000,
            'stock' => 10,
            'tax_rate' => 0,
        ]);

        $response = $this->actingAs($this->admin)->post(
            route('products.update', $product),
            $this->payload($product)
        );

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('products.index'));

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'title' => 'Nama Produk Baru',
            'image' => 'product.png',
        ]);
    }

    public function test_update_with_existing_units_succeeds(): void
    {
        Storage::fake('local');

        $unit = Unit::create([
            'code' => 'U'.uniqid(),
            'name' => 'Pieces',
            'symbol' => 'pcs',
        ]);

        $product = Product::create([
            'image' => 'product.png',
            'barcode' => 'BRCD-UPDATE-2',
            'sku' => 'sku-update-2',
            'title' => 'Nama Lama',
            'description' => 'Deskripsi lama.',
            'category_id' => $this->category->id,
            'buy_price' => 1000,
            'sell_price' => 2000,
            'stock' => 10,
            'tax_rate' => 0,
        ]);

        $product->units()->attach($unit->id, [
            'is_base' => true,
            'conversion_factor' => 1,
            'buy_price' => 1000,
            'sell_price' => 2000,
            'barcode' => '',
        ]);

        $response = $this->actingAs($this->admin)->post(
            route('products.update', $product),
            $this->payload($product, [
                'units' => [[
                    'unit_id' => $unit->id,
                    'is_base' => true,
                    'conversion_factor' => 1,
                    'sell_price' => 2000,
                    'barcode' => '',
                ]],
            ])
        );

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('products.index'));
    }

    public function test_update_generates_sku_when_missing(): void
    {
        Storage::fake('local');

        $product = Product::create([
            'image' => 'product.png',
            'barcode' => 'BRCD-UPDATE-3',
            'sku' => null,
            'title' => 'Nama Lama',
            'description' => 'Deskripsi lama.',
            'category_id' => $this->category->id,
            'buy_price' => 1000,
            'sell_price' => 2000,
            'stock' => 10,
            'tax_rate' => 0,
        ]);

        $response = $this->actingAs($this->admin)->post(
            route('products.update', $product),
            $this->payload($product)
        );

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('products.index'));

        $this->assertSame(
            'nama-produk-baru',
            Product::findOrFail($product->id)->sku
        );
    }
}
