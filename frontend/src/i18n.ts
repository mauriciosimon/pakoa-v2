import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import esTranslation from './locales/es/translation.json'
import enTranslation from './locales/en/translation.json'

const resources = {
  es: {
    translation: esTranslation
  },
  en: {
    translation: enTranslation
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    defaultNS: 'translation',

    detection: {
      // Order of detection: localStorage first, then browser language
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache the language in localStorage
      caches: ['localStorage'],
      // Key for localStorage
      lookupLocalStorage: 'pakoa-language',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  })

export default i18n

// Helper to get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || 'es'
}

// Helper to change language
export const changeLanguage = (lang: 'es' | 'en'): void => {
  i18n.changeLanguage(lang)
}

// Helper to check if language is Spanish
export const isSpanish = (): boolean => {
  return getCurrentLanguage().startsWith('es')
}

// Helper to check if language is English
export const isEnglish = (): boolean => {
  return getCurrentLanguage().startsWith('en')
}
