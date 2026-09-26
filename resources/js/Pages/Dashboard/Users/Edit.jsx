import { useEffect, useRef, useState } from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconUserEdit, IconDeviceFloppy, IconArrowLeft, IconShield } from '@tabler/icons-react';
import ImageCropper from '@/Components/Dashboard/ImageCropper';
import ImageDropzone from '@/Components/Dashboard/ImageDropzone';
import Input from '@/Components/Dashboard/Input';
import Checkbox from '@/Components/Dashboard/Checkbox';
import toast from 'react-hot-toast';

export default function Edit() {
    const { roles, user } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        selectedRoles: user.roles.map((role) => role.name),
        avatar: null,
        _method: 'PUT',
    });

    const originalAvatar = user.avatar || null;
    const [avatarPreview, setAvatarPreview] = useState(originalAvatar);
    const [cropperFile, setCropperFile] = useState(null);
    const objectUrlRef = useRef(null);

    useEffect(
        () => () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        },
        []
    );

    const handleSelect = (file) => setCropperFile(file);

    const commitAvatar = (file) => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }

        objectUrlRef.current = URL.createObjectURL(file);
        setData('avatar', file);
        setAvatarPreview(objectUrlRef.current);
        setCropperFile(null);
    };

    const handleReset = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        setData('avatar', null);
        setAvatarPreview(originalAvatar);
    };

    const setSelectedRoles = (e) => {
        let items = [...data.selectedRoles];
        if (items.includes(e.target.value)) {
            items = items.filter((name) => name !== e.target.value);
        } else {
            items.push(e.target.value);
        }
        setData('selectedRoles', items);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('users.update', user.id), {
            onSuccess: () => toast.success('Pengguna berhasil diperbarui'),
            onError: () => toast.error('Gagal memperbarui pengguna'),
        });
    };

    return (
        <>
            <Head title="Edit Pengguna" />

            <div className="mb-6">
                <Link
                    href={route('users.index')}
                    className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600"
                >
                    <IconArrowLeft size={16} />
                    Kembali ke Pengguna
                </Link>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconUserEdit size={28} className="text-primary-500" />
                    Edit Pengguna
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    {user.name} • {user.email}
                </p>
            </div>

            <form onSubmit={submit}>
                <div className="max-w-2xl space-y-6">
                    {/* Account Info */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Informasi Akun
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Avatar
                                </label>
                                <div className="max-w-[168px]">
                                    <ImageDropzone
                                        preview={avatarPreview}
                                        original={originalAvatar}
                                        onSelect={handleSelect}
                                        onReset={handleReset}
                                        error={errors.avatar}
                                        aspect="aspect-square"
                                        shape="circle"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                    />
                                </div>
                            </div>
                            <Input
                                type="text"
                                label="Nama Lengkap"
                                placeholder="Nama pengguna"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                errors={errors.name}
                            />
                            <Input
                                type="email"
                                label="Email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                errors={errors.email}
                                disabled
                                className="opacity-60"
                            />
                            <Input
                                type="password"
                                label="Kata Sandi Baru"
                                placeholder="Kosongkan jika tidak diubah"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                errors={errors.password}
                            />
                            <Input
                                type="password"
                                label="Konfirmasi Kata Sandi"
                                placeholder="Ulangi kata sandi baru"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                errors={errors.password_confirmation}
                            />
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <IconShield size={16} />
                            Akses Group
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {roles.map((role, i) => (
                                <label
                                    key={i}
                                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 transition-all ${
                                        data.selectedRoles.includes(role.name)
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50'
                                            : 'border-slate-200 hover:border-primary-300 dark:border-slate-700'
                                    }`}
                                >
                                    <Checkbox
                                        value={role.name}
                                        onChange={setSelectedRoles}
                                        checked={data.selectedRoles.includes(role.name)}
                                    />
                                    <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                                        {role.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.selectedRoles && (
                            <p className="mt-3 text-xs text-danger-500">{errors.selectedRoles}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('users.index')}
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
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </form>

            <ImageCropper
                file={cropperFile}
                open={Boolean(cropperFile)}
                onApply={commitAvatar}
                onUseOriginal={commitAvatar}
                onCancel={() => setCropperFile(null)}
            />
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
