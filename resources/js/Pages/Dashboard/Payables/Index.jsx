import { useEffect, useState } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Select from '@/Components/Dashboard/Select';
import {
    IconClockHour6,
    IconSearch,
    IconCalendar,
    IconAlertCircle,
    IconPlus,
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

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'unpaid', label: 'Belum Lunas' },
    { value: 'partial', label: 'Parsial' },
    { value: 'paid', label: 'Lunas' },
    { value: 'overdue', label: 'Jatuh Tempo' },
];

export default function PayablesIndex({ payables, filters = {}, suppliers = [] }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.invoice || '');
    const [status, setStatus] = useState(filters.status || '');
    const [supplierId, setSupplierId] = useState(filters.supplier || '');
    const { data, setData, post, processing, reset, errors } = useForm({
        supplier_id: '',
        document_number: '',
        total: '',
        due_date: '',
        note: '',
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(
            route('payables.index'),
            { invoice: search, status, supplier: supplierId },
            { preserveScroll: true, preserveState: true }
        );
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

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('payables.store'), {
            onSuccess: () => reset(),
        });
    };

    const rows = payables?.data || [];

    return (
        <>
            <Head title="Hutang Supplier" />
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconClockHour6 size={26} className="text-primary-500" />
                            Hutang Supplier
                        </h1>
                        <p className="text-sm text-slate-500">
                            Catat dan lacak pembayaran hutang ke supplier.
                        </p>
                    </div>
                </div>

                {/* Create form */}
                <form
                    onSubmit={submitCreate}
                    className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-5"
                >
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Supplier
                        </label>
                        <Select
                            value={data.supplier_id}
                            onChange={(value) => setData('supplier_id', value)}
                            options={[
                                { value: '', label: 'Umum' },
                                ...suppliers.map((s) => ({
                                    value: s.id,
                                    label: s.name,
                                })),
                            ]}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Nomor Dokumen
                        </label>
                        <input
                            value={data.document_number}
                            onChange={(e) => setData('document_number', e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                            placeholder="Opsional"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Total
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={data.total}
                            onChange={(e) => setData('total', e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                            required
                        />
                        {errors.total && <p className="text-xs text-danger-500">{errors.total}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Jatuh Tempo
                        </label>
                        <input
                            type="date"
                            value={data.due_date}
                            onChange={(e) => setData('due_date', e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 text-sm font-semibold text-white"
                        >
                            <IconPlus size={16} />
                            Simpan
                        </button>
                    </div>
                    <div className="md:col-span-5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Catatan
                        </label>
                        <textarea
                            rows={2}
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                            placeholder="Catatan tambahan (opsional)"
                        />
                    </div>
                </form>

                {/* Filters */}
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
                            placeholder="Cari nomor dokumen"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                        />
                    </div>
                    <Select
                        value={supplierId}
                        onChange={(value) => setSupplierId(value)}
                        options={[
                            { value: '', label: 'Semua Supplier' },
                            ...suppliers.map((s) => ({
                                value: s.id,
                                label: s.name,
                            })),
                        ]}
                        size="sm"
                        className="w-full"
                    />
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
                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
                    >
                        Terapkan
                    </button>
                </form>

                {/* Table + Cards */}
                <div className="rounded-2xl border-0 bg-transparent shadow-none sm:overflow-hidden sm:border sm:border-slate-200 sm:bg-white sm:dark:border-slate-800 sm:dark:bg-slate-900">
                    <div className="hidden w-full overflow-x-auto sm:block">
                        <div className="min-w-[720px]">
                            <div className="grid grid-cols-12 border-b border-slate-100 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 sm:px-4">
                                <div className="col-span-2">Dokumen</div>
                                <div className="col-span-2">Supplier</div>
                                <div className="col-span-2 text-right">Total</div>
                                <div className="col-span-2 text-right">Sisa</div>
                                <div className="col-span-2 text-right">Jatuh Tempo</div>
                                <div className="col-span-2 min-w-[140px] text-center">Status</div>
                            </div>
                            {rows.length ? (
                                rows.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={route('payables.show', item.id)}
                                        className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 px-3 py-3 transition-colors hover:bg-primary-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50 sm:px-4"
                                    >
                                        <div className="col-span-2">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                {item.document_number}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-slate-700 dark:text-slate-200">
                                                {item.supplier?.name || '-'}
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
                                        <div className="col-span-2 flex justify-center whitespace-nowrap">
                                            {statusBadge(item.status)}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <IconAlertCircle
                                        size={28}
                                        className="mx-auto mb-2 text-slate-400"
                                    />
                                    Belum ada data hutang.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="flex flex-col gap-3 px-1 sm:hidden">
                        {rows.length ? (
                            rows.map((item) => (
                                <Link
                                    key={item.id}
                                    href={route('payables.show', item.id)}
                                    className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Dokumen
                                            </p>
                                            <p className="text-base font-semibold text-slate-900 dark:text-white">
                                                {item.document_number || '-'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Jatuh tempo: {formatDate(item.due_date)}
                                            </p>
                                        </div>
                                        <div className="space-y-2 text-right">
                                            {statusBadge(item.status)}
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(item.total)}
                                            </p>
                                            <p className="text-xs text-primary-600 dark:text-primary-400">
                                                Sisa {formatCurrency(item.remaining)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Supplier
                                            </p>
                                            <p className="font-medium">
                                                {item.supplier?.name || '-'}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Status
                                            </p>
                                            <p className="font-medium capitalize">{item.status}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                <IconAlertCircle
                                    size={28}
                                    className="mx-auto mb-2 text-slate-400"
                                />
                                Belum ada data hutang.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

PayablesIndex.layout = (page) => <DashboardLayout children={page} />;
