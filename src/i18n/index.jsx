import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LANGUAGES, TRANSLATIONS } from './translations'

export { LANGUAGES }

const DEFAULT_LANG = 'de'

function initialLang() {
  try {
    const saved = localStorage.getItem('lang')
    if (saved && TRANSLATIONS[saved]) return saved
  } catch {
    // ignore
  }
  const browser = (navigator.language || '').slice(0, 2).toLowerCase()
  return TRANSLATIONS[browser] ? browser : DEFAULT_LANG
}

function translate(lang, key, params) {
  let value = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS[DEFAULT_LANG][key] ?? key
  if (typeof value === 'object') value = params?.count === 1 ? value.one : value.other
  if (!params) return value
  return value.replace(/\{(\w+)\}/g, (m, name) => (params[name] ?? m))
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('lang', lang)
    } catch {
      // ignore
    }
  }, [lang])

  const t = useCallback((key, params) => translate(lang, key, params), [lang])
  const locale = LANGUAGES.find((l) => l.code === lang)?.locale ?? 'de-DE'

  const value = useMemo(() => ({ lang, setLang, t, locale }), [lang, t, locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

// Data comentariilor (ISO de la API), ex. „02.10, 14:20” în formatul limbii curente.
export function formatDateTime(iso, locale) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
