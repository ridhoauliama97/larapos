import { Head, Link, useForm } from '@inertiajs/react';
import AuthBotGuardFields from '@/Components/AuthBotGuardFields';
import {
    IconShoppingCart,
    IconMailCheck,
    IconLoader2,
    IconLogout,
    IconRefresh,
} from '@tabler/icons-react';

export default function VerifyEmail({ status, botGuard }) {
    const honeypotField = botGuard?.honeypot_field || 'company_website';
    const tokenField = botGuard?.token_field || 'bot_guard_token';
    const { data, setData, post, processing, errors } = useForm({
        [honeypotField]: '',
        [tokenField]: botGuard?.token || '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Verifikasi Email" />

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
                                <IconMailCheck
                                    size={28}
                                    className="text-primary-600 dark:text-primary-400"
                                />
                            </div>

                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Verifikasi Email Anda
                            </h1>
                            <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">
                                Sebelum masuk ke dashboard, klik link verifikasi yang sudah kami
                                kirim ke email Anda. Jika email belum diterima, kirim ulang dari
                                halaman ini.
                            </p>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mb-6 rounded-xl bg-success-50 p-4 text-sm text-success-700 dark:bg-success-950/50 dark:text-success-400">
                                Link verifikasi baru sudah dikirim ke email Anda.
                            </div>
                        )}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                                Pastikan juga memeriksa folder spam atau promotion jika email belum
                                terlihat di inbox.
                            </div>
                            {errors.human && (
                                <div className="mb-5 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:bg-danger-950/40 dark:text-danger-300">
                                    {errors.human}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-3">
                                <AuthBotGuardFields
                                    botGuard={botGuard}
                                    data={data}
                                    setData={setData}
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 font-semibold text-white transition-all hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <IconLoader2 size={20} className="animate-spin" />
                                            Mengirim ulang...
                                        </>
                                    ) : (
                                        <>
                                            <IconRefresh size={18} />
                                            Kirim Ulang Email Verifikasi
                                        </>
                                    )}
                                </button>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                    <IconLogout size={18} />
                                    Keluar
                                </Link>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-12 lg:flex">
                    <div className="max-w-md text-center text-white">
                        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20">
                            <IconMailCheck size={48} />
                        </div>
                        <h2 className="mb-4 text-3xl font-bold">Aktivasi Akun Lebih Aman</h2>
                        <p className="text-lg opacity-90">
                            Verifikasi email membantu memastikan hanya akun yang valid yang dapat
                            mengakses dashboard dan data operasional toko.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {['Akses Terverifikasi', 'Perlindungan Akun', 'Dashboard Aman'].map(
                                (item, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
