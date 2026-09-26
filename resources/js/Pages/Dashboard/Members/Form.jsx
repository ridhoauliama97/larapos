import { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Input from '@/Components/Dashboard/Input';
import Select from '@/Components/Dashboard/Select';
import Textarea from '@/Components/Dashboard/TextArea';
import { IconArrowLeft, IconCrown, IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Form({ mode = 'create', member = null }) {
    const isEdit = mode === 'edit';
    const {
        errors,
        provinces = [],
        regencies = [],
        districts = [],
        villages = [],
        tierOptions = [],
    } = usePage().props;

    const { data, setData, post, processing } = useForm({
        name: member?.name ?? '',
        no_telp: member?.no_telp ?? '',
        address: member?.address ?? '',
        is_loyalty_member: Boolean(member?.is_loyalty_member ?? true),
        loyalty_tier: member?.loyalty_tier ?? 'regular',
        province_id: member?.province_id ?? '',
        regency_id: member?.regency_id ?? '',
        district_id: member?.district_id ?? '',
        village_id: member?.village_id ?? '',
        _method: isEdit ? 'PUT' : 'POST',
    });

    const [regencyList, setRegencyList] = useState(regencies);
    const [districtList, setDistrictList] = useState(districts);
    const [villageList, setVillageList] = useState(villages);
    const prevProvince = useRef(member?.province_id ?? null);
    const prevRegency = useRef(member?.regency_id ?? null);
    const prevDistrict = useRef(member?.district_id ?? null);

    const fetchRegencies = async (provinceId) => {
        if (!provinceId) {
            setRegencyList([]);
            return;
        }

        const response = await axios.get(route('regions.regencies'), {
            params: { province_id: provinceId },
        });
        setRegencyList(response.data);
    };

    const fetchDistricts = async (regencyId) => {
        if (!regencyId) {
            setDistrictList([]);
            return;
        }

        const response = await axios.get(route('regions.districts'), {
            params: { regency_id: regencyId },
        });
        setDistrictList(response.data);
    };

    const fetchVillages = async (districtId) => {
        if (!districtId) {
            setVillageList([]);
            return;
        }

        const response = await axios.get(route('regions.villages'), {
            params: { district_id: districtId },
        });
        setVillageList(response.data);
    };

    useEffect(() => {
        if (data.province_id) {
            if (prevProvince.current && prevProvince.current !== data.province_id) {
                setData('regency_id', '');
                setData('district_id', '');
                setData('village_id', '');
                setDistrictList([]);
                setVillageList([]);
            }
            fetchRegencies(data.province_id);
        } else {
            setRegencyList([]);
            setDistrictList([]);
            setVillageList([]);
        }

        prevProvince.current = data.province_id;
    }, [data.province_id]);

    useEffect(() => {
        if (data.regency_id) {
            if (prevRegency.current && prevRegency.current !== data.regency_id) {
                setData('district_id', '');
                setData('village_id', '');
                setVillageList([]);
            }
            fetchDistricts(data.regency_id);
        } else {
            setDistrictList([]);
            setVillageList([]);
        }

        prevRegency.current = data.regency_id;
    }, [data.regency_id]);

    useEffect(() => {
        if (data.district_id) {
            if (prevDistrict.current && prevDistrict.current !== data.district_id) {
                setData('village_id', '');
            }
            fetchVillages(data.district_id);
        } else {
            setVillageList([]);
        }

        prevDistrict.current = data.district_id;
    }, [data.district_id]);

    const submit = (event) => {
        event.preventDefault();

        post(isEdit ? route('members.update', member.id) : route('members.store'), {
            onSuccess: () =>
                toast.success(
                    isEdit ? 'Data member berhasil diperbarui' : 'Member baru berhasil didaftarkan'
                ),
            onError: () =>
                toast.error(isEdit ? 'Gagal memperbarui data member' : 'Gagal mendaftarkan member'),
        });
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Member' : 'Daftar Member Baru'} />

            <div className="w-full">
                <div className="mb-6">
                    <Link
                        href={route('members.index')}
                        className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600"
                    >
                        <IconArrowLeft size={16} />
                        Kembali ke Member
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isEdit ? 'Edit Member' : 'Daftarkan Member Baru'}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isEdit
                            ? 'Kelola status, tier, dan data dasar member tanpa memutus histori transaksi maupun reward.'
                            : 'Daftarkan pelanggan sebagai member agar langsung mendapatkan poin, benefit harga member, dan voucher personal.'}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4 dark:border-primary-900/40 dark:bg-primary-950/20">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-xl bg-white/80 p-2 text-primary-600 dark:bg-slate-900/70 dark:text-primary-300">
                                <IconInfoCircle size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Cara kerja member
                                </p>
                                <p className="mt-1 text-xs leading-6 text-slate-600 dark:text-slate-300">
                                    Member otomatis memakai pricing khusus member, earn/redeem poin
                                    dari loyalty settings, dan bisa menerima voucher personal di
                                    CRM.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300">
                                <IconCrown size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Profil Member
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Lengkapi identitas dasar member untuk pencarian dan histori CRM.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Input
                                type="text"
                                label="Nama Member"
                                placeholder="Masukkan nama lengkap"
                                errors={errors.name}
                                onChange={(event) => setData('name', event.target.value)}
                                value={data.name}
                            />
                            <Input
                                type="text"
                                label="No. Handphone"
                                placeholder="08xxxxxxxxxx"
                                errors={errors.no_telp}
                                onChange={(event) => setData('no_telp', event.target.value)}
                                value={data.no_telp}
                            />
                        </div>

                        <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/70 p-4 dark:border-primary-900/40 dark:bg-primary-950/20">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Status Member
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Nonaktifkan member jika benefit member perlu dihentikan
                                        tanpa menghapus histori.
                                    </p>
                                </div>
                                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={data.is_loyalty_member}
                                        onChange={(event) =>
                                            setData('is_loyalty_member', event.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-primary-500"
                                    />
                                    Aktif
                                </label>
                            </div>

                            <div className="mt-4">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Tier Member
                                </label>
                                <Select
                                    className="mt-2 w-full"
                                    value={data.loyalty_tier}
                                    onChange={(value) => setData('loyalty_tier', value)}
                                    options={tierOptions}
                                />
                                {errors.loyalty_tier && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.loyalty_tier}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Wilayah & Alamat
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Provinsi
                                </label>
                                <Select
                                    className="mt-2 w-full"
                                    value={data.province_id}
                                    onChange={(value) => setData('province_id', value)}
                                    options={provinces.map((province) => ({
                                        value: province.code,
                                        label: province.name,
                                    }))}
                                    placeholder="Pilih Provinsi"
                                />
                                {errors.province_id && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.province_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Kota/Kabupaten
                                </label>
                                <Select
                                    className="mt-2 w-full"
                                    value={data.regency_id}
                                    onChange={(value) => setData('regency_id', value)}
                                    disabled={!data.province_id}
                                    options={regencyList.map((regency) => ({
                                        value: regency.code,
                                        label: regency.name,
                                    }))}
                                    placeholder="Pilih Kota/Kabupaten"
                                />
                                {errors.regency_id && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.regency_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Kecamatan
                                </label>
                                <Select
                                    className="mt-2 w-full"
                                    value={data.district_id}
                                    onChange={(value) => setData('district_id', value)}
                                    disabled={!data.regency_id}
                                    options={districtList.map((district) => ({
                                        value: district.code,
                                        label: district.name,
                                    }))}
                                    placeholder="Pilih Kecamatan"
                                />
                                {errors.district_id && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.district_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Kelurahan
                                </label>
                                <Select
                                    className="mt-2 w-full"
                                    value={data.village_id}
                                    onChange={(value) => setData('village_id', value)}
                                    disabled={!data.district_id}
                                    options={villageList.map((village) => ({
                                        value: village.code,
                                        label: village.name,
                                    }))}
                                    placeholder="Pilih Kelurahan"
                                />
                                {errors.village_id && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.village_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <Textarea
                                label="Alamat Detail"
                                placeholder="Alamat lengkap member"
                                errors={errors.address}
                                onChange={(event) => setData('address', event.target.value)}
                                value={data.address}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <Link
                            href={route('members.index')}
                            className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        >
                            <IconDeviceFloppy size={18} />
                            {processing
                                ? 'Menyimpan...'
                                : isEdit
                                  ? 'Simpan Perubahan'
                                  : 'Daftarkan Member'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
