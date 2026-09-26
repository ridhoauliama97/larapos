import { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { IconChevronDown, IconCircle, IconCircleFilled } from '@tabler/icons-react';

export default function InputSelect({
    selected,
    data,
    setSelected,
    label,
    errors,
    placeholder,
    multiple = false,
    searchable = false,
    displayKey = 'name',
}) {
    const [search, setSearch] = useState('');

    const filteredData = data.filter((item) =>
        item[displayKey]?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">{label}</label>
            <Listbox value={selected} onChange={setSelected} multiple={multiple} by="id">
                <Listbox.Button
                    className={
                        'flex w-full items-center justify-between gap-8 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-gray-200 focus:outline-none focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-gray-700'
                    }
                >
                    {multiple
                        ? selected.length > 0
                            ? selected.map((item) => item[displayKey]).join(', ')
                            : placeholder
                        : selected
                          ? selected[displayKey]
                          : placeholder}
                    <IconChevronDown size={20} strokeWidth={1.5} />
                </Listbox.Button>
                <Listbox.Options
                    className={
                        'flex flex-col gap-2 rounded-lg border bg-gray-100 p-4 dark:border-gray-900 dark:bg-gray-950'
                    }
                >
                    {searchable && (
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="mb-2 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-gray-300 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-gray-700"
                        />
                    )}
                    {filteredData.map((item) => (
                        <Listbox.Option key={item.id} value={item}>
                            {({ selected }) => (
                                <div className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800">
                                    {selected ? (
                                        <IconCircleFilled
                                            size={15}
                                            strokeWidth={1.5}
                                            className="text-teal-500"
                                        />
                                    ) : (
                                        <IconCircle size={15} strokeWidth={1.5} />
                                    )}
                                    {item[displayKey]}
                                </div>
                            )}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>
            {errors && <small className="text-xs text-red-500">{errors}</small>}
        </div>
    );
}
