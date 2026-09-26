import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthBotGuardFields from '@/Components/AuthBotGuardFields';
import {
    IconShoppingCart,
    IconMail,
    IconLock,
    IconEye,
    IconEyeOff,
    IconLoader2,
} from '@tabler/icons-react';
import { useState } from 'react';

export default function Login({ status, canResetPassword, canRegister, botGuard }) {
    const { t } = useTranslation();
    const honeypotField = botGuard?.honeypot_field || 'company_website';
    const tokenField = botGuard?.token_field || 'bot_guard_token';
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        [honeypotField]: '',
        [tokenField]: botGuard?.token || '',
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title={t('auth.login.title')} />

            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Left - Form */}
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Logo */}
                        <div className="mb-8">
                            <Link href="/" className="mb-6 inline-flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                    <IconShoppingCart size={24} className="text-white" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {t('auth.login.appName')}
                                </span>
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {t('auth.login.subtitle')}
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                {t('auth.login.description')}
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-6 rounded-xl bg-success-50 p-4 text-sm text-success-700 dark:bg-success-950/50 dark:text-success-400">
                                {status}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            <AuthBotGuardFields botGuard={botGuard} data={data} setData={setData} />
                            {errors.human && (
                                <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:bg-danger-950/40 dark:text-danger-300">
                                    {errors.human}
                                </div>
                            )}
                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('auth.login.email')}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconMail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={t('auth.login.emailPlaceholder')}
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
                                    {t('auth.login.password')}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconLock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder={t('auth.login.passwordPlaceholder')}
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

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500 dark:border-slate-600"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        {t('auth.login.remember')}
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-primary-500 hover:text-primary-600"
                                    >
                                        {t('auth.login.forgotPassword')}
                                    </Link>
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
                                        {t('common.labels.processing')}
                                    </>
                                ) : (
                                    t('auth.login.submit')
                                )}
                            </button>

                            {/* Register Link */}
                            {canRegister && (
                                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                                    {t('auth.login.noAccount')}{' '}
                                    <Link
                                        href="/register"
                                        className="font-semibold text-primary-500 hover:text-primary-600"
                                    >
                                        {t('auth.login.registerLink')}
                                    </Link>
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right - Image/Decoration */}
                <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-12 lg:flex">
                    <div className="max-w-md text-center text-white">
                        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20">
                            <IconShoppingCart size={48} />
                        </div>
                        <h2 className="mb-4 text-3xl font-bold">{t('auth.login.heroTitle')}</h2>
                        <p className="text-lg opacity-90">{t('auth.login.heroDescription')}</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {t('auth.login.features', { returnObjects: true }).map((feature, i) => (
                                <span
                                    key={i}
                                    className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
