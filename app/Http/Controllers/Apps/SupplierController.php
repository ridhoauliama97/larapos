<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::orderBy('name')->get();

        return Inertia::render('Dashboard/Suppliers/Index', [
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
        ]);

        Supplier::create($data);

        return back()->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
        ]);

        $supplier->update($data);

        return back()->with('success', 'Supplier berhasil diperbarui.');
    }

    public function destroy(Supplier $supplier)
    {
        if ($supplier->payables()->exists()) {
            return back()->with('error', 'Supplier memiliki hutang, tidak dapat dihapus.');
        }

        // prevent deleting suppliers that are still referenced by purchasing documents (FK restrict)
        if (
            DB::table('purchase_orders')->where('supplier_id', $supplier->id)->exists()
            || DB::table('goods_receivings')->where('supplier_id', $supplier->id)->exists()
            || DB::table('supplier_returns')->where('supplier_id', $supplier->id)->exists()
        ) {
            return back()->with('error', 'Supplier tidak dapat dihapus karena masih memiliki dokumen terkait.');
        }

        $supplier->delete();

        return back()->with('success', 'Supplier dihapus.');
    }
}
