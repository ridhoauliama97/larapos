import { useEffect } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
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

export default function BankAccounts({ bankAccounts = [] }) {
    const { flash } = usePage().props;
    const { can } = useAuthorization();
    const canUpdatePaymentSettings = can('payment-settings-update');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleDelete = (bank) => {
        if (confirm(`Hapus rekening ${bank.bank_name}?`)) {
            router.delete(route('settings.bank-accounts.destroy', bank.id));
        }
    };

    const handleToggle = (bank) => {
        router.patch(route('settings.bank-accounts.toggle', bank.id));
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
                            <Link
                                href={route('settings.bank-accounts.create')}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                            >
                                <IconPlus size={18} />
                                Tambah Bank
                            </Link>
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
                                                <Link
                                                    href={route(
                                                        'settings.bank-accounts.edit',
                                                        bank.id
                                                    )}
                                                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <IconPencil size={18} />
                                                </Link>
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
        </>
    );
}

BankAccounts.layout = (page) => <DashboardLayout children={page} />;
