import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import Button from '@/Components/Dashboard/Button';
import {
    IconCirclePlus,
    IconDatabaseOff,
    IconPencilCog,
    IconTrash,
    IconLayoutGrid,
    IconList,
    IconPhoto,
    IconPackage,
    IconSearch,
    IconBarcode,
    IconPrinter,
    IconUpload,
    IconDownload,
} from '@tabler/icons-react';
import Search from '@/Components/Dashboard/Search';
import Table from '@/Components/Dashboard/Table';
import Pagination from '@/Components/Dashboard/Pagination';
import { getProductImageUrl } from '@/Utils/imageUrl';
import BarcodePrintModal from '@/Components/Barcode/BarcodePrintModal';
import { useAuthorization } from '@/Utils/authorization';
import { router } from '@inertiajs/react';

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);

// Product Card for Grid View
function ProductCard({
    product,
    index,
    currentPage,
    perPage,
    isSelected,
    onToggle,
    canUpdate,
    canDelete,
}) {
    const rowNumber = index + 1 + (currentPage - 1) * perPage;
    const lowStock = product.stock > 0 && product.stock <= 5;
    const outOfStock = product.stock === 0;
    const isComposite = product.is_composite;

    return (
        <div
            className={`group overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-lg dark:bg-slate-900 ${
                isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
            }`}
        >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                {/* Checkbox */}
                <div className="absolute left-2 top-2 z-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(product)}
                        className="h-5 w-5 cursor-pointer rounded border-2 border-white bg-white/80 text-primary-500 shadow-sm focus:ring-primary-500"
                    />
                </div>
                {product.image ? (
                    <img
                        src={getProductImageUrl(product.image)}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <IconPhoto
                            size={48}
                            className="text-slate-300 dark:text-slate-600"
                            strokeWidth={1}
                        />
                    </div>
                )}

                {/* Stock Badge */}
                <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                    {isComposite && (
                        <span className="rounded-full bg-primary-500 px-2 py-1 text-xs font-semibold text-white">
                            Komposit
                        </span>
                    )}
                    {outOfStock ? (
                        <span className="rounded-full bg-danger-500 px-2 py-1 text-xs font-semibold text-white">
                            Habis
                        </span>
                    ) : lowStock ? (
                        <span className="rounded-full bg-warning-500 px-2 py-1 text-xs font-semibold text-white">
                            Stok: {product.stock}
                        </span>
                    ) : (
                        <span className="rounded-full bg-slate-900/60 px-2 py-1 text-xs font-medium text-white">
                            Stok: {product.stock}
                        </span>
                    )}
                </div>

                {/* Action Buttons Overlay */}
                {(canUpdate || canDelete) && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
                        {canUpdate && (
                            <Link
                                href={route('products.edit', product.id)}
                                className="rounded-xl bg-white p-2.5 text-warning-600 shadow-lg transition-colors hover:bg-warning-50"
                            >
                                <IconPencilCog size={18} />
                            </Link>
                        )}
                        {canDelete && (
                            <Button
                                type={'delete'}
                                icon={<IconTrash size={18} />}
                                className={
                                    'rounded-xl bg-white p-2.5 text-danger-600 shadow-lg hover:bg-danger-50'
                                }
                                url={route('products.destroy', product.id)}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-3 sm:p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="truncate rounded-md bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-400">
                        {product.category?.name || 'Kategori'}
                    </span>
                </div>
                <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {product.title}
                </h3>
                {(product.barcode || product.sku) && (
                    <div className="mb-2 space-y-0.5">
                        {product.barcode && (
                            <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                                Barcode: {product.barcode}
                            </p>
                        )}
                        {product.sku && (
                            <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                                SKU: {product.sku}
                            </p>
                        )}
                    </div>
                )}

                {/* Price Section - Mobile Friendly */}
                <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                    {/* Sell Price - Prominent */}
                    <p className="text-base font-bold text-primary-600 dark:text-primary-400 sm:text-lg">
                        {formatCurrency(product.sell_price)}
                    </p>
                    {/* Buy Price - Subtle */}
                    <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Modal: {formatCurrency(product.buy_price)}
                        </p>
                        {/* Profit Indicator */}
                        {product.sell_price > product.buy_price && (
                            <span className="text-xs font-medium text-success-600 dark:text-success-400">
                                +{formatCurrency(product.sell_price - product.buy_price)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Index({ products }) {
    const { can } = useAuthorization();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [singleProductBarcode, setSingleProductBarcode] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const canCreateProducts = can('products-create');
    const canEditProducts = can('products-edit');
    const canDeleteProducts = can('products-delete');

    const handlePrintSingleBarcode = (product) => {
        setSingleProductBarcode(product);
        setSelectedProducts([]);
        setShowBarcodeModal(true);
    };

    const handlePrintAllBarcodes = () => {
        setSingleProductBarcode(null);
        setSelectedProducts(products.data);
        setShowBarcodeModal(true);
    };

    const handlePrintSelected = () => {
        if (selectedProducts.length === 0) return;
        setSingleProductBarcode(null);
        setShowBarcodeModal(true);
    };

    const toggleProductSelection = (product) => {
        setSelectedProducts((prev) => {
            const isSelected = prev.some((p) => p.id === product.id);
            if (isSelected) {
                return prev.filter((p) => p.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.data.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts([...products.data]);
        }
    };

    const isProductSelected = (productId) => selectedProducts.some((p) => p.id === productId);

    return (
        <>
            <Head title="Produk" />

            {/* Header */}
            <div data-tour="products-header" className="mb-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Produk
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {products.total} produk terdaftar
                        </p>
                    </div>
                    <div
                        data-tour="products-actions"
                        className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center"
                    >
                        <button
                            onClick={handlePrintAllBarcodes}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 sm:w-auto"
                        >
                            <IconBarcode size={18} />
                            Cetak All Barcode
                        </button>
                        {canCreateProducts && (
                            <>
                                <a
                                    href={route('export.products')}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 sm:w-auto"
                                >
                                    <IconDownload size={18} />
                                    Export
                                </a>
                                <button
                                    type="button"
                                    onClick={() =>
                                        document.getElementById('import-products-input')?.click()
                                    }
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 sm:w-auto"
                                >
                                    <IconUpload size={18} />
                                    Import
                                </button>
                                <input
                                    id="import-products-input"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={function (e) {
                                        const file = e.target.files && e.target.files[0];
                                        if (file) router.post(route('import.products'), { file });
                                    }}
                                />
                            </>
                        )}
                        {canCreateProducts && (
                            <Button
                                type={'link'}
                                icon={<IconCirclePlus size={18} strokeWidth={1.5} />}
                                className={
                                    'w-full justify-center bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 sm:w-auto'
                                }
                                label={'Tambah Produk'}
                                href={route('products.create')}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div
                data-tour="products-search"
                className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center"
            >
                <div className="flex items-center gap-3">
                    <div className="w-full sm:w-80">
                        <Search url={route('products.index')} placeholder="Cari produk..." />
                    </div>
                    {/* Select All Checkbox */}
                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="checkbox"
                            checked={
                                selectedProducts.length === products.data.length &&
                                products.data.length > 0
                            }
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="hidden text-sm text-slate-600 dark:text-slate-400 sm:inline">
                            Pilih Semua
                        </span>
                    </label>
                </div>
                <div data-tour="products-view" className="flex items-center gap-2">
                    {/* Show selection count and print selected button */}
                    {selectedProducts.length > 0 && (
                        <button
                            onClick={handlePrintSelected}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                        >
                            <IconPrinter size={18} />
                            Cetak Terpilih ({selectedProducts.length})
                        </button>
                    )}
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`rounded-lg p-2.5 transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Grid View"
                    >
                        <IconLayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`rounded-lg p-2.5 transition-colors ${
                            viewMode === 'list'
                                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="List View"
                    >
                        <IconList size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div data-tour="products-list" className="contents">
                {products.data.length > 0 ? (
                    viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {products.data.map((product, i) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    index={i}
                                    currentPage={products.current_page}
                                    perPage={products.per_page}
                                    isSelected={isProductSelected(product.id)}
                                    onToggle={toggleProductSelection}
                                    canUpdate={canEditProducts}
                                    canDelete={canDeleteProducts}
                                />
                            ))}
                        </div>
                    ) : (
                        /* List View */
                        <Table.Card title={'Data Produk'}>
                            <Table>
                                <Table.Thead>
                                    <tr>
                                        <Table.Th className="w-10">No</Table.Th>
                                        <Table.Th>Produk</Table.Th>
                                        <Table.Th>Kategori</Table.Th>
                                        <Table.Th>Harga Beli</Table.Th>
                                        <Table.Th>Harga Jual</Table.Th>
                                        <Table.Th>Stok</Table.Th>
                                        <Table.Th></Table.Th>
                                    </tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {products.data.map((product, i) => (
                                        <tr
                                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            key={product.id}
                                        >
                                            <Table.Td className="text-center">
                                                {++i +
                                                    (products.current_page - 1) * products.per_page}
                                            </Table.Td>
                                            <Table.Td>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                                        {product.image ? (
                                                            <img
                                                                src={getProductImageUrl(
                                                                    product.image
                                                                )}
                                                                alt={product.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <IconPackage
                                                                    size={16}
                                                                    className="text-slate-400"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                            {product.title}
                                                        </p>
                                                        <div className="space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                            {product.barcode && (
                                                                <p>Barcode: {product.barcode}</p>
                                                            )}
                                                            {product.sku && (
                                                                <p>SKU: {product.sku}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Table.Td>
                                            <Table.Td>
                                                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                    {product.category?.name}
                                                </span>
                                            </Table.Td>
                                            <Table.Td>{formatCurrency(product.buy_price)}</Table.Td>
                                            <Table.Td className="font-semibold text-primary-600 dark:text-primary-400">
                                                {formatCurrency(product.sell_price)}
                                            </Table.Td>
                                            <Table.Td>
                                                <span
                                                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                                                        product.stock === 0
                                                            ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400'
                                                            : product.stock <= 5
                                                              ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-400'
                                                              : 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400'
                                                    }`}
                                                >
                                                    {product.stock}
                                                </span>
                                            </Table.Td>
                                            <Table.Td>
                                                <div className="flex gap-2">
                                                    {canEditProducts && (
                                                        <Button
                                                            type={'edit'}
                                                            icon={
                                                                <IconPencilCog
                                                                    size={16}
                                                                    strokeWidth={1.5}
                                                                />
                                                            }
                                                            className={
                                                                'border border-warning-200 bg-warning-100 text-warning-600 hover:bg-warning-200 dark:border-warning-800 dark:bg-warning-900/50 dark:text-warning-400'
                                                            }
                                                            href={route(
                                                                'products.edit',
                                                                product.id
                                                            )}
                                                        />
                                                    )}
                                                    {canDeleteProducts && (
                                                        <Button
                                                            type={'delete'}
                                                            icon={
                                                                <IconTrash
                                                                    size={16}
                                                                    strokeWidth={1.5}
                                                                />
                                                            }
                                                            className={
                                                                'border border-danger-200 bg-danger-100 text-danger-600 hover:bg-danger-200 dark:border-danger-800 dark:bg-danger-900/50 dark:text-danger-400'
                                                            }
                                                            url={route(
                                                                'products.destroy',
                                                                product.id
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            </Table.Td>
                                        </tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Table.Card>
                    )
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <IconDatabaseOff
                                size={32}
                                className="text-slate-400"
                                strokeWidth={1.5}
                            />
                        </div>
                        <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">
                            Belum Ada Produk
                        </h3>
                        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                            Tambahkan produk pertama Anda untuk memulai.
                        </p>
                        {canCreateProducts && (
                            <Button
                                type={'link'}
                                icon={<IconCirclePlus size={18} />}
                                className={'bg-primary-500 text-white hover:bg-primary-600'}
                                label={'Tambah Produk'}
                                href={route('products.create')}
                            />
                        )}
                    </div>
                )}
            </div>

            {products.last_page !== 1 && <Pagination links={products.links} />}

            {/* Barcode Print Modal */}
            <BarcodePrintModal
                isOpen={showBarcodeModal}
                onClose={() => {
                    setShowBarcodeModal(false);
                    setSingleProductBarcode(null);
                }}
                products={selectedProducts}
                singleProduct={singleProductBarcode}
            />
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
