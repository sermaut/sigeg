import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptTranslations from './locales/pt.json';
import frTranslations from './locales/fr.json';
import enTranslations from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'pt', // default language
    fallbackLng: 'pt',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    resources: {
      pt: {
        translation: ptTranslations,
      },
      fr: {
        translation: frTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
  });

export default i18n;