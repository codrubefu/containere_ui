import { Factory } from 'lucide-react'
import Header from '../components/Header'
import LoadState from '../components/LoadState'
import { workApi } from '../api/work'
import { useApi } from '../api/useApi'
import { useI18n } from '../i18n'

// Secțiile vin de la API: cele alocate utilizatorului (adminul le vede pe toate).
export default function WorkerHome({ onOpenSection }) {
  const { t } = useI18n()
  const { data: sections, loading, error, reload } = useApi(() => workApi.sections(), [])

  return (
    <div className="min-h-screen bg-base-950 pb-24 md:pb-8">
      <Header title={t('worker.title')} subtitle={sections ? t('worker.assigned', { count: sections.length }) : undefined} />

      <div className="px-3 py-3 md:px-0">
        <LoadState loading={loading && !sections} error={error} onRetry={reload} />

        {sections?.length > 0 && (
          <div className="divide-y divide-base-800 rounded-xl border border-base-700 bg-base-900">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => onOpenSection(s.id)}
                className="tap flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-base-800"
              >
                <Factory size={17} className="shrink-0 text-steel" />
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-paper">{t(`section.${s.id}`)}</span>
                <span className="shrink-0 text-xs text-muted">
                  {s.pendingCount > 0 ? t('worker.pending', { count: s.pendingCount }) : t('worker.nothingPending')}
                </span>
                {s.pendingCount > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber px-1 text-[11px] font-bold text-ink">
                    {s.pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {sections?.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-base-600 p-6 text-center">
            <p className="text-sm text-muted">{t('worker.noSections')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
