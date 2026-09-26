import { useForm } from '@inertiajs/react';
import { IconSearch } from '@tabler/icons-react';
export default function Search({ url, placeholder }) {
    // define use form inertia
    const { data, setData, get } = useForm({
        search: '',
    });

    // define method searchData
    const searchData = (e) => {
        e.preventDefault();

        get(`${url}?search=${data.search}`);
    };

    return (
        <form onSubmit={searchData}>
            <div className="relative">
                <input
                    type="text"
                    value={data.search}
                    onChange={(e) => setData('search', e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 pr-11 text-sm text-gray-700 focus:border-gray-200 focus:outline-none focus:ring-0 focus:ring-gray-400 dark:border-gray-900 dark:bg-gray-950 dark:text-gray-200 dark:focus:border-gray-800 dark:focus:ring-gray-500"
                    placeholder={placeholder}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <IconSearch className="h-5 w-5 text-gray-500" />
                </div>
            </div>
        </form>
    );
}
