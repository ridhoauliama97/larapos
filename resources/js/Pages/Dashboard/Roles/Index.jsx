import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import Input from "@/Components/Dashboard/Input";
import Modal from "@/Components/Dashboard/Modal";
import Search from "@/Components/Dashboard/Search";
import Pagination from "@/Components/Dashboard/Pagination";
import { useAuthorization } from "@/Utils/authorization";
import {
    IconDatabaseOff,
    IconCirclePlus,
    IconTrash,
    IconUserShield,
    IconPencilCog,
    IconPencilCheck,
} from "@tabler/icons-react";
import Swal from "sweetalert2";

function permissionModule(name) {
    const index = name.lastIndexOf("-");

    return index === -1 ? name : name.slice(0, index);
}

function PermissionPicker({ permissions, selected, onChange, error }) {
    const [search, setSearch] = useState("");

    const selectedIds = useMemo(
        () => new Set(selected.map((permission) => permission.id)),
        [selected],
    );

    const groups = useMemo(() => {
        const term = search.trim().toLowerCase();
        const map = new Map();

        permissions
            .filter((permission) =>
                permission.name.toLowerCase().includes(term),
            )
            .forEach((permission) => {
                const module = permissionModule(permission.name);

                if (!map.has(module)) {
                    map.set(module, []);
                }

                map.get(module).push(permission);
            });

        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [permissions, search]);

    const toggle = (permission) => {
        onChange(
            selectedIds.has(permission.id)
                ? selected.filter((item) => item.id !== permission.id)
                : [...selected, permission],
        );
    };

    const toggleGroup = (items) => {
        const ids = items.map((item) => item.id);
        const allSelected = ids.every((id) => selectedIds.has(id));

        onChange(
            allSelected
                ? selected.filter((item) => !ids.includes(item.id))
                : [
                      ...selected.filter((item) => !ids.includes(item.id)),
                      ...items,
                  ],
        );
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Pilih hak akses
                </label>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                    {selected.length} dipilih
                </span>
            </div>

            <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari hak akses..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
            />

            <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {groups.length ? (
                    groups.map(([module, items]) => {
                        const allSelected = items.every((item) =>
                            selectedIds.has(item.id),
                        );

                        return (
                            <div key={module}>
                                <div className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        {module.replace(/-/g, " ")}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(items)}
                                        className="text-xs font-medium text-primary-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:text-primary-400"
                                    >
                                        {allSelected
                                            ? "Batal pilih"
                                            : "Pilih semua"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2">
                                    {items.map((permission) => (
                                        <label
                                            key={permission.id}
                                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(
                                                    permission.id,
                                                )}
                                                onChange={() =>
                                                    toggle(permission)
                                                }
                                                className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/40"
                                            />
                                            <span className="truncate">
                                                {permission.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="px-3 py-6 text-center text-sm text-slate-400">
                        Hak akses tidak ditemukan.
                    </p>
                )}
            </div>

            {error && <p className="text-xs text-danger-500">{error}</p>}
        </div>
    );
}

function RoleCard({ role, onEdit, onDelete, canUpdate, canDelete }) {
    const modules = Array.from(
        new Set(
            role.permissions.map((permission) =>
                permissionModule(permission.name),
            ),
        ),
    );
    const shown = modules.slice(0, 4);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all">
            <div className="p-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300 flex items-center justify-center flex-shrink-0">
                        <IconUserShield size={24} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {role.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {role.permissions.length} hak akses
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                    {shown.map((module) => (
                        <span
                            key={module}
                            className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                            {module.replace(/-/g, " ")}
                        </span>
                    ))}
                    {modules.length > shown.length && (
                        <span className="px-2 py-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            +{modules.length - shown.length} modul
                        </span>
                    )}
                    {!modules.length && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            Belum ada hak akses
                        </span>
                    )}
                </div>
            </div>

            {(canUpdate || canDelete) && (
                <div className="flex border-t border-slate-100 dark:border-slate-800">
                    {canUpdate && (
                        <button
                            onClick={onEdit}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-950/50 text-sm font-medium transition-colors"
                        >
                            <IconPencilCog size={16} />
                            <span>Edit</span>
                        </button>
                    )}
                    {canUpdate && canDelete && (
                        <div className="w-px bg-slate-100 dark:bg-slate-800" />
                    )}
                    {canDelete && (
                        <button
                            onClick={onDelete}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/50 text-sm font-medium transition-colors"
                        >
                            <IconTrash size={16} />
                            <span>Hapus</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Index() {
    const { roles, permissions, errors } = usePage().props;
    const { can } = useAuthorization();
    const canCreateRoles = can("roles-create");
    const canUpdateRoles = can("roles-update");
    const canDeleteRoles = can("roles-delete");

    const { data, setData, transform, post, delete: destroy } = useForm({
        id: "",
        name: "",
        selectedPermission: [],
        isUpdate: false,
        isOpen: false,
    });

    const setSelectedPermission = (value) =>
        setData("selectedPermission", value);

    transform((data) => ({
        ...data,
        selectedPermission: data.selectedPermission.map(
            (permission) => permission.id,
        ),
        _method: data.isUpdate === true ? "put" : "post",
    }));

    const closeModal = () =>
        setData({
            isOpen: false,
            id: "",
            name: "",
            selectedPermission: [],
            isUpdate: false,
        });

    const saveRole = async (e) => {
        e.preventDefault();
        post(route("roles.store"), {
            onSuccess: () => closeModal(),
        });
    };

    const updateRole = async (e) => {
        e.preventDefault();
        post(route("roles.update", data.id), {
            onSuccess: () => closeModal(),
        });
    };

    const handleEdit = (role) => {
        setData({
            id: role.id,
            selectedPermission: role.permissions,
            name: role.name,
            isUpdate: true,
            isOpen: true,
        });
    };

    const handleDelete = (roleId) => {
        Swal.fire({
            title: "Hapus Akses Group?",
            text: "Group yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#6366f1",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route("roles.destroy", roleId));
            }
        });
    };

    return (
        <>
            <Head title="Akses Group" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <IconUserShield
                                size={28}
                                className="text-primary-500"
                            />
                            Akses Group
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {roles.total || roles.data?.length || 0} group
                            terdaftar
                        </p>
                    </div>
                    {canCreateRoles && (
                        <Button
                            type={"button"}
                            icon={
                                <IconCirclePlus
                                    size={18}
                                    strokeWidth={1.5}
                                />
                            }
                            className={
                                "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                            }
                            label={"Tambah Group"}
                            onClick={() => setData("isOpen", true)}
                        />
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="mb-4 w-full sm:w-80">
                <Search
                    url={route("roles.index")}
                    placeholder="Cari akses group..."
                />
            </div>

            {/* Modal */}
            <Modal
                show={data.isOpen}
                onClose={closeModal}
                title={data.isUpdate ? "Ubah Akses Group" : "Tambah Akses Group"}
                maxWidth="lg"
            >
                <form onSubmit={data.isUpdate ? updateRole : saveRole}>
                    <div className="mb-4">
                        <Input
                            label={"Nama group"}
                            type={"text"}
                            placeholder={"Masukan nama group"}
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            errors={errors.name}
                        />
                    </div>
                    <div className="mb-4">
                        <PermissionPicker
                            permissions={permissions}
                            selected={data.selectedPermission}
                            onChange={setSelectedPermission}
                            error={errors.selectedPermission}
                        />
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <Button
                            type={"submit"}
                            icon={<IconPencilCheck size={18} />}
                            className={
                                "bg-primary-500 hover:bg-primary-600 text-white"
                            }
                            label={data.isUpdate ? "Simpan Perubahan" : "Simpan"}
                        />
                    </div>
                </form>
            </Modal>

            {/* Content */}
            {roles.data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {roles.data.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            onEdit={() => handleEdit(role)}
                            onDelete={() => handleDelete(role.id)}
                            canUpdate={canUpdateRoles}
                            canDelete={canDeleteRoles}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <IconDatabaseOff
                            size={32}
                            className="text-slate-400"
                            strokeWidth={1.5}
                        />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
                        Belum Ada Group
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Tambahkan group akses pertama.
                    </p>
                    <Button
                        type={"button"}
                        icon={<IconCirclePlus size={18} />}
                        className={
                            "bg-primary-500 hover:bg-primary-600 text-white"
                        }
                        label={"Tambah Group"}
                        onClick={() => setData("isOpen", true)}
                    />
                </div>
            )}

            {roles.last_page !== 1 && <Pagination links={roles.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
