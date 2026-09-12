<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductWarehouse;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ProductsImport implements ToModel, WithChunkReading, WithHeadingRow, WithValidation
{
    private int $rowCount = 0;

    private bool $warehouseResolved = false;

    private ?Warehouse $defaultWarehouse = null;

    /** @var array<string, int> */
    private array $categoryIds = [];

    public function model(array $row)
    {
        $this->rowCount++;

        return DB::transaction(function () use ($row) {
            $categoryName = trim((string) ($row['kategori'] ?? '')) ?: 'Umum';

            $categoryId = $this->categoryIds[$categoryName] ??= Category::firstOrCreate(
                ['name' => $categoryName],
                ['description' => '', 'image' => 'default.png']
            )->id;

            $barcode = (string) ($row['barcode'] ?? '');
            $stock = (int) ($row['stok'] ?? 0);

            $product = Product::updateOrCreate(
                ['barcode' => $barcode],
                [
                    'sku' => $row['sku'] ?? $barcode,
                    'title' => $row['nama'] ?? '',
                    'description' => $row['deskripsi'] ?? '',
                    'category_id' => $categoryId,
                    'buy_price' => (int) ($row['harga_beli'] ?? 0),
                    'sell_price' => (int) ($row['harga_jual'] ?? 0),
                    'stock' => $stock,
                    'min_stock' => (int) ($row['min_stok'] ?? 0),
                    'max_stock' => (int) ($row['max_stok'] ?? 0),
                    'tax_type' => $row['tipe_pajak'] ?? 'exclusive',
                    'tax_rate' => (float) ($row['tarif_pajak'] ?? 11.00),
                ]
            );

            if ($warehouse = $this->defaultWarehouse()) {
                ProductWarehouse::updateOrCreate(
                    ['product_id' => $product->id, 'warehouse_id' => $warehouse->id],
                    ['stock' => $stock]
                );
            }

            return $product;
        });
    }

    public function rules(): array
    {
        return [
            'barcode' => ['required'],
            'nama' => ['required', 'string', 'max:255'],
            'harga_beli' => ['nullable', 'numeric', 'min:0'],
            'harga_jual' => ['nullable', 'numeric', 'min:0'],
            'stok' => ['nullable', 'integer', 'min:0'],
            'min_stok' => ['nullable', 'integer', 'min:0'],
            'max_stok' => ['nullable', 'integer', 'min:0'],
            'tipe_pajak' => ['nullable', 'in:exclusive,inclusive'],
            'tarif_pajak' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function customValidationMessages()
    {
        return [
            'barcode.required' => 'Barcode wajib diisi.',
            'barcode.unique' => 'Barcode sudah terdaftar.',
            'nama.required' => 'Nama produk wajib diisi.',
        ];
    }

    public function chunkSize(): int
    {
        return 100;
    }

    public function getRowCount(): int
    {
        return $this->rowCount;
    }

    private function defaultWarehouse(): ?Warehouse
    {
        if (! $this->warehouseResolved) {
            $this->defaultWarehouse = Warehouse::active()
                ->where('type', 'main')
                ->orderBy('sort_order')
                ->orderBy('code')
                ->first()
                ?? Warehouse::active()->orderBy('sort_order')->orderBy('code')->first();

            $this->warehouseResolved = true;
        }

        return $this->defaultWarehouse;
    }
}
