import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import Input from '@/Components/Dashboard/Input';
import Textarea from '@/Components/Dashboard/TextArea';
import ImageDropzone from '@/Components/Dashboard/ImageDropzone';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import {
    IconDeviceFloppy,
    IconPhone,
    IconMapPin,
    IconWorld,
    IconMail,
    IconPhoto,
    IconFileCertificate,
    IconReceiptTax,
} from '@tabler/icons-react';

export default function Store({ settings }) {
    const { data, setData, transform, post, processing, errors, reset } = useForm({
        store_name: settings.store_name || '',
        store_logo: null,
        store_address: settings.store_address || '',
        store_phone: settings.store_phone || '',
        store_email: settings.store_email || '',
        store_website: settings.store_website || '',
        store_city: settings.store_city || '',
        store_npwp: settings.store_npwp || '',
        store_nib: settings.store_nib || '',
        tax_default_rate: settings.tax_default_rate || '11.00',
    });

    const originalLogo = settings.store_logo
        ? settings.store_logo.startsWith('http') || settings.store_logo.startsWith('/storage')
            ? settings.store_logo
            : `/storage/${settings.store_logo}`
        : null;

    const [logoPreview, setLogoPreview] = useState(originalLogo);
    const objectUrlRef = useRef(null);

    useEffect(
        () => () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        },
        []
    );

    const handleLogoSelect = (file) => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }

        objectUrlRef.current = URL.createObjectURL(file);
        setData('store_logo', file);
        setLogoPreview(objectUrlRef.current);
    };

    const handleLogoReset = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        setData('store_logo', null);
        setLogoPreview(originalLogo);
    };

    const submit = (e) => {
        e.preventDefault();

        transform((data) => {
            const { store_logo, ...rest } = data;

            return store_logo ? data : rest;
        });

        post(route('settings.store.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil toko disimpan');
                reset('store_logo');
            },
            onError: () => toast.error('Gagal menyimpan profil toko'),
        });
    };

    return (
        <>
            <Head title="Profil Toko" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Pengaturan Toko
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Atur identitas toko yang muncul di struk dan laporan.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                    <div className="flex flex-col gap-6 lg:flex-row">
                        {/* Logo */}
                        <div className="lg:w-1/3">
                            <label className="mb-3 block flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                <IconPhoto size={18} />
                                Logo Toko
                            </label>
                            <ImageDropzone
                                preview={logoPreview}
                                original={originalLogo}
                                onSelect={handleLogoSelect}
                                onReset={handleLogoReset}
                                error={errors.store_logo}
                                aspect="aspect-square"
                            />
                        </div>

                        {/* Info */}
                        <div className="space-y-4 lg:flex-1">
                            <Input
                                label="Nama Toko"
                                value={data.store_name}
                                errors={errors.store_name}
                                onChange={(e) => setData('store_name', e.target.value)}
                                placeholder="Nama toko"
                            />
                            <Textarea
                                label="Alamat Lengkap"
                                value={data.store_address}
                                errors={errors.store_address}
                                onChange={(e) => setData('store_address', e.target.value)}
                                rows={3}
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Input
                                    label="Kota/Kabupaten"
                                    value={data.store_city}
                                    errors={errors.store_city}
                                    onChange={(e) => setData('store_city', e.target.value)}
                                    placeholder="contoh: Surabaya"
                                    icon={<IconMapPin size={16} />}
                                />
                                <Input
                                    label="Nomor Telepon"
                                    value={data.store_phone}
                                    errors={errors.store_phone}
                                    onChange={(e) => setData('store_phone', e.target.value)}
                                    placeholder="0812xxxxxxx"
                                    icon={<IconPhone size={16} />}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={data.store_email}
                                    errors={errors.store_email}
                                    onChange={(e) => setData('store_email', e.target.value)}
                                    placeholder="email@toko.com"
                                    icon={<IconMail size={16} />}
                                />
                                <Input
                                    label="Website / Sosial Media"
                                    value={data.store_website}
                                    errors={errors.store_website}
                                    onChange={(e) => setData('store_website', e.target.value)}
                                    placeholder="https://"
                                    icon={<IconWorld size={16} />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tax & Legal Section */}
                    <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
                            <IconReceiptTax size={20} className="text-primary-500" />
                            Informasi Pajak & Legal
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Input
                                label="NPWP Toko"
                                value={data.store_npwp}
                                errors={errors.store_npwp}
                                onChange={(e) => setData('store_npwp', e.target.value)}
                                placeholder="XX.XXX.XXX.X-XXX.XXX"
                                icon={<IconFileCertificate size={16} />}
                            />
                            <Input
                                label="NIB"
                                value={data.store_nib}
                                errors={errors.store_nib}
                                onChange={(e) => setData('store_nib', e.target.value)}
                                placeholder="Nomor Induk Berusaha"
                            />
                        </div>
                        <div className="mt-4">
                            <Input
                                label="Tarif PPN Default (%)"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.tax_default_rate}
                                errors={errors.tax_default_rate}
                                onChange={(e) => setData('tax_default_rate', e.target.value)}
                                placeholder="11.00"
                            />
                            <p className="mt-1 text-xs text-slate-400">
                                Tarif default untuk produk baru. Dapat diubah per produk.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        >
                            <IconDeviceFloppy size={18} />
                            {processing ? 'Menyimpan...' : 'Simpan Profil'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Store.layout = (page) => <DashboardLayout children={page} />;
