const Card = ({ icon, title, className, children }) => {
    return (
        <>
            <div
                className={`rounded-t-lg border p-4 ${className} bg-white dark:border-gray-900 dark:bg-gray-950`}
            >
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {title}
                </div>
            </div>
            <div className="rounded-b-lg border-t-0 bg-white dark:border-gray-900 dark:bg-gray-950">
                {children}
            </div>
        </>
    );
};

const Table = ({ children }) => {
    return (
        <div className="w-full border-collapse overflow-hidden overflow-x-auto rounded-b-lg border border-t-0 dark:border-gray-900">
            <table className="w-full text-sm">{children}</table>
        </div>
    );
};

const Thead = ({ className, children }) => {
    return (
        <thead className={`${className} border-b bg-gray-50 dark:border-gray-900 dark:bg-gray-950`}>
            {children}
        </thead>
    );
};

const Tbody = ({ className, children }) => {
    return (
        <tbody className={`${className} divide-y bg-white dark:divide-gray-900 dark:bg-gray-950`}>
            {children}
        </tbody>
    );
};

const Td = ({ className, children }) => {
    return (
        <td
            className={`${className} whitespace-nowrap p-4 align-middle text-gray-700 dark:text-gray-400`}
        >
            {children}
        </td>
    );
};

const Th = ({ className, children }) => {
    return (
        <th
            scope="col"
            className={`${className} h-12 px-4 text-left align-middle font-medium text-gray-700 dark:text-gray-400`}
        >
            {children}
        </th>
    );
};

const Empty = ({ colSpan, message, children }) => {
    return (
        <tr>
            <td colSpan={colSpan}>
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        {children}
                        <div className="mt-5">{message}</div>
                    </div>
                </div>
            </td>
        </tr>
    );
};

Table.Card = Card;
Table.Thead = Thead;
Table.Tbody = Tbody;
Table.Td = Td;
Table.Th = Th;
Table.Empty = Empty;

export default Table;
