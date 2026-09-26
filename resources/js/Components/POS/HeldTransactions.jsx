import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    IconClock,
    IconPlayerPlay,
    IconTrash,
    IconChevronDown,
    IconChevronUp,
    IconX,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

const formatPrice = (value = 0) =>
    Number(value || 0).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

/**
 * HeldTransactions - Compact badge with expandable panel
 * Takes minimal space when collapsed, expands to show list with max height
 */
export default function HeldTransactions({ heldCarts = [], hasActiveCart = false }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [resumingId, setResumingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    if (!heldCarts || heldCarts.length === 0) {
        return null;
    }

    const handleResume = (holdId) => {
        if (hasActiveCart) {
            toast.error('Selesaikan atau tahan transaksi aktif terlebih dahulu');
            return;
        }

        setResumingId(holdId);

        router.post(
            route('transactions.resume', holdId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Transaksi dilanjutkan');
                    setResumingId(null);
                    setIsExpanded(false);
                },
                onError: (errors) => {
                    toast.error(errors.message || 'Gagal melanjutkan transaksi');
                    setResumingId(null);
                },
            }
        );
    };

    const handleDelete = (holdId) => {
        if (!confirm('Hapus transaksi yang ditahan ini?')) return;

        setDeletingId(holdId);

        router.delete(route('transactions.clearHold', holdId), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Transaksi dihapus');
                setDeletingId(null);
            },
            onError: () => {
                toast.error('Gagal menghapus transaksi');
                setDeletingId(null);
            },
        });
    };

    const totalHeldAmount = heldCarts.reduce((sum, h) => sum + Number(h.total || 0), 0);

    // Collapsed view - compact clickable badge (minimal space)
    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="flex w-full items-center justify-between border-b border-amber-200 bg-amber-50 px-3 py-2 transition-colors hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-950/30 dark:hover:bg-amber-900/40"
            >
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-xs font-bold text-white">
                        {heldCarts.length}
                    </div>
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Transaksi Ditahan
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                        • {formatPrice(totalHeldAmount)}
                    </span>
                </div>
                <IconChevronDown size={16} className="text-amber-600" />
            </button>
        );
    }

    // Expanded view - list with max height and scroll
    return (
        <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-200/50 px-3 py-2 dark:border-amber-800/30">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-xs font-bold text-white">
                        {heldCarts.length}
                    </div>
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Transaksi Ditahan
                    </span>
                </div>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-amber-200 dark:hover:bg-amber-900/50"
                >
                    <IconChevronUp size={16} className="text-amber-600" />
                </button>
            </div>

            {/* List with max height - won't take over cart space */}
            <div className="max-h-[140px] overflow-y-auto">
                {heldCarts.map((hold) => (
                    <div
                        key={hold.hold_id}
                        className="flex items-center justify-between gap-2 border-b border-amber-100/50 px-3 py-2 last:border-0 dark:border-amber-900/30"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-amber-800 dark:text-amber-200">
                                {hold.label}
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                {hold.items_count} item • {formatPrice(hold.total)}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleResume(hold.hold_id)}
                                disabled={resumingId === hold.hold_id || hasActiveCart}
                                className="flex items-center gap-1 rounded bg-amber-500 px-2 py-1 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                                title={hasActiveCart ? 'Kosongkan keranjang dulu' : 'Lanjutkan'}
                            >
                                {resumingId === hold.hold_id ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <IconPlayerPlay size={12} />
                                )}
                            </button>
                            <button
                                onClick={() => handleDelete(hold.hold_id)}
                                disabled={deletingId === hold.hold_id}
                                className="rounded p-1 text-amber-600 hover:bg-amber-200 disabled:opacity-50 dark:hover:bg-amber-900/50"
                            >
                                <IconTrash size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * HoldButton - Compact button to hold current transaction
 */
export function HoldButton({ hasItems = false, onHold, isHolding = false }) {
    const [showLabelInput, setShowLabelInput] = useState(false);
    const [label, setLabel] = useState('');

    const handleHold = () => {
        onHold(label || null);
        setLabel('');
        setShowLabelInput(false);
    };

    if (!hasItems) return null;

    if (showLabelInput) {
        return (
            <div className="flex gap-2">
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Label (opsional)"
                    className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleHold();
                        if (e.key === 'Escape') setShowLabelInput(false);
                    }}
                />
                <button
                    onClick={handleHold}
                    disabled={isHolding}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                    {isHolding ? '...' : 'OK'}
                </button>
                <button
                    onClick={() => setShowLabelInput(false)}
                    className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <IconX size={14} className="text-slate-500" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowLabelInput(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-amber-400 px-3 py-2 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
        >
            <IconClock size={14} />
            Tahan
        </button>
    );
}
