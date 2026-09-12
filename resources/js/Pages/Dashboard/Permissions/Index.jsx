import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    IconDatabaseOff,
    IconKey,
    IconLayoutGrid,
    IconList,
    IconShield,
} from "@tabler/icons-react";
import Search from "@/Components/Dashboard/Search";
import Table from "@/Components/Dashboard/Table";
import Pagination from "@/Components/Dashboard/Pagination";
import {
    permissionModule,
    prettifyModule,
} from "@/Utils/permissionModules";

export default function Index() {
    const { permissions } = usePage().props;
    const [viewMode, setViewMode] = useState("list");
    const rows = permissions.data ?? [];

    return (
        <>
            <Head title="Hak Akses" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="w-full sm:w-80">
                    <Search
                        url={route("permissions.index")}
                        placeholder="Cari hak akses..."
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2.5 rounded-lg transition-colors ${
                            viewMode === "grid"
                                ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        title="Grid View"
                    >
                        <IconLayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2.5 rounded-lg transition-colors ${
                            viewMode === "list"
                                ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        title="List View"
                    >
                        <IconList size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {rows.length ? (
                viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {rows.map((permission, i) => (
                            <div
                                key={permission.id || i}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0">
                                        <IconShield
                                            size={16}
                                            className="text-primary-600 dark:text-primary-400"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
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
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
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
                                                    className="text-primary-500 shrink-0"
                                                />
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    {permission.name}
                                                </span>
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {prettifyModule(
                                                    permissionModule(
                                                        permission.name,
                                                    ),
                                                )}
                                            </span>
                                        </Table.Td>
                                    </tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.Card>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <IconDatabaseOff
                            size={32}
                            className="text-slate-400"
                            strokeWidth={1.5}
                        />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
                        Belum Ada Hak Akses
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Hak akses tidak ditemukan.
                    </p>
                </div>
            )}

            {permissions.last_page !== 1 && (
                <Pagination links={permissions.links} />
            )}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
