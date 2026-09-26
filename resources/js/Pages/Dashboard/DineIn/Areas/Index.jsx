import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Button from '@/Components/Dashboard/Button';
import { IconCirclePlus, IconDatabaseOff, IconPencilCog, IconTrash } from '@tabler/icons-react';
import Table from '@/Components/Dashboard/Table';
import Modal from '@/Components/Dashboard/Modal';
import Input from '@/Components/Dashboard/Input';
import { useAuthorization } from '@/Utils/authorization';
import toast from 'react-hot-toast';

export default function Index({ areas }) {
    const { can } = useAuthorization();
    const canCreate = can('dine-tables-create');
    const canUpdate = can('dine-tables-access');
    const canDelete = can('dine-tables-access');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    // Function initializer: Inertia reassigns `defaults` to the last submitted
    // payload after every successful submit, so `reset()` would refill the form with
    // whatever was just saved. Only a function initializer makes `reset()` return
    // the pristine values.
    const { data, setData, post, patch, processing, errors, reset } = useForm(() => ({
        name: '',
        sort_order: 0,
        is_active: true,
    }));

    const openCreate = () => {
        setEditingArea(null);
        // `reset` takes field *names* and copies them from the defaults — passing an
        // object of values is silently a no-op, which left the previous edit's values
        // in the form. No args restores the defaults; `setData` then applies the one
        // field that is intentionally not the default.
        reset();
        setData('sort_order', areas.length);
        setModalOpen(true);
    };

    const openEdit = (area) => {
        setEditingArea(area);
        setData({
            name: area.name,
            sort_order: area.sort_order,
            is_active: area.is_active,
        });
        setModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => {
            toast.success(editingArea ? 'Area berhasil diperbarui.' : 'Area berhasil ditambahkan.');
            setModalOpen(false);
        };
        const onError = () => toast.error('Gagal menyimpan area.');

        if (editingArea) {
            patch(route('dine-areas.update', editingArea.id), { onSuccess, onError });
        } else {
            post(route('dine-areas.store'), { onSuccess, onError });
        }
    };

    const handleDelete = (area) => {
        if (!confirm(`Hapus area "${area.name}"?`)) return;
        router.delete(route('dine-areas.destroy', area.id), {
            onSuccess: () => toast.success('Area berhasil dihapus.'),
            onError: () => toast.error('Gagal menghapus area.'),
        });
    };

    return (
        <>
            <Head title="Area Dine-In" />

            <div className="mb-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Area Dine-In
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {areas.length} area terdaftar
                        </p>
                    </div>
                    {canCreate && (
                        <Button
                            type={'link'}
                            icon={<IconCirclePlus size={18} strokeWidth={1.5} />}
                            className={
                                'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600'
                            }
                            label={'Tambah Area'}
                            onClick={openCreate}
                        />
                    )}
                </div>
            </div>

            {areas.length > 0 ? (
                <Table.Card title={'Data Area'}>
                    <Table>
                        <Table.Thead>
                            <tr>
                                <Table.Th className="w-10">No</Table.Th>
                                <Table.Th>Nama Area</Table.Th>
                                <Table.Th>Jumlah Meja</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th></Table.Th>
                            </tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {areas.map((area, i) => (
                                <tr
                                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    key={area.id}
                                >
                                    <Table.Td className="text-center">{++i}</Table.Td>
                                    <Table.Td>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                            {area.name}
                                        </p>
                                    </Table.Td>
                                    <Table.Td>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            {area.tables?.length ?? 0} meja
                                        </span>
                                    </Table.Td>
                                    <Table.Td>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                area.is_active
                                                    ? 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                            }`}
                                        >
                                            {area.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </Table.Td>
                                    <Table.Td>
                                        <div className="flex justify-end gap-2">
                                            {canUpdate && (
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
                                                    onClick={() => openEdit(area)}
                                                />
                                            )}
                                            {canDelete && (
                                                <Button
                                                    type={'delete'}
                                                    icon={<IconTrash size={16} strokeWidth={1.5} />}
                                                    className={
                                                        'border border-danger-200 bg-danger-100 text-danger-600 hover:bg-danger-200 dark:border-danger-800 dark:bg-danger-900/50 dark:text-danger-400'
                                                    }
                                                    onClick={() => handleDelete(area)}
                                                />
                                            )}
                                        </div>
                                    </Table.Td>
                                </tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.Card>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <IconDatabaseOff size={32} className="text-slate-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">
                        Belum Ada Area
                    </h3>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Tambahkan area dine-in pertama Anda.
                    </p>
                    {canCreate && (
                        <Button
                            type={'link'}
                            icon={<IconCirclePlus size={18} />}
                            className={'bg-primary-500 text-white hover:bg-primary-600'}
                            label={'Tambah Area'}
                            onClick={openCreate}
                        />
                    )}
                </div>
            )}

            <Modal
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingArea ? 'Edit Area' : 'Tambah Area'}
            >
                <form onSubmit={submit} className="space-y-4">
                    <Input
                        label="Nama Area"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        errors={errors.name}
                        placeholder="Contoh: Indoor, Outdoor, VIP"
                        required
                    />
                    <Input
                        label="Urutan"
                        type="number"
                        min="0"
                        value={data.sort_order}
                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                        errors={errors.sort_order}
                    />
                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                            Area aktif
                        </span>
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type={'button'}
                            label={'Batal'}
                            onClick={() => setModalOpen(false)}
                        />
                        <Button
                            type={'submit'}
                            label={editingArea ? 'Perbarui' : 'Simpan'}
                            processing={processing}
                            className={'bg-primary-500 text-white hover:bg-primary-600'}
                        />
                    </div>
                </form>
            </Modal>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
