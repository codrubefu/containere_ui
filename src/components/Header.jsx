import { ChevronLeft } from 'lucide-react'
import { useI18n } from '../i18n'

export default function Header({ title, subtitle, onBack, right }) {
  const { t } = useI18n()
  return (
    <header className="safe-top sticky top-0 z-20 border-b border-base-700 bg-base-900/95 backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-3">
        {onBack && (
          <button
            onClick={onBack}
            className="tap -ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-paper active:bg-base-800"
            aria-label={t('common.back')}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-bold leading-tight text-paper">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}
