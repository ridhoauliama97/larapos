import { useEffect, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    IconBuildingWarehouse,
    IconPlus,
    IconPencil,
    IconTrash,
    IconDots,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { useAuthorization } from '@/Utils/authorization';
import Input from '@/Components/Dashboard/Input';
import Select from '@/Components/Dashboard/Select';

export default function Warehouses({ warehouses = [] }) {
    const { flash } = usePage().props;
    const { can } = useAuthorization();
    const canCreate = can('warehouses-create');
    const canUpdate = can('warehouses-update');
    const canDelete = can('warehouses-delete');

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        code: '',
        name: '',
        type: 'branch',
        address: '',
        phone: '',
        is_active: true,
        sort_order: 0,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const resetForm = () => {
        setForm({
            code: '',
            name: '',
            type: 'branch',
            address: '',
            phone: '',
            is_active: true,
            sort_order: 0,
        });
        setErrors({});
        setEditing(null);
        setShowForm(false);
    };

    const openEdit = (w) => {
        setEditing(w);
        setForm({
            code: w.code,
            name: w.name,
            type: w.type,
            address: w.address || '',
            phone: w.phone || '',
            is_active: w.is_active,
            sort_order: w.sort_order,
        });
        setErrors({});
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        if (editing) {
            router.put(route('settings.warehouses.update', editing.id), form, {
                onError: (err) => setErrors(err),
                onSuccess: () => resetForm(),
            });
        } else {
            router.post(route('settings.warehouses.store'), form, {
                onError: (err) => setErrors(err),
                onSuccess: () => resetForm(),
            });
        }
    };

    const handleDelete = (w) => {
        if (!confirm(`Hapus gudang ${w.name}?`)) return;
        router.delete(route('settings.warehouses.destroy', w.id));
    };

    const typeLabel = (type) => {
        const labels = { main: 'Utama', branch: 'Cabang', warehouse: 'Gudang' };
        return labels[type] || type;
    };

    const typeColor = (type) => {
        const colors = {
            main: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
            branch: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
            warehouse: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        };
        return colors[type] || colors.warehouse;
    };

    return (
        <>
            <Head title="Pengaturan Gudang" />

            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconBuildingWarehouse size={28} className="text-primary-500" />
                    Gudang / Cabang
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Kelola gudang dan cabang untuk pemisahan stok per lokasi
                </p>
            </div>

            <div className="max-w-4xl space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                            Daftar Gudang ({warehouses.length})
                        </h3>
                        {canCreate && (
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                            >
                                <IconPlus size={18} />
                                Tambah Gudang
                            </button>
                        )}
                    </div>

                    {warehouses.length > 0 ? (
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {warehouses.map((w) => (
                                <div
                                    key={w.id}
                                    className={`flex items-center gap-4 p-4 ${!w.is_active ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                        <IconBuildingWarehouse
                                            size={22}
                                            className="text-slate-500"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate font-semibold text-slate-800 dark:text-white">
                                                {w.name}
                                            </p>
                                            <span
                                                className={`rounded-lg px-2 py-0.5 text-xs font-medium ${typeColor(w.type)}`}
                                            >
                                                {typeLabel(w.type)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {w.code}
                                            {w.address ? ` • ${w.address}` : ''}
                                            {w.phone ? ` • ${w.phone}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {w.type !== 'main' && (
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                Sort: {w.sort_order}
                                            </span>
                                        )}
                                        {canUpdate && (
                                            <button
                                                onClick={() => openEdit(w)}
                                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <IconPencil size={18} />
                                            </button>
                                        )}
                                        {canDelete && w.type !== 'main' && (
                                            <button
                                                onClick={() => handleDelete(w)}
                                                className="rounded-lg p-2 text-danger-500 transition-colors hover:bg-danger-50 dark:hover:bg-danger-900/20"
                                            >
                                                <IconTrash size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <IconBuildingWarehouse
                                size={48}
                                className="mx-auto mb-3 text-slate-300 dark:text-slate-600"
                            />
                            <p className="text-slate-500 dark:text-slate-400">Belum ada gudang</p>
                        </div>
                    )}
                </div>

                {showForm && (
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                            {editing ? 'Edit Gudang' : 'Tambah Gudang Baru'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Input
                                    label="Kode"
                                    placeholder="WH-002"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    errors={errors.code}
                                    disabled={!!editing}
                                />
                                <Input
                                    label="Nama Gudang"
                                    placeholder="Gudang Cabang A"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    errors={errors.name}
                                />
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Tipe
                                    </label>
                                    <Select
                                        value={form.type}
                                        onChange={(value) => setForm({ ...form, type: value })}
                                        options={[
                                            { value: 'branch', label: 'Cabang' },
                                            { value: 'warehouse', label: 'Gudang' },
                                        ]}
                                        error={errors.type}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Alamat
                                    </label>
                                    <textarea
                                        value={form.address}
                                        onChange={(e) =>
                                            setForm({ ...form, address: e.target.value })
                                        }
                                        className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    />
                                    {errors.address && (
                                        <p className="mt-1 text-xs text-danger-500">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <Input
                                        label="Telepon"
                                        placeholder="021-12345678"
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm({ ...form, phone: e.target.value })
                                        }
                                        errors={errors.phone}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Urutan"
                                            type="number"
                                            value={form.sort_order}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    sort_order: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            errors={errors.sort_order}
                                        />
                                        <div className="flex items-end pb-2">
                                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <input
                                                    type="checkbox"
                                                    checked={form.is_active}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            is_active: e.target.checked,
                                                        })
                                                    }
                                                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
                                                />
                                                Aktif
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                                >
                                    {editing ? 'Update' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}

Warehouses.layout = (page) => <DashboardLayout children={page} />;
