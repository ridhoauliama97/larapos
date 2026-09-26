import { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    IconShoppingCart,
    IconShieldLock,
    IconLock,
    IconEye,
    IconEyeOff,
    IconLoader2,
} from '@tabler/icons-react';

export default function ConfirmPassword({ challenge = null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const challengeLabel = useMemo(() => {
        if (!challenge?.route) {
            return 'aksi sensitif';
        }

        return challenge.route.replaceAll('.', ' / ');
    }, [challenge]);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'));
    };

    return (
        <>
            <Head title="Konfirmasi Password" />

            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <Link href="/" className="mb-6 inline-flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                    <IconShoppingCart size={24} className="text-white" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Aplikasi Kasir
                                </span>
                            </Link>
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950/50">
                                <IconShieldLock
                                    size={28}
                                    className="text-primary-600 dark:text-primary-400"
                                />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Konfirmasi Password
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                Untuk melanjutkan {challengeLabel}, masukkan kembali password akun
                                Anda.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconLock size={20} />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`h-12 w-full rounded-xl border-2 pl-12 pr-12 ${
                                            errors.password
                                                ? 'border-danger-500 focus:border-danger-500'
                                                : 'border-slate-200 focus:border-primary-500 dark:border-slate-700'
                                        } bg-white text-slate-900 placeholder-slate-400 transition-all focus:ring-4 focus:ring-primary-500/20 dark:bg-slate-800 dark:text-white`}
                                        autoFocus
                                        placeholder="Masukkan password Anda"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <IconEyeOff size={20} />
                                        ) : (
                                            <IconEye size={20} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-sm text-danger-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 font-semibold text-white transition-all hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <IconLoader2 size={18} className="animate-spin" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    'Lanjutkan'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-12 lg:flex">
                    <div className="max-w-md text-center text-white">
                        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20">
                            <IconShieldLock size={48} />
                        </div>
                        <h2 className="mb-4 text-3xl font-bold">Proteksi Aksi Admin</h2>
                        <p className="text-lg opacity-90">
                            Konfirmasi password ulang membantu menahan aksi sensitif saat sesi admin
                            sudah lama aktif.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
