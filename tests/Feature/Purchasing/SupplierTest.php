<?php

namespace Tests\Feature\Purchasing;

use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class, UserSeeder::class]);

        $this->admin = User::where('email', 'admin.nelsha@gmail.com')->firstOrFail();
        $this->admin->markEmailAsVerified();

        $this->seedRegions();
    }

    private function seedRegions(): void
    {
        $now = now();

        DB::table('indonesia_provinces')->insert([
            'code' => '11',
            'name' => 'ACEH',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('indonesia_cities')->insert([
            'code' => '1101',
            'province_code' => '11',
            'name' => 'KAB. SIMEULUE',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('indonesia_districts')->insert([
            'code' => '1101010',
            'city_code' => '1101',
            'name' => 'TEUPAH SELATAN',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('indonesia_villages')->insert([
            'code' => '1101010001',
            'district_code' => '1101010',
            'name' => 'LATIUNG',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'PT Sumber Pangan',
            'phone' => '0812-3456-7890',
            'email' => 'sales@sumberpangan.test',
            'address' => 'Jl. Industri No. 10',
            'province_id' => '11',
            'regency_id' => '1101',
            'district_id' => '1101010',
            'village_id' => '1101010001',
        ], $overrides);
    }

    public function test_store_creates_supplier_with_resolved_region_names(): void
    {
        $this->actingAs($this->admin)
            ->post(route('suppliers.store'), $this->payload())
            ->assertRedirect(route('suppliers.index'))
            ->assertSessionHasNoErrors();

        $supplier = Supplier::where('name', 'PT Sumber Pangan')->firstOrFail();

        $this->assertSame('081234567890', $supplier->phone);
        $this->assertSame('ACEH', $supplier->province_name);
        $this->assertSame('KAB. SIMEULUE', $supplier->regency_name);
        $this->assertSame('TEUPAH SELATAN', $supplier->district_name);
        $this->assertSame('LATIUNG', $supplier->village_name);
    }

    public function test_store_requires_name_address_and_regions(): void
    {
        $this->actingAs($this->admin)
            ->post(route('suppliers.store'), [
                'name' => '',
                'email' => 'not-an-email',
            ])
            ->assertSessionHasErrors([
                'name',
                'email',
                'address',
                'province_id',
                'regency_id',
                'district_id',
                'village_id',
            ]);
    }

    public function test_update_updates_supplier_and_region(): void
    {
        $supplier = Supplier::create([
            'name' => 'Supplier Lama',
            'address' => 'Alamat lama',
        ]);

        $this->actingAs($this->admin)
            ->put(route('suppliers.update', $supplier), $this->payload([
                'name' => 'PT Sumber Pangan Baru',
            ]))
            ->assertRedirect(route('suppliers.index'))
            ->assertSessionHasNoErrors();

        $supplier->refresh();

        $this->assertSame('PT Sumber Pangan Baru', $supplier->name);
        $this->assertSame('ACEH', $supplier->province_name);
        $this->assertSame('LATIUNG', $supplier->village_name);
    }

    public function test_supplier_pages_render(): void
    {
        $supplier = Supplier::create([
            'name' => 'Supplier Lama',
            'address' => 'Alamat lama',
        ]);

        $this->actingAs($this->admin)
            ->get(route('suppliers.create'))
            ->assertOk();

        $this->actingAs($this->admin)
            ->get(route('suppliers.edit', $supplier))
            ->assertOk();
    }

    public function test_index_searches_suppliers(): void
    {
        Supplier::create(['name' => 'PT Alpha', 'address' => 'Alamat A']);
        Supplier::create(['name' => 'PT Beta', 'address' => 'Alamat B']);

        $this->actingAs($this->admin)
            ->get(route('suppliers.index', ['search' => 'Alpha']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard/Suppliers/Index')
                ->has('suppliers.data', 1)
                ->where('suppliers.data.0.name', 'PT Alpha'));
    }
}
