import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/Dashboard/Button';
import {
    IconCirclePlus,
    IconDatabaseOff,
    IconPencilCog,
    IconTrash,
    IconLayoutGrid,
    IconList,
    IconCategory,
} from '@tabler/icons-react';
import Search from '@/Components/Dashboard/Search';
import Table from '@/Components/Dashboard/Table';
import Pagination from '@/Components/Dashboard/Pagination';
import { useAuthorization } from '@/Utils/authorization';

// Category Card for Grid View
function CategoryCard({ category, canUpdate, canDelete }) {
    return (
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
            {/* Category Image */}
            <div className="relative aspect-[3/2] overflow-hidden bg-slate-100 dark:bg-slate-800">
                {category.image ? (
                    <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <IconCategory
                            size={48}
                            className="text-slate-300 dark:text-slate-600"
                            strokeWidth={1}
                        />
                    </div>
                )}

                {/* Action Buttons Overlay */}
                {(canUpdate || canDelete) && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100">
                        {canUpdate && (
                            <Link
                                href={route('categories.edit', category.id)}
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
                                url={route('categories.destroy', category.id)}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Category Info */}
            <div className="p-4">
                <h3 className="mb-1 text-base font-semibold text-slate-800 dark:text-slate-200">
                    {category.name}
                </h3>
                {category.description && (
                    <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {category.description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function Index({ categories }) {
    const { can } = useAuthorization();
    const [viewMode, setViewMode] = useState('grid');
    const canCreateCategories = can('categories-create');
    const canEditCategories = can('categories-edit');
    const canDeleteCategories = can('categories-delete');

    return (
        <>
            <Head title="Kategori" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Kategori
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {categories.total || categories.data?.length || 0} kategori terdaftar
                        </p>
                    </div>
                    {canCreateCategories && (
                        <Button
                            type={'link'}
                            icon={<IconCirclePlus size={18} strokeWidth={1.5} />}
                            className={
                                'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600'
                            }
                            label={'Tambah Kategori'}
                            href={route('categories.create')}
                        />
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-80">
                    <Search url={route('categories.index')} placeholder="Cari kategori..." />
                </div>
                <div className="flex items-center gap-2">
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
            {categories.data.length > 0 ? (
                viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {categories.data.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                canUpdate={canEditCategories}
                                canDelete={canDeleteCategories}
                            />
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <Table.Card title={'Data Kategori'}>
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th className="w-10">No</Table.Th>
                                    <Table.Th>Kategori</Table.Th>
                                    <Table.Th>Deskripsi</Table.Th>
                                    <Table.Th></Table.Th>
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {categories.data.map((category, i) => (
                                    <tr
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        key={category.id}
                                    >
                                        <Table.Td className="text-center">
                                            {++i +
                                                (categories.current_page - 1) * categories.per_page}
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                                    {category.image ? (
                                                        <img
                                                            src={category.image}
                                                            alt={category.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <IconCategory
                                                                size={20}
                                                                className="text-slate-400"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    {category.name}
                                                </p>
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                                {category.description || '-'}
                                            </p>
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="flex gap-2">
                                                {canEditCategories && (
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
                                                        href={route('categories.edit', category.id)}
                                                    />
                                                )}
                                                {canDeleteCategories && (
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
                                                            'categories.destroy',
                                                            category.id
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
                        <IconDatabaseOff size={32} className="text-slate-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">
                        Belum Ada Kategori
                    </h3>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Tambahkan kategori pertama Anda.
                    </p>
                    <Button
                        type={'link'}
                        icon={<IconCirclePlus size={18} />}
                        className={'bg-primary-500 text-white hover:bg-primary-600'}
                        label={'Tambah Kategori'}
                        href={route('categories.create')}
                    />
                </div>
            )}

            {categories.last_page !== 1 && <Pagination links={categories.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
