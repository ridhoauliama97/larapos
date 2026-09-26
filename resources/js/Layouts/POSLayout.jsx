import { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '@/Context/ThemeSwitcherContext';
import { useOnlineStatus } from '@/Context/OnlineStatusContext';
import {
    IconHome,
    IconHistory,
    IconSun,
    IconMoon,
    IconLogout,
    IconMenu2,
    IconX,
    IconUser,
    IconWallet,
    IconArrowsMaximize,
    IconArrowsMinimize,
    IconBook,
} from '@tabler/icons-react';
import Notification from '@/Components/Dashboard/Notification';
import { useTour } from '@/Hooks/useTour';
import i18n from '@/i18n';
import { getPendingCount } from '@/Utils/offlineDb';

export default function POSLayout({ children }) {
    const { auth, storeProfile, activeCashierShift, appVersion } = usePage().props;
    const { darkMode, themeSwitcher } = useTheme();
    const { start: startTour, isActive: tourActive } = useTour('pos');
    const [pendingSyncCount, setPendingSyncCount] = useState(0);
    const isOnline = useOnlineStatus();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement
                .requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch(() => {});
        } else {
            document
                .exitFullscreen()
                .then(() => setIsFullscreen(false))
                .catch(() => {});
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Pending offline transaction count (refresh on mount and on reconnect)
    useEffect(() => {
        const refresh = () =>
            getPendingCount()
                .then(setPendingSyncCount)
                .catch(() => {});

        refresh();

        window.addEventListener('online', refresh);
        const timer = setInterval(refresh, 15000);
        return () => {
            window.removeEventListener('online', refresh);
            clearInterval(timer);
        };
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:px-6">
                {/* Left Section - Logo & Time */}
                <div className="flex items-center gap-4 lg:gap-6">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                    >
                        {showMobileMenu ? (
                            <IconX size={22} className="text-slate-600 dark:text-slate-400" />
                        ) : (
                            <IconMenu2 size={22} className="text-slate-600 dark:text-slate-400" />
                        )}
                    </button>

                    {/* Logo */}
                    <Link href={route('dashboard')} className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden">
                            {storeProfile?.logo ? (
                                <img
                                    src={storeProfile.logo}
                                    alt={storeProfile?.name || 'Store'}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-primary-600 text-sm font-bold text-white">
                                    {(storeProfile?.name || 'K').charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="hidden text-lg font-bold text-slate-800 dark:text-white sm:block">
                            {storeProfile?.name || 'KASIR'}
                        </span>
                    </Link>

                    {/* Divider */}
                    <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-700 md:block" />

                    {/* Time & Date */}
                    <div className="hidden items-center gap-3 md:flex">
                        <div className="text-2xl font-semibold tabular-nums text-slate-800 dark:text-white">
                            {formatTime(currentTime)}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(currentTime)}
                        </div>
                    </div>
                </div>

                {/* Right Section - Actions & User */}
                <div className="flex items-center gap-2 lg:gap-3">
                    {/* Quick Actions */}
                    <nav className="hidden items-center gap-1 lg:flex">
                        <Link
                            href={route('dashboard')}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <IconHome size={18} />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            href={route('transactions.history')}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <IconHistory size={18} />
                            <span>Riwayat</span>
                        </Link>
                    </nav>

                    {/* Divider */}
                    <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-700 lg:block" />

                    {/* Notifications (desktop) */}
                    <div className="hidden md:flex">
                        <Notification />
                    </div>

                    {/* Version */}
                    <span className="hidden font-mono text-[11px] text-slate-400 dark:text-slate-600 lg:block">
                        {appVersion}
                    </span>

                    {/* Tour Guide */}
                    <button
                        onClick={startTour}
                        disabled={tourActive}
                        className="flex min-h-touch min-w-touch items-center justify-center rounded-lg p-2.5 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                        title={i18n.t('tour.button')}
                    >
                        <IconBook size={20} className="text-slate-500" />
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="flex min-h-touch min-w-touch items-center justify-center rounded-lg p-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? (
                            <IconArrowsMinimize size={20} className="text-slate-500" />
                        ) : (
                            <IconArrowsMaximize size={20} className="text-slate-500" />
                        )}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={themeSwitcher}
                        className="flex min-h-touch min-w-touch items-center justify-center rounded-lg p-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={darkMode ? 'Light Mode' : 'Dark Mode'}
                    >
                        {darkMode ? (
                            <IconSun size={20} className="text-amber-500" />
                        ) : (
                            <IconMoon size={20} className="text-slate-500" />
                        )}
                    </button>

                    {/* Notifications (mobile) */}
                    <div className="flex md:hidden">
                        <Notification />
                    </div>

                    {/* User Info - Simplified */}
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-2 dark:border-slate-700 lg:pl-3">
                        {activeCashierShift && (
                            <Link
                                href={route('cashier-shifts.show', activeCashierShift.id)}
                                className="hidden items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60 lg:flex"
                            >
                                <IconWallet size={16} />
                                <span>
                                    Shift aktif •{' '}
                                    {new Intl.NumberFormat('id-ID').format(
                                        activeCashierShift.expected_cash || 0
                                    )}
                                </span>
                            </Link>
                        )}
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {auth.user.name}
                        </p>
                    </div>

                    {/* Logout */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="hidden min-h-touch min-w-touch items-center justify-center rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-950/50 lg:flex"
                        title="Logout"
                    >
                        <IconLogout size={20} />
                    </Link>
                </div>
            </header>

            {!isOnline && (
                <div className="bg-amber-500 px-4 py-1 text-center text-xs font-medium text-white">
                    Transaksi disimpan offline — akan dikirim saat online kembali
                </div>
            )}

            {isOnline && pendingSyncCount > 0 && (
                <div className="bg-amber-100 px-4 py-1 text-center text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    {pendingSyncCount} transaksi menunggu sinkronisasi
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setShowMobileMenu(false)}
                >
                    <div
                        className="absolute left-0 right-0 top-16 animate-slide-up border-b border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <nav className="space-y-2 p-4">
                            <Link
                                href={route('dashboard')}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <IconHome size={20} />
                                <span className="font-medium">Dashboard</span>
                            </Link>
                            <Link
                                href={route('transactions.history')}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <IconHistory size={20} />
                                <span className="font-medium">Riwayat Transaksi</span>
                            </Link>
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <IconUser size={20} />
                                <span className="font-medium">Profil</span>
                            </Link>
                            <hr className="border-slate-200 dark:border-slate-700" />
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-danger-600 transition-colors hover:bg-danger-50 dark:hover:bg-danger-950/50"
                            >
                                <IconLogout size={20} />
                                <span className="font-medium">Keluar</span>
                            </Link>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content - Full Height */}
            <main className="flex-1 overflow-hidden">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        className: 'text-sm',
                        duration: 3000,
                        style: {
                            background: darkMode ? '#1e293b' : '#fff',
                            color: darkMode ? '#f1f5f9' : '#1e293b',
                            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                        },
                    }}
                />
                {children}
            </main>
        </div>
    );
}
