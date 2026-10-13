import { useMemo, useState } from 'react'
import { CheckCircle2, PlayCircle, Circle, MessageSquare, Send, Plus } from 'lucide-react'
import AddMaterialSheet from '../components/AddMaterialSheet'
import AuditLine from '../components/AuditLine'
import Header from '../components/Header'
import LoadState from '../components/LoadState'
import StatusBadge from '../components/StatusBadge'
import { workApi } from '../api/work'
import { workMaterialsApi } from '../api/client'
import { useApi } from '../api/useApi'
import { formatDateTime, useI18n } from '../i18n'

const STATUS_ICON = {
  neinceput: Circle,
  in_lucru: PlayCircle,
  finalizat: CheckCircle2,
}

export default function SectionWork({ sectionId, projectId, user, access, onBack, onError }) {
  const { t } = useI18n()
  const { data, loading, error, reload, setData } = useApi(() => workApi.items(sectionId, projectId), [sectionId, projectId])
  const [openItemId, setOpenItemId] = useState(null)
  const [adding, setAdding] = useState(false)
  const project = data?.project
  const containers = project?.containers ?? []
  const canAdd = access.work && project && project.status !== 'finalizat' && containers.length > 0

  const rows = useMemo(
    () => [...(data?.items ?? [])].sort((a, b) => (a.status === 'finalizat' ? 1 : 0) - (b.status === 'finalizat' ? 1 : 0)),
    [data]
  )

  // Citit din lista curentă, ca foaia să arate imediat comentariile/statusul salvate.
  const openItem = data?.items.find((i) => i.id === openItemId)

  // Serverul întoarce materialul actualizat; îl înlocuim în listă.
  async function save(request) {
    try {
      const updated = await request
      setData((d) => ({ ...d, items: d.items.map((i) => (i.id === updated.id ? updated : i)) }))
    } catch (err) {
      onError(err)
    }
  }

  // Materialele noi (câte unul per container) se adaugă la finalul listei.
  async function addItems(payload) {
    setAdding(false)
    try {
      const created = await workApi.addItems(sectionId, projectId, payload)
      setData((d) => ({ ...d, items: [...d.items, ...created] }))
    } catch (err) {
      onError(err)
    }
  }

  return (
    <div className={`min-h-screen bg-base-950 md:pb-8 ${canAdd ? 'pb-28' : 'pb-10'}`}>
      <Header
        title={t(`section.${sectionId}`)}
        subtitle={project ? `${project.name} · ${project.code}` : undefined}
        onBack={onBack}
      />

      <div className="px-3 py-3 md:px-0">
        <LoadState loading={loading && !data} error={error} onRetry={reload} />

        {data && rows.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-base-600 p-6 text-center">
            <p className="text-sm text-muted">{t('work.empty')}</p>
          </div>
        )}

        {rows.length > 0 && (
          <div className="divide-y divide-base-800 rounded-xl border border-base-700 bg-base-900">
            {rows.map((item) => {
              const mat = item.material
              const container = item.container
              const Icon = STATUS_ICON[item.status]
              return (
                <button
                  key={item.id}
                  onClick={() => setOpenItemId(item.id)}
                  className="tap flex w-full items-center gap-2 px-3.5 py-3 text-left active:bg-base-800"
                >
                  <Icon
                    size={17}
                    className={`shrink-0 ${
                      item.status === 'finalizat' ? 'text-signal' : item.status === 'in_lucru' ? 'text-amber' : 'text-muted'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-paper">{mat.name}</span>
                    {container && <span className="block truncate font-mono text-[11px] text-steel">{container.code} · {container.type}</span>}
                  </span>
                  <span className="hidden shrink-0 font-mono text-xs text-muted sm:inline">{mat.code}</span>
                  <span className="shrink-0 whitespace-nowrap font-mono text-xs text-muted">
                    {item.plannedQty} {mat.unit}
                  </span>
                  {item.comments?.length > 0 && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-amber">
                      <MessageSquare size={12} /> {item.comments.length}
                    </span>
                  )}
                  <StatusBadge status={item.status} className="shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {canAdd && (
        <button
          onClick={() => setAdding(true)}
          className="tap fixed bottom-6 left-4 right-4 z-20 flex items-center justify-center gap-2 rounded-xl bg-amber py-3.5 text-[15px] font-bold text-ink shadow-lg shadow-black/40 md:bottom-8 md:left-auto md:right-8 md:w-auto md:px-6"
        >
          <Plus size={20} strokeWidth={2.5} /> {t('project.addMaterial')}
        </button>
      )}

      {canAdd && adding && (
        <AddMaterialSheet
          containers={containers}
          initialContainerIds={containers.length === 1 ? [containers[0].id] : []}
          catalog={workMaterialsApi}
          fixedSectionId={sectionId}
          onClose={() => setAdding(false)}
          onAdd={addItems}
        />
      )}

      {openItem && (
        <WorkSheet
          item={openItem}
          material={openItem.material}
          container={openItem.container}
          user={user}
          access={access}
          onClose={() => setOpenItemId(null)}
          onSave={(updates) => {
            save(workApi.updateItem(openItem.id, updates))
            setOpenItemId(null)
          }}
          onAddComment={(text) => save(workApi.addComment(openItem.id, text.trim()))}
        />
      )}
    </div>
  )
}

function WorkSheet({ item, material, container, user, access, onClose, onSave, onAddComment }) {
  const { t, locale } = useI18n()
  const [actualQty, setActualQty] = useState(item.actualQty ?? '')
  const [draft, setDraft] = useState('')
  const comments = item.comments ?? []

  function start() {
    onSave({ status: 'in_lucru', workerId: user.id })
  }

  function finish() {
    if (actualQty === '') return
    onSave({ status: 'finalizat', actualQty: Number(actualQty), workerId: user.id })
  }

  function submitComment() {
    if (!draft.trim()) return
    onAddComment(draft)
    setDraft('')
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 md:items-center" onClick={onClose}>
      <div
        className="safe-bottom max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border-t border-base-700 bg-base-900 p-5 md:max-w-md md:rounded-2xl md:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-base-600" />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{material.code}</p>
        <h2 className="mt-0.5 text-lg font-bold text-paper">{material.name}</h2>
        {container && (
          <p className="mt-0.5 text-sm text-steel">
            {container.type} <span className="font-mono text-xs text-muted">· {container.code}</span>
          </p>
        )}
        <p className="mt-1 text-sm text-muted">
          {t('work.requiredQty')} <span className="font-mono font-semibold text-paper">{item.plannedQty} {material.unit}</span>
        </p>
        <AuditLine item={item} className="mt-2" />

        {access.work && item.status === 'neinceput' && (
          <button
            onClick={start}
            className="tap mt-5 w-full rounded-lg bg-amber py-3.5 text-center text-[15px] font-bold text-ink"
          >
            {t('work.start')}
          </button>
        )}

        {access.work && item.status !== 'neinceput' && (
          <>
            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-muted">
              {t('work.actualQty', { unit: material.unit })}
            </label>
            <input
              type="number"
              inputMode="decimal"
              autoFocus
              value={actualQty}
              onChange={(e) => setActualQty(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-lg border border-base-600 bg-base-800 px-3 py-3 text-center font-mono text-xl font-bold text-paper outline-none focus:border-amber"
            />
            <button
              onClick={finish}
              disabled={actualQty === ''}
              className="tap mt-5 w-full rounded-lg bg-signal py-3.5 text-center text-[15px] font-bold text-ink disabled:opacity-40"
            >
              {t('work.markDone')}
            </button>
          </>
        )}

        <div className="mt-5 border-t border-base-700 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('common.comments')}</p>
          {comments.length > 0 && (
            <div className="mt-2 space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="font-semibold text-paper">{c.author}</span>{' '}
                  <span className="text-muted">· {formatDateTime(c.createdAt, locale)}</span>
                  <p className="mt-0.5 text-muted">{c.text}</p>
                </div>
              ))}
            </div>
          )}
          {access.comment && (
          <div className="mt-2.5 flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              placeholder={t('common.commentPlaceholder')}
              className="min-w-0 flex-1 rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-[13px] text-paper outline-none focus:border-amber"
            />
            <button
              onClick={submitComment}
              disabled={!draft.trim()}
              className="tap flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber text-ink disabled:opacity-40"
              aria-label={t('common.sendComment')}
            >
              <Send size={15} />
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
