import { ClipboardList } from 'lucide-react'
import Header from '../components/Header'
import LoadState from '../components/LoadState'
import { workApi } from '../api/work'
import { useApi } from '../api/useApi'
import { useI18n } from '../i18n'

export default function ProjectPicker({ sectionId, onSelectProject, onBack }) {
  const { t } = useI18n()
  const { data: rows, loading, error, reload } = useApi(() => workApi.projects(sectionId), [sectionId])

  return (
    <div className="min-h-screen bg-base-950 pb-24 md:pb-8">
      <Header title={t(`section.${sectionId}`)} subtitle={t('picker.subtitle')} onBack={onBack} />

      <div className="px-3 py-3 md:px-0">
        <LoadState loading={loading && !rows} error={error} onRetry={reload} />

        {rows?.length > 0 && (
          <div className="divide-y divide-base-800 rounded-xl border border-base-700 bg-base-900">
            {rows.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="tap flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-base-800"
              >
                <ClipboardList size={17} className="shrink-0 text-steel" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-paper">{project.name}</p>
                  <p className="font-mono text-xs text-muted">{project.code}</p>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {t('picker.materialsShort', { count: project.itemsCount })} ·{' '}
                  {project.pendingCount > 0 ? t('picker.toFinish', { count: project.pendingCount }) : t('picker.allDone')}
                </span>
                {project.pendingCount > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber px-1 text-[11px] font-bold text-ink">
                    {project.pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {rows?.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-base-600 p-6 text-center">
            <p className="text-sm text-muted">{t('picker.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
