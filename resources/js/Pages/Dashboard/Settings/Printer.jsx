import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Select from '@/Components/Dashboard/Select';
import { Head, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { IconPrinter } from '@tabler/icons-react';
import { requestPrinter, disconnectPrinter, printReceipt, kickDrawer } from '@/Utils/escpos';

export default function Printer({ settings }) {
    const { data, setData, post, processing } = useForm({
        printer_auto_print: settings.printer_auto_print || false,
        printer_paper_size: settings.printer_paper_size || '80mm',
    });
    const [printerConnected, setPrinterConnected] = useState(false);
    const [printerBusy, setPrinterBusy] = useState(false);

    const handleConnect = async () => {
        setPrinterBusy(true);
        try {
            await requestPrinter();
            setPrinterConnected(true);
            toast.success('Printer terhubung');
        } catch (e) {
            toast.error(e.message || 'Gagal menghubungkan printer');
        } finally {
            setPrinterBusy(false);
        }
    };

    const handleTestPrint = async () => {
        setPrinterBusy(true);
        try {
            await printReceipt(
                {
                    store_name: 'TEST PRINT',
                    invoice: 'TEST-001',
                    created_at: new Date().toLocaleString('id-ID'),
                    items: [{ qty: 1, name: 'Produk Uji Cetak', price: 1000 }],
                    money: (v) => `Rp${Number(v || 0).toLocaleString('id-ID')}`,
                    subtotal: 1000,
                    discount_total: 0,
                    tax_total: 0,
                    shipping_cost: 0,
                    grand_total: 1000,
                    payment_method_label: 'Tunai',
                    cash_received: 1000,
                    change: 0,
                },
                data.printer_paper_size
            );
            toast.success('Test print terkirim');
        } catch (e) {
            toast.error(e.message || 'Gagal test print');
        } finally {
            setPrinterBusy(false);
        }
    };

    const handleKickDrawer = async () => {
        setPrinterBusy(true);
        try {
            await kickDrawer();
            toast.success('Drawer dikick');
        } catch (e) {
            toast.error(e.message || 'Gagal kick drawer');
        } finally {
            setPrinterBusy(false);
        }
    };

    const handleDisconnect = async () => {
        await disconnectPrinter();
        setPrinterConnected(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('settings.printer.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Pengaturan printer disimpan'),
            onError: () => toast.error('Gagal menyimpan'),
        });
    };

    return (
        <>
            <Head title="Pengaturan Printer" />
            <div className="space-y-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                        <IconPrinter size={28} className="text-primary-500" />
                        Pengaturan Printer
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Atur printer thermal untuk cetak struk otomatis
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Ukuran Kertas
                        </label>
                        <Select
                            value={data.printer_paper_size}
                            onChange={(value) => setData('printer_paper_size', value)}
                            options={[
                                { value: '80mm', label: '80 mm' },
                                { value: '58mm', label: '58 mm' },
                            ]}
                            className="w-full"
                        />
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={data.printer_auto_print}
                            onChange={(e) => setData('printer_auto_print', e.target.checked)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        Cetak otomatis setelah transaksi
                    </label>

                    <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <p className="text-sm text-slate-500">
                            Printer thermal terhubung via WebUSB (Chrome/Edge)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {!printerConnected ? (
                                <button
                                    type="button"
                                    onClick={handleConnect}
                                    disabled={printerBusy}
                                    className="rounded-xl border border-primary-500 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 disabled:opacity-50 dark:hover:bg-primary-950/30"
                                >
                                    Hubungkan Printer
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleTestPrint}
                                        disabled={printerBusy}
                                        className="rounded-xl border border-primary-500 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 disabled:opacity-50 dark:hover:bg-primary-950/30"
                                    >
                                        Test Print
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleKickDrawer}
                                        disabled={printerBusy}
                                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        Buka Laci (Kick)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDisconnect}
                                        className="rounded-xl border border-danger-300 px-4 py-2 text-sm font-medium text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/30"
                                    >
                                        Putuskan
                                    </button>
                                </>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-primary-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Printer.layout = (page) => <DashboardLayout children={page} />;
