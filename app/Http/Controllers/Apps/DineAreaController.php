<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\DineArea;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DineAreaController extends Controller
{
    public function index()
    {
        // `name` breaks ties: without it, two areas sharing a sort_order come back in
        // whatever order the database happens to use, so the list can reshuffle between
        // requests. Warehouses already tie-break on `code` in both controllers.
        $areas = DineArea::with('tables')->orderBy('sort_order')->orderBy('name')->get();

        return Inertia::render('Dashboard/DineIn/Areas/Index', [
            'areas' => $areas,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        DineArea::create($validated);

        return back()->with('success', 'Area berhasil ditambahkan.');
    }

    public function update(Request $request, DineArea $dineArea)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $dineArea->update($validated);

        return back()->with('success', 'Area berhasil diperbarui.');
    }

    public function destroy(DineArea $dineArea)
    {
        if ($dineArea->tables()->exists()) {
            return back()->with('error', 'Area memiliki meja. Hapus atau pindahkan meja terlebih dahulu.');
        }

        $dineArea->delete();

        return back()->with('success', 'Area berhasil dihapus.');
    }
}
