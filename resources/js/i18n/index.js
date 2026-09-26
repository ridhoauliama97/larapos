import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import id from './locales/id.json';
import en from './locales/en.json';

const resources = {
    id: { translation: id },
    en: { translation: en },
};

const supported = Object.keys(resources);

// The server is the source of truth: SetLocale resolves user > session > cookie >
// Accept-Language and app.blade.php renders the result on <html lang>.
const serverLocale = (document.documentElement.lang || 'id').split('-')[0];
const initialLocale = supported.includes(serverLocale) ? serverLocale : 'id';

i18n.use(initReactI18next).init({
    resources,
    lng: initialLocale,
    fallbackLng: 'id',
    supportedLngs: supported,
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;

export const languages = [
    { code: 'id', name: 'Indonesia', nativeName: 'Indonesia' },
    { code: 'en', name: 'English', nativeName: 'English' },
];
