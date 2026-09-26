import { Link, usePage } from '@inertiajs/react';
import { isSuperAdmin } from '@/Utils/authorization';
import { isActiveUrl } from '@/Utils/activeUrl';

export default function LinkItem({ href, icon, access, title, sidebarOpen, active, ...props }) {
    const { url } = usePage();
    const { auth } = usePage().props;

    const isActive = active ?? isActiveUrl(url, href);
    const canAccess = isSuperAdmin(auth) || access === true;

    if (!canAccess) return null;

    if (sidebarOpen) {
        return (
            <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-r-lg border-l-[3px] px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                        ? 'border-primary-500 bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                        : 'border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-transparent dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
                {...props}
            >
                <span className="shrink-0">{icon}</span>
                <span className="truncate">{title}</span>
            </Link>
        );
    }

    // Collapsed sidebar
    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            title={title}
            className={`flex w-full items-center justify-center border-l-[3px] py-3 transition-all duration-200 ${
                isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-transparent dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
            {...props}
        >
            {icon}
        </Link>
    );
}
