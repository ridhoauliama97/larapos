import { useEffect, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    IconBuildingBank,
    IconPlus,
    IconPencil,
    IconTrash,
    IconGripVertical,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { useAuthorization } from '@/Utils/authorization';
import Drawer from '@/Components/Dashboard/Drawer';
import ImageDropzone from '@/Components/Dashboard/ImageDropzone';
import Input from '@/Components/Dashboard/Input';

const blankAccount = {
    _method: 'POST',
    bank_name: '',
    account_number: '',
    account_name: '',
    logo: null,
    is_active: true,
};

export default function BankAccounts({ bankAccounts = [] }) {
    const { can } = useAuthorization();
    const canUpdatePaymentSettings = can('payment-settings-update');

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    // Plain-object defaults are fine here because every open path calls `setData`
    // with a complete payload rather than `reset()` — `reset()` would copy from
    // Inertia's `defaults`, which gets reassigned to the last submitted payload after
    // every successful submit.
    const { data, setData, post, processing, errors } = useForm({ ...blankAccount });

    const originalLogo = editing?.logo_url || null;
    const [logoPreview, setLogoPreview] = useState(originalLogo);
    const objectUrlRef = useRef(null);

    useEffect(
        () => () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        },
        []
    );

    const revokePreview = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
    };

    const openCreate = () => {
        revokePreview();
        setEditing(null);
        setData({ ...blankAccount });
        setLogoPreview(null);
        setDrawerOpen(true);
    };

    const openEdit = (bank) => {
        revokePreview();
        setEditing(bank);
        setData({
            _method: 'PUT',
            bank_name: bank.bank_name || '',
            account_number: bank.account_number || '',
            account_name: bank.account_name || '',
            logo: null,
            is_active: bank.is_active ?? true,
        });
        setLogoPreview(bank.logo_url || null);
        setDrawerOpen(true);
    };

    const handleLogoSelect = (file) => {
        revokePreview();
        objectUrlRef.current = URL.createObjectURL(file);
        setData('logo', file);
        setLogoPreview(objectUrlRef.current);
    };

    const handleLogoReset = () => {
        revokePreview();
        setData('logo', null);
        setLogoPreview(originalLogo);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const onSuccess = () => {
            toast.success(
                editing
                    ? 'Rekening bank berhasil diperbarui.'
                    : 'Rekening bank berhasil ditambahkan.'
            );
            setDrawerOpen(false);
        };
        const onError = () => toast.error('Gagal menyimpan rekening bank.');

        // `forceFormData` is required for the logo upload. The update route is
        // PUT-only, so the edit case still relies on `_method` spoofing in the body.
        if (editing) {
            post(route('settings.bank-accounts.update', editing.id), {
                forceFormData: true,
                onSuccess,
                onError,
            });
        } else {
            post(route('settings.bank-accounts.store'), {
                forceFormData: true,
                onSuccess,
                onError,
            });
        }
    };

    const handleDelete = (bank) => {
        if (!confirm(`Hapus rekening ${bank.bank_name}?`)) return;
        router.delete(route('settings.bank-accounts.destroy', bank.id), {
            onSuccess: () => toast.success('Rekening bank berhasil dihapus.'),
            onError: () => toast.error('Gagal menghapus rekening bank.'),
        });
    };

    const handleToggle = (bank) => {
        router.patch(route('settings.bank-accounts.toggle', bank.id), {
            onSuccess: () =>
                toast.success(
                    bank.is_active ? 'Rekening bank dinonaktifkan.' : 'Rekening bank diaktifkan.'
                ),
            onError: () => toast.error('Gagal mengubah status rekening bank.'),
        });
    };

    return (
        <>
            <Head title="Pengaturan Rekening Bank" />

            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconBuildingBank size={28} className="text-primary-500" />
                    Rekening Bank
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Kelola rekening bank untuk pembayaran transfer
                </p>
            </div>

            <div className="max-w-3xl space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                            Daftar Rekening ({bankAccounts.length})
                        </h3>
                        {canUpdatePaymentSettings && (
                            <button
                                onClick={openCreate}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                            >
                                <IconPlus size={18} />
                                Tambah Bank
                            </button>
                        )}
                    </div>

                    {bankAccounts.length > 0 ? (
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {bankAccounts.map((bank) => (
                                <div
                                    key={bank.id}
                                    className={`flex items-center gap-4 p-4 ${
                                        !bank.is_active ? 'opacity-50' : ''
                                    }`}
                                >
                                    <div className="cursor-move text-slate-400">
                                        <IconGripVertical size={20} />
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                        {bank.logo_url ? (
                                            <img
                                                src={bank.logo_url}
                                                alt={bank.bank_name}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <IconBuildingBank
                                                size={24}
                                                className="text-slate-500"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800 dark:text-white">
                                            {bank.bank_name}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {bank.account_number} • {bank.account_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canUpdatePaymentSettings && (
                                            <>
                                                <button
                                                    onClick={() => handleToggle(bank)}
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                                        bank.is_active
                                                            ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {bank.is_active ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                                <button
                                                    onClick={() => openEdit(bank)}
                                                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <IconPencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bank)}
                                                    className="rounded-lg p-2 text-danger-500 transition-colors hover:bg-danger-50 dark:hover:bg-danger-900/20"
                                                >
                                                    <IconTrash size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <IconBuildingBank
                                size={48}
                                className="mx-auto mb-3 text-slate-300 dark:text-slate-600"
                            />
                            <p className="text-slate-500 dark:text-slate-400">
                                Belum ada rekening bank
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Drawer
                show={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={editing ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama Bank"
                        placeholder="BCA, Mandiri, BNI..."
                        value={data.bank_name}
                        onChange={(e) => setData('bank_name', e.target.value)}
                        errors={errors.bank_name}
                        disabled={!canUpdatePaymentSettings}
                    />
                    <Input
                        label="Nomor Rekening"
                        placeholder="1234567890"
                        value={data.account_number}
                        onChange={(e) => setData('account_number', e.target.value)}
                        errors={errors.account_number}
                        disabled={!canUpdatePaymentSettings}
                    />
                    <Input
                        label="Atas Nama"
                        placeholder="Nama pemilik rekening"
                        value={data.account_name}
                        onChange={(e) => setData('account_name', e.target.value)}
                        errors={errors.account_name}
                        disabled={!canUpdatePaymentSettings}
                    />
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Logo Bank (opsional)
                        </label>
                        <ImageDropzone
                            preview={logoPreview}
                            original={originalLogo}
                            onSelect={handleLogoSelect}
                            onReset={handleLogoReset}
                            error={errors.logo}
                            accept="image/png,image/jpeg"
                            hint="PNG atau JPG. Maksimal 1 MB."
                            disabled={!canUpdatePaymentSettings}
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            disabled={!canUpdatePaymentSettings}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
                        />
                        Aktif
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !canUpdatePaymentSettings}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : editing ? 'Update' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </>
    );
}

BankAccounts.layout = (page) => <DashboardLayout children={page} />;
