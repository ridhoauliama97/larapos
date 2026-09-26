import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";
import { IconLock } from "@tabler/icons-react";
import Input from "@/Components/Dashboard/Input";

export default function UpdatePasswordForm() {
    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success("Kata sandi diperbarui");
            },
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    document.getElementById("new_password")?.focus();
                }

                if (errors.current_password) {
                    reset("current_password");
                    document.getElementById("current_password")?.focus();
                }
            },
        });
    };

    return (
        <section>
            <header className="mb-6">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <IconLock size={16} />
                    Ubah Kata Sandi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Gunakan kata sandi yang panjang dan tidak dipakai di tempat
                    lain.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-4">
                <Input
                    id="current_password"
                    type="password"
                    label="Kata Sandi Saat Ini"
                    placeholder="Kata sandi saat ini"
                    value={data.current_password}
                    onChange={(e) =>
                        setData("current_password", e.target.value)
                    }
                    errors={errors.current_password}
                    autoComplete="current-password"
                />
                <Input
                    id="new_password"
                    type="password"
                    label="Kata Sandi Baru"
                    placeholder="Kata sandi baru"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    errors={errors.password}
                    autoComplete="new-password"
                />
                <Input
                    id="password_confirmation"
                    type="password"
                    label="Konfirmasi Kata Sandi Baru"
                    placeholder="Ulangi kata sandi baru"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                    }
                    errors={errors.password_confirmation}
                    autoComplete="new-password"
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                    {recentlySuccessful && (
                        <span className="text-xs font-medium text-success-600 dark:text-success-400">
                            Tersimpan.
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
                    >
                        {processing ? "Menyimpan..." : "Simpan Kata Sandi"}
                    </button>
                </div>
            </form>
        </section>
    );
}
