import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { LANGUAGES, useI18n } from '../i18n'
import Flag from './Flag'

// placement: 'down' (implicit) sau 'up' — în sidebar meniul se deschide în sus.
export default function LanguageSwitcher({ compact = false, placement = 'down' }) {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGUAGES.find((l) => l.code === lang)

  useEffect(() => {
    if (!open) return
    function onPointer(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function choose(code) {
    setLang(code)
    setOpen(false)
  }

  return (
    <div ref={ref} className={`relative ${compact ? '' : 'w-full'}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.language')}
        className={`tap flex items-center gap-2 rounded-lg text-sm font-medium text-muted hover:bg-base-800 hover:text-paper ${
          compact ? 'h-9 px-2' : 'w-full px-3 py-2'
        }`}
      >
        <Flag code={lang} />
        <span className={compact ? 'text-xs font-bold' : 'flex-1 text-left'}>{compact ? current.label : current.name}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('common.language')}
          className={`absolute z-40 min-w-[11rem] overflow-hidden rounded-lg border border-base-700 bg-base-900 py-1 shadow-xl shadow-black/30 ${
            placement === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${compact ? 'right-0' : 'left-0 right-0'}`}
        >
          {LANGUAGES.map((l) => {
            const active = l.code === lang
            return (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(l.code)}
                  className={`tap flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm ${
                    active ? 'text-amber' : 'text-paper hover:bg-base-800'
                  }`}
                >
                  <Flag code={l.code} />
                  <span className="flex-1">{l.name}</span>
                  {active && <Check size={15} className="shrink-0" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
