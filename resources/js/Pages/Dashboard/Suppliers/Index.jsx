import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Button from '@/Components/Dashboard/Button';
import Search from '@/Components/Dashboard/Search';
import Table from '@/Components/Dashboard/Table';
import Pagination from '@/Components/Dashboard/Pagination';
import Drawer from '@/Components/Dashboard/Drawer';
import Input from '@/Components/Dashboard/Input';
import Select from '@/Components/Dashboard/Select';
import Textarea from '@/Components/Dashboard/TextArea';
import {
    IconBuildingStore,
    IconCirclePlus,
    IconDatabaseOff,
    IconDeviceFloppy,
    IconLayoutGrid,
    IconList,
    IconMail,
    IconMapPin,
    IconPencilCog,
    IconPhone,
    IconTrash,
} from '@tabler/icons-react';
import { useAuthorization } from '@/Utils/authorization';

const blankSupplier = {
    _method: 'POST',
    name: '',
    phone: '',
    email: '',
    address: '',
    province_id: '',
    regency_id: '',
    district_id: '',
    village_id: '',
};

function SupplierCard({ supplier, canManage, onEdit }) {
    const region = [supplier.regency_name, supplier.province_name].filter(Boolean).join(', ');

    return (
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
            <div className="mb-4 flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300">
                    <IconBuildingStore size={22} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-slate-800 dark:text-slate-200">
                        {supplier.name}
                    </h3>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {region || 'Wilayah belum diisi'}
                    </p>
                </div>
            </div>

            <div className="mb-4 space-y-2">
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
                        <IconMapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                )}
            </div>

            {canManage && (
                <div className="flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                        onClick={() => onEdit(supplier)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-warning-100 py-2 text-sm font-medium text-warning-600 transition-colors hover:bg-warning-200 dark:bg-warning-900/50 dark:text-warning-400"
                    >
                        <IconPencilCog size={16} strokeWidth={1.5} />
                        <span>Edit</span>
                    </button>
                    <Button
                        type="delete"
                        icon={<IconTrash size={16} strokeWidth={1.5} />}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-danger-100 py-2 text-sm font-medium text-danger-600 hover:bg-danger-200 dark:bg-danger-900/50 dark:text-danger-400"
                        url={route('suppliers.destroy', supplier.id)}
                        label="Hapus"
                    />
                </div>
            )}
        </div>
    );
}

export default function SuppliersIndex({ suppliers }) {
    const { can } = useAuthorization();
    const canManageSuppliers = can('suppliers-access');
    const [viewMode, setViewMode] = useState('grid');
    const rows = suppliers.data ?? [];

    // Supplied by SupplierController@index — the dedicated create/edit pages used to
    // pass this, and the form has to live on this page now.
    const { provinces = [] } = usePage().props;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    // Plain-object defaults are fine here because every open path calls `setData`
    // with a complete payload rather than `reset()` — reset() would copy from
    // Inertia's `defaults`, which gets reassigned to the last submitted payload after
    // every successful submit. That also replaces the old dead `flash` effect, which
    // never fired because HandleInertiaRequests shares no `flash` key.
    const { data, setData, post, processing, errors } = useForm({ ...blankSupplier });

    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    const fetchRegencies = async (provinceId) => {
        if (!provinceId) return setRegencies([]);
        const res = await axios.get(route('regions.regencies'), {
            params: { province_id: provinceId },
        });
        setRegencies(res.data);
    };

    const fetchDistricts = async (regencyId) => {
        if (!regencyId) return setDistricts([]);
        const res = await axios.get(route('regions.districts'), {
            params: { regency_id: regencyId },
        });
        setDistricts(res.data);
    };

    const fetchVillages = async (districtId) => {
        if (!districtId) return setVillages([]);
        const res = await axios.get(route('regions.villages'), {
            params: { district_id: districtId },
        });
        setVillages(res.data);
    };

    // Driven from the change handlers rather than effects on the form data, so
    // picking a parent never needs a second render pass to clear its children.
    const handleProvinceChange = (provinceId) => {
        setData((previous) => ({
            ...previous,
            province_id: provinceId,
            regency_id: '',
            district_id: '',
            village_id: '',
        }));
        setDistricts([]);
        setVillages([]);
        fetchRegencies(provinceId);
    };

    const handleRegencyChange = (regencyId) => {
        setData((previous) => ({
            ...previous,
            regency_id: regencyId,
            district_id: '',
            village_id: '',
        }));
        setVillages([]);
        fetchDistricts(regencyId);
    };

    const handleDistrictChange = (districtId) => {
        setData((previous) => ({ ...previous, district_id: districtId, village_id: '' }));
        fetchVillages(districtId);
    };

    const openCreate = () => {
        setEditing(null);
        setData({ ...blankSupplier });
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        setDrawerOpen(true);
    };

    const openEdit = (supplier) => {
        setEditing(supplier);
        setData({
            ...blankSupplier,
            _method: 'PUT',
            name: supplier.name || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            province_id: supplier.province_id || '',
            regency_id: supplier.regency_id || '',
            district_id: supplier.district_id || '',
            village_id: supplier.village_id || '',
        });
        // The old edit page received the whole region chain as page props. The index
        // has none, so load all three levels from the saved record.
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        if (supplier.province_id) fetchRegencies(supplier.province_id);
        if (supplier.regency_id) fetchDistricts(supplier.regency_id);
        if (supplier.district_id) fetchVillages(supplier.district_id);
        setDrawerOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const onSuccess = () => {
            toast.success(
                editing ? 'Supplier berhasil diperbarui' : 'Supplier berhasil ditambahkan'
            );
            setDrawerOpen(false);
        };
        const onError = () =>
            toast.error(editing ? 'Gagal memperbarui supplier' : 'Gagal menyimpan supplier');

        // `suppliers.update` only answers PUT, so the update keeps the existing
        // POST + `_method` spoofing rather than switching to put().
        if (editing) {
            post(route('suppliers.update', editing.id), { onSuccess, onError });
        } else {
            post(route('suppliers.store'), { onSuccess, onError });
        }
    };

    return (
        <>
            <Head title="Supplier" />

            <div className="mb-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
                            icon={<IconCirclePlus size={18} strokeWidth={1.5} />}
                            className="bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600"
                            label="Tambah Supplier"
                            onClick={openCreate}
                        />
                    )}
                </div>
            </div>

            <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-80">
                    <Search url={route('suppliers.index')} placeholder="Cari supplier..." />
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

            {rows.length ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {rows.map((supplier) => (
                            <SupplierCard
                                key={supplier.id}
                                supplier={supplier}
                                canManage={canManageSuppliers}
                                onEdit={openEdit}
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
                                    const region = [supplier.regency_name, supplier.province_name]
                                        .filter(Boolean)
                                        .join(', ');

                                    return (
                                        <tr
                                            key={supplier.id}
                                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        >
                                            <Table.Td className="text-center">
                                                {++i +
                                                    (suppliers.current_page - 1) *
                                                        suppliers.per_page}
                                            </Table.Td>
                                            <Table.Td>
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    {supplier.name}
                                                </p>
                                            </Table.Td>
                                            <Table.Td>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {supplier.phone || '-'}
                                                </span>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                                    {supplier.email || '-'}
                                                </p>
                                            </Table.Td>
                                            <Table.Td>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {region || '-'}
                                                </span>
                                            </Table.Td>
                                            <Table.Td>
                                                <p className="line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {supplier.address || '-'}
                                                </p>
                                            </Table.Td>
                                            <Table.Td>
                                                <div className="flex gap-2">
                                                    {canManageSuppliers && (
                                                        <>
                                                            <Button
                                                                type="modal"
                                                                icon={
                                                                    <IconPencilCog
                                                                        size={16}
                                                                        strokeWidth={1.5}
                                                                    />
                                                                }
                                                                className="border border-warning-200 bg-warning-100 text-warning-600 hover:bg-warning-200 dark:border-warning-800 dark:bg-warning-900/50 dark:text-warning-400"
                                                                onClick={() => openEdit(supplier)}
                                                            />
                                                            <Button
                                                                type="delete"
                                                                icon={
                                                                    <IconTrash
                                                                        size={16}
                                                                        strokeWidth={1.5}
                                                                    />
                                                                }
                                                                className="border border-danger-200 bg-danger-100 text-danger-600 hover:bg-danger-200 dark:border-danger-800 dark:bg-danger-900/50 dark:text-danger-400"
                                                                url={route(
                                                                    'suppliers.destroy',
                                                                    supplier.id
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
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <IconDatabaseOff size={32} className="text-slate-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">
                        Belum Ada Supplier
                    </h3>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Tambahkan supplier pertama Anda.
                    </p>
                    {canManageSuppliers && (
                        <Button
                            type="link"
                            icon={<IconCirclePlus size={18} />}
                            className="bg-primary-500 text-white hover:bg-primary-600"
                            label="Tambah Supplier"
                            onClick={openCreate}
                        />
                    )}
                </div>
            )}

            {suppliers.last_page !== 1 && <Pagination links={suppliers.links} />}

            <Drawer
                show={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={editing ? 'Edit Supplier' : 'Tambah Supplier'}
                width="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        label="Nama Supplier"
                        placeholder="Masukkan nama supplier"
                        errors={errors.name}
                        onChange={(e) => setData('name', e.target.value)}
                        value={data.name}
                    />
                    <Input
                        type="text"
                        label="No. Telepon"
                        placeholder="021-12345678"
                        errors={errors.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        value={data.phone}
                    />
                    <Input
                        type="email"
                        label="Email"
                        placeholder="supplier@example.com"
                        errors={errors.email}
                        onChange={(e) => setData('email', e.target.value)}
                        value={data.email}
                    />

                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Provinsi
                        </label>
                        <Select
                            value={data.province_id}
                            onChange={handleProvinceChange}
                            options={provinces.map((prov) => ({
                                value: prov.code,
                                label: prov.name,
                            }))}
                            placeholder="Pilih Provinsi"
                            className="w-full"
                        />
                        {errors.province_id && (
                            <p className="mt-1 text-xs text-danger-500">{errors.province_id}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Kota/Kabupaten
                        </label>
                        <Select
                            value={data.regency_id}
                            onChange={handleRegencyChange}
                            options={regencies.map((item) => ({
                                value: item.code,
                                label: item.name,
                            }))}
                            placeholder="Pilih Kota/Kabupaten"
                            disabled={!data.province_id}
                            className="w-full"
                        />
                        {errors.regency_id && (
                            <p className="mt-1 text-xs text-danger-500">{errors.regency_id}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Kecamatan
                        </label>
                        <Select
                            value={data.district_id}
                            onChange={handleDistrictChange}
                            options={districts.map((item) => ({
                                value: item.code,
                                label: item.name,
                            }))}
                            placeholder="Pilih Kecamatan"
                            disabled={!data.regency_id}
                            className="w-full"
                        />
                        {errors.district_id && (
                            <p className="mt-1 text-xs text-danger-500">{errors.district_id}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Kelurahan
                        </label>
                        <Select
                            value={data.village_id}
                            onChange={(value) => setData('village_id', value)}
                            options={villages.map((item) => ({
                                value: item.code,
                                label: item.name,
                            }))}
                            placeholder="Pilih Kelurahan"
                            disabled={!data.district_id}
                            className="w-full"
                        />
                        {errors.village_id && (
                            <p className="mt-1 text-xs text-danger-500">{errors.village_id}</p>
                        )}
                    </div>

                    <Textarea
                        label="Alamat Detail"
                        placeholder="Alamat lengkap supplier"
                        errors={errors.address}
                        onChange={(e) => setData('address', e.target.value)}
                        value={data.address}
                        rows={3}
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        >
                            <IconDeviceFloppy size={18} />
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </>
    );
}

SuppliersIndex.layout = (page) => <DashboardLayout children={page} />;
