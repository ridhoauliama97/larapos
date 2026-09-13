import React, { useEffect, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Select from "@/Components/Dashboard/Select";
import Textarea from "@/Components/Dashboard/TextArea";
import toast from "react-hot-toast";
import {
    IconBuildingStore,
    IconDeviceFloppy,
    IconArrowLeft,
} from "@tabler/icons-react";
import axios from "axios";

export default function Create() {
    const { errors, provinces = [] } = usePage().props;

    const { data, setData, post, processing } = useForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        province_id: "",
        regency_id: "",
        district_id: "",
        village_id: "",
    });

    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    const fetchRegencies = async (provinceId) => {
        if (!provinceId) {
            setRegencies([]);
            return;
        }
        const res = await axios.get(route("regions.regencies"), {
            params: { province_id: provinceId },
        });
        setRegencies(res.data);
    };

    const fetchDistricts = async (regencyId) => {
        if (!regencyId) {
            setDistricts([]);
            return;
        }
        const res = await axios.get(route("regions.districts"), {
            params: { regency_id: regencyId },
        });
        setDistricts(res.data);
    };

    const fetchVillages = async (districtId) => {
        if (!districtId) {
            setVillages([]);
            return;
        }
        const res = await axios.get(route("regions.villages"), {
            params: { district_id: districtId },
        });
        setVillages(res.data);
    };

    // reset children when parent changes
    useEffect(() => {
        setData("regency_id", "");
        setData("district_id", "");
        setData("village_id", "");
        setDistricts([]);
        setVillages([]);
        fetchRegencies(data.province_id);
    }, [data.province_id]);

    useEffect(() => {
        setData("district_id", "");
        setData("village_id", "");
        setVillages([]);
        fetchDistricts(data.regency_id);
    }, [data.regency_id]);

    useEffect(() => {
        setData("village_id", "");
        fetchVillages(data.district_id);
    }, [data.district_id]);

    const submit = (e) => {
        e.preventDefault();
        post(route("suppliers.store"), {
            onSuccess: () => toast.success("Supplier berhasil ditambahkan"),
            onError: () => toast.error("Gagal menyimpan supplier"),
        });
    };

    return (
        <>
            <Head title="Tambah Supplier" />

            <div className="mb-6">
                <Link
                    href={route("suppliers.index")}
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3"
                >
                    <IconArrowLeft size={16} />
                    Kembali ke Supplier
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconBuildingStore size={28} className="text-primary-500" />
                    Tambah Supplier Baru
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="max-w-3xl">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                label="Nama Supplier"
                                placeholder="Masukkan nama supplier"
                                errors={errors.name}
                                onChange={(e) => setData("name", e.target.value)}
                                value={data.name}
                            />
                            <Input
                                type="text"
                                label="No. Telepon"
                                placeholder="08xxxxxxxxxx"
                                errors={errors.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                value={data.phone}
                            />
                        </div>

                        <Input
                            type="email"
                            label="Email"
                            placeholder="email@supplier.com"
                            errors={errors.email}
                            onChange={(e) => setData("email", e.target.value)}
                            value={data.email}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Provinsi
                                </label>
                                <Select
                                    value={data.province_id}
                                    onChange={(value) =>
                                        setData("province_id", value)
                                    }
                                    options={provinces.map((prov) => ({
                                        value: prov.code,
                                        label: prov.name,
                                    }))}
                                    placeholder="Pilih Provinsi"
                                    className="w-full"
                                />
                                {errors.province_id && (
                                    <p className="text-xs text-danger-500 mt-1">
                                        {errors.province_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Kota/Kabupaten
                                </label>
                                <Select
                                    value={data.regency_id}
                                    onChange={(value) =>
                                        setData("regency_id", value)
                                    }
                                    options={regencies.map((item) => ({
                                        value: item.code,
                                        label: item.name,
                                    }))}
                                    placeholder="Pilih Kota/Kabupaten"
                                    disabled={!data.province_id}
                                    className="w-full"
                                />
                                {errors.regency_id && (
                                    <p className="text-xs text-danger-500 mt-1">
                                        {errors.regency_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Kecamatan
                                </label>
                                <Select
                                    value={data.district_id}
                                    onChange={(value) =>
                                        setData("district_id", value)
                                    }
                                    options={districts.map((item) => ({
                                        value: item.code,
                                        label: item.name,
                                    }))}
                                    placeholder="Pilih Kecamatan"
                                    disabled={!data.regency_id}
                                    className="w-full"
                                />
                                {errors.district_id && (
                                    <p className="text-xs text-danger-500 mt-1">
                                        {errors.district_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Kelurahan
                                </label>
                                <Select
                                    value={data.village_id}
                                    onChange={(value) =>
                                        setData("village_id", value)
                                    }
                                    options={villages.map((item) => ({
                                        value: item.code,
                                        label: item.name,
                                    }))}
                                    placeholder="Pilih Kelurahan"
                                    disabled={!data.district_id}
                                    className="w-full"
                                />
                                {errors.village_id && (
                                    <p className="text-xs text-danger-500 mt-1">
                                        {errors.village_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Textarea
                            label="Alamat Detail"
                            placeholder="Alamat lengkap supplier"
                            errors={errors.address}
                            onChange={(e) => setData("address", e.target.value)}
                            value={data.address}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href={route("suppliers.index")}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
                        >
                            <IconDeviceFloppy size={18} />
                            {processing ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
