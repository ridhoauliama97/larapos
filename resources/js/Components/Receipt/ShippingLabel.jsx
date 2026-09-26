import { IconMapPin, IconPhone, IconUser, IconPackage } from '@tabler/icons-react';

export default function ShippingLabel({ transaction, store = {} }) {
    const formatPrice = (price = 0) =>
        Number(price || 0).toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        });

    const formatDate = (value) => {
        if (!value) return '-';
        const d = new Date(value);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const SimpleBarcode = ({ value }) => {
        const bars = (value || '').split('').map((char, idx) => {
            const weight = (char.charCodeAt(0) + idx * 17) % 4;
            return 2 + weight;
        });

        return (
            <div className="mt-1 flex items-end justify-center gap-[1px] sm:justify-end">
                {bars.map((w, i) => (
                    <span key={i} style={{ width: `${w}px` }} className="block h-8 bg-black" />
                ))}
            </div>
        );
    };

    const storeName = store?.name || 'TOKO';
    const storeInitial = storeName?.[0] || 'T';
    const storeLogo = store?.logo;
    const customer = transaction?.customer || {};
    const region = [
        customer.village_name,
        customer.district_name,
        customer.regency_name,
        customer.province_name,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <div className="flex w-full justify-center py-4 sm:py-0">
            <style>
                {`
                    @media print {
                        @page {
                            size: 150mm 100mm;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                        }
                        .shipping-label-container {
                            box-shadow: none !important;
                            border: 1px solid #e2e8f0 !important;
                            width: 150mm !important;
                            height: 100mm !important;
                            margin: 0 !important;
                            border-radius: 0 !important;
                        }
                    }
                `}
            </style>

            <div
                className="shipping-label-container relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm"
                style={{
                    width: '150mm',
                    minHeight: '100mm',
                }}
            >
                {/* Decorative Side Bar (Commerce Style) */}
                <div className="absolute bottom-0 left-0 top-0 w-2 bg-primary-600 print:hidden" />

                <div>
                    {/* Header Section */}
                    <div className="mb-4 grid grid-cols-[1fr,auto] gap-4 border-b-2 border-dashed border-slate-200 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2">
                                {storeLogo ? (
                                    <img
                                        src={storeLogo}
                                        alt={storeName}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <span className="text-2xl font-black text-primary-600">
                                        {storeInitial}
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-xl font-bold leading-tight text-slate-900">
                                    {storeName}
                                </h2>
                                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                    <IconPhone size={14} /> {store.phone || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="border-l border-slate-200 pl-4 text-right">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                No. Invoice
                            </span>
                            <p className="text-xl font-black tabular-nums text-primary-600">
                                {transaction?.invoice}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                                {formatDate(transaction?.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Address Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Side: Penerima */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-primary-600">
                                <IconUser size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    Penerima
                                </span>
                            </div>
                            <div className="pl-1">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {customer.name || 'Pelanggan Umum'}
                                </h3>
                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                    {customer.phone || ''}
                                </p>
                                <div className="mt-2 flex gap-2">
                                    <IconMapPin
                                        size={16}
                                        className="mt-0.5 shrink-0 text-slate-400"
                                    />
                                    <p className="text-xs uppercase italic leading-relaxed text-slate-600">
                                        {customer.address || 'Ambil di Toko'}
                                    </p>
                                </div>
                                {region && (
                                    <p className="mt-1 text-[11px] uppercase text-slate-500">
                                        {region}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Order Summary */}
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="mb-3 flex items-center gap-2 text-slate-500">
                                <IconPackage size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    Isi Paket
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="line-clamp-3 text-[11px] font-medium leading-relaxed text-slate-600">
                                    {transaction?.details
                                        ?.map((item) => `${item.product?.title} (x${item.qty})`)
                                        .join(', ')}
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                        Total Bayar
                                    </span>
                                    <span className="text-sm font-black text-slate-900">
                                        {formatPrice(transaction?.grand_total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Barcode */}
                <div className="mt-4 flex items-end justify-between border-t-2 border-slate-100 pt-4">
                    <div className="text-[10px] font-medium italic text-slate-400">
                        Dicetak pada: {new Date().toLocaleString('id-ID')}
                    </div>
                    <div className="flex flex-col items-end">
                        <SimpleBarcode value={transaction?.invoice} />
                        <span className="mr-1 mt-1 text-[10px] font-bold uppercase tracking-[3px] text-slate-800">
                            {transaction?.invoice}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
