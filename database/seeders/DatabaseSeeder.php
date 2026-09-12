<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            PaymentSettingSeeder::class,
            DineInSettingsSeeder::class,
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->seedDefaultWarehouse();
    }

    private function seedDefaultWarehouse(): void
    {
        $pusat = Warehouse::firstOrCreate(
            ['code' => 'PUSAT'],
            [
                'name' => 'Gudang Pusat',
                'type' => 'main',
                'is_active' => true,
                'sort_order' => 0,
            ],
        );

        if (! Setting::get('setup_warehouse_id')) {
            Setting::set('setup_warehouse_id', $pusat->id);
        }

        DB::table('products')
            ->select(['id', 'stock'])
            ->orderBy('id')
            ->chunkById(500, function ($products) use ($pusat) {
                $now = now();

                $rows = $products->map(fn ($product) => [
                    'product_id' => $product->id,
                    'warehouse_id' => $pusat->id,
                    'stock' => $product->stock,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all();

                DB::table('product_warehouse')->insertOrIgnore($rows);
            });
    }
}
