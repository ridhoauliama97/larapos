import { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { IconChevronDown, IconChevronUp, IconCornerDownRight } from '@tabler/icons-react';
import { isSuperAdmin } from '@/Utils/authorization';
import { isActiveUrl } from '@/Utils/activeUrl';

export default function LinkItemDropdown({ icon, title, data, access, sidebarOpen, ...props }) {
    const { url } = usePage();
    const { auth } = usePage().props;
    const superAdmin = isSuperAdmin(auth);

    const visibleItems = useMemo(
        () => data.filter((item) => superAdmin || item.permissions === true),
        [data, superAdmin]
    );

    const childActive = useMemo(
        () => visibleItems.some((item) => isActiveUrl(url, item.href)),
        [visibleItems, url]
    );

    // Keep the submenu open while one of its children is the current page
    const [isOpen, setIsOpen] = useState(childActive);

    useEffect(() => {
        if (childActive) setIsOpen(true);
    }, [childActive]);

    const canRenderParent = superAdmin || access === true || visibleItems.length > 0;

    if (!canRenderParent || visibleItems.length === 0) {
        return null;
    }

    const accentState = childActive
        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
        : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-transparent dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200';

    const buttonClass = sidebarOpen
        ? `min-w-full flex items-center justify-between gap-x-3.5 rounded-r-lg border-l-[3px] px-4 py-2.5 text-sm font-medium capitalize transition-all duration-200 hover:cursor-pointer ${accentState}`
        : `flex min-w-full items-center justify-center border-l-[3px] py-3 transition-all duration-200 hover:cursor-pointer ${accentState}`;

    return (
        <>
            <button
                className={buttonClass}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                {sidebarOpen ? (
                    <>
                        <div className="flex items-center gap-x-3.5">
                            {icon}
                            {title}
                        </div>
                        {isOpen ? (
                            <IconChevronUp size={18} strokeWidth={1.5} />
                        ) : (
                            <IconChevronDown size={18} strokeWidth={1.5} />
                        )}
                    </>
                ) : !isOpen ? (
                    icon
                ) : (
                    <IconChevronDown size={20} strokeWidth={1.5} />
                )}
            </button>

            {isOpen &&
                visibleItems.map((item, index) => {
                    const isActive = isActiveUrl(url, item.href);

                    return (
                        <Link
                            key={index}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            onClick={() => {
                                // Collapse submenu after navigating on mobile
                                if (window.innerWidth < 768) {
                                    setIsOpen(false);
                                }
                            }}
                            className={`rounded-r-lg border-l-[3px] transition-all duration-200 ${
                                sidebarOpen
                                    ? 'line-clamp-1 flex min-w-full items-center gap-x-3.5 px-5 py-2.5 text-sm font-medium capitalize hover:cursor-pointer'
                                    : 'flex min-w-full items-center justify-center py-3 hover:cursor-pointer'
                            } ${
                                isActive
                                    ? 'border-primary-500 bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-transparent dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                            }`}
                            {...props}
                        >
                            {sidebarOpen ? (
                                <>
                                    <IconCornerDownRight
                                        size={18}
                                        strokeWidth={1.5}
                                        className="shrink-0"
                                    />{' '}
                                    {item.title}
                                </>
                            ) : (
                                item.icon
                            )}
                        </Link>
                    );
                })}
        </>
    );
}
