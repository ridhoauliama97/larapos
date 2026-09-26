<?php

namespace Tests\Feature\DineIn;

use App\Models\DineArea;
use App\Models\DiningTable;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DineInOrderingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class, UserSeeder::class]);

        $this->admin = User::where('email', 'admin.nelsha@gmail.com')->firstOrFail();
        $this->admin->markEmailAsVerified();
    }

    public function test_areas_sharing_a_sort_order_fall_back_to_name_order(): void
    {
        foreach (['Zulu', 'Alpha', 'Mike'] as $name) {
            DineArea::create(['name' => $name, 'sort_order' => 0, 'is_active' => true]);
        }

        $this->actingAs($this->admin)
            ->get(route('dine-areas.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('areas', fn ($areas) => collect($areas)->pluck('name')->all() === ['Alpha', 'Mike', 'Zulu'])
            );
    }

    public function test_areas_still_honour_sort_order_before_name(): void
    {
        DineArea::create(['name' => 'Zulu', 'sort_order' => 0, 'is_active' => true]);
        DineArea::create(['name' => 'Alpha', 'sort_order' => 5, 'is_active' => true]);

        $this->actingAs($this->admin)
            ->get(route('dine-areas.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('areas', fn ($areas) => collect($areas)->pluck('name')->all() === ['Zulu', 'Alpha'])
            );
    }

    public function test_tables_sharing_a_sort_order_fall_back_to_name_order(): void
    {
        $area = DineArea::create(['name' => 'Indoor', 'sort_order' => 0, 'is_active' => true]);

        foreach (['Meja 9', 'Meja 1', 'Meja 5'] as $name) {
            DiningTable::create([
                'dine_area_id' => $area->id,
                'name' => $name,
                'token' => Str::random(32),
                'capacity' => 4,
                'sort_order' => 0,
                'is_active' => true,
            ]);
        }

        $this->actingAs($this->admin)
            ->get(route('dine-tables.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('tables', fn ($tables) => collect($tables)->pluck('name')->all() === ['Meja 1', 'Meja 5', 'Meja 9'])
            );
    }

    public function test_table_index_area_list_is_tie_broken_by_name(): void
    {
        foreach (['Zulu', 'Alpha'] as $name) {
            DineArea::create(['name' => $name, 'sort_order' => 0, 'is_active' => true]);
        }

        $this->actingAs($this->admin)
            ->get(route('dine-tables.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('areas', fn ($areas) => collect($areas)->pluck('name')->all() === ['Alpha', 'Zulu'])
            );
    }
}
