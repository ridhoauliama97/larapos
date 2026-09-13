import React, { useEffect, useId, useRef, useState } from "react";
import { IconPhoto, IconReplace, IconX } from "@tabler/icons-react";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp";

export default function ImageDropzone({
    preview,
    original = null,
    onSelect,
    onReset = null,
    hint = "JPG, PNG, atau WebP. Maksimal 2 MB.",
    error,
    aspect = "aspect-[4/3]",
    accept = DEFAULT_ACCEPT,
    shape = "rounded",
}) {
    const inputId = useId();
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const hasPreview = Boolean(preview);
    const isReplaced = hasPreview && preview !== original;

    const openPicker = () => inputRef.current?.click();

    const handleFiles = (files) => {
        const file = files?.[0];

        if (file) {
            onSelect(file);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
    };

    const descriptionIds = [
        error ? `${inputId}-error` : null,
        `${inputId}-hint`,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="flex flex-col gap-3">
            <button
                type="button"
                onClick={openPicker}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                aria-describedby={descriptionIds}
                className={`relative block ${aspect} w-full overflow-hidden border text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 motion-reduce:transition-none ${
                    shape === "circle" ? "rounded-full" : "rounded-xl"
                } ${
                    error
                        ? "border-danger-400 bg-danger-50 dark:border-danger-500/60 dark:bg-danger-500/10"
                        : dragging
                          ? "border-primary-400 bg-primary-50 dark:border-primary-500/60 dark:bg-primary-500/10"
                          : "border-slate-200 bg-slate-50 hover:border-primary-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-primary-500/40"
                }`}
            >
                {hasPreview ? (
                    <img
                        src={preview}
                        alt="Pratinjau gambar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-slate-900 dark:text-slate-500">
                            <IconPhoto size={22} />
                        </span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Seret gambar ke sini
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            atau klik untuk memilih dari perangkat
                        </span>
                    </span>
                )}
            </button>

            <div className="flex items-start justify-between gap-3">
                <p
                    id={`${inputId}-hint`}
                    className="sr-only"
                >
                    {hint}
                </p>

                <div className="flex shrink-0 items-center gap-1">
                    {hasPreview && (
                        <button
                            type="button"
                            onClick={openPicker}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                            <IconReplace size={14} />
                            Ganti
                        </button>
                    )}

                    {onReset && (isReplaced || (hasPreview && !original)) && (
                        <button
                            type="button"
                            onClick={onReset}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-danger-50 hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500/40 dark:text-slate-400 dark:hover:bg-danger-500/10 dark:hover:text-danger-400"
                        >
                            <IconX size={14} />
                            {original ? "Batalkan" : "Hapus"}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <p
                    id={`${inputId}-error`}
                    role="alert"
                    className="text-xs text-danger-500 dark:text-danger-400"
                >
                    {error}
                </p>
            )}

            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = "";
                }}
            />
        </div>
    );
}
