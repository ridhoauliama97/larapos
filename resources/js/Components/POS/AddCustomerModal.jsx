import { useState } from 'react';
import axios from 'axios';
import Select from '@/Components/Dashboard/Select';
import { IconCrown, IconUserPlus, IconX, IconLoader2, IconCheck } from '@tabler/icons-react';
import toast from 'react-hot-toast';

/**
 * AddCustomerModal - Modal to add new customer from transaction page
 */
export default function AddCustomerModal({ isOpen, onClose, onSuccess, tierOptions = [] }) {
    const defaultTier = tierOptions[0]?.value || 'regular';
    const [form, setForm] = useState({
        name: '',
        no_telp: '',
        address: '',
        is_loyalty_member: false,
        loyalty_tier: defaultTier,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Nama wajib diisi';
        if (!form.no_telp.trim()) newErrors.no_telp = 'No. telepon wajib diisi';
        if (!form.address.trim()) newErrors.address = 'Alamat wajib diisi';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(route('customers.storeAjax'), form);

            if (response.data.success) {
                toast.success('Pelanggan berhasil ditambahkan');
                setForm({
                    name: '',
                    no_telp: '',
                    address: '',
                    is_loyalty_member: false,
                    loyalty_tier: defaultTier,
                });
                setIsSubmitting(false);
                onSuccess?.(response.data.customer);
                onClose();
            } else {
                setErrors(response.data.errors || {});
                toast.error(response.data.message || 'Gagal menambahkan pelanggan');
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error('Add customer error:', err);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
            toast.error(err.response?.data?.message || 'Gagal menambahkan pelanggan');
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setForm({
            name: '',
            no_telp: '',
            address: '',
            is_loyalty_member: false,
            loyalty_tier: defaultTier,
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="animate-in zoom-in-95 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200 dark:bg-slate-900">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                    <div className="flex items-center gap-3 text-white">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                            <IconUserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Tambah Pelanggan</h3>
                            <p className="text-sm text-white/80">
                                Daftarkan pelanggan baru atau aktifkan sebagai member
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                        <IconX size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {/* Name */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Nama Pelanggan <span className="text-danger-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama lengkap"
                            className={`h-11 w-full rounded-xl border px-4 ${
                                errors.name
                                    ? 'border-danger-500 focus:ring-danger-500/20'
                                    : 'border-slate-200 focus:ring-primary-500/20 dark:border-slate-700'
                            } bg-white text-slate-800 transition-all focus:border-primary-500 focus:ring-4 dark:bg-slate-800 dark:text-slate-200`}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-danger-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            No. Telepon <span className="text-danger-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="no_telp"
                            value={form.no_telp}
                            onChange={handleChange}
                            placeholder="Contoh: 08123456789"
                            className={`h-11 w-full rounded-xl border px-4 ${
                                errors.no_telp
                                    ? 'border-danger-500 focus:ring-danger-500/20'
                                    : 'border-slate-200 focus:ring-primary-500/20 dark:border-slate-700'
                            } bg-white text-slate-800 transition-all focus:border-primary-500 focus:ring-4 dark:bg-slate-800 dark:text-slate-200`}
                        />
                        {errors.no_telp && (
                            <p className="mt-1 text-xs text-danger-500">{errors.no_telp}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Alamat <span className="text-danger-500">*</span>
                        </label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Masukkan alamat lengkap"
                            rows={3}
                            className={`w-full rounded-xl border px-4 py-3 ${
                                errors.address
                                    ? 'border-danger-500 focus:ring-danger-500/20'
                                    : 'border-slate-200 focus:ring-primary-500/20 dark:border-slate-700'
                            } resize-none bg-white text-slate-800 transition-all focus:border-primary-500 focus:ring-4 dark:bg-slate-800 dark:text-slate-200`}
                        />
                        {errors.address && (
                            <p className="mt-1 text-xs text-danger-500">{errors.address}</p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4 dark:border-primary-900/40 dark:bg-primary-950/20">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-xl bg-white/80 p-2 text-primary-600 dark:bg-slate-900/70 dark:text-primary-300">
                                    <IconCrown size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Registrasi Member
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Aktifkan jika pelanggan perlu langsung menerima benefit
                                        harga dan poin member.
                                    </p>
                                </div>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={form.is_loyalty_member}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            is_loyalty_member: event.target.checked,
                                        }))
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-primary-500"
                                />
                                Member
                            </label>
                        </div>

                        {form.is_loyalty_member ? (
                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Tier Awal
                                </label>
                                <Select
                                    value={form.loyalty_tier}
                                    onChange={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            loyalty_tier: value,
                                        }))
                                    }
                                    options={tierOptions.map((tier) => ({
                                        value: tier.value,
                                        label: tier.label,
                                    }))}
                                    className="w-full"
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="h-11 flex-1 rounded-xl border border-slate-200 font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader2 size={18} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IconCheck size={18} />
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/**
 * AddCustomerButton - Compact button to trigger modal
 */
export function AddCustomerButton({ onClick, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-12 items-center gap-2 rounded-xl border-2 border-dashed border-primary-300 px-4 font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-950/30 ${className}`}
            title="Tambah pelanggan baru"
        >
            <IconUserPlus size={18} />
            <span className="hidden sm:inline">Tambah</span>
        </button>
    );
}
