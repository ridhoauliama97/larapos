import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref
) {
    // Always create the internal ref; a forwarded ref is merged in below.
    // Calling useRef() conditionally would break hook order when a parent
    // starts or stops passing a ref between renders.
    const internalRef = useRef(null);

    // Expose the underlying <input> node to the forwarded ref.
    useImperativeHandle(ref, () => internalRef.current);

    useEffect(() => {
        if (isFocused) {
            internalRef.current?.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
                className
            }
            ref={internalRef}
        />
    );
});
