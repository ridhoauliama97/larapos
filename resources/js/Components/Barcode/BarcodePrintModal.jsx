import { useState, useRef } from 'react';
import Select from '@/Components/Dashboard/Select';
import { BarcodeLabelGrid } from './BarcodeLabel';
import { IconX, IconPrinter, IconBarcode, IconTruck } from '@tabler/icons-react';

/**
 * BarcodePrintModal - Modal for printing barcode labels
 */
export default function BarcodePrintModal({
    isOpen,
    onClose,
    products = [],
    singleProduct = null,
}) {
    const [size, setSize] = useState('70x50');
    const [showPrice, setShowPrice] = useState(true);
    const [showOngkir, setShowOngkir] = useState(false);
    const [ongkirAmount, setOngkirAmount] = useState(0);
    const [copies, setCopies] = useState(1);
    const printRef = useRef(null);

    const productsToPrint = singleProduct ? [singleProduct] : products;

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Barcode</title>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                <style>
                    @page {
                        size: A4;
                        margin: 5mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    .barcode-grid {
                        display: grid;
                        gap: 2mm;
                    }
                    .barcode-label {
                        border: 1px solid #ccc;
                        padding: 2mm;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        page-break-inside: avoid;
                        background: white;
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
                <script>
                    document.querySelectorAll('.barcode-svg').forEach(svg => {
                        const code = svg.dataset.code;
                        if (code) {
                            JsBarcode(svg, code, {
                                format: "CODE128",
                                width: 2,
                                height: 50,
                                displayValue: true,
                                fontSize: 12,
                                margin: 5,
                            });
                        }
                    });
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 500);
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <IconBarcode size={24} className="text-primary-500" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            Cetak Barcode
                        </h2>
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                            {productsToPrint.length} produk
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <IconX size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Options */}
                <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {/* Size */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                                Ukuran Label
                            </label>
                            <Select
                                value={size}
                                onChange={(value) => setSize(value)}
                                options={[
                                    { value: '50x30', label: '50 x 30 mm' },
                                    { value: '70x50', label: '70 x 50 mm' },
                                    { value: '100x50', label: '100 x 50 mm' },
                                ]}
                                className="w-full"
                            />
                        </div>

                        {/* Copies */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                                Jumlah per Produk
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={copies}
                                onChange={(e) => setCopies(Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                            />
                        </div>

                        {/* Show Price */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showPrice"
                                checked={showPrice}
                                onChange={(e) => setShowPrice(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                            />
                            <label
                                htmlFor="showPrice"
                                className="text-sm text-slate-700 dark:text-slate-300"
                            >
                                Tampilkan Harga
                            </label>
                        </div>

                        {/* Show Ongkir */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showOngkir"
                                checked={showOngkir}
                                onChange={(e) => setShowOngkir(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                            />
                            <label
                                htmlFor="showOngkir"
                                className="text-sm text-slate-700 dark:text-slate-300"
                            >
                                Tampilkan Ongkir
                            </label>
                        </div>
                    </div>

                    {/* Ongkir Amount */}
                    {showOngkir && (
                        <div className="mt-3">
                            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                                <IconTruck size={14} className="mr-1 inline" />
                                Nominal Ongkir
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={ongkirAmount}
                                onChange={(e) => setOngkirAmount(Number(e.target.value))}
                                placeholder="Contoh: 15000"
                                className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                            />
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="overflow-auto p-4" style={{ maxHeight: '400px' }}>
                    <p className="mb-3 text-xs text-slate-500">Preview:</p>
                    <div
                        ref={printRef}
                        className="rounded-lg border border-dashed border-slate-300 bg-white p-4"
                    >
                        <BarcodeLabelGrid
                            products={productsToPrint}
                            size={size}
                            showPrice={showPrice}
                            showOngkir={showOngkir}
                            ongkirAmount={ongkirAmount}
                            copies={copies}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-4 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                    >
                        <IconPrinter size={18} />
                        Cetak
                    </button>
                </div>
            </div>
        </div>
    );
}
