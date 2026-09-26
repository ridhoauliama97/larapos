import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';
import Input from '@/Components/Dashboard/Input';
import Modal from '@/Components/Dashboard/Modal';

export default function DeleteUserForm() {
    const [confirming, setConfirming] = useState(false);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const closeModal = () => {
        setConfirming(false);
        reset();
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => document.getElementById('delete_password')?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <section>
            <header className="mb-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-danger-600 dark:text-danger-400">
                    <IconAlertTriangle size={16} />
                    Hapus Akun
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Menghapus akun akan menghapus seluruh data secara permanen. Pastikan data
                    penting sudah dicadangkan.
                </p>
            </header>

            <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-5 py-2.5 font-medium text-danger-600 transition-colors hover:bg-danger-100 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-400"
            >
                <IconTrash size={18} />
                Hapus Akun
            </button>

            <Modal show={confirming} onClose={closeModal} title="Hapus akun?" maxWidth="md">
                <form onSubmit={deleteUser} className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Semua data akun akan dihapus permanen. Masukkan kata sandi untuk
                        mengonfirmasi.
                    </p>

                    <Input
                        id="delete_password"
                        type="password"
                        label="Kata Sandi"
                        placeholder="Kata sandi"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        errors={errors.password}
                        autoComplete="current-password"
                    />

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-danger-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-600 disabled:opacity-50"
                        >
                            <IconTrash size={16} />
                            {processing ? 'Menghapus...' : 'Hapus Akun'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
