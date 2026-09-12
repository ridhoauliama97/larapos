<?php

namespace App\Exports;

use App\Models\Customer;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomersExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    public function collection()
    {
        return Customer::orderBy('name')->get();
    }

    public function headings(): array
    {
        return ['Nama', 'Telepon', 'Alamat', 'Provinsi', 'Kota', 'Kecamatan', 'Desa', 'Member', 'Tier', 'Poin'];
    }

    public function map($customer): array
    {
        return [
            SpreadsheetSanitizer::sanitize($customer->name),
            SpreadsheetSanitizer::sanitize($customer->no_telp ?? ''),
            SpreadsheetSanitizer::sanitize($customer->address ?? ''),
            SpreadsheetSanitizer::sanitize($customer->province_name ?? ''),
            SpreadsheetSanitizer::sanitize($customer->regency_name ?? ''),
            SpreadsheetSanitizer::sanitize($customer->district_name ?? ''),
            SpreadsheetSanitizer::sanitize($customer->village_name ?? ''),
            $customer->is_loyalty_member ? 'Ya' : 'Tidak',
            SpreadsheetSanitizer::sanitize($customer->loyalty_tier ?? 'regular'),
            (int) ($customer->loyalty_points ?? 0),
        ];
    }
}
