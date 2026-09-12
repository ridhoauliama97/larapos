<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Running full demo data seeder...');

        $this->call([
            DatabaseSeeder::class,
            UserSeeder::class,
            SampleDataSeeder::class,
            OperationalCoreSeeder::class,
            FeatureCoverageSeeder::class,
            FeatureDemoSeeder::class,
        ]);

        $this->command?->info('Demo data seeder completed.');
        $this->command?->info('Admin: admin.nelsha@gmail.com / password');
        $this->command?->info('Kasir: cashier.nelsha@gmail.com / password');
    }
}
