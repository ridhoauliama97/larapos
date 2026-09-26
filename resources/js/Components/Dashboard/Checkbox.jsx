export default function Checkbox({ label, errors, ...props }) {
    return (
        <div>
            <div className="flex flex-row items-center gap-2">
                <input
                    {...props}
                    type="checkbox"
                    className={
                        'rounded-md border-gray-200 bg-white checked:bg-teal-500 dark:border-gray-800 dark:bg-gray-950'
                    }
                />
                <label className="text-sm text-gray-700 dark:text-gray-400">{label}</label>

                {errors && <small className="text-xs text-red-500">{errors}</small>}
            </div>
        </div>
    );
}
