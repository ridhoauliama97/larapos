<?php

namespace Tests\Feature\Categories;

use App\Models\Category;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CategoryUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class, UserSeeder::class]);

        $this->admin = User::where('email', 'admin.nelsha@gmail.com')->firstOrFail();
        $this->admin->markEmailAsVerified();
    }

    private User $admin;

    public function test_update_without_new_image_keeps_existing_image(): void
    {
        Storage::fake('local');

        $category = Category::create([
            'image' => 'old.png',
            'name' => 'Kategori Lama',
            'description' => 'Deskripsi lama',
        ]);

        $response = $this->actingAs($this->admin)->post(route('categories.update', $category), [
            '_method' => 'PUT',
            'name' => 'Kategori Baru',
            'description' => 'Deskripsi baru',
            'image' => '',
        ]);

        $response->assertRedirect(route('categories.index'));
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Kategori Baru',
            'image' => 'old.png',
        ]);
    }

    public function test_update_with_new_image_replaces_the_stored_file(): void
    {
        Storage::fake('local');

        $category = Category::create([
            'image' => 'old.png',
            'name' => 'Kategori Lama',
            'description' => 'Deskripsi lama',
        ]);

        $response = $this->actingAs($this->admin)->post(route('categories.update', $category), [
            '_method' => 'PUT',
            'name' => 'Kategori Baru',
            'description' => 'Deskripsi baru',
            'image' => UploadedFile::fake()->image('baru.png', 100, 100),
        ]);

        $response->assertRedirect(route('categories.index'));
        $response->assertSessionHasNoErrors();

        $category->refresh();

        $this->assertNotSame('old.png', $category->getRawOriginal('image'));
        Storage::disk('local')->assertExists('public/category/'.$category->getRawOriginal('image'));
        Storage::disk('local')->assertMissing('public/category/old.png');
    }

    public function test_update_ignores_a_non_file_image_value(): void
    {
        Storage::fake('local');

        $category = Category::create([
            'image' => 'old.png',
            'name' => 'Kategori Lama',
            'description' => 'Deskripsi lama',
        ]);

        $response = $this->actingAs($this->admin)->post(route('categories.update', $category), [
            '_method' => 'PUT',
            'name' => 'Kategori Baru',
            'description' => 'Deskripsi baru',
            'image' => 'stale-filename.png',
        ]);

        $response->assertRedirect(route('categories.index'));
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Kategori Baru',
            'image' => 'old.png',
        ]);
    }

    public function test_update_accepts_webp_images(): void
    {
        Storage::fake('local');

        $category = Category::create([
            'image' => 'old.png',
            'name' => 'Kategori Lama',
            'description' => 'Deskripsi lama',
        ]);

        $response = $this->actingAs($this->admin)->post(route('categories.update', $category), [
            '_method' => 'PUT',
            'name' => 'Kategori Baru',
            'description' => 'Deskripsi baru',
            'image' => UploadedFile::fake()->image('baru.webp', 100, 100),
        ]);

        $response->assertRedirect(route('categories.index'));
        $response->assertSessionHasNoErrors();

        $category->refresh();

        $this->assertNotSame('old.png', $category->getRawOriginal('image'));
    }
}
