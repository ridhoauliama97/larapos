import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Select from '@/Components/Dashboard/Select';
import {
    IconHistory,
    IconSearch,
    IconCalendar,
    IconAlertCircle,
    IconChartBar,
    IconUsers,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const statusBadge = (value) => {
    const base = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (value) {
        case 'paid':
            return <span className={`${base} bg-success-100 text-success-700`}>Lunas</span>;
        case 'partial':
            return <span className={`${base} bg-primary-100 text-primary-700`}>Parsial</span>;
        case 'overdue':
            return <span className={`${base} bg-rose-100 text-rose-700`}>Jatuh Tempo</span>;
        default:
            return <span className={`${base} bg-amber-100 text-amber-700`}>Belum Lunas</span>;
    }
};

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'unpaid', label: 'Belum Lunas' },
    { value: 'partial', label: 'Parsial' },
    { value: 'paid', label: 'Lunas' },
    { value: 'overdue', label: 'Jatuh Tempo' },
];

export default function ReceivablesIndex({ receivables, filters = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.invoice || '');
    const [status, setStatus] = useState(filters.status || '');
    const [activeTab, setActiveTab] = useState('list');
    const [agingData, setAgingData] = useState(null);
    const [loadingAging, setLoadingAging] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        if (activeTab !== 'aging' || agingData) return;
        setLoadingAging(true);
        fetch(route('receivables.aging'))
            .then((res) => res.json())
            .then((data) => {
                setAgingData(data);
                setLoadingAging(false);
            })
            .catch(() => {
                setLoadingAging(false);
                toast.error('Gagal memuat data aging');
            });
    }, [activeTab]);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(
            route('receivables.index'),
            { invoice: search, status },
            { preserveScroll: true, preserveState: true }
        );
    };

    const rows = receivables?.data || [];

    return (
        <>
            <Head title="Nota Barang" />
            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconHistory size={26} className="text-primary-500" />
                            Nota Barang (Piutang)
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Pantau piutang pelanggan dan pembayaran parsialnya.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                    activeTab === 'list'
                                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                Daftar
                            </button>
                            <button
                                onClick={() => setActiveTab('aging')}
                                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                    activeTab === 'aging'
                                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                <IconChartBar size={16} />
                                Aging
                            </button>
                        </div>
                        <Link
                            href={route('transactions.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                        >
                            Buat Dari POS
                        </Link>
                    </div>
                </div>

                {activeTab === 'aging' ? (
                    <div className="space-y-6">
                        {loadingAging ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
                            </div>
                        ) : agingData ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Total Piutang
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(
                                                agingData.collection_rate
                                                    ?.total_receivables_amount || 0
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Sudah Dibayar
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-success-600">
                                            {formatCurrency(
                                                agingData.collection_rate?.total_paid_amount || 0
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Collection Rate
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-primary-600">
                                            {agingData.collection_rate?.collection_rate || 0}%
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Lunas / Total
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                            {agingData.collection_rate?.paid_count || 0} /{' '}
                                            {agingData.collection_rate?.total_count || 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
                                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                                            Aging Piutang
                                        </h3>
                                        <div className="space-y-3">
                                            {agingData.aging_summary?.map((bucket) => {
                                                const bucketColors = {
                                                    current: 'bg-success-100 text-success-700',
                                                    '0-30': 'bg-success-100 text-success-700',
                                                    '31-60': 'bg-warning-100 text-warning-700',
                                                    '61-90': 'bg-orange-100 text-orange-700',
                                                    '90+': 'bg-danger-100 text-danger-700',
                                                };
                                                const bucketLabels = {
                                                    current: 'Belum Jatuh Tempo',
                                                    '0-30': '1-30 Hari',
                                                    '31-60': '31-60 Hari',
                                                    '61-90': '61-90 Hari',
                                                    '90+': '90+ Hari',
                                                };
                                                return (
                                                    <div
                                                        key={bucket.bucket}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${bucketColors[bucket.bucket] || 'bg-slate-100 text-slate-700'}`}
                                                        >
                                                            {bucketLabels[bucket.bucket] ||
                                                                bucket.bucket}
                                                        </span>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                                {formatCurrency(bucket.remaining)}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {bucket.count} nota
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:col-span-3">
                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                            <IconUsers size={20} />
                                            Pelanggan Terbesar
                                        </h3>
                                        <div className="space-y-3">
                                            {agingData.top_customers?.length > 0 ? (
                                                agingData.top_customers.map((customer) => (
                                                    <div
                                                        key={customer.id}
                                                        className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0 dark:border-slate-800"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-slate-800 dark:text-white">
                                                                {customer.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                Piutang
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-warning-600">
                                                                {formatCurrency(customer.remaining)}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                Total:{' '}
                                                                {formatCurrency(
                                                                    customer.total_receivable
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="py-4 text-center text-sm text-slate-500">
                                                    Belum ada data piutang.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                ) : (
                    <>
                        <form
                            onSubmit={applyFilter}
                            className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4"
                        >
                            <div className="relative w-full">
                                <IconSearch
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari invoice / nomor nota"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800"
                                />
                            </div>
                            <Select
                                value={status}
                                onChange={(value) => setStatus(value)}
                                options={statusOptions}
                                size="sm"
                                icon={<IconCalendar size={18} />}
                                className="w-full"
                            />
                            <button
                                type="submit"
                                className="inline-flex w-full items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
                            >
                                Terapkan
                            </button>
                        </form>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <div className="w-full overflow-x-auto">
                                <div className="min-w-[720px]">
                                    <div className="grid grid-cols-12 border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                        <div className="col-span-2">Invoice</div>
                                        <div className="col-span-2">Pelanggan</div>
                                        <div className="col-span-2 text-right">Total</div>
                                        <div className="col-span-2 text-right">Sisa</div>
                                        <div className="col-span-2 text-right">Jatuh Tempo</div>
                                        <div className="col-span-2 text-center">Status</div>
                                    </div>
                                    {rows.length > 0 ? (
                                        rows.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={route('receivables.show', item.id)}
                                                className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 px-4 py-3 transition-colors hover:bg-primary-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                            >
                                                <div className="col-span-2">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                        {item.invoice}
                                                    </p>
                                                    {item.transaction_id && (
                                                        <p className="text-[11px] text-slate-500">
                                                            POS #{item.transaction_id}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-sm text-slate-700 dark:text-slate-200">
                                                        {item.customer?.name || 'Umum'}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                                    {formatCurrency(item.total)}
                                                </div>
                                                <div className="col-span-2 text-right text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                    {formatCurrency(item.remaining)}
                                                </div>
                                                <div className="col-span-2 text-right text-sm text-slate-600 dark:text-slate-400">
                                                    {formatDate(item.due_date)}
                                                </div>
                                                <div className="col-span-2 flex justify-center">
                                                    {statusBadge(item.status)}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                            <IconAlertCircle size={28} className="mx-auto mb-2" />
                                            Belum ada data nota barang.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-500">
                            <div>
                                Menampilkan {rows.length} dari {receivables?.total || 0} data
                            </div>
                            <div className="flex gap-2">
                                {receivables?.links?.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        className={`rounded-lg px-3 py-1.5 text-sm ${
                                            link.active
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

ReceivablesIndex.layout = (page) => <DashboardLayout children={page} />;
