import { useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Input from '@/Components/Dashboard/Input';
import Checkbox from '@/Components/Dashboard/Checkbox';
import Select from '@/Components/Dashboard/Select';
import { useAuthorization } from '@/Utils/authorization';
import { IconCreditCard, IconDeviceFloppy, IconBrandStripe, IconCash } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function Payment({
    setting,
    paymentSettingSources = {},
    supportedGateways = [],
    webhookUrls = {},
    webhookWarnings = [],
}) {
    const { flash } = usePage().props;
    const { can } = useAuthorization();
    const canUpdatePaymentSettings = can('payment-settings-update');

    const { data, setData, put, errors, processing } = useForm({
        default_gateway: setting?.default_gateway ?? 'cash',
        bank_transfer_enabled: setting?.bank_transfer_enabled ?? false,
        midtrans_enabled: setting?.midtrans_enabled ?? false,
        midtrans_server_key: '',
        midtrans_client_key: setting?.midtrans_client_key ?? '',
        midtrans_production: setting?.midtrans_production ?? false,
        xendit_enabled: setting?.xendit_enabled ?? false,
        xendit_secret_key: '',
        xendit_public_key: setting?.xendit_public_key ?? '',
        xendit_callback_token: '',
        xendit_production: setting?.xendit_production ?? false,
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('settings.payments.update'), { preserveScroll: true });
    };

    const isGatewaySelectable = (gateway) => {
        if (gateway === 'cash') return true;
        if (gateway === 'midtrans') return data.midtrans_enabled;
        if (gateway === 'xendit') return data.xendit_enabled;
        return false;
    };

    const renderSecretHint = (field, keepMessage) => {
        const source = paymentSettingSources?.[field];

        if (!source) {
            return null;
        }

        if (source.managed_by_environment) {
            return (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                    Secret dikelola oleh environment dan tidak bisa diubah dari dashboard.
                </p>
            );
        }

        if (source.configured) {
            return (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tersimpan: <span className="font-medium">{source.masked}</span>. {keepMessage}
                </p>
            );
        }

        return null;
    };

    return (
        <>
            <Head title="Pengaturan Payment" />

            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconCreditCard size={28} className="text-primary-500" />
                    Pengaturan Payment Gateway
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Konfigurasi metode pembayaran dan gateway
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                {/* Default Gateway */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <IconCash size={18} />
                        Gateway Default
                    </h3>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Gateway pembayaran default yang digunakan kasir saat membuka halaman
                        transaksi.
                    </p>
                    {!canUpdatePaymentSettings && (
                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                            Anda hanya memiliki akses lihat. Perubahan payment settings memerlukan
                            permission update dan konfirmasi password ulang.
                        </div>
                    )}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Pilih Gateway
                        </label>
                        <Select
                            value={data.default_gateway}
                            onChange={(value) => setData('default_gateway', value)}
                            options={supportedGateways.map((gw) => ({
                                value: gw.value,
                                label: isGatewaySelectable(gw.value)
                                    ? gw.label
                                    : `${gw.label} (nonaktif)`,
                                disabled: !isGatewaySelectable(gw.value),
                            }))}
                            disabled={!canUpdatePaymentSettings}
                            error={errors?.default_gateway}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Bank Transfer */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            🏦 Transfer Bank
                        </h3>
                        <label
                            className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                data.bank_transfer_enabled
                                    ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                        >
                            <Checkbox
                                checked={data.bank_transfer_enabled}
                                onChange={(e) => setData('bank_transfer_enabled', e.target.checked)}
                                disabled={!canUpdatePaymentSettings}
                            />
                            {data.bank_transfer_enabled ? 'Aktif' : 'Nonaktif'}
                        </label>
                    </div>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Pembayaran manual via transfer bank. Kasir akan memasukkan transaksi dengan
                        status pending, kemudian admin mengkonfirmasi setelah dana diterima.
                    </p>
                    <a
                        href={route('settings.bank-accounts.index')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600"
                    >
                        Kelola Rekening Bank →
                    </a>
                </div>

                {/* Midtrans */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <IconBrandStripe size={18} />
                            Midtrans Snap
                        </h3>
                        <label
                            className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                data.midtrans_enabled
                                    ? 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}
                        >
                            <Checkbox
                                checked={data.midtrans_enabled}
                                onChange={(e) => setData('midtrans_enabled', e.target.checked)}
                                disabled={!canUpdatePaymentSettings}
                            />
                            {data.midtrans_enabled ? 'Aktif' : 'Nonaktif'}
                        </label>
                    </div>
                    <div
                        className={`space-y-4 ${
                            !data.midtrans_enabled ? 'pointer-events-none opacity-50' : ''
                        }`}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Server Key"
                                type="password"
                                value={data.midtrans_server_key}
                                onChange={(e) => setData('midtrans_server_key', e.target.value)}
                                errors={errors?.midtrans_server_key}
                                placeholder={
                                    paymentSettingSources?.midtrans_server_key?.configured
                                        ? 'Kosongkan untuk mempertahankan nilai saat ini'
                                        : 'SB-Mid-server-xxx'
                                }
                                disabled={
                                    !canUpdatePaymentSettings ||
                                    paymentSettingSources?.midtrans_server_key
                                        ?.managed_by_environment
                                }
                            />
                            <Input
                                label="Client Key"
                                type="text"
                                value={data.midtrans_client_key}
                                onChange={(e) => setData('midtrans_client_key', e.target.value)}
                                errors={errors?.midtrans_client_key}
                                placeholder="SB-Mid-client-xxx"
                                disabled={!canUpdatePaymentSettings}
                            />
                        </div>
                        {renderSecretHint(
                            'midtrans_server_key',
                            'Isi ulang hanya jika ingin mengganti secret.'
                        )}
                        <label className="flex cursor-pointer items-center gap-2">
                            <Checkbox
                                checked={data.midtrans_production}
                                onChange={(e) => setData('midtrans_production', e.target.checked)}
                                disabled={!canUpdatePaymentSettings}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Mode Produksi
                            </span>
                        </label>
                    </div>
                </div>

                {/* Xendit */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <IconCreditCard size={18} />
                            Xendit Invoice
                        </h3>
                        <label
                            className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                data.xendit_enabled
                                    ? 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}
                        >
                            <Checkbox
                                checked={data.xendit_enabled}
                                onChange={(e) => setData('xendit_enabled', e.target.checked)}
                                disabled={!canUpdatePaymentSettings}
                            />
                            {data.xendit_enabled ? 'Aktif' : 'Nonaktif'}
                        </label>
                    </div>
                    <div
                        className={`space-y-4 ${
                            !data.xendit_enabled ? 'pointer-events-none opacity-50' : ''
                        }`}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Secret Key"
                                type="password"
                                value={data.xendit_secret_key}
                                onChange={(e) => setData('xendit_secret_key', e.target.value)}
                                errors={errors?.xendit_secret_key}
                                placeholder={
                                    paymentSettingSources?.xendit_secret_key?.configured
                                        ? 'Kosongkan untuk mempertahankan nilai saat ini'
                                        : 'xnd_development_xxx'
                                }
                                disabled={
                                    !canUpdatePaymentSettings ||
                                    paymentSettingSources?.xendit_secret_key?.managed_by_environment
                                }
                            />
                            <Input
                                label="Public Key"
                                type="text"
                                value={data.xendit_public_key}
                                onChange={(e) => setData('xendit_public_key', e.target.value)}
                                errors={errors?.xendit_public_key}
                                placeholder="xnd_public_development_xxx"
                                disabled={!canUpdatePaymentSettings}
                            />
                        </div>
                        {renderSecretHint(
                            'xendit_secret_key',
                            'Isi ulang hanya jika ingin mengganti secret.'
                        )}
                        <Input
                            label="Callback Token"
                            type="password"
                            value={data.xendit_callback_token}
                            onChange={(e) => setData('xendit_callback_token', e.target.value)}
                            errors={errors?.xendit_callback_token}
                            placeholder={
                                paymentSettingSources?.xendit_callback_token?.configured
                                    ? 'Kosongkan untuk mempertahankan nilai saat ini'
                                    : 'xendit-callback-token'
                            }
                            disabled={
                                !canUpdatePaymentSettings ||
                                paymentSettingSources?.xendit_callback_token?.managed_by_environment
                            }
                        />
                        {renderSecretHint(
                            'xendit_callback_token',
                            'Isi ulang hanya jika ingin mengganti token.'
                        )}
                        <label className="flex cursor-pointer items-center gap-2">
                            <Checkbox
                                checked={data.xendit_production}
                                onChange={(e) => setData('xendit_production', e.target.checked)}
                                disabled={!canUpdatePaymentSettings}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Mode Produksi
                            </span>
                        </label>
                    </div>
                </div>

                {/* Webhook URLs Info */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        🔗 Webhook URLs
                    </h3>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Salin URL berikut dan paste ke dashboard Midtrans/Xendit sebagai
                        Notification/Callback URL.
                    </p>
                    {webhookWarnings.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {webhookWarnings.map((warning) => (
                                <div
                                    key={warning}
                                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                                >
                                    {warning}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                                Midtrans Notification URL
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={webhookUrls.midtrans || ''}
                                    className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(webhookUrls.midtrans || '');
                                        toast.success('URL disalin!');
                                    }}
                                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    Salin
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                                Xendit Callback URL
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={webhookUrls.xendit || ''}
                                    className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(webhookUrls.xendit || '');
                                        toast.success('URL disalin!');
                                    }}
                                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    Salin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing || !canUpdatePaymentSettings}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                    >
                        <IconDeviceFloppy size={18} />
                        {processing ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                    </button>
                </div>
            </form>
        </>
    );
}

Payment.layout = (page) => <DashboardLayout children={page} />;
