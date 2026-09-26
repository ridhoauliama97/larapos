import { useEffect, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    IconShoppingCart,
    IconBuildingStore,
    IconTags,
    IconUserShield,
    IconLoader2,
    IconPlus,
    IconX,
    IconCheck,
    IconArrowLeft,
    IconArrowRight,
} from '@tabler/icons-react';

const STEPS = ['store', 'businessType', 'categories', 'account'];

export default function Wizard({ businessTypes, primaryWarehouse }) {
    const { t, i18n } = useTranslation();
    const { props } = usePage();
    const [step, setStep] = useState(0);

    useEffect(() => {
        const locale = props.locale?.current;
        if (locale && locale !== i18n.language) {
            i18n.changeLanguage(locale);
        }
    }, [i18n, props.locale?.current]);

    const changeLanguage = (locale) => {
        i18n.changeLanguage(locale);
        document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
        window.localStorage.setItem('i18nextLng', locale);
    };

    const { data, setData, post, transform, processing, errors, setError, clearErrors } = useForm({
        store_name: '',
        store_address: '',
        store_phone: '',
        store_email: '',
        business_type: '',
        categories: [],
        user_name: '',
        user_email: '',
        password: '',
        warehouse_id: primaryWarehouse?.id ?? '',
        warehouse_code: primaryWarehouse?.code ?? '',
        warehouse_name: primaryWarehouse?.name ?? '',
    });
    const [customCategory, setCustomCategory] = useState('');

    const categoryValue = (category) => `__setup:${data.business_type}:${category}`;

    const toggleCategory = (name) => {
        setData(
            'categories',
            data.categories.includes(name)
                ? data.categories.filter((c) => c !== name)
                : [...data.categories, name]
        );
        clearErrors('categories');
    };

    const addCustomCategory = () => {
        const name = customCategory.trim();
        if (!name || data.categories.includes(name)) return;
        setData('categories', [...data.categories, name]);
        setCustomCategory('');
    };

    const validateStep = () => {
        const nextErrors = {};
        if (step === 0 && !data.store_name.trim()) {
            nextErrors.store_name = t('setup.required');
        }
        if (step === 1 && !data.business_type) {
            nextErrors.business_type = t('setup.required');
        }
        if (step === 2 && data.categories.length === 0) {
            nextErrors.categories = t('setup.required');
        }
        if (Object.keys(nextErrors).length) {
            setError(nextErrors);
            return false;
        }
        return true;
    };

    const next = (event) => {
        event?.preventDefault();
        event?.stopPropagation();
        if (validateStep()) setStep((currentStep) => currentStep + 1);
    };

    const submit = () => {
        if (!validateStep()) return;

        transform((formData) => ({
            ...formData,
            categories: formData.categories.map((category) => {
                const prefix = `__setup:${formData.business_type}:`;

                return category.startsWith(prefix)
                    ? t(
                          `setup.categoryOptions.${formData.business_type}.${category.slice(prefix.length)}`
                      )
                    : category;
            }),
        }));
        post(route('setup.store'), { forceFormData: true });
    };

    const selectedType = businessTypes?.find((b) => b.key === data.business_type);

    const stepIcons = [IconBuildingStore, IconBuildingStore, IconTags, IconUserShield];

    return (
        <>
            <Head title={t('setup.title')} />

            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
                <div className="w-full max-w-2xl">
                    <div className="mb-8 flex items-center justify-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                            <IconShoppingCart size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            {t('auth.login.appName')}
                        </span>
                    </div>

                    <div className="mb-4 flex justify-center gap-1">
                        {['id', 'en'].map((locale) => (
                            <button
                                key={locale}
                                type="button"
                                onClick={() => changeLanguage(locale)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                    i18n.language.startsWith(locale)
                                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                            >
                                {locale === 'id' ? 'Indonesia' : 'English'}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        {/* Stepper */}
                        <div className="mb-8">
                            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                                {t('setup.step', {
                                    current: step + 1,
                                    total: STEPS.length,
                                })}
                            </p>
                            <div className="flex items-center gap-2">
                                {STEPS.map((key, i) => {
                                    const Icon = stepIcons[i];
                                    return (
                                        <div key={key} className="flex flex-1 items-center gap-2">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                                    i < step
                                                        ? 'bg-success-500 text-white'
                                                        : i === step
                                                          ? 'bg-primary-500 text-white'
                                                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                                }`}
                                            >
                                                {i < step ? (
                                                    <IconCheck size={16} />
                                                ) : (
                                                    <Icon size={16} />
                                                )}
                                            </div>
                                            <span
                                                className={`hidden text-xs font-medium sm:block ${
                                                    i === step
                                                        ? 'text-slate-900 dark:text-white'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {t(`setup.steps.${key}`)}
                                            </span>
                                            {i < STEPS.length - 1 && (
                                                <div
                                                    className={`h-0.5 flex-1 rounded ${
                                                        i < step
                                                            ? 'bg-success-500'
                                                            : 'bg-slate-200 dark:bg-slate-800'
                                                    }`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
                            {t(`setup.steps.${STEPS[step]}`)}
                        </h1>
                        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                            {t('setup.subtitle')}
                        </p>

                        <div className="space-y-5">
                            {/* Step 1: Store profile */}
                            {step === 0 && (
                                <>
                                    <Field
                                        label={t('setup.store.name')}
                                        error={errors.store_name}
                                        required
                                    >
                                        <input
                                            type="text"
                                            value={data.store_name}
                                            onChange={(e) => setData('store_name', e.target.value)}
                                            placeholder={t('setup.store.namePlaceholder')}
                                            className={inputCls(errors.store_name)}
                                            autoFocus
                                        />
                                    </Field>
                                    <Field label={t('setup.store.address')}>
                                        <textarea
                                            value={data.store_address}
                                            onChange={(e) =>
                                                setData('store_address', e.target.value)
                                            }
                                            rows={2}
                                            className={inputCls()}
                                        />
                                    </Field>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label={t('setup.store.phone')}>
                                            <input
                                                type="text"
                                                value={data.store_phone}
                                                onChange={(e) =>
                                                    setData('store_phone', e.target.value)
                                                }
                                                className={inputCls()}
                                            />
                                        </Field>
                                        <Field label={t('setup.store.email')}>
                                            <input
                                                type="email"
                                                value={data.store_email}
                                                onChange={(e) =>
                                                    setData('store_email', e.target.value)
                                                }
                                                className={inputCls()}
                                            />
                                        </Field>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Business type */}
                            {step === 1 && (
                                <>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {t('setup.businessType.hint')}
                                    </p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {businessTypes?.map((type) => (
                                            <button
                                                key={type.key}
                                                type="button"
                                                onClick={() => {
                                                    setData('business_type', type.key);
                                                    clearErrors('business_type');
                                                }}
                                                className={`rounded-xl border p-4 text-left transition ${
                                                    data.business_type === type.key
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                                                        : 'border-slate-200 hover:border-primary-300 dark:border-slate-700'
                                                }`}
                                            >
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {t(`setup.businessType.${type.key}`)}
                                                </span>
                                                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                                                    {type.categories
                                                        .map((category) =>
                                                            t(
                                                                `setup.categoryOptions.${type.key}.${category}`
                                                            )
                                                        )
                                                        .join(', ')}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.business_type && (
                                        <p className="text-sm text-danger-600">
                                            {errors.business_type}
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Step 3: Categories */}
                            {step === 2 && (
                                <>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {t('setup.categories.hint')}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedType?.categories ?? []).map((category) => {
                                            const name = t(
                                                `setup.categoryOptions.${selectedType.key}.${category}`
                                            );
                                            const value = categoryValue(category);

                                            return (
                                                <CategoryChip
                                                    key={category}
                                                    name={name}
                                                    active={data.categories.includes(value)}
                                                    onClick={() => toggleCategory(value)}
                                                />
                                            );
                                        })}
                                    </div>
                                    {data.categories.filter(
                                        (c) =>
                                            !selectedType?.categories.some(
                                                (category) => categoryValue(category) === c
                                            )
                                    ).length > 0 && (
                                        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                                            {data.categories
                                                .filter(
                                                    (c) =>
                                                        !selectedType?.categories.some(
                                                            (category) =>
                                                                categoryValue(category) === c
                                                        )
                                                )
                                                .map((name) => (
                                                    <CategoryChip
                                                        key={name}
                                                        name={name}
                                                        active
                                                        onClick={() => toggleCategory(name)}
                                                    />
                                                ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customCategory}
                                            onChange={(e) => setCustomCategory(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    addCustomCategory();
                                                }
                                            }}
                                            placeholder={t('setup.categories.placeholder')}
                                            className={inputCls()}
                                        />
                                        <button
                                            type="button"
                                            onClick={addCustomCategory}
                                            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-600"
                                        >
                                            <IconPlus size={16} />
                                            {t('setup.categories.add')}
                                        </button>
                                    </div>
                                    {errors.categories && (
                                        <p className="text-sm text-danger-600">
                                            {errors.categories}
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Step 4: Admin + warehouse */}
                            {step === 3 && (
                                <>
                                    <div className="rounded-xl bg-primary-50 p-3 text-sm text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                                        {t('setup.account.adminHint')}
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label={t('setup.account.name')}
                                            error={errors.user_name}
                                            required
                                        >
                                            <input
                                                type="text"
                                                value={data.user_name}
                                                onChange={(e) =>
                                                    setData('user_name', e.target.value)
                                                }
                                                className={inputCls(errors.user_name)}
                                                autoFocus
                                            />
                                        </Field>
                                        <Field
                                            label={t('auth.login.email')}
                                            error={errors.user_email}
                                            required
                                        >
                                            <input
                                                type="email"
                                                value={data.user_email}
                                                onChange={(e) =>
                                                    setData('user_email', e.target.value)
                                                }
                                                className={inputCls(errors.user_email)}
                                            />
                                        </Field>
                                    </div>
                                    <Field
                                        label={t('setup.password')}
                                        error={errors.password}
                                        required
                                        hint={t('setup.passwordHint')}
                                    >
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={inputCls(errors.password)}
                                        />
                                    </Field>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label={t('setup.account.warehouseCode')}
                                            error={errors.warehouse_code}
                                            required
                                        >
                                            <input
                                                type="text"
                                                value={data.warehouse_code}
                                                onChange={(e) =>
                                                    setData('warehouse_code', e.target.value)
                                                }
                                                placeholder={t(
                                                    'setup.account.warehouseCodePlaceholder'
                                                )}
                                                className={inputCls(errors.warehouse_code)}
                                            />
                                        </Field>
                                        <Field
                                            label={t('setup.account.warehouseName')}
                                            error={errors.warehouse_name}
                                            required
                                        >
                                            <input
                                                type="text"
                                                value={data.warehouse_name}
                                                onChange={(e) =>
                                                    setData('warehouse_name', e.target.value)
                                                }
                                                className={inputCls(errors.warehouse_name)}
                                            />
                                        </Field>
                                    </div>
                                </>
                            )}

                            {/* Nav buttons */}
                            <div className="flex items-center justify-between pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep((currentStep) => currentStep - 1)}
                                    disabled={step === 0}
                                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <IconArrowLeft size={16} />
                                    {t('setup.back')}
                                </button>

                                {step < STEPS.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={next}
                                        className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
                                    >
                                        {t('setup.next')}
                                        <IconArrowRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={submit}
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
                                    >
                                        {processing && (
                                            <IconLoader2 size={16} className="animate-spin" />
                                        )}
                                        {t('setup.finish')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Field({ label, error, hint, required, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
                {required && <span className="text-danger-500"> *</span>}
            </label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        </div>
    );
}

function CategoryChip({ name, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                active
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-primary-300 dark:border-slate-700 dark:text-slate-300'
            }`}
        >
            {active && <IconCheck size={14} />}
            {name}
            {active && <IconX size={14} className="opacity-60" />}
        </button>
    );
}

const inputCls = (error) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
        error ? 'border-danger-500' : 'border-slate-200 dark:border-slate-700'
    }`;
