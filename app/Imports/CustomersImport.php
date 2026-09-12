<?php

namespace App\Imports;

use App\Models\Customer;
use App\Support\PhoneNumber;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CustomersImport implements ToModel, WithChunkReading, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return Customer::updateOrCreate(
            ['no_telp' => PhoneNumber::normalize((string) ($row['telepon'] ?? ''))],
            [
                'name' => $row['nama'],
                'address' => $row['alamat'],
            ]
        );
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:255'],
            'telepon' => ['required', 'string', 'max:20'],
            'alamat' => ['required', 'string'],
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama.required' => 'Nama customer wajib diisi.',
            'telepon.required' => 'Telepon customer wajib diisi.',
            'alamat.required' => 'Alamat customer wajib diisi.',
        ];
    }

    public function chunkSize(): int
    {
        return 100;
    }
}
