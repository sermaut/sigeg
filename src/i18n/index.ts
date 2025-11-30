import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptTranslations from './locales/pt.json';
import frTranslations from './locales/fr.json';
import enTranslations from './locales/en.json';

// Get saved language from localStorage for instant language restoration
const getSavedLanguage = (): string => {
  try {
    const stored = localStorage.getItem('sigeg_app_state');
    if (stored) {
      const state = JSON.parse(stored);
      return state?.state?.language || 'pt';
    }
  } catch {
    // Ignore parse errors
  }
  return 'pt';
};

// Pre-load all translations synchronously for instant switching
const resources = {
  pt: { translation: ptTranslations },
  fr: { translation: frTranslations },
  en: { translation: enTranslations },
};

i18n
  .use(initReactI18next)
  .init({
    lng: getSavedLanguage(),
    fallbackLng: 'pt',
    debug: false,
    load: 'currentOnly', // Only load current language
    interpolation: {
      escapeValue: false,
    },
    resources,
    // Performance optimizations
    react: {
      useSuspense: false, // Disable suspense for faster initial render
      bindI18n: 'languageChanged', // Only re-render on language change
      bindI18nStore: false, // Don't re-render on store changes
    },
    initImmediate: true, // Initialize immediately
  });

export default i18n;