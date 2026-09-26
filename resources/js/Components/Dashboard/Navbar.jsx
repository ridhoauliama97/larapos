import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { IconMenu2, IconMoon, IconSun, IconBook } from '@tabler/icons-react';
import AuthDropdown from '@/Components/Dashboard/AuthDropdown';
import LanguageSwitcher from '@/Components/Dashboard/LanguageSwitcher';
import Menu from '@/Utils/Menu';
import Notification from '@/Components/Dashboard/Notification';
import { useTour } from '@/Hooks/useTour';
import i18n from '@/i18n';

export default function Navbar({ toggleSidebar, themeSwitcher, darkMode }) {
    const { auth, storeProfile } = usePage().props;
    const { start: startTour, isActive: tourActive } = useTour('dashboard');
    const menuNavigation = Menu();

    const storeName = storeProfile?.name || 'KASIR';
    const storeInitial = storeName?.charAt(0)?.toUpperCase() || 'K';

    // Get current page title
    const links = menuNavigation.flatMap((item) => item.details);
    const sublinks = links
        .filter((item) => Object.hasOwn(item, 'subdetails'))
        .flatMap((item) => item.subdetails);

    const getCurrentTitle = () => {
        for (const link of links) {
            if (Object.hasOwn(link, 'subdetails')) {
                const activeSublink = sublinks.find((s) => s.active);
                if (activeSublink) return activeSublink.title;
            } else if (link.active) {
                return link.title;
            }
        }
        return 'Dashboard';
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 md:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    title="Toggle Sidebar"
                >
                    <IconMenu2 size={20} strokeWidth={1.5} />
                </button>

                {/* Mobile Logo */}
                <div className="flex items-center gap-2 md:hidden">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
                        <span className="text-xs font-bold text-white">{storeInitial}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">
                        {storeName}
                    </span>
                </div>

                {/* Current Page Title */}
                <div className="hidden items-center md:flex">
                    <div className="mr-4 h-6 w-px bg-slate-200 dark:bg-slate-700" />
                    <h1 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                        {getCurrentTitle()}
                    </h1>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {/* Tour Guide */}
                <button
                    onClick={startTour}
                    disabled={tourActive}
                    className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    title={i18n.t('tour.button')}
                >
                    <IconBook size={20} strokeWidth={1.5} />
                </button>

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Theme Toggle */}
                <button
                    onClick={themeSwitcher}
                    className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    title={darkMode ? 'Light Mode' : 'Dark Mode'}
                >
                    {darkMode ? (
                        <IconSun size={20} strokeWidth={1.5} className="text-amber-500" />
                    ) : (
                        <IconMoon size={20} strokeWidth={1.5} />
                    )}
                </button>

                {/* Notifications */}
                <Notification />

                {/* Divider */}
                <div className="mx-1 h-8 w-px bg-slate-200 dark:bg-slate-700" />

                {/* User Dropdown */}
                <AuthDropdown auth={auth} isMobile={isMobile} />
            </div>
        </header>
    );
}
