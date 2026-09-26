import { useState, useRef, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { usePage, router } from '@inertiajs/react';
import { IconLogout, IconRotate, IconUserCircle } from '@tabler/icons-react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import MenuLink from '@/Utils/Menu';
import LinkItem from './LinkItem';
import LinkItemDropdown from './LinkItemDropdown';
import i18n from '@/i18n';
export default function AuthDropdown({ auth, isMobile }) {
    // define usefrom
    const { post } = useForm();
    // define url from usepage
    const { url } = usePage();

    // define state isToggle
    const [isToggle, setIsToggle] = useState(false);
    // define state isOpen
    const [isOpen, setIsOpen] = useState(false);
    // define ref dropdown
    const dropdownRef = useRef(null);

    // define method handleClickOutside
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsToggle(false);
        }
    };

    // get menu from utils
    const menuNavigation = MenuLink();

    // define useEffect
    useEffect(() => {
        // add event listener
        window.addEventListener('mousedown', handleClickOutside);

        // remove event listener
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // define function logout
    const logout = async (e) => {
        e.preventDefault();

        post(route('logout'));
    };

    const resetTours = (e) => {
        e.preventDefault();

        // ponytail: plain axios — Inertia router rejects the JSON-only response
        axios
            .post(route('tours.reset'), {}, { headers: { Accept: 'application/json' } })
            .then(() => router.reload({ only: ['auth'] }));
    };

    const avatarUrl = auth.user.avatar;
    const userInitial =
        auth.user.name?.charAt(0)?.toUpperCase() ??
        auth.user.email?.charAt(0)?.toUpperCase() ??
        '?';

    return (
        <>
            {isMobile === false ? (
                <Menu className="relative z-10" as="div">
                    <Menu.Button className="flex items-center rounded-full">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={auth.user.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                                {userInitial}
                            </div>
                        )}
                    </Menu.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Menu.Items className="absolute right-0 z-[100] mt-2 w-48 rounded-lg border bg-white py-2 dark:border-gray-900 dark:bg-gray-950">
                            <div className="flex flex-col gap-1.5 divide-y divide-gray-100 dark:divide-gray-900">
                                {/* <Menu.Item>
                                    <button
                                        onClick={resetTours}
                                        className="px-3 py-1.5 text-sm flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <IconRotate
                                            strokeWidth={"1.5"}
                                            size={"20"}
                                        />
                                        {i18n.t("tour.reset")}
                                    </button>
                                </Menu.Item> */}
                                <Menu.Item>
                                    <button
                                        onClick={() => router.visit(route('profile.edit'))}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <IconUserCircle strokeWidth={'1.5'} size={'20'} />
                                        Profil
                                    </button>
                                </Menu.Item>
                                <Menu.Item>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <IconLogout strokeWidth={'1.5'} size={'20'} />
                                        Logout
                                    </button>
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            ) : (
                <div ref={dropdownRef}>
                    <div className="flex items-center">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={auth.user.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                                {userInitial}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
