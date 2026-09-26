import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import Button from '@/Components/Dashboard/Button';
import toast from 'react-hot-toast';
import { IconTarget, IconDeviceFloppy, IconCoin } from '@tabler/icons-react';

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);

export default function Target({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        monthly_sales_target: settings?.monthly_sales_target || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('settings.target.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Target berhasil disimpan'),
            onError: () => toast.error('Gagal menyimpan target'),
        });
    };

    return (
        <>
            <Head title="Target Penjualan" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Target Penjualan
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Atur target penjualan bulanan untuk bisnis Anda
                    </p>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-primary-100 p-3 dark:bg-primary-900/30">
                                <IconTarget
                                    size={24}
                                    className="text-primary-600 dark:text-primary-400"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Target Penjualan Bulanan
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconCoin size={20} />
                                    </div>
                                    <input
                                        type="number"
                                        value={data.monthly_sales_target}
                                        onChange={(e) =>
                                            setData('monthly_sales_target', e.target.value)
                                        }
                                        placeholder="Contoh: 50000000"
                                        className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                                {data.monthly_sales_target > 0 && (
                                    <p className="mt-2 text-sm text-slate-500">
                                        Target: {formatCurrency(data.monthly_sales_target)}
                                    </p>
                                )}
                                {errors.monthly_sales_target && (
                                    <p className="mt-1 text-sm text-danger-500">
                                        {errors.monthly_sales_target}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                                className="flex items-center gap-2"
                            >
                                <IconDeviceFloppy size={18} />
                                {processing ? 'Menyimpan...' : 'Simpan Target'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Info */}
                <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-900 dark:bg-primary-950/30">
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                        <strong>Tip:</strong> Target penjualan akan ditampilkan di Dashboard sebagai
                        progress bar untuk memantau pencapaian bulanan Anda.
                    </p>
                </div>
            </div>
        </>
    );
}

Target.layout = (page) => <DashboardLayout children={page} />;
