import React, { useState } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import Select from "@/Components/Dashboard/Select";
import {
    IconListDetails,
    IconPlus,
    IconPencil,
    IconTrash,
    IconEye,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function PriceLists({ priceLists }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        slug: "",
        customer_scope: "all",
        notes: "",
        priority: 0,
    });

    if (flash?.success) toast.success(flash.success);

    const resetForm = () => {
        reset();
        setEditing(null);
        setShowForm(false);
    };

    const openEdit = (pl) => {
        setEditing(pl);
        setData({
            name: pl.name,
            slug: pl.slug,
            customer_scope: pl.customer_scope,
            notes: pl.notes || "",
            priority: pl.priority,
        });
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            put(route("price-lists.update", editing.id), {
                preserveScroll: true,
                onSuccess: () => resetForm(),
                onError: () => toast.error("Gagal menyimpan price list"),
            });
        } else {
            post(route("price-lists.store"), {
                preserveScroll: true,
                onSuccess: () => resetForm(),
                onError: () => toast.error("Gagal menyimpan price list"),
            });
        }
    };

    const handleDelete = (pl) => {
        if (!confirm(`Hapus price list ${pl.name}?`)) return;
        router.delete(route("price-lists.destroy", pl.id));
    };

    const scopeLabel = {
        all: "Semua",
        walk_in: "Walk-in",
        registered: "Terdaftar",
        member: "Member",
        segment: "Segmen",
    };

    return (
        <>
            <Head title="Price List" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IconListDetails
                                size={28}
                                className="text-primary-500"
                            />
                            Price List
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Harga khusus per kelompok pelanggan
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                        disabled={processing}
                    >
                        <IconPlus size={18} /> Baru
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                            {editing ? "Edit Price List" : "Price List Baru"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Nama"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    errors={errors.name}
                                    maxLength={100}
                                    required
                                />
                                <Input
                                    label="Slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData("slug", e.target.value)
                                    }
                                    errors={errors.slug}
                                    maxLength={100}
                                    disabled
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Kelompok"
                                    value={data.customer_scope}
                                    onChange={(value) =>
                                        setData("customer_scope", value)
                                    }
                                    options={[
                                        {
                                            value: "all",
                                            label: "Semua Pelanggan",
                                        },
                                        { value: "walk_in", label: "Walk-in" },
                                        {
                                            value: "registered",
                                            label: "Terdaftar",
                                        },
                                        { value: "member", label: "Member" },
                                    ]}
                                    error={errors.customer_scope}
                                />
                                <Input
                                    label="Prioritas"
                                    type="number"
                                    min="0"
                                    value={data.priority}
                                    onChange={(e) =>
                                        setData(
                                            "priority",
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                    errors={errors.priority}
                                />
                            </div>
                            <Textarea
                                label="Catatan"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                errors={errors.notes}
                                rows={2}
                                maxLength={500}
                            />
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : editing
                                          ? "Update"
                                          : "Simpan"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {priceLists.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {priceLists.map((pl) => (
                                <div
                                    key={pl.id}
                                    className="p-4 flex items-center gap-4"
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {pl.name}{" "}
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                ({pl.slug})
                                            </span>
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {scopeLabel[pl.customer_scope] ||
                                                pl.customer_scope}{" "}
                                            • {pl.items_count} produk •
                                            Prioritas {pl.priority}
                                        </p>
                                    </div>
                                    <Link
                                        href={route("price-lists.show", pl.id)}
                                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <IconEye size={18} />
                                    </Link>
                                    <button
                                        onClick={() => openEdit(pl)}
                                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <IconPencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pl)}
                                        className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10"
                                    >
                                        <IconTrash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                            Belum ada price list.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PriceLists.layout = (page) => <DashboardLayout children={page} />;
