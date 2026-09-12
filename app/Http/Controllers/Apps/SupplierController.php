<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Support\PhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::when(request()->search, function ($suppliers) {
            $search = request()->search;
            $suppliers = $suppliers->where(function ($query) use ($search) {
                $query
                    ->where('name', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        })->orderBy('name')->paginate($this->perPage())->withQueryString();

        return Inertia::render('Dashboard/Suppliers/Index', [
            'suppliers' => $suppliers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Suppliers/Create', [
            'provinces' => Province::select('code', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->merge(['phone' => PhoneNumber::normalize($request->input('phone'))]);

        $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['required', 'string'],
            ...$this->regionRules(),
        ]);

        Supplier::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            ...$this->regionPayload($request),
        ]);

        return to_route('suppliers.index')->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('Dashboard/Suppliers/Edit', [
            'supplier' => $supplier,
            'provinces' => $this->provinces(),
            'regencies' => $this->regencies($supplier->province_id),
            'districts' => $this->districts($supplier->regency_id),
            'villages' => $this->villages($supplier->district_id),
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $request->merge(['phone' => PhoneNumber::normalize($request->input('phone'))]);

        $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['required', 'string'],
            ...$this->regionRules(),
        ]);

        $supplier->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            ...$this->regionPayload($request),
        ]);

        return to_route('suppliers.index')->with('success', 'Supplier berhasil diperbarui.');
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

    private function regionRules(): array
    {
        return [
            'province_id' => ['required', 'string'],
            'regency_id' => ['required', 'string'],
            'district_id' => ['required', 'string'],
            'village_id' => ['required', 'string'],
        ];
    }

    private function regionPayload(Request $request): array
    {
        return [
            'province_id' => $request->province_id,
            'province_name' => Province::where('code', $request->province_id)->value('name'),
            'regency_id' => $request->regency_id,
            'regency_name' => City::where('code', $request->regency_id)->value('name'),
            'district_id' => $request->district_id,
            'district_name' => District::where('code', $request->district_id)->value('name'),
            'village_id' => $request->village_id,
            'village_name' => Village::where('code', $request->village_id)->value('name'),
        ];
    }

    private function provinces()
    {
        return Province::select('code', 'name')->orderBy('name')->get();
    }

    private function regencies(?string $provinceId)
    {
        return $provinceId
            ? City::where('province_code', $provinceId)->select('code', 'name')->orderBy('name')->get()
            : [];
    }

    private function districts(?string $regencyId)
    {
        return $regencyId
            ? District::where('city_code', $regencyId)->select('code', 'name')->orderBy('name')->get()
            : [];
    }

    private function villages(?string $districtId)
    {
        return $districtId
            ? Village::where('district_code', $districtId)->select('code', 'name')->orderBy('name')->get()
            : [];
    }
}
