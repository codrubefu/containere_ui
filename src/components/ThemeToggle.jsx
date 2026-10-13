import { Sun, Moon } from 'lucide-react'
import { useI18n } from '../i18n'

export default function ThemeToggle({ theme, onToggle, compact = false }) {
  const { t } = useI18n()
  const isLight = theme === 'light'

  if (compact) {
    return (
      <button
        onClick={onToggle}
        className="tap flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-base-800 hover:text-paper"
        aria-label={t('theme.toggle')}
      >
        {isLight ? <Moon size={17} /> : <Sun size={17} />}
      </button>
    )
  }

  return (
    <button
      onClick={onToggle}
      className="tap flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-base-800 hover:text-paper"
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
      {isLight ? t('theme.dark') : t('theme.light')}
    </button>
  )
}
