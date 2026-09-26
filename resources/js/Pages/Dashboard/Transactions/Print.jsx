import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconPrinter,
    IconExternalLink,
    IconReceipt,
    IconFileInvoice,
    IconTruck,
    IconBuildingBank,
    IconCheck,
    IconAlertCircle,
    IconShare,
} from '@tabler/icons-react';
import ThermalReceipt, { ThermalReceipt58mm } from '@/Components/Receipt/ThermalReceipt';
import ShippingLabel from '@/Components/Receipt/ShippingLabel';
import { useAuthorization } from '@/Utils/authorization';
import { hasCachedPrinter, kickDrawer, printReceipt } from '@/Utils/escpos';
import toast from 'react-hot-toast';

export default function Print({ transaction }) {
    const { storeProfile, printerSettings } = usePage().props;
    const { can } = useAuthorization();
    const [printMode, setPrintMode] = useState('invoice'); // 'invoice' | 'thermal80' | 'thermal58'
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [liveStatus, setLiveStatus] = useState(transaction?.payment_status || 'pending');
    const [printFailed, setPrintFailed] = useState(false);
    const canConfirmPayment = can('transactions-confirm-payment');

    const showQris = Boolean(transaction?.qr_string) && liveStatus === 'pending';

    // Poll QRIS payment status every 4s while pending
    useEffect(() => {
        if (!showQris) return undefined;
        const timer = setInterval(async () => {
            try {
                const res = await fetch(route('transactions.status', transaction.invoice), {
                    headers: { Accept: 'application/json' },
                });
                const data = await res.json();
                if (data.payment_status && data.payment_status !== liveStatus) {
                    setLiveStatus(data.payment_status);
                    if (data.payment_status === 'paid') {
                        toast.success('Pembayaran QRIS diterima!');
                        router.reload({ only: ['transaction'] });
                    }
                }
            } catch {
                // ignore transient network errors
            }
        }, 4000);
        return () => clearInterval(timer);
    }, [showQris, transaction?.invoice, liveStatus]);

    const formatPrice = (price = 0) =>
        Number(price || 0).toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        });

    const formatDateTime = (value) =>
        new Date(value).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const items = transaction?.details ?? [];
    const promoDiscountTotal = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.discount_total || 0), 0),
        [items]
    );
    const loyaltyDiscountTotal = Number(transaction?.loyalty_discount_total || 0);
    const voucherDiscountTotal = Number(transaction?.customer_voucher_discount || 0);
    const baseSubtotal =
        (transaction?.grand_total || 0) +
        (transaction?.discount || 0) -
        (transaction?.shipping_cost || 0) -
        (transaction?.tax_total || 0) +
        promoDiscountTotal +
        loyaltyDiscountTotal +
        voucherDiscountTotal;

    const store = useMemo(
        () => ({
            name: storeProfile?.name || 'Toko Anda',
            logo: storeProfile?.logo || null,
            address: storeProfile?.address || '',
            phone: storeProfile?.phone || '',
            email: storeProfile?.email || '',
            website: storeProfile?.website || '',
        }),
        [storeProfile]
    );

    const paymentLabels = {
        cash: 'Tunai',
        bank_transfer: 'Transfer Bank',
        midtrans: 'Midtrans',
        xendit: 'Xendit',
        pay_later: 'Piutang',
    };
    const paymentMethodKey = (transaction?.payment_method || 'cash').toLowerCase();
    const paymentMethodLabel = paymentLabels[paymentMethodKey] ?? 'Tunai';

    const paymentStatuses = {
        paid: 'Lunas',
        pending: transaction?.payment_method === 'pay_later' ? 'Belum Lunas' : 'Menunggu',
        failed: 'Gagal',
        expired: 'Kedaluwarsa',
        unpaid: 'Belum Lunas',
        partial: 'Parsial',
    };
    const paymentStatusKey = (transaction?.payment_status || '').toLowerCase();
    const paymentStatusLabel =
        paymentStatuses[paymentStatusKey] ?? (paymentMethodKey === 'cash' ? 'Lunas' : 'Menunggu');

    const statusColors = {
        paid: 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400',
        pending: 'bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-400',
        unpaid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
        partial: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400',
        failed: 'bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400',
        expired: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    };
    const paymentStatusColor = statusColors[paymentStatusKey] ?? statusColors.paid;

    const isNonCash = paymentMethodKey !== 'cash';
    const showPaymentLink = isNonCash && transaction.payment_url;

    // ponytail: auto-print silently skips if no WebUSB printer is cached; browser print stays manual
    useEffect(() => {
        if (!printerSettings?.autoPrint) return;
        if (!hasCachedPrinter()) return;
        if (!transaction?.details?.length) return;
        if (showQris) return; // wait for payment confirmation first
        const orderTypeLabels = {
            in_store: 'Di Tempat',
            takeaway: 'Bawa Pulang',
            delivery: 'Diantar',
        };
        const discountTotal =
            Number(transaction.discount || 0) +
            promoDiscountTotal +
            loyaltyDiscountTotal +
            voucherDiscountTotal;
        const data = {
            store_name: store.name,
            store_address: store.address,
            store_phone: store.phone,
            invoice: transaction.invoice,
            created_at: formatDateTime(transaction.created_at),
            cashier: transaction.cashier?.name,
            customer_name: transaction.customer?.name,
            order_type_label: orderTypeLabels[transaction.order_type] ?? transaction.order_type,
            items: items.map((item) => ({
                qty: Number(item.qty),
                name: item.product?.title ?? item.product?.name ?? 'Item',
                price: Number(item.price),
            })),
            money: formatPrice,
            subtotal: baseSubtotal,
            discount_total: discountTotal,
            tax_total: Number(transaction.tax_total || 0),
            shipping_cost: Number(transaction.shipping_cost || 0),
            grand_total: Number(transaction.grand_total || 0),
            payment_method_label: paymentMethodLabel,
            cash_received: isNonCash ? null : Number(transaction.cash || 0),
            change: Number(transaction.change || 0),
            note: transaction.note,
            footer: 'Terima kasih!',
        };
        (async () => {
            try {
                await printReceipt(data, printerSettings.paperSize);
                toast.success('Struk tercetak otomatis.');
                if (!isNonCash) {
                    await kickDrawer().catch(() => {});
                }
            } catch {
                // Printer busy, disconnected, or a browser without WebUSB. The
                // old comment here claimed "manual print still available", but no
                // button was ever rendered and the error was swallowed, so the
                // cashier got no receipt and no explanation. Tell them, and point
                // them at the manual print button.
                setPrintFailed(true);
                toast.error('Printer tidak tersedia. Gunakan tombol "Cetak" untuk cetak manual.', {
                    duration: 8000,
                });
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transaction?.id, printerSettings?.autoPrint]);

    const handlePrint = () => {
        window.print();
    };

    const SimpleBarcode = ({ value }) => {
        const bars = useMemo(() => {
            const data = value || '';
            return data.split('').map((char, idx) => {
                const weight = (char.charCodeAt(0) + idx * 17) % 5;
                return 2 + weight; // 2-6px width
            });
        }, [value]);
        const totalWidth = bars.reduce((acc, w) => acc + w, 0);
        const targetWidth = 180; // px target
        const scale = totalWidth ? Math.min(2.2, targetWidth / totalWidth) : 1;

        return (
            <div className="mt-4 flex items-end gap-[2px]">
                {bars.map((w, i) => (
                    <span
                        key={i}
                        style={{ width: `${w * scale}px` }}
                        className="block h-10 bg-slate-800 dark:bg-slate-100 sm:h-14"
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <Head title="Invoice Penjualan" />

            <div className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950 print:bg-white print:p-0">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Action Bar */}
                    <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
                        <Link
                            href={route('transactions.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <IconArrowLeft size={18} />
                            Kembali ke kasir
                        </Link>

                        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                            {printFailed && (
                                <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 sm:w-auto">
                                    <span>Printer thermal tidak tersedia.</span>
                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
                                    >
                                        Cetak
                                    </button>
                                </div>
                            )}
                            {/* Print Mode Selector */}
                            <div className="flex w-full rounded-xl bg-slate-200 p-1 dark:bg-slate-800 sm:w-auto">
                                <button
                                    onClick={() => setPrintMode('invoice')}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                        printMode === 'invoice'
                                            ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    <IconFileInvoice size={16} className="mr-1 inline" />
                                    Invoice
                                </button>
                                <button
                                    onClick={() => setPrintMode('thermal80')}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                        printMode === 'thermal80'
                                            ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    <IconReceipt size={16} className="mr-1 inline" />
                                    Struk 80mm
                                </button>
                                <button
                                    onClick={() => setPrintMode('thermal58')}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                        printMode === 'thermal58'
                                            ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    <IconReceipt size={16} className="mr-1 inline" />
                                    Struk 58mm
                                </button>
                                <button
                                    onClick={() => setPrintMode('shipping')}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                        printMode === 'shipping'
                                            ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    <IconTruck size={16} className="mr-1 inline" />
                                    Resi
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const res = await fetch(
                                            route('pdf.transactions.thermal', transaction.invoice)
                                        );
                                        const html = await res.text();
                                        const blob = new Blob([html], { type: 'text/html' });
                                        const url = URL.createObjectURL(blob);
                                        window.open(url, '_blank', 'width=400,height=600');
                                    } catch (e) {
                                        alert('Gagal cetak thermal: ' + e.message);
                                    }
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 sm:w-auto"
                            >
                                <IconPrinter size={18} />
                                Thermal
                            </button>

                            {showPaymentLink && (
                                <a
                                    href={transaction.payment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 px-4 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-950/50 sm:w-auto"
                                >
                                    <IconExternalLink size={18} />
                                    Pembayaran
                                </a>
                            )}

                            {showQris && (
                                <div className="flex w-full flex-col items-center gap-2 rounded-2xl border border-primary-200 bg-primary-50/60 p-4 dark:border-primary-800 dark:bg-primary-950/30 sm:w-auto print:hidden">
                                    <img
                                        src={route('transactions.qr', transaction.invoice)}
                                        alt="QRIS"
                                        className="h-48 w-48 rounded-lg bg-white p-2"
                                    />
                                    <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                                        Scan QRIS untuk membayar
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-warning-500" />
                                        Menunggu pembayaran…
                                    </span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    const url = route('portal.transaction', [
                                        transaction.invoice,
                                        { token: transaction.access_token },
                                    ]);
                                    navigator.clipboard?.writeText(
                                        window.location.origin + '/' + url.replace(/^\/+/, '')
                                    );
                                    alert('Link invoice disalin');
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 sm:w-auto"
                            >
                                <IconShare size={18} />
                                Share
                            </button>

                            {/* Confirm Payment Button - Only for pending bank_transfer */}
                            {paymentMethodKey === 'bank_transfer' &&
                                paymentStatusKey === 'pending' &&
                                canConfirmPayment && (
                                    <button
                                        onClick={() => setShowConfirmModal(true)}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-success-600 sm:w-auto"
                                    >
                                        <IconCheck size={18} />
                                        Konfirmasi Bayar
                                    </button>
                                )}

                            {printMode === 'invoice' && (
                                <a
                                    href={route('pdf.transactions.invoice', transaction.invoice)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-colors hover:bg-primary-600 sm:w-auto"
                                >
                                    <IconPrinter size={18} />
                                    PDF Invoice
                                </a>
                            )}

                            {(printMode === 'thermal80' || printMode === 'thermal58') && (
                                <a
                                    href={route('pdf.transactions.receipt', {
                                        invoice: transaction.invoice,
                                        size: printMode === 'thermal58' ? '58' : '80',
                                    })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-900 sm:w-auto"
                                >
                                    <IconPrinter size={18} />
                                    PDF Struk {printMode === 'thermal58' ? '58mm' : '80mm'}
                                </a>
                            )}

                            {printMode === 'shipping' && (
                                <a
                                    href={route('pdf.transactions.shipping', transaction.invoice)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:w-auto"
                                >
                                    <IconPrinter size={18} />
                                    PDF Resi
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Thermal Receipt Preview */}
                    {(printMode === 'thermal80' || printMode === 'thermal58') && (
                        <div className="flex justify-center print:block">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 print:rounded-none print:border-0 print:p-0 print:shadow-none">
                                {printMode === 'thermal80' ? (
                                    <ThermalReceipt
                                        transaction={transaction}
                                        storeName={store.name}
                                        storeAddress={store.address}
                                        storePhone={store.phone}
                                        storeEmail={store.email}
                                        storeWebsite={store.website}
                                    />
                                ) : (
                                    <ThermalReceipt58mm
                                        transaction={transaction}
                                        storeName={store.name}
                                        storePhone={store.phone}
                                        storeEmail={store.email}
                                        storeWebsite={store.website}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Shipping Label Preview */}
                    {printMode === 'shipping' && (
                        <div className="flex items-center justify-center py-10 print:block print:py-0">
                            <div className="mx-auto w-full max-w-[150mm] scale-100 transform transition-all duration-300 md:scale-110 lg:scale-125 print:scale-100">
                                <ShippingLabel transaction={transaction} store={store} />
                            </div>
                        </div>
                    )}

                    {/* Invoice View */}
                    {printMode === 'invoice' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 print:border-slate-300 print:shadow-none">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-5 text-white sm:px-6 sm:py-6 print:bg-slate-100 print:text-slate-900">
                                <div className="flex flex-col items-center gap-4 text-center sm:grid sm:grid-cols-[1.4fr,1fr] sm:items-start sm:gap-5 sm:text-left">
                                    <div className="flex min-w-0 flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-3">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center p-1 sm:h-14 sm:w-14">
                                            {store.logo ? (
                                                <img
                                                    src={store.logo}
                                                    alt={store.name}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-lg font-bold text-white print:text-slate-800">
                                                    {store.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 space-y-1 text-center text-white sm:text-left print:text-slate-800">
                                            <p className="text-base font-bold leading-tight sm:text-lg">
                                                {store.name}
                                            </p>
                                            {store.address && (
                                                <p className="break-words text-[11px] leading-snug opacity-90 sm:text-xs">
                                                    {store.address}
                                                </p>
                                            )}
                                            {(store.phone || store.email || store.website) && (
                                                <p className="flex flex-wrap justify-center gap-x-2 gap-y-1 space-x-2 text-[11px] leading-snug opacity-90 sm:justify-start sm:text-xs">
                                                    {store.phone && (
                                                        <span>Telp: {store.phone}</span>
                                                    )}
                                                    {store.email && (
                                                        <span>Email: {store.email}</span>
                                                    )}
                                                    {store.website && <span>{store.website}</span>}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center sm:text-right">
                                        <div className="inline-flex min-w-[180px] flex-col items-center rounded-xl bg-white/5 px-3 py-2 sm:min-w-[200px] sm:items-end sm:px-4 sm:py-3 print:bg-transparent">
                                            <div className="mb-1 flex items-center justify-center gap-2 sm:justify-end">
                                                <IconReceipt size={20} className="sm:h-6 sm:w-6" />
                                                <span className="text-xs font-medium opacity-90 sm:text-sm print:opacity-100">
                                                    INVOICE
                                                </span>
                                            </div>
                                            <p className="text-lg font-bold leading-tight sm:text-2xl">
                                                {transaction.invoice}
                                            </p>
                                            <p className="mt-1 text-xs opacity-80 sm:text-sm print:opacity-100">
                                                {formatDateTime(transaction.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:gap-6 sm:px-6 sm:py-6 md:grid-cols-2">
                                <div className="rounded-xl bg-slate-50/60 p-3 dark:bg-slate-800/40 sm:p-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        Pelanggan
                                    </p>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                        {transaction.customer?.name ?? 'Umum'}
                                    </p>
                                    {transaction.customer?.address && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {transaction.customer.address}
                                        </p>
                                    )}
                                    {transaction.customer?.phone && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {transaction.customer.phone}
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-xl bg-slate-50/60 p-3 dark:bg-slate-800/40 sm:p-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        Kasir
                                    </p>
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                                            {transaction.cashier?.name ?? '-'}
                                        </p>
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <span
                                                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusColor}`}
                                            >
                                                {paymentStatusLabel}
                                            </span>
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                {paymentMethodLabel}
                                            </span>
                                            {transaction.order_type && (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {{
                                                        in_store: 'Di Tempat',
                                                        takeaway: 'Bawa Pulang',
                                                        delivery: 'Diantar',
                                                    }[transaction.order_type] ??
                                                        transaction.order_type}
                                                </span>
                                            )}
                                            {transaction.payment_method === 'pay_later' &&
                                                transaction.receivable && (
                                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                        Jatuh tempo:{' '}
                                                        {transaction.receivable?.due_date || '-'}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Transfer Info */}
                            {paymentMethodKey === 'bank_transfer' && transaction.bank_account && (
                                <div className="mx-6 mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Silakan Transfer ke Rekening
                                    </p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                        {transaction.bank_account.bank_name}
                                    </p>
                                    <p className="text-base font-semibold text-primary-600 dark:text-primary-400">
                                        {transaction.bank_account.account_number}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        a.n. {transaction.bank_account.account_name}
                                    </p>
                                </div>
                            )}

                            {/* Items Table */}
                            <div className="px-4 py-6 sm:px-6">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[620px] text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Produk
                                                </th>
                                                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Harga
                                                </th>
                                                <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Qty
                                                </th>
                                                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {items.map((item, index) => {
                                                const quantity = Number(item.qty) || 1;
                                                const subtotal = Number(item.price) || 0;
                                                const unitPrice =
                                                    Number(item.unit_price || 0) ||
                                                    subtotal / quantity;
                                                const baseUnitPrice =
                                                    Number(item.base_unit_price || 0) || unitPrice;
                                                const hasPromo =
                                                    Number(item.discount_total || 0) > 0 &&
                                                    baseUnitPrice > unitPrice;

                                                return (
                                                    <tr
                                                        key={item.id ?? index}
                                                        className={
                                                            index % 2 === 0
                                                                ? 'bg-slate-50/60 dark:bg-slate-800/30'
                                                                : ''
                                                        }
                                                    >
                                                        <td className="py-3">
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {item.product?.title}
                                                            </p>
                                                            {hasPromo && (
                                                                <p className="text-xs font-medium text-rose-500 dark:text-rose-400">
                                                                    {item.pricing_group_label ||
                                                                        item.pricing_rule_name ||
                                                                        'Promo aktif'}
                                                                </p>
                                                            )}
                                                            {item.product?.barcode && (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {item.product.barcode}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                                                            <div>
                                                                {hasPromo && (
                                                                    <p className="text-xs text-slate-400 line-through">
                                                                        {formatPrice(baseUnitPrice)}
                                                                    </p>
                                                                )}
                                                                <p>{formatPrice(unitPrice)}</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center text-slate-600 dark:text-slate-400">
                                                            {quantity}
                                                        </td>
                                                        <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">
                                                            {formatPrice(subtotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-slate-50 px-6 py-6 dark:bg-slate-800/50">
                                <div className="ml-auto max-w-xs space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(baseSubtotal)}</span>
                                    </div>
                                    {promoDiscountTotal > 0 && (
                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>Promo Otomatis</span>
                                            <span>- {formatPrice(promoDiscountTotal)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Diskon Manual</span>
                                        <span>- {formatPrice(transaction.discount)}</span>
                                    </div>
                                    {transaction.shipping_cost > 0 && (
                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>Ongkos Kirim</span>
                                            <span>+ {formatPrice(transaction.shipping_cost)}</span>
                                        </div>
                                    )}
                                    {transaction.tax_total > 0 && (
                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>
                                                PPN{' '}
                                                {transaction.tax_rate
                                                    ? Number(transaction.tax_rate).toFixed(0)
                                                    : '11'}
                                                %
                                            </span>
                                            <span>+ {formatPrice(transaction.tax_total)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                                        <span>Total</span>
                                        <span>{formatPrice(transaction.grand_total)}</span>
                                    </div>
                                    {paymentMethodKey === 'cash' && (
                                        <>
                                            <div className="flex justify-between pt-2 text-slate-600 dark:text-slate-400">
                                                <span>Tunai</span>
                                                <span>{formatPrice(transaction.cash)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium text-success-600 dark:text-success-400">
                                                <span>Kembali</span>
                                                <span>{formatPrice(transaction.change)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Barcode + Footer */}
                            <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Invoice: {transaction.invoice}
                                </p>
                                <SimpleBarcode value={transaction.invoice} />
                                <div className="mt-4 text-center">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Terima kasih telah berbelanja
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && canConfirmPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !isConfirming && setShowConfirmModal(false)}
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
                                        {transaction.invoice}
                                    </span>
                                </div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Pelanggan
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {transaction.customer?.name ?? 'Umum'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Total
                                    </span>
                                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {formatPrice(transaction.grand_total ?? 0)}
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
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isConfirming}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    setIsConfirming(true);
                                    router.patch(
                                        route('transactions.confirm-payment', transaction.id),
                                        {},
                                        {
                                            onSuccess: () => {
                                                setShowConfirmModal(false);
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
}
