import { usePage } from '@inertiajs/react';
import LinkItem from '@/Components/Dashboard/LinkItem';
import LinkItemDropdown from '@/Components/Dashboard/LinkItemDropdown';
import { resolveActiveHrefs } from '@/Utils/activeUrl';
import Menu from '@/Utils/Menu';

export default function Sidebar({ sidebarOpen }) {
    const page = usePage();
    const { auth, storeProfile, appVersion } = page.props;
    const url = page.url;
    const menuNavigation = Menu();

    const activeHrefs = resolveActiveHrefs(
        url,
        menuNavigation.flatMap((section) =>
            section.details.flatMap((detail) =>
                detail.subdetails ? detail.subdetails.map((sub) => sub.href) : [detail.href]
            )
        )
    );

    const storeName = storeProfile?.name || 'KASIR';
    const storeLogo = storeProfile?.logo || null;
    const storeInitial =
        storeName?.charAt(0)?.toUpperCase() || auth?.user?.name?.charAt(0)?.toUpperCase() || 'K';

    return (
        <div
            className={` ${sidebarOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full'} md:translate-x-0 ${sidebarOpen ? 'md:w-[260px]' : 'md:w-[80px]'} fixed inset-y-0 left-0 z-40 flex h-screen flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 md:sticky md:top-0 md:shrink-0 md:self-stretch`}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-slate-100 dark:border-slate-800">
                {sidebarOpen ? (
                    <div className="flex items-center gap-2">
                        {storeLogo ? (
                            <img
                                src={storeLogo}
                                alt={storeName}
                                className="h-10 w-10 object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
                                <span className="text-sm font-bold text-white">{storeInitial}</span>
                            </div>
                        )}
                        <span className="truncate text-lg font-bold text-slate-800 dark:text-white">
                            {storeName}
                        </span>
                    </div>
                ) : storeLogo ? (
                    <img
                        src={storeLogo}
                        alt={storeName}
                        className="h-9 w-9 rounded-md object-cover"
                    />
                ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-700">
                        <span className="text-sm font-bold text-white">{storeInitial}</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="dashboard-scrollbar min-h-0 flex-1 overflow-y-auto py-3">
                {menuNavigation.map((section, index) => {
                    const hasPermission = section.details.some(
                        (detail) => detail.permissions === true
                    );
                    if (!hasPermission) return null;

                    return (
                        <div key={index} className="mb-2">
                            {/* Section Title */}
                            {sidebarOpen && (
                                <div className="px-4 py-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                                        {section.title}
                                    </span>
                                </div>
                            )}

                            {/* Menu Items */}
                            <div className={sidebarOpen ? '' : 'flex flex-col items-center'}>
                                {section.details.map((detail, idx) => {
                                    if (!detail.permissions) return null;

                                    if (Object.hasOwn(detail, 'subdetails')) {
                                        return (
                                            <LinkItemDropdown
                                                key={idx}
                                                title={detail.title}
                                                icon={detail.icon}
                                                data={detail.subdetails}
                                                access={detail.permissions}
                                                sidebarOpen={sidebarOpen}
                                            />
                                        );
                                    }

                                    return (
                                        <LinkItem
                                            key={idx}
                                            title={detail.title}
                                            icon={detail.icon}
                                            href={detail.href}
                                            access={detail.permissions}
                                            active={activeHrefs.has(detail.href)}
                                            sidebarOpen={sidebarOpen}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Version/Footer */}
            {sidebarOpen && (
                <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                    <p className="text-center text-[10px] text-slate-400 dark:text-slate-600">
                        Point of Sales {appVersion}
                    </p>
                </div>
            )}
        </div>
    );
}
