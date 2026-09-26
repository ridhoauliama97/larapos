import { IconTrash, IconMinus, IconPlus, IconShoppingCart } from '@tabler/icons-react';
import { getProductImageUrl } from '@/Utils/imageUrl';

const formatPrice = (value = 0) =>
    Number(value || 0).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

// Single Cart Item
function CartItem({ item, onUpdateQty, onRemove, isRemoving }) {
    // Note: item.price from backend is already the total (sell_price * qty)
    const quantity = Number(item.qty || 0);
    const itemPrice = Number(item.price || 0);
    const unitPrice = Number(item.product?.sell_price || 0) || itemPrice / quantity || 0;
    const subtotal = itemPrice; // Already calculated total from backend

    return (
        <div
            className={`group flex animate-slide-up gap-3 rounded-xl border border-transparent bg-slate-50 p-3 transition-all duration-200 hover:border-slate-200 dark:bg-slate-800/50 dark:hover:border-slate-700 ${isRemoving ? 'scale-95 opacity-50' : ''} `}
        >
            {/* Product Image */}
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                {item.product?.image ? (
                    <img
                        src={getProductImageUrl(item.product.image)}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <IconShoppingCart size={20} className="text-slate-400" />
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    {item.product?.title || 'Produk'}
                </h4>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatPrice(unitPrice)} × {item.qty}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {formatPrice(subtotal)}
                </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end justify-between">
                {/* Remove Button */}
                <button
                    onClick={() => onRemove(item.id)}
                    disabled={isRemoving}
                    className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-colors hover:bg-danger-50 hover:text-danger-500 group-hover:opacity-100 dark:hover:bg-danger-950/50"
                >
                    <IconTrash size={16} />
                </button>

                {/* Qty Stepper */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                        disabled={item.qty <= 1}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                        <IconMinus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.qty}
                    </span>
                    <button
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                        <IconPlus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Empty Cart State
function EmptyCart() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <IconShoppingCart size={32} className="text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-base font-medium text-slate-600 dark:text-slate-400">
                Keranjang Kosong
            </h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                Klik produk untuk menambahkan
            </p>
        </div>
    );
}

// Main CartPanel Component
export default function CartPanel({
    items = [],
    onUpdateQty,
    onRemove,
    removingItemId,
    className = '',
}) {
    const totalItems = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    // Note: item.price from backend is already sell_price * qty
    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

    return (
        <div className={`flex h-full flex-col ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <IconShoppingCart size={20} className="text-slate-600 dark:text-slate-400" />
                    <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                        Keranjang
                    </h2>
                </div>
                {totalItems > 0 && (
                    <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                        {totalItems} item
                    </span>
                )}
            </div>

            {/* Cart Items */}
            {items.length > 0 ? (
                <div
                    className="flex-1 space-y-2 overflow-y-auto p-3"
                    style={{ maxHeight: '300px', minHeight: '150px' }}
                >
                    {items.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onUpdateQty={onUpdateQty}
                            onRemove={onRemove}
                            isRemoving={removingItemId === item.id}
                        />
                    ))}
                </div>
            ) : (
                <EmptyCart />
            )}

            {/* Subtotal */}
            {items.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {formatPrice(subtotal)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Export sub-components
CartPanel.Item = CartItem;
CartPanel.Empty = EmptyCart;
