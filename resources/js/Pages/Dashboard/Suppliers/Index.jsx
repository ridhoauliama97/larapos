import { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Dashboard/Button";
import Search from "@/Components/Dashboard/Search";
import Table from "@/Components/Dashboard/Table";
import Pagination from "@/Components/Dashboard/Pagination";
import {
    IconBuildingStore,
    IconCirclePlus,
    IconDatabaseOff,
    IconLayoutGrid,
    IconList,
    IconMail,
    IconMapPin,
    IconPencilCog,
    IconPhone,
    IconTrash,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import { useAuthorization } from "@/Utils/authorization";

function SupplierCard({ supplier, canManage }) {
    const region = [supplier.regency_name, supplier.province_name]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-300 flex-shrink-0">
                    <IconBuildingStore size={22} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {supplier.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {region || "Wilayah belum diisi"}
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <IconPhone size={16} />
                        <span>{supplier.phone}</span>
                    </div>
                )}
                {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <IconMail size={16} />
                        <span className="truncate">{supplier.email}</span>
                    </div>
                )}
                {supplier.address && (
                    <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <IconMapPin
                            size={16}
                            className="flex-shrink-0 mt-0.5"
                        />
                        <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                )}
            </div>

            {canManage && (
                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                        href={route("suppliers.edit", supplier.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-warning-100 text-warning-600 hover:bg-warning-200 dark:bg-warning-900/50 dark:text-warning-400 text-sm font-medium transition-colors"
                    >
                        <IconPencilCog size={16} strokeWidth={1.5} />
                        <span>Edit</span>
                    </Link>
                    <Button
                        type="delete"
                        icon={<IconTrash size={16} strokeWidth={1.5} />}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-danger-100 text-danger-600 hover:bg-danger-200 dark:bg-danger-900/50 dark:text-danger-400 text-sm font-medium"
                        url={route("suppliers.destroy", supplier.id)}
                        label="Hapus"
                    />
                </div>
            )}
        </div>
    );
}

export default function SuppliersIndex({ suppliers }) {
    const { flash } = usePage().props;
    const { can } = useAuthorization();
    const canManageSuppliers = can("suppliers-access");
    const [viewMode, setViewMode] = useState("grid");
    const rows = suppliers.data ?? [];

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <>
            <Head title="Supplier" />

            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Supplier
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {suppliers.total || 0} supplier terdaftar
                        </p>
                    </div>
                    {canManageSuppliers && (
                        <Button
                            type="link"
                            icon={
                                <IconCirclePlus size={18} strokeWidth={1.5} />
                            }
                            className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                            label="Tambah Supplier"
                            href={route("suppliers.create")}
                        />
                    )}
                </div>
            </div>

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="w-full sm:w-80">
                    <Search
                        url={route("suppliers.index")}
                        placeholder="Cari supplier..."
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

            {rows.length ? (
                viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rows.map((supplier) => (
                            <SupplierCard
                                key={supplier.id}
                                supplier={supplier}
                                canManage={canManageSuppliers}
                            />
                        ))}
                    </div>
                ) : (
                    <Table.Card title="Data Supplier">
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th className="w-10">No</Table.Th>
                                    <Table.Th>Supplier</Table.Th>
                                    <Table.Th>Kontak</Table.Th>
                                    <Table.Th>Wilayah</Table.Th>
                                    <Table.Th>Alamat</Table.Th>
                                    <Table.Th></Table.Th>
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows.map((supplier, i) => {
                                    const region = [
                                        supplier.regency_name,
                                        supplier.province_name,
                                    ]
                                        .filter(Boolean)
                                        .join(", ");

                                    return (
                                        <tr
                                            key={supplier.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <Table.Td className="text-center">
                                                {++i +
                                                    (suppliers.current_page -
                                                        1) *
                                                        suppliers.per_page}
                                            </Table.Td>
                                            <Table.Td>
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    {supplier.name}
                                                </p>
                                            </Table.Td>
                                            <Table.Td>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {supplier.phone || "-"}
                                                </span>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                                    {supplier.email || "-"}
                                                </p>
                                            </Table.Td>
                                            <Table.Td>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {region || "-"}
                                                </span>
                                            </Table.Td>
                                            <Table.Td>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                                    {supplier.address || "-"}
                                                </p>
                                            </Table.Td>
                                            <Table.Td>
                                                <div className="flex gap-2">
                                                    {canManageSuppliers && (
                                                        <>
                                                            <Button
                                                                type="edit"
                                                                icon={
                                                                    <IconPencilCog
                                                                        size={16}
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                    />
                                                                }
                                                                className="border bg-warning-100 border-warning-200 text-warning-600 hover:bg-warning-200 dark:bg-warning-900/50 dark:border-warning-800 dark:text-warning-400"
                                                                href={route(
                                                                    "suppliers.edit",
                                                                    supplier.id,
                                                                )}
                                                            />
                                                            <Button
                                                                type="delete"
                                                                icon={
                                                                    <IconTrash
                                                                        size={16}
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                    />
                                                                }
                                                                className="border bg-danger-100 border-danger-200 text-danger-600 hover:bg-danger-200 dark:bg-danger-900/50 dark:border-danger-800 dark:text-danger-400"
                                                                url={route(
                                                                    "suppliers.destroy",
                                                                    supplier.id,
                                                                )}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </Table.Td>
                                        </tr>
                                    );
                                })}
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
                        Belum Ada Supplier
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Tambahkan supplier pertama Anda.
                    </p>
                    {canManageSuppliers && (
                        <Button
                            type="link"
                            icon={<IconCirclePlus size={18} />}
                            className="bg-primary-500 hover:bg-primary-600 text-white"
                            label="Tambah Supplier"
                            href={route("suppliers.create")}
                        />
                    )}
                </div>
            )}

            {suppliers.last_page !== 1 && (
                <Pagination links={suppliers.links} />
            )}
        </>
    );
}

SuppliersIndex.layout = (page) => <DashboardLayout children={page} />;
