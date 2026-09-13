import React from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";
import {
    IconAlertTriangle,
    IconArrowsExchange,
    IconBell,
    IconCurrencyDollar,
    IconDeviceFloppy,
    IconPackage,
    IconReceipt,
    IconShieldLock,
    IconShoppingCart,
} from "@tabler/icons-react";

const NOTIFICATION_TYPES = [
    {
        key: "transaction",
        label: "Transaksi Penjualan",
        description: "Saat ada transaksi baru masuk.",
        icon: IconShoppingCart,
        tint: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
    },
    {
        key: "low_stock",
        label: "Stok Menipis",
        description: "Saat stok produk menyentuh batas minimum.",
        icon: IconAlertTriangle,
        tint: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
    },
    {
        key: "stock_mutation",
        label: "Mutasi Stok",
        description: "Setiap ada pencatatan keluar-masuk stok.",
        icon: IconPackage,
        tint: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
    {
        key: "stock_transfer",
        label: "Transfer Stok",
        description: "Saat transfer antar gudang dikirim, diterima, atau dibatalkan.",
        icon: IconArrowsExchange,
        tint: "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400",
    },
    {
        key: "receivable",
        label: "Piutang",
        description: "Saat muncul piutang baru dari transaksi tempo.",
        icon: IconReceipt,
        tint: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    },
    {
        key: "payable",
        label: "Hutang",
        description: "Saat muncul hutang baru ke supplier.",
        icon: IconCurrencyDollar,
        tint: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
    },
    {
        key: "security",
        label: "Keamanan",
        description: "Percobaan login gagal ke sistem (khusus super-admin).",
        icon: IconShieldLock,
        tint: "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400",
    },
];

function Switch({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 motion-reduce:transition-none ${
                checked ? "bg-primary-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
                    checked ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
            />
        </button>
    );
}

export default function UpdateNotificationPreferences({ preferences }) {
    const { data, setData, patch, processing, errors } = useForm({ preferences });

    const toggle = (key) =>
        setData("preferences", {
            ...data.preferences,
            [key]: !data.preferences[key],
        });

    const enableAll = () =>
        setData(
            "preferences",
            Object.fromEntries(
                NOTIFICATION_TYPES.map((type) => [type.key, true])
            )
        );

    const enabledCount = NOTIFICATION_TYPES.filter(
        (type) => data.preferences[type.key]
    ).length;

    const submit = (event) => {
        event.preventDefault();

        patch(route("profile.notifications.update"), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success("Preferensi notifikasi disimpan"),
        });
    };

    return (
        <section>
            <form onSubmit={submit}>
                <header className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <IconBell size={16} />
                            Preferensi Notifikasi
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {enabledCount} dari {NOTIFICATION_TYPES.length}{" "}
                            jenis notifikasi aktif untuk akun Anda.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={enableAll}
                        disabled={enabledCount === NOTIFICATION_TYPES.length}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Aktifkan semua
                    </button>
                </header>

                {errors.preferences && (
                    <p className="mb-3 text-xs text-danger-500 dark:text-danger-400">
                        {errors.preferences}
                    </p>
                )}

                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {NOTIFICATION_TYPES.map((type) => {
                        const Icon = type.icon;
                        const checked = Boolean(data.preferences[type.key]);

                        return (
                            <li
                                key={type.key}
                                className="flex items-center gap-3 p-4"
                            >
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${type.tint}`}
                                >
                                    <Icon size={18} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {type.label}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {type.description}
                                    </p>
                                </div>
                                <Switch
                                    checked={checked}
                                    onChange={() => toggle(type.key)}
                                    label={type.label}
                                />
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-6 dark:border-slate-800">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                    >
                        <IconDeviceFloppy size={16} />
                        {processing ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </form>
        </section>
    );
}
