import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import Input from '@/Components/Dashboard/Input';
import ImageDropzone from '@/Components/Dashboard/ImageDropzone';
import Textarea from '@/Components/Dashboard/TextArea';
import toast from 'react-hot-toast';
import { IconCategory, IconDeviceFloppy, IconArrowLeft, IconPhoto } from '@tabler/icons-react';

export default function Create() {
    const { errors } = usePage().props;

    const { data, setData, post, processing, transform } = useForm({
        name: '',
        description: '',
        image: '',
    });

    const [imagePreview, setImagePreview] = useState(null);
    const objectUrlRef = useRef(null);

    useEffect(
        () => () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        },
        []
    );

    const handleSelect = (file) => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }

        objectUrlRef.current = URL.createObjectURL(file);
        setData('image', file);
        setImagePreview(objectUrlRef.current);
    };

    const handleReset = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        setData('image', '');
        setImagePreview(null);
    };

    const submit = (e) => {
        e.preventDefault();

        transform((data) => {
            const { image, ...rest } = data;

            return image ? { ...rest, image } : rest;
        });

        post(route('categories.store'), {
            onSuccess: () => toast.success('Kategori berhasil ditambahkan'),
            onError: () => toast.error('Gagal menyimpan kategori'),
        });
    };

    return (
        <>
            <Head title="Tambah Kategori" />

            <div className="mb-6">
                <Link
                    href={route('categories.index')}
                    className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600"
                >
                    <IconArrowLeft size={16} />
                    Kembali ke Kategori
                </Link>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <IconCategory size={28} className="text-primary-500" />
                    Tambah Kategori Baru
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="max-w-3xl">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <IconPhoto size={16} />
                                    Gambar
                                </h3>
                                <ImageDropzone
                                    preview={imagePreview}
                                    onSelect={handleSelect}
                                    onReset={handleReset}
                                    error={errors.image}
                                    hint="Rasio 4:3 disarankan."
                                />
                            </div>

                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    label="Nama Kategori"
                                    placeholder="Masukkan nama"
                                    errors={errors.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    value={data.name}
                                />
                                <Textarea
                                    label="Deskripsi"
                                    placeholder="Deskripsi kategori"
                                    errors={errors.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    value={data.description}
                                    rows={5}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                            <Link
                                href={route('categories.index')}
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
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
