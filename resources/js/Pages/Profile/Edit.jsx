import { useRef, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { IconBell, IconLock, IconUserCircle } from '@tabler/icons-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdateNotificationPreferencesForm from './Partials/UpdateNotificationPreferencesForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const TABS = [
    { key: 'profile', label: 'Profil', icon: IconUserCircle },
    { key: 'security', label: 'Keamanan', icon: IconLock },
    { key: 'notifications', label: 'Notifikasi', icon: IconBell },
];

export default function Edit({ mustVerifyEmail, status, notificationPreferences }) {
    const [active, setActive] = useState('profile');
    const tabRefs = useRef({});

    const focusTab = (index) => {
        const next = TABS[(index + TABS.length) % TABS.length];
        setActive(next.key);
        tabRefs.current[next.key]?.focus();
    };

    const onTabKeyDown = (event, index) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            focusTab(index + 1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focusTab(index - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            focusTab(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            focusTab(TABS.length - 1);
        }
    };

    return (
        <>
            <Head title="Profil" />

            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconUserCircle size={28} className="text-primary-500" />
                    Profil Saya
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Kelola informasi akun, keamanan, dan preferensi Anda.
                </p>
            </div>

            <div
                role="tablist"
                aria-label="Pengaturan profil"
                className="mb-6 grid w-full grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 lg:w-[400px]"
            >
                {TABS.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = active === tab.key;

                    return (
                        <button
                            key={tab.key}
                            ref={(node) => {
                                tabRefs.current[tab.key] = node;
                            }}
                            type="button"
                            role="tab"
                            id={`profile-tab-${tab.key}`}
                            aria-selected={isActive}
                            aria-controls={`profile-panel-${tab.key}`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => setActive(tab.key)}
                            onKeyDown={(event) => onTabKeyDown(event, index)}
                            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${
                                isActive
                                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <Icon size={16} strokeWidth={1.5} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="max-w-3xl">
                <div
                    id="profile-panel-profile"
                    role="tabpanel"
                    aria-labelledby="profile-tab-profile"
                    hidden={active !== 'profile'}
                    className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                <div
                    id="profile-panel-security"
                    role="tabpanel"
                    aria-labelledby="profile-tab-security"
                    hidden={active !== 'security'}
                    className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                    <UpdatePasswordForm />

                    <div className="mt-8 border-t border-slate-100 pt-8 dark:border-slate-800">
                        <DeleteUserForm />
                    </div>
                </div>

                <div
                    id="profile-panel-notifications"
                    role="tabpanel"
                    aria-labelledby="profile-tab-notifications"
                    hidden={active !== 'notifications'}
                    className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                    <UpdateNotificationPreferencesForm preferences={notificationPreferences} />
                </div>
            </div>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
