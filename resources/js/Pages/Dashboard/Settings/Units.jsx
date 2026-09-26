import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconRulerMeasure, IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { useAuthorization } from '@/Utils/authorization';
import Button from '@/Components/Dashboard/Button';
import Drawer from '@/Components/Dashboard/Drawer';
import Input from '@/Components/Dashboard/Input';

export default function Units({ units = [] }) {
    const { can } = useAuthorization();
    const canCreate = can('units-create');
    const canUpdate = can('units-update');
    const canDelete = can('units-delete');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    // Function initializer, not a plain object: Inertia reassigns `defaults` to the
    // last submitted payload after every successful submit, so `reset()` would refill
    // the form with whatever was just saved. Only a function initializer makes
    // `reset()` return the pristine values.
    const { data, setData, post, patch, processing, errors, reset } = useForm(() => ({
        code: '',
        name: '',
        symbol: '',
    }));

    const openCreate = () => {
        setEditing(null);
        // `reset` takes field *names* and copies them from the defaults — passing an
        // object of values is silently a no-op. No args restores the empty defaults.
        reset();
        setModalOpen(true);
    };

    const openEdit = (u) => {
        setEditing(u);
        // `setData` is the one that accepts an object of new values.
        setData({ code: u.code, name: u.name, symbol: u.symbol });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const onSuccess = () => {
            toast.success(editing ? 'Satuan berhasil diperbarui.' : 'Satuan berhasil ditambahkan.');
            setModalOpen(false);
        };
        const onError = () => toast.error('Gagal menyimpan satuan.');

        if (editing) {
            patch(route('settings.units.update', editing.id), { onSuccess, onError });
        } else {
            post(route('settings.units.store'), { onSuccess, onError });
        }
    };

    const handleDelete = (u) => {
        if (!confirm(`Hapus satuan ${u.name}?`)) return;
        router.delete(route('settings.units.destroy', u.id), {
            onSuccess: () => toast.success('Satuan berhasil dihapus.'),
            onError: () => toast.error('Gagal menghapus satuan.'),
        });
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
                                onClick={openCreate}
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
            </div>

            <Drawer
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Satuan' : 'Tambah Satuan'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Kode"
                        placeholder="PCS"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        errors={errors.code}
                    />
                    <Input
                        label="Nama Satuan"
                        placeholder="Pieces"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        errors={errors.name}
                    />
                    <Input
                        label="Simbol"
                        placeholder="pcs"
                        value={data.symbol}
                        onChange={(e) => setData('symbol', e.target.value)}
                        errors={errors.symbol}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type={'button'}
                            label={'Batal'}
                            onClick={() => setModalOpen(false)}
                        />
                        <Button
                            type={'submit'}
                            label={editing ? 'Perbarui' : 'Simpan'}
                            processing={processing}
                            className={'bg-primary-500 text-white hover:bg-primary-600'}
                        />
                    </div>
                </form>
            </Drawer>
        </>
    );
}

Units.layout = (page) => <DashboardLayout children={page} />;
