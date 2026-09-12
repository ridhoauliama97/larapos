import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from "@/Components/Dashboard/Modal";
import { IconCrop, IconMinus, IconPlus, IconRefresh } from "@tabler/icons-react";

const VIEWPORT = 320;
const OUTPUT_SIZE = 1000;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export default function ImageCropper({
    file = null,
    open = false,
    onApply = () => {},
    onUseOriginal = null,
    onCancel = () => {},
}) {
    const [image, setImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [busy, setBusy] = useState(false);
    const drag = useRef(null);

    const coverScale = useCallback(
        (img) =>
            Math.max(
                VIEWPORT / img.naturalWidth,
                VIEWPORT / img.naturalHeight,
            ),
        [],
    );

    const displayed = useCallback(
        (img, level) => {
            const scale = coverScale(img) * level;

            return {
                scale,
                width: img.naturalWidth * scale,
                height: img.naturalHeight * scale,
            };
        },
        [coverScale],
    );

    const clampOffset = useCallback(
        (img, level, next) => {
            const { width, height } = displayed(img, level);

            return {
                x: Math.max(Math.min(0, VIEWPORT - width), Math.min(0, next.x)),
                y: Math.max(
                    Math.min(0, VIEWPORT - height),
                    Math.min(0, next.y),
                ),
            };
        },
        [displayed],
    );

    const centerOffset = useCallback(
        (img, level) => {
            const { width, height } = displayed(img, level);

            return clampOffset(img, level, {
                x: (VIEWPORT - width) / 2,
                y: (VIEWPORT - height) / 2,
            });
        },
        [displayed, clampOffset],
    );

    useEffect(() => {
        if (!file || !open) {
            return;
        }

        let cancelled = false;
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            if (cancelled) {
                return;
            }

            setImage(img);
            setZoom(1);
            setOffset(centerOffset(img, 1));
        };
        img.src = url;

        return () => {
            cancelled = true;
            URL.revokeObjectURL(url);
        };
    }, [file, open, centerOffset]);

    useEffect(() => {
        if (!open) {
            setImage(null);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setBusy(false);
        }
    }, [open]);

    const setZoomLevel = (next) => {
        if (!image) {
            return;
        }

        const level = Math.max(
            MIN_ZOOM,
            Math.min(MAX_ZOOM, Math.round(next * 100) / 100),
        );
        const before = displayed(image, zoom);

        // keep the image point under the viewport centre stable while zooming
        const centerX = (VIEWPORT / 2 - offset.x) / before.scale;
        const centerY = (VIEWPORT / 2 - offset.y) / before.scale;
        const after = displayed(image, level);

        setZoom(level);
        setOffset(
            clampOffset(image, level, {
                x: VIEWPORT / 2 - centerX * after.scale,
                y: VIEWPORT / 2 - centerY * after.scale,
            }),
        );
    };

    const reset = () => {
        if (!image) {
            return;
        }

        setZoom(1);
        setOffset(centerOffset(image, 1));
    };

    const onPointerDown = (event) => {
        if (!image) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            origin: offset,
        };
    };

    const onPointerMove = (event) => {
        if (
            !image ||
            !drag.current ||
            drag.current.pointerId !== event.pointerId
        ) {
            return;
        }

        setOffset(
            clampOffset(image, zoom, {
                x: drag.current.origin.x + (event.clientX - drag.current.startX),
                y: drag.current.origin.y + (event.clientY - drag.current.startY),
            }),
        );
    };

    const onPointerUp = (event) => {
        if (drag.current?.pointerId === event.pointerId) {
            drag.current = null;
            event.currentTarget.releasePointerCapture?.(event.pointerId);
        }
    };

    const apply = () => {
        if (!image || !file) {
            return;
        }

        setBusy(true);

        const { scale } = displayed(image, zoom);
        const sourceSize = VIEWPORT / scale;
        const canvas = document.createElement("canvas");
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;

        const context = canvas.getContext("2d");
        context.imageSmoothingQuality = "high";
        context.drawImage(
            image,
            -offset.x / scale,
            -offset.y / scale,
            sourceSize,
            sourceSize,
            0,
            0,
            OUTPUT_SIZE,
            OUTPUT_SIZE,
        );

        const type =
            file.type === "image/png" || file.type === "image/webp"
                ? file.type
                : "image/jpeg";
        const extension =
            type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
        const baseName = (file.name || "gambar").replace(/\.[^.]+$/, "");

        canvas.toBlob(
            (blob) => {
                setBusy(false);

                if (!blob) {
                    onApply(file);

                    return;
                }

                onApply(
                    new File([blob], `${baseName}-crop.${extension}`, {
                        type,
                    }),
                );
            },
            type,
            0.92,
        );
    };

    const isGif = file?.type === "image/gif";
    const { width, height } = image
        ? displayed(image, zoom)
        : { width: 0, height: 0 };

    return (
        <Modal
            show={open}
            onClose={onCancel}
            title="Atur gambar"
            maxWidth="lg"
        >
            <div className="space-y-4">
                <div
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    className="relative mx-auto h-80 w-80 cursor-grab touch-none overflow-hidden rounded-xl bg-slate-900 active:cursor-grabbing"
                >
                    {image && (
                        <img
                            src={image.src}
                            alt="Pratinjau crop"
                            draggable={false}
                            className="pointer-events-none absolute select-none"
                            style={{
                                width: `${width}px`,
                                height: `${height}px`,
                                maxWidth: "none",
                                transform: `translate(${offset.x}px, ${offset.y}px)`,
                                transformOrigin: "top left",
                            }}
                        />
                    )}
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setZoomLevel(zoom - 0.1)}
                        aria-label="Perkecil"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <IconMinus size={16} />
                    </button>
                    <input
                        type="range"
                        min={MIN_ZOOM}
                        max={MAX_ZOOM}
                        step={0.01}
                        value={zoom}
                        onChange={(event) =>
                            setZoomLevel(Number(event.target.value))
                        }
                        aria-label="Zoom gambar"
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary-500 dark:bg-slate-700"
                    />
                    <button
                        type="button"
                        onClick={() => setZoomLevel(zoom + 0.1)}
                        aria-label="Perbesar"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <IconPlus size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <IconRefresh size={14} />
                        Atur ulang
                    </button>
                </div>

                <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                    Geser gambar untuk mengatur posisi, gunakan slider untuk
                    zoom. Hasil crop berbentuk persegi (1:1).
                    {isGif &&
                        " GIF akan menjadi gambar statis setelah di-crop."}
                </p>

                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        Batal
                    </button>
                    {isGif && onUseOriginal && (
                        <button
                            type="button"
                            onClick={() => onUseOriginal(file)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Gunakan GIF asli
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={apply}
                        disabled={busy || !image}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                    >
                        <IconCrop size={16} />
                        {busy ? "Memproses..." : "Simpan crop"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
