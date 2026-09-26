import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '@/Components/Dashboard/Button';
import {
    IconCirclePlus,
    IconDatabaseOff,
    IconPencilCog,
    IconTrash,
    IconLayoutGrid,
    IconList,
    IconPhone,
    IconMapPin,
    IconUpload,
    IconDownload,
    IconDeviceFloppy,
} from '@tabler/icons-react';
import Search from '@/Components/Dashboard/Search';
import Table from '@/Components/Dashboard/Table';
import Pagination from '@/Components/Dashboard/Pagination';
import Drawer from '@/Components/Dashboard/Drawer';
import Input from '@/Components/Dashboard/Input';
import Select from '@/Components/Dashboard/Select';
import Textarea from '@/Components/Dashboard/TextArea';
import { useAuthorization } from '@/Utils/authorization';

const blankCustomer = {
    _method: 'POST',
    name: '',
    no_telp: '',
    address: '',
    is_loyalty_member: false,
    loyalty_tier: 'regular',
    province_id: '',
    regency_id: '',
    district_id: '',
    village_id: '',
};

// Customer Card for Grid View
function CustomerCard({ customer, canUpdate, canDelete, onEdit }) {
    return (
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
            {/* Avatar & Name */}
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {customer.avatar ? (
                        <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="h-12 w-12 flex-shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                        />
                    ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-lg font-semibold text-white">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                            <Link
                                href={route('customers.show', customer.id)}
                                className="hover:text-primary-600"
                            >
                                {customer.name}
                            </Link>
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                            <span className="inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                                {customer.is_loyalty_member ? customer.loyalty_tier : 'non-member'}
                            </span>
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {customer.loyalty_points || 0} poin
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="mb-4 space-y-2">
                {customer.no_telp && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <IconPhone size={16} />
                        <span>{customer.no_telp}</span>
                    </div>
                )}
                {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <IconMapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{customer.address}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            {(canUpdate || canDelete) && (
                <div className="flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {canUpdate && (
                        <button
                            onClick={() => onEdit(customer)}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-warning-100 py-2 text-sm font-medium text-warning-600 transition-colors hover:bg-warning-200 dark:bg-warning-900/50 dark:text-warning-400"
                        >
                            <IconPencilCog size={16} />
                            <span>Edit</span>
                        </button>
                    )}
                    {canDelete && (
                        <Button
                            type={'delete'}
                            icon={<IconTrash size={16} />}
                            className={
                                'flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-danger-100 py-2 text-sm font-medium text-danger-600 hover:bg-danger-200 dark:bg-danger-900/50 dark:text-danger-400'
                            }
                            url={route('customers.destroy', customer.id)}
                            label="Hapus"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default function Index({ customers }) {
    const { can } = useAuthorization();
    const [viewMode, setViewMode] = useState('grid');
    const canCreateCustomers = can('customers-create');
    const canEditCustomers = can('customers-edit');
    const canDeleteCustomers = can('customers-delete');

    // Supplied by CustomerController@index — the dedicated create/edit pages used to
    // pass these, and the form has to live on this page now.
    const { provinces = [], tierOptions = [] } = usePage().props;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    // Plain-object defaults are fine here because every open path calls `setData`
    // with a complete payload rather than `reset()` — reset() would copy from
    // Inertia's `defaults`, which gets reassigned to the last submitted payload after
    // every successful submit.
    const { data, setData, post, processing, errors } = useForm({ ...blankCustomer });

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

    // The cascade is driven from the change handlers rather than effects on the form
    // data, so picking a parent never needs a second render pass to clear its
    // children.
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
        setData({ ...blankCustomer });
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        setDrawerOpen(true);
    };

    const openEdit = (customer) => {
        setEditing(customer);
        setData({
            ...blankCustomer,
            _method: 'PUT',
            name: customer.name || '',
            no_telp: customer.no_telp || '',
            address: customer.address || '',
            is_loyalty_member: !!customer.is_loyalty_member,
            loyalty_tier: customer.loyalty_tier || 'regular',
            province_id: customer.province_id || '',
            regency_id: customer.regency_id || '',
            district_id: customer.district_id || '',
            village_id: customer.village_id || '',
        });
        // The old edit page received the whole region chain as page props. The index
        // has none, so load all three levels from the saved record.
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        if (customer.province_id) fetchRegencies(customer.province_id);
        if (customer.regency_id) fetchDistricts(customer.regency_id);
        if (customer.district_id) fetchVillages(customer.district_id);
        setDrawerOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const onSuccess = () => {
            toast.success(
                editing ? 'Pelanggan berhasil diperbarui' : 'Pelanggan berhasil ditambahkan'
            );
            setDrawerOpen(false);
        };
        const onError = () =>
            toast.error(editing ? 'Gagal memperbarui pelanggan' : 'Gagal menyimpan pelanggan');

        // `customers.update` only answers PUT|PATCH, so the update keeps the existing
        // POST + `_method` spoofing rather than switching to put().
        if (editing) {
            post(route('customers.update', editing.id), { onSuccess, onError });
        } else {
            post(route('customers.store'), { onSuccess, onError });
        }
    };

    return (
        <>
            <Head title="Pelanggan" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Pelanggan
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {customers.total || customers.data?.length || 0} pelanggan terdaftar
                        </p>
                    </div>
                    {canCreateCustomers && (
                        <div className="flex items-center gap-2">
                            <a
                                href={route('export.customers')}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                <IconDownload size={18} />
                                Export
                            </a>
                            <button
                                type="button"
                                onClick={() =>
                                    document.getElementById('import-customers-input')?.click()
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                <IconUpload size={18} />
                                Import
                            </button>
                            <input
                                id="import-customers-input"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={function (e) {
                                    const file = e.target.files && e.target.files[0];
                                    if (file) router.post(route('import.customers'), { file });
                                }}
                            />
                            <Button
                                type={'link'}
                                icon={<IconCirclePlus size={18} strokeWidth={1.5} />}
                                className={
                                    'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600'
                                }
                                label={'Tambah Pelanggan'}
                                onClick={openCreate}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-80">
                    <Search url={route('customers.index')} placeholder="Cari pelanggan..." />
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
            {customers.data.length > 0 ? (
                viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {customers.data.map((customer) => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                canUpdate={canEditCustomers}
                                canDelete={canDeleteCustomers}
                                onEdit={openEdit}
                            />
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <Table.Card title={'Data Pelanggan'}>
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th className="w-10">No</Table.Th>
                                    <Table.Th>Pelanggan</Table.Th>
                                    <Table.Th>Loyalty</Table.Th>
                                    <Table.Th>No. Telepon</Table.Th>
                                    <Table.Th>Alamat</Table.Th>
                                    <Table.Th></Table.Th>
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {customers.data.map((customer, i) => (
                                    <tr
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        key={customer.id}
                                    >
                                        <Table.Td className="text-center">
                                            {++i +
                                                (customers.current_page - 1) * customers.per_page}
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="flex items-center gap-3">
                                                {customer.avatar ? (
                                                    <img
                                                        src={customer.avatar}
                                                        alt={customer.name}
                                                        className="h-10 w-10 flex-shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-sm font-semibold text-white">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    <Link
                                                        href={route('customers.show', customer.id)}
                                                        className="hover:text-primary-600"
                                                    >
                                                        {customer.name}
                                                    </Link>
                                                </p>
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-primary-600 dark:text-primary-300">
                                                    {customer.is_loyalty_member
                                                        ? customer.loyalty_tier
                                                        : 'non-member'}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {customer.loyalty_points || 0} poin
                                                </span>
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {customer.no_telp || '-'}
                                            </span>
                                        </Table.Td>
                                        <Table.Td>
                                            <p className="line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                                                {customer.address || '-'}
                                            </p>
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="flex gap-2">
                                                {canEditCustomers && (
                                                    <Button
                                                        type={'modal'}
                                                        icon={
                                                            <IconPencilCog
                                                                size={16}
                                                                strokeWidth={1.5}
                                                            />
                                                        }
                                                        className={
                                                            'border border-warning-200 bg-warning-100 text-warning-600 hover:bg-warning-200 dark:border-warning-800 dark:bg-warning-900/50 dark:text-warning-400'
                                                        }
                                                        onClick={() => openEdit(customer)}
                                                    />
                                                )}
                                                {canDeleteCustomers && (
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
                                                            'customers.destroy',
                                                            customer.id
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
                        Belum Ada Pelanggan
                    </h3>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Tambahkan pelanggan pertama Anda.
                    </p>
                    <Button
                        type={'link'}
                        icon={<IconCirclePlus size={18} />}
                        className={'bg-primary-500 text-white hover:bg-primary-600'}
                        label={'Tambah Pelanggan'}
                        onClick={openCreate}
                    />
                </div>
            )}

            {customers.last_page !== 1 && <Pagination links={customers.links} />}

            <Drawer
                show={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={editing ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
                width="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        label="Nama Pelanggan"
                        placeholder="Masukkan nama lengkap"
                        errors={errors.name}
                        onChange={(e) => setData('name', e.target.value)}
                        value={data.name}
                    />
                    <Input
                        type="text"
                        label="No. Handphone"
                        placeholder="08xxxxxxxxxx"
                        errors={errors.no_telp}
                        onChange={(e) => setData('no_telp', e.target.value)}
                        value={data.no_telp}
                    />

                    <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4 dark:border-primary-900/40 dark:bg-primary-950/20">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Aktivasi Loyalty Member
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Member mendapat poin, voucher, dan harga khusus.
                                </p>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={data.is_loyalty_member}
                                    onChange={(e) => setData('is_loyalty_member', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary-500"
                                />
                                Member
                            </label>
                        </div>

                        {data.is_loyalty_member && (
                            <div className="mt-4">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Tier Awal
                                </label>
                                <Select
                                    value={data.loyalty_tier}
                                    onChange={(value) => setData('loyalty_tier', value)}
                                    options={tierOptions}
                                    className="mt-2 w-full"
                                />
                            </div>
                        )}
                    </div>

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
                        placeholder="Alamat lengkap pelanggan"
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

Index.layout = (page) => <DashboardLayout children={page} />;
