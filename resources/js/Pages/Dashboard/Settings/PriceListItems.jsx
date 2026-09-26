import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import toast from 'react-hot-toast';

const formatPrice = (v = 0) => Number(v).toLocaleString('id-ID');

export default function PriceListItems({ priceList, products }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    if (flash?.success) toast.success(flash.success);

    const filtered = products.filter(
        (p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').includes(search)
    );
    const existingProductIds = priceList.items.map((i) => i.product_id);

    const addPrice = (product) => {
        const price = prompt(`Harga untuk ${product.title}:`, String(product.sell_price));
        if (price === null) return;
        router.post(route('price-lists.items.update', priceList.id), {
            product_id: product.id,
            price: parseInt(price),
        });
    };

    const removeItem = (item) => {
        if (!confirm(`Hapus ${item.product?.title} dari price list?`)) return;
        router.delete(route('price-lists.items.destroy', [priceList.id, item.product_id]));
    };

    return (
        <>
            <Head title={`Price List: ${priceList.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('price-lists.index')}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <IconArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{priceList.name}</h1>
                        <p className="text-sm text-slate-500">{priceList.items.length} produk</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 font-semibold">Tambah Harga</h3>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari produk..."
                        className="mb-3 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
                    />
                    {search &&
                        filtered
                            .filter((p) => !existingProductIds.includes(p.id))
                            .slice(0, 10)
                            .map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => addPrice(p)}
                                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm transition hover:bg-slate-50"
                                >
                                    <span>
                                        {p.title}{' '}
                                        <span className="text-slate-400">({p.sku || '-'})</span>
                                    </span>
                                    <span className="font-medium text-primary-500">
                                        {formatPrice(p.sell_price)}
                                    </span>
                                </button>
                            ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {priceList.items.length > 0 ? (
                        <div className="divide-y">
                            {priceList.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4">
                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            {item.product?.title || '-'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {item.product?.sku || '-'} • Harga normal:{' '}
                                            {formatPrice(item.product?.sell_price)}
                                        </p>
                                    </div>
                                    <span className="font-bold text-primary-600">
                                        {formatPrice(item.price)}
                                    </span>
                                    <button
                                        onClick={() => removeItem(item)}
                                        className="rounded-lg p-2 text-danger-500 hover:bg-danger-50"
                                    >
                                        <IconTrash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            Belum ada item. Cari produk di atas untuk menambah.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PriceListItems.layout = (page) => <DashboardLayout children={page} />;
