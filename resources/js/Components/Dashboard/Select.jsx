import React, {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import { IconCheck, IconChevronDown, IconSearch } from "@tabler/icons-react";

const SIZES = {
    md: "min-h-11 px-4 py-2",
    sm: "h-10 px-3",
};

export default function Select({
    value,
    onChange,
    options = [],
    placeholder = "Pilih...",
    label,
    error,
    disabled = false,
    searchable,
    size = "md",
    icon = null,
    className = "",
    menuClassName = "",
    emptyText = "Tidak ada pilihan",
    id,
}) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);

    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const searchRef = useRef(null);
    const optionRefs = useRef([]);

    const normalized = useMemo(
        () =>
            options
                .filter((option) => option !== null && option !== undefined)
                .map((option) => ({
                    ...option,
                    value: option.value ?? "",
                    label: option.label ?? String(option.value ?? ""),
                })),
        [options]
    );

    const selectedIndex = normalized.findIndex(
        (option) => String(option.value) === String(value ?? "")
    );
    const selectedOption = selectedIndex >= 0 ? normalized[selectedIndex] : null;

    const shouldSearch = searchable ?? normalized.length > 7;
    const filtered =
        shouldSearch && search.trim() !== ""
            ? normalized.filter((option) =>
                  String(option.label)
                      .toLowerCase()
                      .includes(search.toLowerCase())
              )
            : normalized;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && shouldSearch && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen, shouldSearch]);

    useEffect(() => {
        if (isOpen && activeIndex >= 0) {
            optionRefs.current[activeIndex]?.scrollIntoView({
                block: "nearest",
            });
        }
    }, [isOpen, activeIndex]);

    const openMenu = () => {
        if (disabled) {
            return;
        }

        setIsOpen(true);
        setSearch("");
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    };

    const closeMenu = (refocus = true) => {
        setIsOpen(false);
        setSearch("");

        if (refocus) {
            buttonRef.current?.focus();
        }
    };

    const selectOption = (option) => {
        onChange?.(option.value, option);
        closeMenu();
    };

    const handleButtonKeyDown = (event) => {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
            event.preventDefault();

            if (!isOpen) {
                openMenu();
            }

            return;
        }

        if (event.key === "Escape") {
            closeMenu(false);
        }
    };

    const handleListKeyDown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === "Home") {
            event.preventDefault();
            setActiveIndex(0);
        } else if (event.key === "End") {
            event.preventDefault();
            setActiveIndex(filtered.length - 1);
        } else if (event.key === "Enter") {
            event.preventDefault();

            const option = filtered[activeIndex];

            if (option && !option.disabled) {
                selectOption(option);
            }
        } else if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    {label}
                </label>
            )}

            <div ref={containerRef} className="relative w-full min-w-0">
                <button
                    ref={buttonRef}
                    type="button"
                    id={inputId}
                    disabled={disabled}
                    onClick={() => (isOpen ? closeMenu() : openMenu())}
                    onKeyDown={handleButtonKeyDown}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-controls={`${inputId}-listbox`}
                    aria-invalid={error ? true : undefined}
                    className={`
                        w-full min-w-0 ${SIZES[size]} rounded-xl text-left
                        flex items-center gap-3 border-2 transition-all duration-200
                        ${
                            isOpen
                                ? "border-primary-500 ring-4 ring-primary-500/20"
                                : error
                                  ? "border-danger-500"
                                  : "border-slate-200 dark:border-slate-700"
                        }
                        bg-white dark:bg-slate-900
                        disabled:cursor-not-allowed disabled:opacity-60
                    `}
                >
                    {icon && (
                        <span
                            className={`
                                flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                                ${
                                    selectedOption
                                        ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                }
                            `}
                        >
                            {icon}
                        </span>
                    )}

                    <span className="min-w-0 flex-1 overflow-hidden">
                        {selectedOption ? (
                            <>
                                <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {selectedOption.label}
                                </span>
                                {selectedOption.description && (
                                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                                        {selectedOption.description}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="block truncate text-sm text-slate-400 dark:text-slate-500">
                                {placeholder}
                            </span>
                        )}
                    </span>

                    <IconChevronDown
                        size={18}
                        className={`shrink-0 text-slate-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {isOpen && (
                    <div
                        id={`${inputId}-listbox`}
                        role="listbox"
                        aria-labelledby={label ? inputId : undefined}
                        onKeyDown={handleListKeyDown}
                        className={`absolute left-0 right-0 top-full z-50 mt-2 w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-slide-up dark:border-slate-700 dark:bg-slate-900 ${menuClassName}`}
                    >
                        {shouldSearch && (
                            <div className="border-b border-slate-100 p-3 dark:border-slate-800">
                                <div className="relative">
                                    <IconSearch
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari..."
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="max-h-60 overflow-y-auto scrollbar-thin">
                            {filtered.length > 0 ? (
                                <ul>
                                    {filtered.map((option, index) => {
                                        const isSelected =
                                            option === selectedOption ||
                                            String(option.value) ===
                                                String(
                                                    selectedOption?.value ?? ""
                                                );

                                        return (
                                            <li key={`${option.value}`}>
                                                <button
                                                    ref={(node) => {
                                                        optionRefs.current[index] =
                                                            node;
                                                    }}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    disabled={option.disabled}
                                                    onClick={() =>
                                                        selectOption(option)
                                                    }
                                                    onMouseEnter={() =>
                                                        setActiveIndex(index)
                                                    }
                                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                                        option.disabled
                                                            ? "cursor-not-allowed opacity-50"
                                                            : isSelected
                                                              ? "bg-primary-50 dark:bg-primary-950/30"
                                                              : index ===
                                                                  activeIndex
                                                                ? "bg-slate-50 dark:bg-slate-800"
                                                                : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                                    }`}
                                                >
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                                            {option.label}
                                                        </span>
                                                        {option.description && (
                                                            <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                                                                {
                                                                    option.description
                                                                }
                                                            </span>
                                                        )}
                                                    </span>

                                                    {isSelected && (
                                                        <IconCheck
                                                            size={16}
                                                            className="shrink-0 text-primary-500"
                                                        />
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                                    {emptyText}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <small className="text-xs text-danger-500 dark:text-danger-400">
                    {error}
                </small>
            )}
        </div>
    );
}
