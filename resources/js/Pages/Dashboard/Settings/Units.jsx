import { useEffect, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconRulerMeasure, IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { useAuthorization } from '@/Utils/authorization';
import Input from '@/Components/Dashboard/Input';

export default function Units({ units = [] }) {
    const { flash } = usePage().props;
    const { can } = useAuthorization();
    const canCreate = can('units-create');
    const canUpdate = can('units-update');
    const canDelete = can('units-delete');

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ code: '', name: '', symbol: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const resetForm = () => {
        setForm({ code: '', name: '', symbol: '' });
        setErrors({});
        setEditing(null);
        setShowForm(false);
    };

    const openEdit = (u) => {
        setEditing(u);
        setForm({ code: u.code, name: u.name, symbol: u.symbol });
        setErrors({});
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        if (editing) {
            router.put(route('settings.units.update', editing.id), form, {
                onError: (err) => setErrors(err),
                onSuccess: () => resetForm(),
            });
        } else {
            router.post(route('settings.units.store'), form, {
                onError: (err) => setErrors(err),
                onSuccess: () => resetForm(),
            });
        }
    };

    const handleDelete = (u) => {
        if (!confirm(`Hapus satuan ${u.name}?`)) return;
        router.delete(route('settings.units.destroy', u.id));
    };

    return (
        <>
            <Head title="Pengaturan Satuan" />

            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconRulerMeasure size={28} className="text-primary-500" />
                    Satuan
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Master satuan produk (pcs, box, karton, dll) untuk penjualan multi-satuan
                </p>
            </div>

            <div className="max-w-4xl space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                            Daftar Satuan ({units.length})
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
                                Tambah Satuan
                            </button>
                        )}
                    </div>

                    {units.length > 0 ? (
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {units.map((u) => (
                                <div key={u.id} className="flex items-center gap-4 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                        <IconRulerMeasure size={22} className="text-slate-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate font-semibold text-slate-800 dark:text-white">
                                                {u.name}
                                            </p>
                                            <span className="rounded-lg bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">
                                                {u.symbol}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {u.code}
                                            {u.products_count > 0
                                                ? ` • dipakai ${u.products_count} produk`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {canUpdate && (
                                            <button
                                                onClick={() => openEdit(u)}
                                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <IconPencil size={18} />
                                            </button>
                                        )}
                                        {canDelete && u.products_count === 0 && (
                                            <button
                                                onClick={() => handleDelete(u)}
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
                            <IconRulerMeasure
                                size={48}
                                className="mx-auto mb-3 text-slate-300 dark:text-slate-600"
                            />
                            <p className="text-slate-500 dark:text-slate-400">Belum ada satuan</p>
                        </div>
                    )}
                </div>

                {showForm && (
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                            {editing ? 'Edit Satuan' : 'Tambah Satuan Baru'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Input
                                    label="Kode"
                                    placeholder="PCS"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    errors={errors.code}
                                />
                                <Input
                                    label="Nama Satuan"
                                    placeholder="Pieces"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    errors={errors.name}
                                />
                                <Input
                                    label="Simbol"
                                    placeholder="pcs"
                                    value={form.symbol}
                                    onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                                    errors={errors.symbol}
                                />
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

Units.layout = (page) => <DashboardLayout children={page} />;
