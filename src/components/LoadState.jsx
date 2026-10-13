import { Loader2 } from 'lucide-react'
import { useI18n } from '../i18n'

// Spinner la încărcare, mesaj + „Reîncearcă” la eroare; altfel nu afișează nimic.
export default function LoadState({ loading, error, onRetry }) {
  const { t } = useI18n()
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={22} className="animate-spin text-muted" />
      </div>
    )
  }
  if (!error) return null
  return (
    <div className="mt-6 rounded-xl border border-alert/40 bg-alert/10 p-4 text-center">
      <p className="text-sm text-alert">{error.status === 0 ? t('login.network') : t('common.loadError')}</p>
      <button onClick={onRetry} className="tap mt-2 text-sm font-semibold text-amber">
        {t('common.retry')}
      </button>
    </div>
  )
}
