/**
 * Decorative barcode block.
 *
 * IMPORTANT: this is NOT a scannable symbology. Bar widths are derived from
 * `charCodeAt`, purely so receipts and labels have a barcode-looking strip. For
 * a barcode a scanner can actually read, use Components/Barcode/BarcodeLabel
 * (JsBarcode, CODE128) instead.
 *
 * This lives at module scope on purpose. It used to be declared inside the
 * consuming component in four places, which meant React saw a brand-new
 * component type on every render and remounted the subtree each time.
 */
export default function SimpleBarcode({
    value,
    divisor = 5,
    targetWidth = null,
    className = 'mt-2 justify-center',
    barClassName = 'h-10 bg-black',
    // Full class, not a fragment: Tailwind's scanner only sees literal strings,
    // so `gap-${x}` would never be generated.
    gapClassName = 'gap-[2px]',
}) {
    let bars = (value || '').split('').map((char, idx) => {
        const weight = (char.charCodeAt(0) + idx * 17) % divisor;
        return 2 + weight; // 2 to 1+divisor px
    });

    let scale = 1;
    if (targetWidth) {
        const total = bars.reduce((acc, w) => acc + w, 0);
        scale = total ? Math.min(2.2, targetWidth / total) : 1;
    }

    return (
        <div className={`flex items-end ${gapClassName} ${className}`}>
            {bars.map((w, i) => (
                <span
                    key={i}
                    style={{ width: `${w * scale}px` }}
                    className={`block ${barClassName}`}
                />
            ))}
        </div>
    );
}
