import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IconX } from '@tabler/icons-react';

/**
 * Right-hand slide-over. Same headlessui `Dialog` + `Transition` pairing as
 * `Modal.jsx`, so Escape / focus trap / backdrop-click behave identically — only
 * the axis of entry and the panel anchoring differ.
 *
 * `width` is the panel's max width at sm+; below that it is full-screen.
 */
export default function Drawer({
    children,
    title,
    show = false,
    width = 'md',
    closeable = true,
    onClose = () => {},
}) {
    const close = () => {
        if (closeable) onClose();
    };

    const widthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
    }[width];

    return (
        <Transition show={show} as={Fragment} leave="duration-200">
            <Dialog as="div" className="relative z-50" onClose={close}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-200"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel
                                    className={`pointer-events-auto flex h-full w-screen flex-col bg-white shadow-xl dark:bg-gray-950 ${widthClass}`}
                                >
                                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-900">
                                        <Dialog.Title className="text-base font-semibold text-gray-700 dark:text-gray-300">
                                            {title}
                                        </Dialog.Title>
                                        {closeable && (
                                            <button
                                                type="button"
                                                onClick={close}
                                                aria-label="Tutup"
                                                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                            >
                                                <IconX size={20} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4">{children}</div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
