<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // get all role data
        $roles = Role::query()
            ->with('permissions')
            ->when(request()->search, fn ($query) => $query->where('name', 'like', '%'.request()->search.'%'))
            ->select('id', 'name')
            ->latest()
            ->paginate(7)
            ->withQueryString();

        // get all permission data
        $permissions = Permission::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // render view
        return Inertia::render('Dashboard/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoleRequest $request)
    {
        $actor = $request->user();
        $isSuper = $actor?->isSuperAdmin() ?? false;

        if (! $isSuper) {
            if ($request->name === 'super-admin') {
                abort(403, 'Hanya super-admin yang dapat membuat role super-admin.');
            }

            $allowedIds = $actor->getAllPermissions()->pluck('id')->all();

            if (array_diff($request->selectedPermission ?? [], $allowedIds) !== []) {
                abort(403, 'Tidak dapat memberikan permission yang tidak Anda miliki.');
            }
        }

        DB::transaction(function () use ($request) {
            // create new role data
            $role = Role::create(['name' => $request->name]);

            // give permissions to role
            $role->givePermissionTo($request->selectedPermission);

            $this->auditLogService->log(
                event: 'role.created',
                module: 'roles',
                auditable: $role,
                description: 'Role baru dibuat.',
                after: [
                    'name' => $role->name,
                    'permissions' => $this->auditLogService->permissionNames($request->selectedPermission),
                ],
            );
        });

        // render view
        return back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RoleRequest $request, Role $role)
    {
        $actor = $request->user();
        $isSuper = $actor?->isSuperAdmin() ?? false;

        if ($role->name === 'super-admin' && ! $isSuper) {
            abort(403, 'Hanya super-admin yang dapat mengubah role super-admin.');
        }

        if ($request->name === 'super-admin' && ! $isSuper) {
            abort(403, 'Hanya super-admin yang dapat membuat role super-admin.');
        }

        if (! $isSuper) {
            $allowedIds = $actor->getAllPermissions()->pluck('id')->all();

            if (array_diff($request->selectedPermission ?? [], $allowedIds) !== []) {
                abort(403, 'Tidak dapat memberikan permission yang tidak Anda miliki.');
            }
        }

        $beforePermissions = $role->permissions()->pluck('name')->all();
        $before = [
            'name' => $role->name,
            'permissions' => array_values($beforePermissions),
        ];

        DB::transaction(function () use ($request, $role, $before, $beforePermissions) {
            // update role data
            $role->update(['name' => $request->name]);

            // sync role permissions
            $role->syncPermissions($request->selectedPermission);

            $afterPermissions = $this->auditLogService->permissionNames($request->selectedPermission);

            $this->auditLogService->log(
                event: 'role.updated',
                module: 'roles',
                auditable: $role,
                description: 'Role diperbarui.',
                before: $before,
                after: [
                    'name' => $role->fresh()->name,
                    'permissions' => array_values($afterPermissions),
                ],
            );

            if ($beforePermissions !== $afterPermissions) {
                $this->auditLogService->log(
                    event: 'role.permission_changed',
                    module: 'roles',
                    auditable: $role,
                    description: 'Permission role diperbarui.',
                    before: ['permissions' => array_values($beforePermissions)],
                    after: ['permissions' => array_values($afterPermissions)],
                );
            }
        });

        // render view
        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        if ($role->name === 'super-admin') {
            return back()->with('error', 'Role super-admin tidak dapat dihapus.');
        }

        if ($role->users()->exists()) {
            return back()->with('error', 'Role masih digunakan oleh pengguna.');
        }

        $before = [
            'name' => $role->name,
            'permissions' => $role->permissions()->pluck('name')->all(),
        ];

        // delete role data
        $role->delete();

        $this->auditLogService->log(
            event: 'role.deleted',
            module: 'roles',
            auditable: $role,
            description: 'Role dihapus.',
            before: $before,
        );

        // render view
        return back();
    }
}
