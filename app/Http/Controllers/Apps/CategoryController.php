<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        // get categories
        $categories = Category::when(request()->search, function ($categories) {
            $categories = $categories->where('name', 'like', '%'.request()->search.'%');
        })->latest()->paginate($this->perPage())->withQueryString();

        // return inertia
        return Inertia::render('Dashboard/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(Request $request)
    {
        /**
         * validate
         */
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048',
            'name' => 'required',
            'description' => 'required',
        ]);

        // upload image
        $image = $request->file('image');
        $image->storeAs('public/category', $image->hashName());

        // create category
        Category::create([
            'image' => $image->hashName(),
            'name' => $request->name,
            'description' => $request->description,
        ]);

        // redirect
        return to_route('categories.index');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function update(Request $request, Category $category)
    {
        /**
         * validate
         */
        // a non-file value (empty string, stale filename) must never hit the image rule
        if (! $request->hasFile('image')) {
            $request->request->remove('image');
        }

        $validated = $request->validate([
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
            'name' => 'required',
            'description' => 'required',
        ]);

        // check image update
        if ($request->file('image')) {

            // remove old image
            if ($category->getRawOriginal('image')) {
                Storage::disk('local')->delete('public/category/'.basename($category->getRawOriginal('image')));
            }

            // upload new image
            $image = $request->file('image');
            $image->storeAs('public/category', $image->hashName());

            $validated['image'] = $image->hashName();
        } else {
            unset($validated['image']);
        }

        // update category
        $category->update($validated);

        // redirect
        return to_route('categories.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        // find by ID
        $category = Category::findOrFail($id);
        $image = $category->getRawOriginal('image');

        // delete
        $category->delete();

        // remove image only after the record is deleted successfully
        if ($image) {
            Storage::disk('local')->delete('public/category/'.basename($image));
        }

        // redirect
        return to_route('categories.index');
    }
}
