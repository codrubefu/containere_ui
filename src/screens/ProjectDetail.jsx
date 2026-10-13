import { useMemo, useState } from 'react'
import { Plus, X, MessageSquare, Send, Lock, RotateCcw, Box } from 'lucide-react'
import { SECTIONS } from '../data/mockData'
import AddMaterialSheet from '../components/AddMaterialSheet'
import AuditLine from '../components/AuditLine'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import { formatDateTime, useI18n } from '../i18n'

const STATUS_CYCLE = ['neinceput', 'in_lucru', 'finalizat']

export default function ProjectDetail({ project, access, onBack, onAddItem, onRemoveItem, onUpdateItem, onAddComment, onToggleClose }) {
  const { t } = useI18n()
  // null = închis; altfel { containerId } — containerul precizat vine bifat în formular (null = niciunul)
  const [addTarget, setAddTarget] = useState(null)
  const isClosed = project.status === 'finalizat'
  const { contract, containers } = project

  // Materialele fiecărui container, ordonate după secție (ordinea din SECTIONS).
  const byContainer = useMemo(() => {
    const sectionOrder = (id) => SECTIONS.findIndex((s) => s.id === id)
    const map = {}
    for (const item of project.items) {
      if (!map[item.containerId]) map[item.containerId] = []
      map[item.containerId].push(item)
    }
    for (const list of Object.values(map)) list.sort((a, b) => sectionOrder(a.sectionId) - sectionOrder(b.sectionId))
    return map
  }, [project.items])

  return (
    <div className="min-h-screen bg-base-950 pb-28 md:pb-8">
      <Header title={project.name} subtitle={`${contract.number} · ${contract.client}`} onBack={onBack} />

      <div className="flex items-center justify-between gap-2 px-4 pt-3 md:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t(`projectStatus.${project.status}`)}
          </span>
          {project.deadline && <span className="text-xs text-muted">· {t('project.deadline', { date: project.deadline })}</span>}
        </div>
        {access.close && (
        <button
          onClick={onToggleClose}
          className={`tap flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
            isClosed ? 'border-steel/40 bg-steel/10 text-steel' : 'border-signal/40 bg-signal/10 text-signal'
          }`}
        >
          {isClosed ? <RotateCcw size={13} /> : <Lock size={13} />}
          {isClosed ? t('project.reopen') : t('project.close')}
        </button>
        )}
      </div>

      {isClosed && (
        <div className="mx-4 mt-3 rounded-lg border border-steel/30 bg-steel/10 px-3 py-2 text-xs text-steel md:mx-6">
          {t('project.closedNotice')}
        </div>
      )}

      {project.items.length === 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-dashed border-base-600 p-4 text-center md:mx-6">
          <p className="text-sm text-muted">{t('project.empty')}</p>
          <p className="mt-1 text-xs text-muted">{t('project.emptyHint')}</p>
        </div>
      )}

      <div className="mt-3 space-y-5 px-4 md:px-6">
        {containers.map((container) => {
          const items = byContainer[container.id] ?? []
          const done = items.filter((i) => i.status === 'finalizat').length
          return (
            <div key={container.id}>
              <div className="mb-1.5 flex items-center gap-2">
                <Box size={14} className="shrink-0 text-steel" />
                <p className="min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wide text-steel">
                  {container.type} <span className="font-mono font-normal normal-case text-muted">· {container.code}</span>
                </p>
                {items.length > 0 && (
                  <span className="shrink-0 text-xs text-muted">
                    {t('projects.materialsCount', { count: items.length })} · {t('projects.doneShort', { count: done })}
                  </span>
                )}
                {access.manageItems && (
                  <button
                    onClick={() => setAddTarget({ containerId: container.id })}
                    className="tap flex h-7 w-7 shrink-0 items-center justify-center rounded text-amber active:bg-base-800"
                    aria-label={t('project.addToContainer')}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-base-700 px-3.5 py-3 text-xs text-muted">
                  {t('project.containerEmpty')}
                </div>
              ) : (
                <div className="divide-y divide-base-800 rounded-xl border border-base-700 bg-base-900">
                  {items.map((item) => (
                    <MaterialRow
                      key={item.id}
                      item={item}
                      material={item.material}
                      access={access}
                      onRemove={() => onRemoveItem(item.id)}
                      onAddComment={(text) => onAddComment(item.id, text)}
                      onChangeStatus={(status) => onUpdateItem(item.id, { status })}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {access.manageItems && (
      <button
        onClick={() => setAddTarget({ containerId: containers.length === 1 ? containers[0].id : null })}
        className="tap fixed bottom-24 left-4 right-4 z-20 flex items-center justify-center gap-2 rounded-xl bg-amber py-3.5 text-[15px] font-bold text-ink shadow-lg shadow-black/40 md:bottom-8 md:left-auto md:right-8 md:w-auto md:px-6"
      >
        <Plus size={20} strokeWidth={2.5} /> {t('project.addMaterial')}
      </button>
      )}

      {access.manageItems && addTarget && (
        <AddMaterialSheet
          containers={containers}
          initialContainerIds={addTarget.containerId ? [addTarget.containerId] : []}
          onClose={() => setAddTarget(null)}
          onAdd={(payload) => {
            onAddItem(payload)
            setAddTarget(null)
          }}
        />
      )}
    </div>
  )
}

function MaterialRow({ item, material, access, onRemove, onAddComment, onChangeStatus }) {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const hasComments = item.comments && item.comments.length > 0

  function submit() {
    if (!draft.trim()) return
    onAddComment(draft)
    setDraft('')
  }

  function cycleStatus(e) {
    e.stopPropagation()
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length]
    onChangeStatus(next)
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <button onClick={() => setOpen((v) => !v)} className="tap flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="truncate text-[14px] font-medium text-paper">{material.name}</span>
          <span className="shrink-0 rounded bg-base-800 px-1.5 py-0.5 text-[11px] text-steel">{t(`section.${item.sectionId}`)}</span>
          <span className="hidden shrink-0 font-mono text-xs text-muted sm:inline">{material.code}</span>
        </button>
        <span className="shrink-0 whitespace-nowrap font-mono text-xs text-muted">
          {item.plannedQty} {material.unit}
          {item.actualQty != null && <span className="text-signal"> → {item.actualQty}</span>}
        </span>
        {access.changeStatus ? (
          <button onClick={cycleStatus} className="tap shrink-0" aria-label={t('project.changeStatus')}>
            <StatusBadge status={item.status} />
          </button>
        ) : (
          <StatusBadge status={item.status} className="shrink-0" />
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="tap relative flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted active:bg-base-800"
          aria-label={t('common.comments')}
        >
          <MessageSquare size={15} className={hasComments ? 'text-amber' : ''} />
          {hasComments && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber px-0.5 text-[9px] font-bold text-ink">
              {item.comments.length}
            </span>
          )}
        </button>
        {access.manageItems && (
        <button
          onClick={onRemove}
          className="tap flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted active:bg-base-800"
          aria-label={t('project.removeMaterial')}
        >
          <X size={15} />
        </button>
        )}
      </div>

      {open && (
        <div className="border-t border-base-800 bg-base-950/40 px-3.5 py-3">
          <AuditLine item={item} className="mb-2.5" />
          {hasComments && (
            <div className="mb-2.5 space-y-2">
              {item.comments.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="font-semibold text-paper">{c.author}</span>{' '}
                  <span className="text-muted">· {formatDateTime(c.createdAt, locale)}</span>
                  <p className="mt-0.5 text-muted">{c.text}</p>
                </div>
              ))}
            </div>
          )}
          {access.comment && (
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder={t('common.commentPlaceholder')}
              className="min-w-0 flex-1 rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-[13px] text-paper outline-none focus:border-amber"
            />
            <button
              onClick={submit}
              disabled={!draft.trim()}
              className="tap flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber text-ink disabled:opacity-40"
              aria-label={t('common.sendComment')}
            >
              <Send size={14} />
            </button>
          </div>
          )}
        </div>
      )}
    </div>
  )
}
