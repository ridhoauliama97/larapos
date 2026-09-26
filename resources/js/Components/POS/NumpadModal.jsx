import { useState, useEffect, useCallback } from 'react';
import { IconBackspace, IconX, IconCheck } from '@tabler/icons-react';

/**
 * Numpad Modal for POS - Touch-friendly number input
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal should close
 * @param {function} onConfirm - Called with the final value when confirmed
 * @param {string} title - Modal title (e.g., "Jumlah Bayar", "Quantity")
 * @param {number} initialValue - Starting value
 * @param {number} minValue - Minimum allowed value
 * @param {number} maxValue - Maximum allowed value
 * @param {boolean} isCurrency - If true, formats as currency
 */
export default function NumpadModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Masukkan Angka',
    initialValue = 0,
    minValue = 0,
    maxValue = 999999999,
    isCurrency = false,
}) {
    const [value, setValue] = useState(String(initialValue || ''));

    // Handlers are declared before the effects that use them. They used to sit
    // below the keydown effect, which only worked because `value` was in the
    // effect deps and happened to keep handleConfirm fresh — maxValue and
    // minValue could still go stale mid-session.
    const handleDigit = useCallback(
        (digit) => {
            setValue((prev) => {
                const newValue = prev === '0' ? digit : prev + digit;
                return parseInt(newValue, 10) > maxValue ? prev : newValue;
            });
        },
        [maxValue]
    );

    const handleBackspace = useCallback(() => {
        setValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    }, []);

    const handleClear = useCallback(() => {
        setValue('0');
    }, []);

    const handleConfirm = useCallback(() => {
        const numValue = parseInt(value, 10) || 0;
        if (numValue >= minValue && numValue <= maxValue) {
            onConfirm(numValue);
            onClose();
        }
    }, [value, minValue, maxValue, onConfirm, onClose]);

    // Functional update, so this no longer needs `value` as a dependency.
    const handleQuickAmount = useCallback(
        (amount) => {
            setValue((prev) => {
                const next = (parseInt(prev, 10) || 0) + amount;
                return next <= maxValue ? String(next) : prev;
            });
        },
        [maxValue]
    );

    // Reset value when modal opens
    useEffect(() => {
        if (isOpen) {
            setValue(String(initialValue || ''));
        }
    }, [isOpen, initialValue]);

    // Keyboard support
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') {
                handleDigit(e.key);
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Enter') {
                handleConfirm();
            } else if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'c' || e.key === 'C') {
                handleClear();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, handleDigit, handleBackspace, handleConfirm, handleClear]);

    const formatDisplay = (val) => {
        const num = parseInt(val, 10) || 0;
        if (isCurrency) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(num);
        }
        return num.toLocaleString('id-ID');
    };

    if (!isOpen) return null;

    const numValue = parseInt(value, 10) || 0;
    const isValid = numValue >= minValue && numValue <= maxValue;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-sm animate-slide-up overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Display */}
                <div className="bg-slate-50 px-5 py-6 dark:bg-slate-800/50">
                    <div className="text-right">
                        <p className="font-mono text-3xl font-bold text-slate-900 dark:text-white">
                            {formatDisplay(value)}
                        </p>
                    </div>
                </div>

                {/* Quick Amounts (for currency mode) */}
                {isCurrency && (
                    <div className="grid grid-cols-4 gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
                        {[10000, 20000, 50000, 100000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => handleQuickAmount(amount)}
                                className="rounded-xl bg-primary-50 px-2 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
                            >
                                +{amount / 1000}rb
                            </button>
                        ))}
                    </div>
                )}

                {/* Numpad Grid */}
                <div className="grid grid-cols-3 gap-3 p-5">
                    {/* Numbers 1-9 */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleDigit(String(num))}
                            className="h-14 rounded-2xl bg-slate-100 text-2xl font-semibold text-slate-800 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            {num}
                        </button>
                    ))}

                    {/* Clear */}
                    <button
                        onClick={handleClear}
                        className="h-14 rounded-2xl bg-warning-100 text-sm font-semibold text-warning-700 transition-all hover:bg-warning-200 active:scale-95 dark:bg-warning-900/50 dark:text-warning-400 dark:hover:bg-warning-900"
                    >
                        C
                    </button>

                    {/* 0 */}
                    <button
                        onClick={() => handleDigit('0')}
                        className="h-14 rounded-2xl bg-slate-100 text-2xl font-semibold text-slate-800 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        0
                    </button>

                    {/* Backspace */}
                    <button
                        onClick={handleBackspace}
                        className="flex h-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    >
                        <IconBackspace size={24} />
                    </button>
                </div>

                {/* Footer */}
                <div className="p-5 pt-0">
                    <button
                        onClick={handleConfirm}
                        disabled={!isValid}
                        className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-semibold transition-all ${
                            isValid
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl active:scale-[0.98]'
                                : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700'
                        }`}
                    >
                        <IconCheck size={22} />
                        Konfirmasi
                    </button>
                </div>
            </div>
        </div>
    );
}
