import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { IconBrandWhatsapp, IconPlugConnected, IconPlugConnectedX } from '@tabler/icons-react';

export default function Whatsapp({ settings, waStatus }) {
    const { data, setData, post, processing } = useForm({
        wa_service_url: settings.wa_service_url || '',
        wa_enabled: settings.wa_enabled || false,
        wa_auto_reminder: settings.wa_auto_reminder || false,
        wa_auto_invoice: settings.wa_auto_invoice || false,
    });

    const [status, setStatus] = useState(
        waStatus || { connected: false, phone: null, qr: null, starting: false }
    );
    const [polling, setPolling] = useState(false);
    const [statusError, setStatusError] = useState(null);
    const [testNumber, setTestNumber] = useState('');

    // Declared before the polling effect that calls it. It was below, which only
    // worked by accident and left the closure fragile.
    const fetchStatus = async () => {
        try {
            const res = await axios.get(route('settings.whatsapp.status'));
            setStatus(res.data);
            setStatusError(null);
            if (res.data.connected) setPolling(false);
        } catch (e) {
            // Previously swallowed: the card sat on "Terputus" with no hint that the
            // Node service was unreachable, and the 3s poll kept hammering it.
            setStatusError(
                e.response?.data?.message ||
                    'Gagal menghubungi WhatsApp service. Pastikan service berjalan di port 3001.'
            );
            setPolling(false);
        }
    };

    useEffect(() => {
        let interval;
        if (polling || status.starting) {
            interval = setInterval(() => {
                fetchStatus();
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [polling, status.starting]);

    const handleConnect = async () => {
        try {
            await axios.post(route('settings.whatsapp.start'));
            setPolling(true);
            setStatus((s) => ({ ...s, starting: true }));
        } catch {
            toast.error('Gagal menghubungkan');
        }
    };

    const handleDisconnect = async () => {
        try {
            await axios.post(route('settings.whatsapp.disconnect'));
            setStatus({ connected: false, phone: null, qr: null, starting: false });
            toast.success('Koneksi diputuskan');
        } catch {
            toast.error('Gagal memutuskan koneksi');
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        post(route('settings.whatsapp.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Pengaturan WhatsApp disimpan'),
            onError: () => toast.error('Gagal menyimpan'),
        });
    };

    const handleTest = async () => {
        if (!testNumber) return toast.error('Masukkan nomor tujuan');
        try {
            await axios.post(route('settings.whatsapp.test'), { target: testNumber });
            toast.success('Pesan test terkirim!');
        } catch {
            toast.error('Gagal mengirim');
        }
    };

    return (
        <>
            <Head title="Pengaturan WhatsApp" />
            <div className="space-y-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                        <IconBrandWhatsapp size={28} className="text-emerald-500" />
                        WhatsApp Gateway
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Hubungkan WhatsApp untuk kirim pesan otomatis via campaign CRM
                    </p>
                </div>

                {/* Status Card */}
                <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center gap-3">
                        <div
                            className={`h-3 w-3 rounded-full ${status.connected ? 'bg-emerald-500' : status.starting ? 'animate-pulse bg-amber-400' : 'bg-slate-300'}`}
                        />
                        <span className="font-medium text-slate-800 dark:text-white">
                            {status.connected
                                ? `Terhubung (${status.phone})`
                                : status.starting
                                  ? 'Menghubungkan...'
                                  : 'Terputus'}
                        </span>
                    </div>

                    {statusError && (
                        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                            {statusError}
                        </div>
                    )}

                    {status.qr && !status.connected && (
                        <div className="mb-4 text-center">
                            <img src={status.qr} alt="QR Code" className="mx-auto h-48 w-48" />
                            <p className="mt-2 text-xs text-slate-400">
                                Scan dengan WhatsApp &gt; Perangkat Tertaut &gt; Perangkat Baru
                            </p>
                        </div>
                    )}

                    {!status.connected && (
                        <button
                            onClick={handleConnect}
                            disabled={processing || status.starting}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                        >
                            <IconPlugConnected size={18} />
                            {status.starting ? 'Menghubungkan...' : 'Hubungkan WhatsApp'}
                        </button>
                    )}
                    {status.connected && (
                        <button
                            onClick={handleDisconnect}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                        >
                            <IconPlugConnectedX size={18} />
                            Putuskan Koneksi
                        </button>
                    )}
                </div>

                {/* Settings Form */}
                <form
                    onSubmit={handleSave}
                    className="max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            URL Service WhatsApp
                        </label>
                        <input
                            type="text"
                            value={data.wa_service_url}
                            onChange={(e) => setData('wa_service_url', e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                            placeholder="http://localhost:3001"
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            Alamat Node.js service whatsapp-web.js
                        </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={data.wa_enabled}
                            onChange={(e) => setData('wa_enabled', e.target.checked)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        Aktifkan WhatsApp Gateway
                    </label>

                    <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Kirim Otomatis
                        </h3>
                        <label className="mb-2 flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={data.wa_auto_reminder}
                                onChange={(e) => setData('wa_auto_reminder', e.target.checked)}
                                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            Kirim reminder piutang otomatis
                        </label>
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={data.wa_auto_invoice}
                                onChange={(e) => setData('wa_auto_invoice', e.target.checked)}
                                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            Kirim invoice setelah transaksi
                        </label>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        >
                            Simpan Pengaturan
                        </button>
                    </div>
                </form>

                {/* Test Send */}
                {status.connected && (
                    <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Test Kirim Pesan
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={testNumber}
                                onChange={(e) => setTestNumber(e.target.value)}
                                placeholder="0812xxxxxxx"
                                className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm"
                            />
                            <button
                                onClick={handleTest}
                                disabled={processing}
                                className="rounded-xl bg-emerald-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                            >
                                Kirim
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Whatsapp.layout = (page) => <DashboardLayout children={page} />;
