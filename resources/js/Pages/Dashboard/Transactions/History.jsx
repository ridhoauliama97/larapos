import { useEffect, useState } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Button from '@/Components/Dashboard/Button';
import Table from '@/Components/Dashboard/Table';
import Pagination from '@/Components/Dashboard/Pagination';
import Select from '@/Components/Dashboard/Select';
import { useAuthorization } from '@/Utils/authorization';
import {
    IconDatabaseOff,
    IconSearch,
    IconHistory,
    IconCalendar,
    IconReceipt,
    IconPrinter,
    IconFilter,
    IconX,
    IconCheck,
    IconBuildingBank,
    IconAlertCircle,
    IconBrandWhatsapp,
} from '@tabler/icons-react';

const defaultFilters = {
    invoice: '',
    start_date: '',
    end_date: '',
    warehouse_id: '',
};

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);

const History = ({ transactions, filters, warehouses = [] }) => {
    const { can } = useAuthorization();
    const canCreateSalesReturn = can('sales-returns-create');
    const canConfirmPayment = can('transactions-confirm-payment');
    const canCreateCrmCampaign = can('crm-campaigns-create');
    const [filterData, setFilterData] = useState({
        ...defaultFilters,
        ...filters,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        transaction: null,
    });
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        setFilterData({
            ...defaultFilters,
            ...filters,
        });
    }, [filters]);

    const handleChange = (field, value) => {
        setFilterData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route('transactions.history'), filterData, {
            preserveScroll: true,
            preserveState: true,
        });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilters);
        router.get(route('transactions.history'), defaultFilters, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const rows = transactions?.data ?? [];
    const links = transactions?.links ?? [];
    const currentPage = transactions?.current_page ?? 1;
    const perPage = transactions?.per_page ? Number(transactions?.per_page) : rows.length || 1;

    const hasActiveFilters =
        filterData.invoice ||
        filterData.start_date ||
        filterData.end_date ||
        filterData.warehouse_id;

    return (
        <>
            <Head title="Riwayat Transaksi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconHistory size={28} className="text-primary-500" />
                            Riwayat Transaksi
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {transactions?.total || 0} transaksi tercatat
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                                showFilters || hasActiveFilters
                                    ? 'border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-400'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                        >
                            <IconFilter size={18} />
                            <span>Filter</span>
                            {hasActiveFilters && (
                                <span className="h-2 w-2 rounded-full bg-primary-500"></span>
                            )}
                        </button>
                        <Link
                            href={route('transactions.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/30 transition-colors hover:bg-primary-600"
                        >
                            <IconReceipt size={18} />
                            <span>Transaksi Baru</span>
                        </Link>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Nomor Invoice
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="TRX-..."
                                        value={filterData.invoice}
                                        onChange={(e) => handleChange('invoice', e.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 placeholder-slate-400 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={filterData.start_date}
                                        onChange={(e) => handleChange('start_date', e.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Tanggal Akhir
                                    </label>
                                    <input
                                        type="date"
                                        value={filterData.end_date}
                                        onChange={(e) => handleChange('end_date', e.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Gudang / Cabang
                                    </label>
                                    <Select
                                        value={filterData.warehouse_id}
                                        onChange={(value) => handleChange('warehouse_id', value)}
                                        options={[
                                            { value: '', label: 'Semua Gudang' },
                                            ...warehouses.map((w) => ({
                                                value: w.id,
                                                label: `${w.code} — ${w.name}`,
                                            })),
                                        ]}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        type="submit"
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 font-medium text-white transition-colors hover:bg-primary-600"
                                    >
                                        <IconSearch size={18} />
                                        <span>Cari</span>
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                                        >
                                            <IconX size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Transaction List */}
                {rows.length > 0 ? (
                    <div className="rounded-2xl border-0 bg-transparent shadow-none sm:overflow-hidden sm:border sm:border-slate-200 sm:bg-white sm:dark:border-slate-800 sm:dark:bg-slate-900">
                        {/* Desktop Table */}
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            No
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Invoice
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Kasir
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Pelanggan
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Item
                                        </th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Total
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Status
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {rows.map((transaction, index) => (
                                        <tr
                                            key={transaction.id}
                                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {index + 1 + (currentPage - 1) * perPage}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {transaction.invoice}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {transaction.created_at}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {transaction.cashier?.name ?? '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                    {transaction.customer?.name ?? 'Umum'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-400">
                                                    {transaction.total_items ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(transaction.grand_total ?? 0)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {transaction.payment_method === 'pay_later' &&
                                                transaction.payment_status !== 'paid' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                        Piutang
                                                    </span>
                                                ) : transaction.payment_status === 'paid' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2 py-1 text-xs font-medium text-success-700 dark:bg-success-900/30 dark:text-success-400">
                                                        <IconCheck size={12} />
                                                        Lunas
                                                    </span>
                                                ) : transaction.payment_status === 'pending' &&
                                                  canConfirmPayment ? (
                                                    <button
                                                        onClick={() =>
                                                            setConfirmModal({
                                                                open: true,
                                                                transaction,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-full bg-warning-100 px-2 py-1 text-xs font-medium text-warning-700 transition-colors hover:bg-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:hover:bg-warning-900/50"
                                                    >
                                                        Pending - Konfirmasi
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-danger-100 px-2 py-1 text-xs font-medium text-danger-700 dark:bg-danger-900/30 dark:text-danger-400">
                                                        {transaction.payment_status ?? '-'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {canCreateSalesReturn ? (
                                                        transaction.can_create_sales_return ? (
                                                            <Link
                                                                href={route(
                                                                    'sales-returns.create',
                                                                    transaction.id
                                                                )}
                                                                className="inline-flex items-center justify-center rounded-lg bg-warning-50 px-3 py-2 text-xs font-semibold text-warning-700 hover:bg-warning-100 dark:bg-warning-950/30 dark:text-warning-300"
                                                                title="Buat retur"
                                                            >
                                                                Retur
                                                            </Link>
                                                        ) : (
                                                            <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                                Retur selesai
                                                            </span>
                                                        )
                                                    ) : null}
                                                    <a
                                                        href={`https://wa.me/?text=${encodeURIComponent(
                                                            `Invoice ${transaction.invoice}: ${route(
                                                                'transactions.public',
                                                                transaction.invoice,
                                                                { token: transaction.access_token }
                                                            )}`
                                                        )}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                                                        title="Bagikan ke WhatsApp"
                                                    >
                                                        <IconBrandWhatsapp size={18} />
                                                    </a>
                                                    {canCreateCrmCampaign && (
                                                        <Link
                                                            href={route(
                                                                'transactions.share-campaign',
                                                                transaction.id
                                                            )}
                                                            method="post"
                                                            as="button"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100 hover:text-primary-700 dark:bg-primary-950/30 dark:hover:bg-primary-950/50"
                                                            title="Buat campaign share"
                                                        >
                                                            <IconBuildingBank size={18} />
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={route(
                                                            'transactions.print',
                                                            transaction.invoice
                                                        )}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/50"
                                                        title="Cetak Struk"
                                                    >
                                                        <IconPrinter size={18} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="flex flex-col gap-3 px-1 sm:hidden">
                            {rows.map((transaction, index) => (
                                <div
                                    key={transaction.id}
                                    className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                No {index + 1 + (currentPage - 1) * perPage}
                                            </p>
                                            <p className="text-base font-semibold text-slate-900 dark:text-white">
                                                {transaction.invoice}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {transaction.created_at}
                                            </p>
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {transaction.payment_method === 'pay_later' &&
                                                transaction.payment_status !== 'paid' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                        Piutang
                                                    </span>
                                                ) : transaction.payment_status === 'paid' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2 py-1 text-xs font-medium text-success-700 dark:bg-success-900/30 dark:text-success-400">
                                                        <IconCheck size={12} />
                                                        Lunas
                                                    </span>
                                                ) : transaction.payment_status === 'pending' &&
                                                  canConfirmPayment ? (
                                                    <button
                                                        onClick={() =>
                                                            setConfirmModal({
                                                                open: true,
                                                                transaction,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-full bg-warning-100 px-2 py-1 text-xs font-medium text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                                                    >
                                                        Pending
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-danger-100 px-2 py-1 text-xs font-medium text-danger-700 dark:bg-danger-900/30 dark:text-danger-400">
                                                        {transaction.payment_status ?? '-'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(transaction.grand_total ?? 0)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Kasir
                                            </p>
                                            <p className="font-medium">
                                                {transaction.cashier?.name ?? '-'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Pelanggan
                                            </p>
                                            <p className="font-medium">
                                                {transaction.customer?.name ?? 'Umum'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Item
                                            </p>
                                            <p className="font-medium">
                                                {transaction.total_items ?? 0}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Pembayaran
                                            </p>
                                            <p className="font-medium capitalize">
                                                {transaction.payment_method?.replace('_', ' ') ??
                                                    '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {canCreateSalesReturn ? (
                                            transaction.can_create_sales_return ? (
                                                <Link
                                                    href={route(
                                                        'sales-returns.create',
                                                        transaction.id
                                                    )}
                                                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-warning-50 px-3 py-2 text-xs font-semibold text-warning-700 hover:bg-warning-100 dark:bg-warning-950/30 dark:text-warning-300"
                                                >
                                                    Retur
                                                </Link>
                                            ) : (
                                                <div className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                    Retur selesai
                                                </div>
                                            )
                                        ) : null}
                                        <Link
                                            href={route('transactions.print', transaction.invoice)}
                                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
                                        >
                                            Detail
                                        </Link>
                                        <a
                                            href={route(
                                                'transactions.public',
                                                transaction.invoice,
                                                { token: transaction.access_token }
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                        >
                                            Invoice
                                        </a>
                                        {canCreateCrmCampaign && (
                                            <Link
                                                href={route(
                                                    'transactions.share-campaign',
                                                    transaction.id
                                                )}
                                                method="post"
                                                as="button"
                                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
                                            >
                                                Campaign WA
                                            </Link>
                                        )}
                                        <a
                                            href={route(
                                                'pdf.transactions.shipping',
                                                transaction.invoice
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                                        >
                                            Resi
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <IconDatabaseOff
                                size={32}
                                className="text-slate-400"
                                strokeWidth={1.5}
                            />
                        </div>
                        <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">
                            Belum Ada Transaksi
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {hasActiveFilters
                                ? 'Tidak ada transaksi sesuai filter.'
                                : 'Transaksi akan muncul di sini.'}
                        </p>
                    </div>
                )}

                {links.length > 3 && <Pagination links={links} />}
            </div>

            {/* Confirmation Modal */}
            {confirmModal.open && confirmModal.transaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() =>
                            !isConfirming && setConfirmModal({ open: false, transaction: null })
                        }
                    />

                    {/* Modal */}
                    <div className="animate-in fade-in zoom-in relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200 dark:bg-slate-900">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                    <IconBuildingBank size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Konfirmasi Pembayaran</h3>
                                    <p className="text-sm opacity-90">Transfer Bank</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4 p-6">
                            {/* Invoice Info */}
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Invoice
                                    </span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {confirmModal.transaction.invoice}
                                    </span>
                                </div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Pelanggan
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {confirmModal.transaction.customer?.name ?? 'Umum'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Total
                                    </span>
                                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {formatCurrency(confirmModal.transaction.grand_total ?? 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Confirmation Message */}
                            <div className="flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
                                <IconAlertCircle
                                    size={20}
                                    className="mt-0.5 flex-shrink-0 text-warning-600 dark:text-warning-400"
                                />
                                <p className="text-sm text-warning-800 dark:text-warning-300">
                                    Pastikan dana sudah diterima sebelum mengkonfirmasi pembayaran
                                    ini. Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-6 pb-6">
                            <button
                                onClick={() =>
                                    setConfirmModal({
                                        open: false,
                                        transaction: null,
                                    })
                                }
                                disabled={isConfirming}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    setIsConfirming(true);
                                    router.patch(
                                        route(
                                            'transactions.confirm-payment',
                                            confirmModal.transaction.id
                                        ),
                                        {},
                                        {
                                            onSuccess: () => {
                                                setConfirmModal({
                                                    open: false,
                                                    transaction: null,
                                                });
                                                setIsConfirming(false);
                                            },
                                            onError: () => {
                                                setIsConfirming(false);
                                            },
                                        }
                                    );
                                }}
                                disabled={isConfirming}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success-500 px-4 py-3 font-medium text-white transition-colors hover:bg-success-600 disabled:opacity-50"
                            >
                                {isConfirming ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <IconCheck size={18} />
                                        Konfirmasi Lunas
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

History.layout = (page) => <DashboardLayout children={page} />;

export default History;
