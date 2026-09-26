import { Link } from '@inertiajs/react';
import { IconShoppingCart, IconStar } from '@tabler/icons-react';

const GITHUB_URL = 'https://github.com/ridhoauliama97/larapos';

export const NAV_LINKS = [
    { label: 'Fitur', href: '/fitur' },
    { label: 'Dokumentasi', href: '/dokumentasi' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'Kontribusi', href: '/kontribusi' },
];

export default function PublicLayout({ children, active = '' }) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
            {/* ============ NAVBAR ============ */}
            <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                            <IconShoppingCart size={20} className="text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                            Larapos
                        </span>
                    </Link>

                    <div className="hidden items-center gap-7 md:flex">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm transition-colors ${
                                    active === link.href
                                        ? 'font-semibold text-primary-600 dark:text-primary-400'
                                        : 'text-slate-600 hover:text-primary-500 dark:text-slate-400'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-primary-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-700 sm:flex"
                        >
                            <IconStar size={15} className="text-amber-400" />
                            Star
                        </a>
                        <Link
                            href="/login"
                            className="px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-primary-500 dark:text-slate-300"
                        >
                            Masuk
                        </Link>
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-600 hover:to-primary-700"
                        >
                            Get Source
                        </a>
                    </div>
                </div>
            </nav>

            {/* ============ CONTENT ============ */}
            <main className="flex-1 pt-[68px]">{children}</main>

            {/* ============ FOOTER ============ */}
            <footer className="border-t border-slate-200 px-6 py-10 dark:border-slate-800">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
                            <IconShoppingCart size={16} className="text-white" />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                                Larapos
                            </div>
                            <div className="text-xs text-slate-500">
                                Sistem kasir open source untuk UMKM
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <Link href="/fitur" className="transition-colors hover:text-primary-500">
                            Fitur
                        </Link>
                        <Link
                            href="/dokumentasi"
                            className="transition-colors hover:text-primary-500"
                        >
                            Dokumentasi
                        </Link>
                        <Link href="/roadmap" className="transition-colors hover:text-primary-500">
                            Roadmap
                        </Link>
                        <Link
                            href="/kontribusi"
                            className="transition-colors hover:text-primary-500"
                        >
                            Kontribusi
                        </Link>
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-primary-500"
                        >
                            GitHub
                        </a>
                        <a
                            href={`${GITHUB_URL}/blob/main/LICENSE`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-primary-500"
                        >
                            Lisensi MIT
                        </a>
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            &copy; {new Date().getFullYear()} Dibuat oleh{' '}
                            <a
                                href="https://github.com/aryadwiputra"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-500 hover:underline"
                            >
                                Arya Dwi Putra
                            </a>
                        </p>
                        <div className="text-xs text-slate-500">
                            Updated & Maintained by{' '}
                            <a
                                href="https://github.com/ridhoauliama97"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-500 hover:underline"
                            >
                                Ridho Aulia Mahqoma Angkat
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
