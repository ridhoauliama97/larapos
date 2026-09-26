import { useEffect, useRef, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import {
    IconCamera,
    IconDeviceFloppy,
    IconPencilCog,
    IconUserCircle,
    IconX,
} from "@tabler/icons-react";
import ImageCropper from "@/Components/Dashboard/ImageCropper";
import Input from "@/Components/Dashboard/Input";

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, reset, clearErrors } =
        useForm({
            name: user.name,
            email: user.email,
            avatar: null,
            // PHP cannot parse multipart bodies on PATCH, so the request is sent as
            // POST with a spoofed method (avoids Inertia+file uploads being dropped)
            _method: "patch",
        });

    const [isEditing, setIsEditing] = useState(false);
    const originalAvatar = user.avatar || null;
    const [preview, setPreview] = useState(originalAvatar);
    const [cropperFile, setCropperFile] = useState(null);
    const objectUrlRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(
        () => () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        },
        [],
    );

    const initial =
        user.name?.charAt(0)?.toUpperCase() ||
        user.email?.charAt(0)?.toUpperCase() ||
        "?";

    const startEditing = () => {
        clearErrors();
        setIsEditing(true);
    };

    const cancelEditing = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        setData({
            name: user.name,
            email: user.email,
            avatar: null,
            _method: "patch",
        });
        clearErrors();
        setPreview(user.avatar || null);
        setIsEditing(false);
    };

    const commitAvatar = (file) => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }

        objectUrlRef.current = URL.createObjectURL(file);
        setData("avatar", file);
        setPreview(objectUrlRef.current);
        setCropperFile(null);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route("profile.update"), {
            preserveScroll: true,
            onSuccess: () => {
                reset("avatar");
                setIsEditing(false);
                toast.success("Profil diperbarui");
            },
        });
    };

    return (
        <section>
            <form onSubmit={submit}>
                <header className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <IconUserCircle size={16} />
                            Informasi Profil
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Perbarui data pribadi dan foto profil Anda.
                        </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={startEditing}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                            >
                                <IconPencilCog size={16} />
                                Edit Profil
                            </button>
                        )}
                    </div>
                </header>

                <div className="space-y-6">
                    {/* Foto profil */}
                    <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-lg font-semibold text-slate-500 dark:text-slate-400">
                                    {initial}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                Foto Profil
                            </p>
                            {/* <p className="text-xs text-slate-500 dark:text-slate-400">
                                Ditampilkan di seluruh aplikasi.
                            </p> */}
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <IconCamera size={14} />
                                    Ganti Foto
                                </button>
                            )}
                            {errors.avatar && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.avatar}
                                </p>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="sr-only"
                            onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (file) {
                                    setCropperFile(file);
                                }

                                event.target.value = "";
                            }}
                        />
                    </div>

                    {/* Data pribadi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            type="text"
                            label="Nama Lengkap"
                            placeholder="Nama pengguna"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            errors={errors.name}
                            disabled={!isEditing}
                            className="disabled:cursor-not-allowed disabled:opacity-70"
                            autoComplete="name"
                        />
                        <Input
                            type="email"
                            label="Email"
                            placeholder="email@contoh.com"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            errors={errors.email}
                            disabled={!isEditing}
                            className="disabled:cursor-not-allowed disabled:opacity-70"
                            autoComplete="username"
                        />
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-xs text-warning-600 dark:border-warning-800 dark:bg-warning-900/20 dark:text-warning-400">
                            Email belum diverifikasi.{" "}
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="font-semibold underline focus:outline-none focus-visible:ring-2 focus-visible:ring-warning-500/40"
                            >
                                Kirim ulang tautan verifikasi
                            </Link>
                            {status === "verification-link-sent" && (
                                <p className="mt-1 font-medium text-success-600 dark:text-success-400">
                                    Tautan verifikasi baru sudah dikirim.
                                </p>
                            )}
                        </div>
                    )}

                    {isEditing && (
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-6 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={cancelEditing}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                <IconX size={16} />
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                            >
                                <IconDeviceFloppy size={16} />
                                {processing ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    )}
                </div>
            </form>

            <ImageCropper
                file={cropperFile}
                open={Boolean(cropperFile)}
                onApply={commitAvatar}
                onUseOriginal={commitAvatar}
                onCancel={() => setCropperFile(null)}
            />
        </section>
    );
}
