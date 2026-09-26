import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthBotGuardFields from '@/Components/AuthBotGuardFields';
import {
    IconShoppingCart,
    IconUser,
    IconMail,
    IconLock,
    IconEye,
    IconEyeOff,
    IconLoader2,
    IconCheck,
} from '@tabler/icons-react';

export default function Register({ botGuard }) {
    const honeypotField = botGuard?.honeypot_field || 'company_website';
    const tokenField = botGuard?.token_field || 'bot_guard_token';
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        [honeypotField]: '',
        [tokenField]: botGuard?.token || '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        return () => reset('password', 'password_confirmation');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <Head title="Daftar" />

            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Left - Decoration */}
                <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-12 lg:flex">
                    <div className="max-w-md text-center text-white">
                        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20">
                            <IconShoppingCart size={48} />
                        </div>
                        <h2 className="mb-4 text-3xl font-bold">Bergabung Bersama Kami</h2>
                        <p className="text-lg opacity-90">
                            Mulai kelola bisnis Anda dengan sistem Point of Sale yang modern, cepat,
                            dan mudah digunakan.
                        </p>
                        <div className="mt-8 space-y-3">
                            {['Gratis untuk memulai', 'Setup dalam 5 menit', 'Dukungan penuh'].map(
                                (feature, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <IconCheck size={18} className="text-white/80" />
                                        {feature}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Right - Form */}
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Logo */}
                        <div className="mb-8">
                            <Link href="/" className="mb-6 inline-flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                    <IconShoppingCart size={24} className="text-white" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Aplikasi Kasir
                                </span>
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Buat Akun Baru
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                Daftarkan bisnis Anda sekarang
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            <AuthBotGuardFields botGuard={botGuard} data={data} setData={setData} />
                            {errors.human && (
                                <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:bg-danger-950/40 dark:text-danger-300">
                                    {errors.human}
                                </div>
                            )}
                            {/* Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Nama Lengkap
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconUser size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nama Anda"
                                        className={`h-12 w-full rounded-xl border-2 pl-12 pr-4 ${
                                            errors.name
                                                ? 'border-danger-500 focus:border-danger-500'
                                                : 'border-slate-200 focus:border-primary-500 dark:border-slate-700'
                                        } bg-white text-slate-900 placeholder-slate-400 transition-all focus:ring-4 focus:ring-primary-500/20 dark:bg-slate-800 dark:text-white`}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-danger-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconMail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                        className={`h-12 w-full rounded-xl border-2 pl-12 pr-4 ${
                                            errors.email
                                                ? 'border-danger-500 focus:border-danger-500'
                                                : 'border-slate-200 focus:border-primary-500 dark:border-slate-700'
                                        } bg-white text-slate-900 placeholder-slate-400 transition-all focus:ring-4 focus:ring-primary-500/20 dark:bg-slate-800 dark:text-white`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-sm text-danger-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconLock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        className={`h-12 w-full rounded-xl border-2 pl-12 pr-12 ${
                                            errors.password
                                                ? 'border-danger-500 focus:border-danger-500'
                                                : 'border-slate-200 focus:border-primary-500 dark:border-slate-700'
                                        } bg-white text-slate-900 placeholder-slate-400 transition-all focus:ring-4 focus:ring-primary-500/20 dark:bg-slate-800 dark:text-white`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
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

                            {/* Confirm Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Konfirmasi Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconLock size={20} />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                        placeholder="Ulangi password"
                                        className={`h-12 w-full rounded-xl border-2 pl-12 pr-12 ${
                                            errors.password_confirmation
                                                ? 'border-danger-500 focus:border-danger-500'
                                                : 'border-slate-200 focus:border-primary-500 dark:border-slate-700'
                                        } bg-white text-slate-900 placeholder-slate-400 transition-all focus:ring-4 focus:ring-primary-500/20 dark:bg-slate-800 dark:text-white`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? (
                                            <IconEyeOff size={20} />
                                        ) : (
                                            <IconEye size={20} />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1.5 text-sm text-danger-500">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 font-semibold text-white transition-all hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <IconLoader2 size={20} className="animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Daftar Sekarang'
                                )}
                            </button>

                            {/* Login Link */}
                            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                                Sudah punya akun?{' '}
                                <Link
                                    href="/login"
                                    className="font-semibold text-primary-500 hover:text-primary-600"
                                >
                                    Masuk disini
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
