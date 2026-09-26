import { useMemo, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Button from '@/Components/Dashboard/Button';
import Input from '@/Components/Dashboard/Input';
import Modal from '@/Components/Dashboard/Modal';
import Search from '@/Components/Dashboard/Search';
import Table from '@/Components/Dashboard/Table';
import Pagination from '@/Components/Dashboard/Pagination';
import { useAuthorization } from '@/Utils/authorization';
import { permissionModule, prettifyModule } from '@/Utils/permissionModules';
import {
    IconDatabaseOff,
    IconCirclePlus,
    IconLayoutGrid,
    IconList,
    IconTrash,
    IconUserShield,
    IconPencilCog,
    IconPencilCheck,
} from '@tabler/icons-react';
import Swal from 'sweetalert2';

function PermissionPicker({ permissions, selected, onChange, error }) {
    const [search, setSearch] = useState('');

    const selectedIds = useMemo(
        () => new Set(selected.map((permission) => permission.id)),
        [selected]
    );

    const groups = useMemo(() => {
        const term = search.trim().toLowerCase();
        const map = new Map();

        permissions
            .filter((permission) => permission.name.toLowerCase().includes(term))
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
                : [...selected, permission]
        );
    };

    const toggleGroup = (items) => {
        const ids = items.map((item) => item.id);
        const allSelected = ids.every((id) => selectedIds.has(id));

        onChange(
            allSelected
                ? selected.filter((item) => !ids.includes(item.id))
                : [...selected.filter((item) => !ids.includes(item.id)), ...items]
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
                        const allSelected = items.every((item) => selectedIds.has(item.id));

                        return (
                            <div key={module}>
                                <div className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        {module.replace(/-/g, ' ')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(items)}
                                        className="text-xs font-medium text-primary-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:text-primary-400"
                                    >
                                        {allSelected ? 'Batal pilih' : 'Pilih semua'}
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
                                                checked={selectedIds.has(permission.id)}
                                                onChange={() => toggle(permission)}
                                                className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/40"
                                            />
                                            <span className="truncate">{permission.name}</span>
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
        new Set(role.permissions.map((permission) => permissionModule(permission.name)))
    );
    const shown = modules.slice(0, 4);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300">
                        <IconUserShield size={24} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-slate-800 dark:text-slate-200">
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
                            {prettifyModule(module)}
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
                            className="flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium text-warning-600 transition-colors hover:bg-warning-50 dark:hover:bg-warning-950/50"
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
                            className="flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50 dark:hover:bg-danger-950/50"
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
    const canCreateRoles = can('roles-create');
    const canUpdateRoles = can('roles-update');
    const canDeleteRoles = can('roles-delete');
    const [viewMode, setViewMode] = useState('list');

    const {
        data,
        setData,
        transform,
        post,
        delete: destroy,
    } = useForm({
        id: '',
        name: '',
        selectedPermission: [],
        isUpdate: false,
        isOpen: false,
    });

    const setSelectedPermission = (value) => setData('selectedPermission', value);

    transform((data) => ({
        ...data,
        selectedPermission: data.selectedPermission.map((permission) => permission.id),
        _method: data.isUpdate === true ? 'put' : 'post',
    }));

    const closeModal = () =>
        setData({
            isOpen: false,
            id: '',
            name: '',
            selectedPermission: [],
            isUpdate: false,
        });

    const saveRole = async (e) => {
        e.preventDefault();
        post(route('roles.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const updateRole = async (e) => {
        e.preventDefault();
        post(route('roles.update', data.id), {
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
            title: 'Hapus Akses Group?',
            text: 'Group yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('roles.destroy', roleId));
            }
        });
    };

    return (
        <>
            <Head title="Akses Group" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconUserShield size={28} className="text-primary-500" />
                            Akses Group
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {roles.total || roles.data?.length || 0} group terdaftar
                        </p>
                    </div>
                    {canCreateRoles && (
                        <Button
                            type={'button'}
                            icon={<IconCirclePlus size={18} strokeWidth={1.5} />}
                            className={
                                'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600'
                            }
                            label={'Tambah Group'}
                            onClick={() => setData('isOpen', true)}
                        />
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-80">
                    <Search url={route('roles.index')} placeholder="Cari akses group..." />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`rounded-lg p-2.5 transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Grid View"
                    >
                        <IconLayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`rounded-lg p-2.5 transition-colors ${
                            viewMode === 'list'
                                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="List View"
                    >
                        <IconList size={20} />
                    </button>
                </div>
            </div>

            {/* Modal */}
            <Modal
                show={data.isOpen}
                onClose={closeModal}
                title={data.isUpdate ? 'Ubah Akses Group' : 'Tambah Akses Group'}
                maxWidth="lg"
            >
                <form onSubmit={data.isUpdate ? updateRole : saveRole}>
                    <div className="mb-4">
                        <Input
                            label={'Nama group'}
                            type={'text'}
                            placeholder={'Masukan nama group'}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
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
                            type={'submit'}
                            icon={<IconPencilCheck size={18} />}
                            className={'bg-primary-500 text-white hover:bg-primary-600'}
                            label={data.isUpdate ? 'Simpan Perubahan' : 'Simpan'}
                        />
                    </div>
                </form>
            </Modal>

            {/* Content */}
            {roles.data.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <Table.Card title="Data Akses Group">
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th className="w-10">No</Table.Th>
                                    <Table.Th>Akses Group</Table.Th>
                                    <Table.Th>Hak Akses</Table.Th>
                                    <Table.Th>Modul</Table.Th>
                                    <Table.Th></Table.Th>
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {roles.data.map((role, i) => {
                                    const modules = Array.from(
                                        new Set(
                                            role.permissions.map((permission) =>
                                                permissionModule(permission.name)
                                            )
                                        )
                                    );
                                    const shown = modules.slice(0, 3);

                                    return (
                                        <tr
                                            key={role.id}
                                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        >
                                            <Table.Td className="text-center">
                                                {++i + (roles.current_page - 1) * roles.per_page}
                                            </Table.Td>
                                            <Table.Td>
                                                <p className="text-sm font-medium capitalize text-slate-800 dark:text-slate-200">
                                                    {role.name}
                                                </p>
                                            </Table.Td>
                                            <Table.Td>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {role.permissions.length} hak akses
                                                </span>
                                            </Table.Td>
                                            <Table.Td>
                                                <div className="flex flex-wrap gap-1">
                                                    {shown.map((module) => (
                                                        <span
                                                            key={module}
                                                            className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                                        >
                                                            {prettifyModule(module)}
                                                        </span>
                                                    ))}
                                                    {modules.length > shown.length && (
                                                        <span className="px-2 py-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                                            +{modules.length - shown.length}
                                                        </span>
                                                    )}
                                                    {!modules.length && (
                                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                            </Table.Td>
                                            <Table.Td>
                                                <div className="flex gap-2">
                                                    {canUpdateRoles && (
                                                        <button
                                                            onClick={() => handleEdit(role)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-warning-200 bg-warning-100 px-3 py-2 font-medium text-warning-600 transition-all duration-200 hover:bg-warning-200 active:scale-[0.98] dark:border-warning-800 dark:bg-warning-900/50 dark:text-warning-400"
                                                        >
                                                            <IconPencilCog
                                                                size={16}
                                                                strokeWidth={1.5}
                                                            />
                                                        </button>
                                                    )}
                                                    {canDeleteRoles && (
                                                        <button
                                                            onClick={() => handleDelete(role.id)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger-200 bg-danger-100 px-3 py-2 font-medium text-danger-600 transition-all duration-200 hover:bg-danger-200 active:scale-[0.98] dark:border-danger-800 dark:bg-danger-900/50 dark:text-danger-400"
                                                        >
                                                            <IconTrash
                                                                size={16}
                                                                strokeWidth={1.5}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </Table.Td>
                                        </tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Table.Card>
                )
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <IconDatabaseOff size={32} className="text-slate-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">
                        Belum Ada Group
                    </h3>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Tambahkan group akses pertama.
                    </p>
                    <Button
                        type={'button'}
                        icon={<IconCirclePlus size={18} />}
                        className={'bg-primary-500 text-white hover:bg-primary-600'}
                        label={'Tambah Group'}
                        onClick={() => setData('isOpen', true)}
                    />
                </div>
            )}

            {roles.last_page !== 1 && <Pagination links={roles.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
