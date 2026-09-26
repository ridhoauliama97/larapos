import { Link } from '@inertiajs/react';
import { IconCircleCheck, IconCircleDashed, IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const ITEMS = [
    { key: 'store_profile', href: route('settings.store') },
    { key: 'category', href: route('categories.index') },
    { key: 'product', href: route('products.index') },
    { key: 'customer', href: route('customers.index') },
    { key: 'transaction', href: route('transactions.index') },
];

export default function SetupChecklist({ checklist = {} }) {
    const { t } = useTranslation();

    const done = ITEMS.filter((item) => checklist[item.key]).length;
    const total = ITEMS.length;
    const remaining = total - done;

    if (remaining === 0) return null;

    const percent = Math.round((done / total) * 100);

    return (
        <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5 dark:border-primary-900/40 dark:bg-primary-950/20">
            <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-primary-900 dark:text-primary-200">
                        {t('setupChecklist.title')}
                    </h2>
                    <p className="text-sm text-primary-700/80 dark:text-primary-300/80">
                        {t('setupChecklist.subtitle', { done, total })}
                    </p>
                </div>
                <span className="whitespace-nowrap text-sm font-bold text-primary-600 dark:text-primary-300">
                    {percent}%
                </span>
            </div>

            <div className="mb-4 h-2 overflow-hidden rounded-full bg-primary-100 dark:bg-primary-900/40">
                <div
                    className="h-full rounded-full bg-primary-500 transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>

            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ITEMS.map((item) => {
                    const isDone = !!checklist[item.key];

                    return (
                        <li key={item.key}>
                            <Link
                                href={item.href}
                                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                                    isDone
                                        ? 'cursor-default bg-white/40 text-slate-400 line-through dark:bg-slate-900/20 dark:text-slate-500'
                                        : 'bg-white font-medium text-slate-700 hover:bg-primary-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-primary-900/30'
                                }`}
                            >
                                {isDone ? (
                                    <IconCircleCheck
                                        size={18}
                                        className="shrink-0 text-success-500"
                                    />
                                ) : (
                                    <IconCircleDashed
                                        size={18}
                                        className="shrink-0 text-primary-500"
                                    />
                                )}
                                <span className="flex-1 truncate">
                                    {t(`setupChecklist.items.${item.key}`)}
                                </span>
                                {!isDone && (
                                    <IconArrowRight size={14} className="shrink-0 text-slate-400" />
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
