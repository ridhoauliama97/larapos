import React, { useCallback, useEffect, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
    IconAlertTriangle,
    IconArrowsExchange,
    IconBell,
    IconCircleCheck,
    IconCurrencyDollar,
    IconDots,
    IconPackage,
    IconReceipt,
    IconShieldLock,
    IconShoppingCart,
} from "@tabler/icons-react";
import { usePage, router } from "@inertiajs/react";
import axios from "axios";
import toast from "react-hot-toast";

const FEED_POLL_INTERVAL = 10000;
const MAX_TOASTS_PER_POLL = 3;
const TOAST_DURATION = 6000;

// Icon and tint per system notification type (10x10 rounded-full circle pattern).
const systemNotificationTypes = {
    transaction: {
        icon: IconShoppingCart,
        tint: "bg-primary-100 text-primary-600",
    },
    low_stock: {
        icon: IconAlertTriangle,
        tint: "bg-amber-100 text-amber-600",
    },
    stock_mutation: {
        icon: IconPackage,
        tint: "bg-slate-100 text-slate-600",
    },
    stock_transfer: {
        icon: IconArrowsExchange,
        tint: "bg-cyan-100 text-cyan-600",
    },
    payable: {
        icon: IconCurrencyDollar,
        tint: "bg-emerald-100 text-emerald-600",
    },
    receivable: {
        icon: IconReceipt,
        tint: "bg-amber-100 text-amber-600",
    },
    security: {
        icon: IconShieldLock,
        tint: "bg-rose-100 text-rose-600",
    },
};

const fallbackSystemNotificationType = {
    icon: IconPackage,
    tint: "bg-slate-100 text-slate-600",
};

const renderSystemIcon = (type) => {
    const { icon: Icon, tint } =
        systemNotificationTypes[type] || fallbackSystemNotificationType;

    return (
        <span
            className={`w-10 h-10 rounded-full ${tint} flex items-center justify-center`}
        >
            <Icon size={18} />
        </span>
    );
};

// POSLayout mounts two Notification instances (desktop + mobile), so track
// toasted ids at module scope to avoid showing the same toast twice.
const toastedNotificationIds = new Set();

const showSystemToast = (notification) => {
    toast.custom(
        (t) => (
            <div
                onClick={() => {
                    if (notification.url) {
                        router.visit(notification.url);
                    }
                    toast.dismiss(t.id);
                }}
                className={`flex items-start gap-3 w-80 max-w-[90vw] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg ${
                    notification.url ? "cursor-pointer" : "cursor-default"
                }`}
            >
                {renderSystemIcon(notification.type)}
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 truncate">
                        {notification.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {notification.message}
                    </div>
                </div>
            </div>
        ),
        { duration: TOAST_DURATION }
    );
};

export default function Notification() {
    const {
        lowStockNotifications = [],
        expiringBatchNotifications = [],
        receivableNotifications = [],
        payableNotifications = [],
    } = usePage().props;

    const mapItems = (items) =>
        items.map((item) => ({
            ...item,
            type: item.type || "stock",
            icon:
                item.type === "receivable" ? (
                    <span className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <IconReceipt size={18} />
                    </span>
                ) : item.type === "payable" ? (
                    <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <IconCurrencyDollar size={18} />
                    </span>
                ) : (
                    <span className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                        <IconPackage size={18} />
                    </span>
                ),
        }));

    const mergeData = () => [
        ...mapItems(
            lowStockNotifications.map((n) => ({
                ...n,
                id: `stock-${n.id}`,
                originalId: n.id,
                title: `Stok habis: ${n.title}`,
                subtitle: `Stok: ${n.stock}`,
                type: "stock",
            }))
        ),
        ...mapItems(
            expiringBatchNotifications.map((n) => ({
                ...n,
                id: `batch-${n.id}`,
                title: `Batch kedaluwarsa: ${n.title}`,
                subtitle: `${n.batch_number} • Stok: ${n.stock}`,
                type: "stock",
                noAck: true,
            }))
        ),
        ...mapItems(
            receivableNotifications.map((n) => ({
                ...n,
                id: `recv-${n.id}`,
                type: "receivable",
            }))
        ),
        ...mapItems(
            payableNotifications.map((n) => ({
                ...n,
                id: `pay-${n.id}`,
                type: "payable",
            }))
        ),
    ];

    const [data, setData] = useState(mergeData());
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [unreadSystemCount, setUnreadSystemCount] = useState(0);

    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const notificationRef = useRef(null);
    const seenNotificationIds = useRef(new Set());
    const hasLoadedFeed = useRef(false);
    // Read locally but maybe not persisted yet — keep them read if a poll races the POST.
    const locallyReadIds = useRef(new Set());

    const handleClickOutside = (event) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousedown", handleClickOutside);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Sync when low stock changes (e.g., restocked items disappear)
    useEffect(() => {
        setData(mergeData());
    },         [lowStockNotifications, expiringBatchNotifications, receivableNotifications, payableNotifications]);

    // Fetch the database notification feed and toast items that arrive after the first load.
    const fetchFeed = useCallback(async () => {
        try {
            const response = await axios.get(route("notifications.feed"), {
                headers: { Accept: "application/json" },
            });

            const notifications = response.data?.notifications ?? [];
            const unreadCount = response.data?.unread_count ?? 0;

            if (hasLoadedFeed.current) {
                const newNotifications = notifications.filter(
                    (notification) =>
                        !seenNotificationIds.current.has(notification.id)
                );

                newNotifications
                    .filter(
                        (notification) =>
                            !toastedNotificationIds.has(notification.id)
                    )
                    .slice(0, MAX_TOASTS_PER_POLL)
                    .forEach((notification) => {
                        toastedNotificationIds.add(notification.id);
                        showSystemToast(notification);
                    });
            }

            notifications.forEach((notification) => {
                seenNotificationIds.current.add(notification.id);
            });

            hasLoadedFeed.current = true;
            setSystemNotifications(
                notifications.map((notification) =>
                    notification.read_at === null &&
                    locallyReadIds.current.has(notification.id)
                        ? {
                              ...notification,
                              read_at: new Date().toISOString(),
                          }
                        : notification
                )
            );
            setUnreadSystemCount(unreadCount);
        } catch {
            // Keep the last feed data when a poll fails.
        }
    }, []);

    useEffect(() => {
        fetchFeed();

        const interval = setInterval(fetchFeed, FEED_POLL_INTERVAL);

        // Refresh immediately when the tab becomes visible again or when an
        // Inertia action (checkout, payment, etc.) finishes, instead of waiting
        // for the next poll tick.
        const refreshWhenVisible = () => {
            if (!document.hidden) {
                fetchFeed();
            }
        };

        const unsubscribe = router.on("success", fetchFeed);

        document.addEventListener("visibilitychange", refreshWhenVisible);
        window.addEventListener("focus", refreshWhenVisible);

        return () => {
            clearInterval(interval);
            unsubscribe();
            document.removeEventListener(
                "visibilitychange",
                refreshWhenVisible
            );
            window.removeEventListener("focus", refreshWhenVisible);
        };
    }, [fetchFeed]);

    // System notifications on top, computed Inertia items below.
    const mapSystemItems = (notifications) =>
        notifications.map((notification) => ({
            ...notification,
            id: `sys-${notification.id}`,
            originalId: notification.id,
            system: true,
            unread: notification.read_at === null,
            icon: renderSystemIcon(notification.type),
            subtitle: notification.message,
            time: notification.created_at
                ? new Date(notification.created_at).toLocaleString("id-ID")
                : "",
        }));

    const displayData = [...mapSystemItems(systemNotifications), ...data];

    // Read notifications stay visible as history — only their styling changes.
    const isUnread = (item) => (item.system ? item.unread : !item.read);
    const unreadComputedCount = data.filter((item) => !item.read).length;
    const badgeCount = unreadComputedCount + unreadSystemCount;

    const handleMarkRead = (id) => {
        const item = displayData.find((entry) => entry.id === id);
        if (!item || item.noAck || !isUnread(item)) {
            return;
        }

        if (item.system) {
            locallyReadIds.current.add(item.originalId);
            setSystemNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === item.originalId
                        ? { ...notification, read_at: new Date().toISOString() }
                        : notification
                )
            );
            setUnreadSystemCount((prev) => Math.max(prev - 1, 0));
            axios
                .post(
                    route("notifications.read", item.originalId),
                    {},
                    { headers: { Accept: "application/json" } }
                )
                .catch(() => {});
            return;
        }

        setData((prev) =>
            prev.map((entry) =>
                entry.id === id ? { ...entry, read: true } : entry
            )
        );
        if (item.type === "stock") {
            router.post(
                route("notifications.stock.read"),
                { product_id: item.originalId || id },
                { preserveScroll: true, preserveState: true }
            );
        }
    };

    const handleMarkAllRead = () => {
        const hasUnreadSystem = systemNotifications.some(
            (notification) => notification.read_at === null
        );
        const hasUnreadComputed = data.some(
            (item) => !item.read && !item.noAck
        );

        if (!hasUnreadSystem && !hasUnreadComputed) {
            return;
        }

        if (hasUnreadComputed) {
            setData((prev) =>
                prev.map((item) =>
                    item.noAck ? item : { ...item, read: true }
                )
            );
            router.post(
                route("notifications.stock.readAll"),
                {},
                { preserveScroll: true, preserveState: true }
            );
        }

        if (hasUnreadSystem) {
            systemNotifications.forEach((notification) =>
                locallyReadIds.current.add(notification.id)
            );
            setSystemNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read_at: notification.read_at ?? new Date().toISOString(),
                }))
            );
            setUnreadSystemCount(0);
            axios
                .post(
                    route("notifications.read.all"),
                    {},
                    { headers: { Accept: "application/json" } }
                )
                .catch(() => {});
        }
    };

    const NotificationList = () => (
        <div className="flex flex-col gap-3 items-start w-full max-h-80 overflow-y-auto pr-1">
            {displayData.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tidak ada notifikasi
                </div>
            )}
            {displayData.map((item) => {
                const unread = isUnread(item);

                return (
                    <div
                        className={`flex items-center justify-between w-full p-5 rounded-2xl border hover:shadow transition-all ${
                            unread
                                ? "border-primary-200 bg-primary-50/40 dark:border-primary-800 dark:bg-primary-500/5"
                                : "border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40"
                        }`}
                        key={item.id}
                    >
                        <div className="flex items-center gap-4">
                            <span className={unread ? "" : "opacity-60 grayscale"}>
                                {item.icon}
                            </span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`font-semibold text-sm md:text-base ${
                                            unread
                                                ? "text-gray-700 dark:text-gray-200"
                                                : "text-slate-400 dark:text-slate-500"
                                        }`}
                                    >
                                        {item.title}
                                    </div>
                                    {unread && (
                                        <span
                                            className="w-2 h-2 rounded-full bg-primary-500 shrink-0 ring-2 ring-primary-100 dark:ring-primary-900/60"
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                                <div
                                    className={`text-xs md:text-sm ${
                                        unread
                                            ? "text-gray-500 dark:text-gray-400"
                                            : "text-slate-400 dark:text-slate-500"
                                    }`}
                                >
                                    {item.subtitle} {item.time && `• ${item.time}`}
                                </div>
                            </div>
                        </div>
                        {unread ? (
                            <button
                                onClick={() => handleMarkRead(item.id)}
                                disabled={item.noAck}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/30 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 ${item.noAck ? "opacity-50 cursor-default" : ""}`}
                            >
                                <IconCircleCheck size={16} />
                                Dibaca
                            </button>
                        ) : (
                            <span
                                className="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 dark:text-slate-500"
                                aria-label="Sudah dibaca"
                            >
                                <IconCircleCheck size={16} />
                                Dibaca
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <>
            {isMobile === false ? (
                <Menu className="relative z-50" as="div">
                    <Menu.Button className="flex items-center rounded-2xl group px-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow transition">
                        <div className="absolute text-[11px] font-semibold border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 top-0 -right-2 rounded-md px-2 py-0.5 group-hover:scale-110 duration-200 ease-in">
                            {badgeCount}
                        </div>
                        <IconBell
                            strokeWidth={1.5}
                            size={22}
                            className="text-gray-700 dark:text-gray-400"
                        />
                    </Menu.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Menu.Items className="absolute rounded-2xl w-[600px] max-w-[94vw] border md:right-0 z-[100] bg-white dark:bg-gray-950 dark:border-gray-900 shadow-2xl">
                            <div className="flex justify-between items-center gap-2 p-4 border-b dark:border-gray-900">
                                <div className="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                    Notifikasi
                                </div>
                                <div className="flex items-center gap-2">
                                    {badgeCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        >
                                            Tandai dibaca
                                        </button>
                                    )}
                                    <IconDots className="text-gray-500 dark:text-gray-200" size={24} />
                                </div>
                            </div>
                            <div className="p-4">
                                <NotificationList />
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            ) : (
                <div ref={notificationRef}>
                    <button
                        className="flex items-center rounded-xl group p-2 relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="absolute text-[10px] font-semibold border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 top-0 -right-2 rounded-md px-1.5 py-0.5 group-hover:scale-110 duration-200 ease-in">
                            {badgeCount}
                        </div>
                        <IconBell strokeWidth={1.5} size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                    <div
                        className={`${
                            isOpen ? "translate-x-0 opacity-100" : "translate-x-full"
                        } fixed top-0 right-0 z-50 w-[300px] h-full transition-all duration-300 transform border-l bg-white dark:bg-gray-950 dark:border-gray-900`}
                    >
                        <div className="flex justify-between items-center gap-2 p-4 border-b mt-2 dark:border-gray-900 ">
                            <div className="text-base font-bold text-gray-500 dark:text-gray-400 ">
                                Notifikasi
                            </div>
                            <IconDots className="text-gray-500 dark:text-gray-400" size={24} />
                        </div>
                        <div className="p-4">
                            <div className="flex flex-col gap-3 items-start overflow-y-auto h-screen">
                                <NotificationList />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
