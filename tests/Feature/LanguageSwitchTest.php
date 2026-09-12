<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LanguageSwitchTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_switch_locale_and_it_is_stored_in_session(): void
    {
        $this->post(route('language.switch'), ['locale' => 'en'])
            ->assertRedirect()
            ->assertSessionHas('locale', 'en');
    }

    public function test_authenticated_user_locale_is_persisted(): void
    {
        $this->seed([PermissionSeeder::class, RoleSeeder::class, UserSeeder::class]);

        $admin = User::where('email', 'admin.nelsha@gmail.com')->firstOrFail();
        $admin->markEmailAsVerified();

        $this->actingAs($admin)
            ->post(route('language.switch'), ['locale' => 'en'])
            ->assertRedirect()
            ->assertSessionHas('locale', 'en');

        $this->assertSame('en', $admin->fresh()->locale);
    }

    public function test_invalid_locale_is_rejected(): void
    {
        $this->post(route('language.switch'), ['locale' => 'fr'])
            ->assertSessionHasErrors('locale');
    }

    public function test_flash_message_uses_the_new_locale(): void
    {
        $this->post(route('language.switch'), ['locale' => 'en'])
            ->assertSessionHas('success', 'Language changed successfully.');
    }

    public function test_api_validation_follows_accept_language_header(): void
    {
        $this->postJson(route('api.auth.login'), [], ['Accept-Language' => 'id'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'email wajib diisi.');

        $this->postJson(route('api.auth.login'), [], ['Accept-Language' => 'en'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'The email field is required.');
    }
}
