import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import {
    IconDatabaseOff,
    IconKey,
    IconLayoutGrid,
    IconList,
    IconShield,
} from '@tabler/icons-react';
import Search from '@/Components/Dashboard/Search';
import Table from '@/Components/Dashboard/Table';
import Pagination from '@/Components/Dashboard/Pagination';
import { permissionModule, prettifyModule } from '@/Utils/permissionModules';

export default function Index() {
    const { permissions } = usePage().props;
    const [viewMode, setViewMode] = useState('list');
    const rows = permissions.data ?? [];

    return (
        <>
            <Head title="Hak Akses" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconKey size={28} className="text-primary-500" />
                            Hak Akses
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {permissions.total || 0} hak akses terdaftar
                        </p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-80">
                    <Search url={route('permissions.index')} placeholder="Cari hak akses..." />
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
            {rows.length ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {rows.map((permission, i) => (
                            <div
                                key={permission.id || i}
                                className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-700"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/50">
                                        <IconShield
                                            size={16}
                                            className="text-primary-600 dark:text-primary-400"
                                        />
                                    </div>
                                    <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {permission.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Table.Card title="Data Hak Akses">
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th className="w-10">No</Table.Th>
                                    <Table.Th>Hak Akses</Table.Th>
                                    <Table.Th>Grup</Table.Th>
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows.map((permission, i) => (
                                    <tr
                                        key={permission.id || i}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <Table.Td className="text-center">
                                            {++i +
                                                (permissions.current_page - 1) *
                                                    permissions.per_page}
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="flex items-center gap-2">
                                                <IconShield
                                                    size={16}
                                                    strokeWidth={1.5}
                                                    className="shrink-0 text-primary-500"
                                                />
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    {permission.name}
                                                </span>
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {prettifyModule(permissionModule(permission.name))}
                                            </span>
                                        </Table.Td>
                                    </tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.Card>
                )
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <IconDatabaseOff size={32} className="text-slate-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">
                        Belum Ada Hak Akses
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Hak akses tidak ditemukan.
                    </p>
                </div>
            )}

            {permissions.last_page !== 1 && <Pagination links={permissions.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
