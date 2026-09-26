import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Input from '@/Components/Dashboard/Input';
import Textarea from '@/Components/Dashboard/TextArea';
import Select from '@/Components/Dashboard/Select';
import Drawer from '@/Components/Dashboard/Drawer';
import { IconListDetails, IconPlus, IconPencil, IconTrash, IconEye } from '@tabler/icons-react';
import toast from 'react-hot-toast';

const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-');

export default function PriceLists({ priceLists }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    // Function initializer, not a plain object: Inertia reassigns `defaults` to the
    // last submitted payload after every successful submit, so `reset()` would refill
    // the form with whatever was just saved. Only a function initializer makes
    // `reset()` return the pristine values.
    const { data, setData, post, put, processing, errors, reset } = useForm(() => ({
        name: '',
        slug: '',
        customer_scope: 'all',
        notes: '',
        priority: 0,
    }));

    const openCreate = () => {
        setEditing(null);
        reset();
        setDrawerOpen(true);
    };

    const openEdit = (pl) => {
        setEditing(pl);
        setData({
            name: pl.name,
            slug: pl.slug,
            customer_scope: pl.customer_scope,
            notes: pl.notes || '',
            priority: pl.priority,
        });
        setDrawerOpen(true);
    };

    const handleNameChange = (value) => {
        setData('name', value);
        // Mirror the name into the slug while creating, so the field the server marks
        // `required` is never left blank. Editing keeps whatever slug already exists.
        if (!editing) setData('slug', slugify(value));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const onSuccess = () => {
            toast.success(
                editing ? 'Price list berhasil diperbarui.' : 'Price list berhasil ditambahkan.'
            );
            setDrawerOpen(false);
        };
        const onError = () => toast.error('Gagal menyimpan price list.');

        if (editing) {
            put(route('price-lists.update', editing.id), {
                preserveScroll: true,
                onSuccess,
                onError,
            });
        } else {
            post(route('price-lists.store'), {
                preserveScroll: true,
                onSuccess,
                onError,
            });
        }
    };

    const handleDelete = (pl) => {
        if (!confirm(`Hapus price list ${pl.name}?`)) return;
        router.delete(route('price-lists.destroy', pl.id), {
            onSuccess: () => toast.success('Price list berhasil dihapus.'),
            onError: () => toast.error('Gagal menghapus price list.'),
        });
    };

    const scopeLabel = {
        all: 'Semua',
        walk_in: 'Walk-in',
        registered: 'Terdaftar',
        member: 'Member',
        segment: 'Segmen',
    };

    return (
        <>
            <Head title="Price List" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconListDetails size={28} className="text-primary-500" />
                            Price List
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Harga khusus per kelompok pelanggan
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        disabled={processing}
                    >
                        <IconPlus size={18} /> Baru
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {priceLists.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {priceLists.map((pl) => (
                                <div key={pl.id} className="flex items-center gap-4 p-4">
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {pl.name}{' '}
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                ({pl.slug})
                                            </span>
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {scopeLabel[pl.customer_scope] || pl.customer_scope} •{' '}
                                            {pl.items_count} produk • Prioritas {pl.priority}
                                        </p>
                                    </div>
                                    <Link
                                        href={route('price-lists.show', pl.id)}
                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <IconEye size={18} />
                                    </Link>
                                    <button
                                        onClick={() => openEdit(pl)}
                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <IconPencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pl)}
                                        className="rounded-lg p-2 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10"
                                    >
                                        <IconTrash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                            Belum ada price list.
                        </div>
                    )}
                </div>
            </div>

            <Drawer
                show={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={editing ? 'Edit Price List' : 'Price List Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama"
                        value={data.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        errors={errors.name}
                        maxLength={100}
                    />
                    <Input
                        label="Slug"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        errors={errors.slug}
                        maxLength={100}
                    />
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Kelompok
                        </label>
                        <Select
                            value={data.customer_scope}
                            onChange={(value) => setData('customer_scope', value)}
                            options={[
                                { value: 'all', label: 'Semua Pelanggan' },
                                { value: 'walk_in', label: 'Walk-in' },
                                { value: 'registered', label: 'Terdaftar' },
                                { value: 'member', label: 'Member' },
                            ]}
                            error={errors.customer_scope}
                        />
                    </div>
                    <Input
                        label="Prioritas"
                        type="number"
                        min="0"
                        value={data.priority}
                        onChange={(e) => setData('priority', parseInt(e.target.value) || 0)}
                        errors={errors.priority}
                    />
                    <Textarea
                        label="Catatan"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        errors={errors.notes}
                        rows={2}
                        maxLength={500}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : editing ? 'Update' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </>
    );
}

PriceLists.layout = (page) => <DashboardLayout children={page} />;
