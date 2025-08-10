import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ja from './locales/ja.json'

// Fall back to default locale if not supported
function getDefaultLocale(): string {
  const browserLocale = navigator.language.split('-')[0]
  const supportedLocales = ['en', 'ja']

  if (supportedLocales.includes(browserLocale)) {
    return browserLocale
  }

  return 'en'
}

// Get saved language setting from localStorage
function getSavedLocale(): string | null {
  return localStorage.getItem('locale')
}

// Save language setting to localStorage
export function saveLocale(locale: string): void {
  localStorage.setItem('locale', locale)
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale() || getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    ja
  }
})

export default i18n
