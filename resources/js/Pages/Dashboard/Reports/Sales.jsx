import React, { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InputSelect from '@/Components/Dashboard/InputSelect';
import Pagination from '@/Components/Dashboard/Pagination';
import {
    IconCoin,
    IconDatabaseOff,
    IconDiscount2,
    IconReceipt2,
    IconShoppingBag,
    IconTrendingUp,
    IconFilter,
    IconX,
    IconSearch,
} from '@tabler/icons-react';

// Summary Card Component
const SummaryCard = ({ icon, title, value, description, gradient }) => (
    <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 ${gradient} text-white shadow-lg`}
    >
        <div className="absolute right-0 top-0 h-24 w-24 opacity-20">
            {React.cloneElement(icon, {
                size: 96,
                strokeWidth: 0.5,
                className: 'transform translate-x-4 -translate-y-4',
            })}
        </div>
        <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-white/20 p-2">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                <span className="text-sm font-medium opacity-90">{title}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="mt-1 text-sm opacity-80">{description}</p>
        </div>
    </div>
);

const defaultFilterState = {
    start_date: '',
    end_date: '',
    invoice: '',
    cashier_id: '',
    customer_id: '',
    warehouse_id: '',
};

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);

const castFilterString = (value) => (typeof value === 'number' ? String(value) : (value ?? ''));

const Sales = ({ transactions, summary, filters, cashiers, customers }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        ...defaultFilterState,
        start_date: castFilterString(filters?.start_date),
        end_date: castFilterString(filters?.end_date),
        invoice: castFilterString(filters?.invoice),
        cashier_id: castFilterString(filters?.cashier_id),
        customer_id: castFilterString(filters?.customer_id),
        warehouse_id: castFilterString(filters?.warehouse_id),
    });

    const cashierFromFilters = useMemo(
        () => cashiers.find((c) => castFilterString(c.id) === filterData.cashier_id) ?? null,
        [cashiers, filterData.cashier_id]
    );

    const customerFromFilters = useMemo(
        () => customers.find((c) => castFilterString(c.id) === filterData.customer_id) ?? null,
        [customers, filterData.customer_id]
    );

    const [selectedCashier, setSelectedCashier] = useState(cashierFromFilters);
    const [selectedCustomer, setSelectedCustomer] = useState(customerFromFilters);

    useEffect(() => setSelectedCashier(cashierFromFilters), [cashierFromFilters]);
    useEffect(() => setSelectedCustomer(customerFromFilters), [customerFromFilters]);
    useEffect(() => {
        setFilterData({
            ...defaultFilterState,
            start_date: castFilterString(filters?.start_date),
            end_date: castFilterString(filters?.end_date),
            invoice: castFilterString(filters?.invoice),
            cashier_id: castFilterString(filters?.cashier_id),
            customer_id: castFilterString(filters?.customer_id),
        });
    }, [filters]);

    const handleChange = (field, value) => setFilterData((prev) => ({ ...prev, [field]: value }));
    const handleSelectCashier = (value) => {
        setSelectedCashier(value);
        handleChange('cashier_id', value ? String(value.id) : '');
    };
    const handleSelectCustomer = (value) => {
        setSelectedCustomer(value);
        handleChange('customer_id', value ? String(value.id) : '');
    };

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route('reports.sales.index'), filterData, {
            preserveScroll: true,
            preserveState: true,
        });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilterState);
        setSelectedCashier(null);
        setSelectedCustomer(null);
        router.get(route('reports.sales.index'), defaultFilterState, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const rows = transactions?.data ?? [];
    const paginationLinks = transactions?.links ?? [];
    const currentPage = transactions?.current_page ?? 1;
    const perPage = transactions?.per_page ? Number(transactions?.per_page) : rows.length || 1;

    const hasActiveFilters =
        filterData.invoice ||
        filterData.start_date ||
        filterData.end_date ||
        filterData.cashier_id ||
        filterData.customer_id ||
        filterData.warehouse_id;

    const safeSummary = {
        orders_count: summary?.orders_count ?? 0,
        revenue_total: summary?.revenue_total ?? 0,
        discount_total: summary?.discount_total ?? 0,
        items_sold: summary?.items_sold ?? 0,
        profit_total: summary?.profit_total ?? 0,
        average_order: summary?.average_order ?? 0,
    };

    const summaryCards = [
        {
            title: 'Pendapatan Bersih',
            value: formatCurrency(safeSummary.revenue_total),
            description: 'Total setelah diskon',
            icon: <IconReceipt2 />,
            gradient: 'from-primary-500 to-primary-700',
        },
        {
            title: 'Total Profit',
            value: formatCurrency(safeSummary.profit_total),
            description: `Rata-rata ${formatCurrency(safeSummary.average_order)}`,
            icon: <IconCoin />,
            gradient: 'from-success-500 to-success-700',
        },
        {
            title: 'Item Terjual',
            value: safeSummary.items_sold.toLocaleString('id-ID'),
            description: `${safeSummary.orders_count} transaksi`,
            icon: <IconShoppingBag />,
            gradient: 'from-accent-500 to-accent-700',
        },
        {
            title: 'Diskon Diberikan',
            value: formatCurrency(safeSummary.discount_total),
            description: 'Akumulasi promo',
            icon: <IconDiscount2 />,
            gradient: 'from-warning-500 to-warning-600',
        },
    ];

    return (
        <>
            <Head title="Laporan Penjualan" />

            <div className="space-y-6">
                {/* Header */}
                <div
                    data-tour="reports-header"
                    className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
                >
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconTrendingUp size={28} className="text-primary-500" />
                            Laporan Penjualan
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Analisis dan ringkasan penjualan
                        </p>
                    </div>
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
                </div>

                {/* Summary Cards */}
                <div
                    data-tour="reports-summary"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {summaryCards.map((card) => (
                        <SummaryCard key={card.title} {...card} />
                    ))}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div
                        data-tour="reports-filters"
                        className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                                        Invoice
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="TRX-..."
                                        value={filterData.invoice}
                                        onChange={(e) => handleChange('invoice', e.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 placeholder-slate-400 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <InputSelect
                                    label="Kasir"
                                    data={cashiers}
                                    selected={selectedCashier}
                                    setSelected={handleSelectCashier}
                                    placeholder="Semua kasir"
                                    searchable
                                />
                                <InputSelect
                                    label="Pelanggan"
                                    data={customers}
                                    selected={selectedCustomer}
                                    setSelected={handleSelectCustomer}
                                    placeholder="Semua pelanggan"
                                    searchable
                                />
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <IconX size={18} />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-600"
                                >
                                    <IconSearch size={18} />
                                    Terapkan
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table */}
                {rows.length > 0 ? (
                    <div
                        data-tour="reports-table"
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                            No
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                            Invoice
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                            Pelanggan
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                            Kasir
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                            Item
                                        </th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                            Total
                                        </th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                            Profit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {rows.map((trx, i) => (
                                        <tr
                                            key={trx.id}
                                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {i + 1 + (currentPage - 1) * perPage}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                                                {trx.invoice}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {trx.created_at}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {trx.customer?.name ?? '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {trx.cashier?.name ?? '-'}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-400">
                                                    {trx.total_items ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(trx.grand_total ?? 0)}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-semibold text-success-600 dark:text-success-400">
                                                {formatCurrency(trx.total_profit ?? 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <IconDatabaseOff size={32} className="text-slate-400" />
                        </div>
                        <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">
                            Tidak Ada Data
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Tidak ada transaksi sesuai filter.
                        </p>
                    </div>
                )}

                {paginationLinks.length > 3 && <Pagination links={paginationLinks} />}
            </div>
        </>
    );
};

Sales.layout = (page) => <DashboardLayout children={page} />;

export default Sales;
