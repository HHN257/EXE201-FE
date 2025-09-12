import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Load translation using http -> see /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: 'en',
    
    // Available languages
    supportedLngs: ['en', 'vi'],
    
    // Debug mode (set to false in production)
    debug: process.env.NODE_ENV === 'development',

    // Detection options
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',
      
      // Cache user language
      caches: ['localStorage'],
    },

    // Backend options
    backend: {
      // Path where resources get loaded from
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Interpolation options
    interpolation: {
      // React already does escaping
      escapeValue: false,
    },

    // Namespace options
    ns: ['common', 'navigation', 'services', 'auth', 'dashboard'],
    defaultNS: 'common',

    // React specific options
    react: {
      // Use React suspense
      useSuspense: false,
    },
  });

export default i18n;