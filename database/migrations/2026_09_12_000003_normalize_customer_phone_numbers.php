<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('customers')
            ->select(['id', 'no_telp'])
            ->orderBy('id')
            ->chunkById(100, function ($customers) {
                foreach ($customers as $customer) {
                    $digits = preg_replace('/[^0-9]/', '', (string) $customer->no_telp);

                    if ($digits === '' || $digits === (string) $customer->no_telp) {
                        continue;
                    }

                    $exists = DB::table('customers')
                        ->where('no_telp', $digits)
                        ->where('id', '!=', $customer->id)
                        ->exists();

                    if (! $exists) {
                        DB::table('customers')->where('id', $customer->id)->update(['no_telp' => $digits]);
                    }
                }
            });
    }

    public function down(): void
    {
        // Normalization is not reversible.
    }
};
