import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Box, Loader2 } from 'lucide-react'
import { contractsApi } from '../api/client'
import Header from '../components/Header'
import { useI18n } from '../i18n'

const GROUPS = [
  { status: 'in_productie', title: 'projects.groupInProgress' },
  { status: 'draft', title: 'projects.groupNotStarted' },
  { status: 'finalizat', title: 'projects.groupDone' },
]

export default function AdminHome({ projects, canCreate, onOpenProject, onCreateProject }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [showNew, setShowNew] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
  }, [projects, query])

  const grouped = useMemo(() => {
    const map = { in_productie: [], draft: [], finalizat: [] }
    for (const p of filtered) map[p.status]?.push(p)
    return map
  }, [filtered])

  return (
    <div className="min-h-screen bg-base-950 pb-24 md:pb-8">
      <Header title={t('nav.projects')} subtitle={t('projects.count', { count: projects.length })} />

      <div className="px-3 pt-3 md:px-0">
        <div className="flex items-center gap-2 rounded-lg border border-base-600 bg-base-800 px-3 py-2.5">
          <Search size={17} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.searchNameOrCode')}
            className="w-full bg-transparent text-[15px] text-paper outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <div className="mt-4 space-y-5 px-3 md:px-0">
        {GROUPS.map(({ status, title }) => {
          const items = grouped[status]
          if (items.length === 0) return null
          return (
            <div key={status}>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-steel">
                {t(title)} <span className="text-muted">· {items.length}</span>
              </p>
              <div className="divide-y divide-base-800 rounded-xl border border-base-700 bg-base-900">
                {items.map((p) => (
                  <ProjectRow key={p.id} project={p} onOpen={() => onOpenProject(p.id)} />
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-base-600 p-6 text-center">
            <p className="text-sm text-muted">{t('projects.none')}</p>
          </div>
        )}
      </div>

      {canCreate && (
      <button
        onClick={() => setShowNew(true)}
        className="tap fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-amber text-ink shadow-lg shadow-black/40 md:bottom-8 md:right-8"
        aria-label={t('projects.new')}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
      )}

      {canCreate && showNew && (
        <NewProjectSheet
          projects={projects}
          onClose={() => setShowNew(false)}
          onCreate={(payload) => {
            onCreateProject(payload)
            setShowNew(false)
          }}
        />
      )}
    </div>
  )
}

function ProjectRow({ project, onOpen }) {
  const { t } = useI18n()
  const doneCount = project.items.filter((i) => i.status === 'finalizat').length
  const containerCount = project.containers.length
  return (
    <button onClick={onOpen} className="tap flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-base-800">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-paper">{project.name}</p>
        <p className="font-mono text-xs text-muted">{project.code}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-muted">
          {t('projects.containersCount', { count: containerCount })} ·{' '}
          {t('projects.materialsCount', { count: project.items.length })}
          {project.items.length > 0 && ` · ${t('projects.doneShort', { count: doneCount })}`}
        </p>
        {project.deadline && <p className="text-xs text-muted">{project.deadline}</p>}
      </div>
    </button>
  )
}

function NewProjectSheet({ projects, onClose, onCreate }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [list, setList] = useState({ items: [], page: 0, lastPage: 1, loading: true, error: false })
  const [contract, setContract] = useState(null)
  const [opening, setOpening] = useState(null) // id-ul contractului care se încarcă
  const [openError, setOpenError] = useState(false)
  const [name, setName] = useState('')
  const [deadline, setDeadline] = useState('')

  // Căutare cu debounce; fiecare căutare nouă repornește de la pagina 1.
  useEffect(() => {
    let cancelled = false
    setList((l) => ({ ...l, loading: true, error: false }))
    const timer = setTimeout(() => {
      contractsApi
        .list({ search: query.trim(), page: 1 })
        .then((res) => !cancelled && setList({ items: res.data, page: 1, lastPage: res.meta.last_page, loading: false, error: false }))
        .catch(() => !cancelled && setList({ items: [], page: 0, lastPage: 1, loading: false, error: true }))
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  function loadMore() {
    setList((l) => ({ ...l, loading: true }))
    contractsApi
      .list({ search: query.trim(), page: list.page + 1 })
      .then((res) => setList((l) => ({ items: [...l.items, ...res.data], page: res.meta.current_page, lastPage: res.meta.last_page, loading: false, error: false })))
      .catch(() => setList((l) => ({ ...l, loading: false, error: true })))
  }

  // Un contract are un singur proiect — cele deja folosite nu mai apar în listă.
  const available = useMemo(() => {
    const used = new Set(projects.map((p) => p.contract.id))
    return list.items.filter((c) => !used.has(c.id))
  }, [projects, list.items])

  async function selectContract(c) {
    setOpening(c.id)
    setOpenError(false)
    try {
      const res = await contractsApi.show(c.id)
      setContract(res.data)
      setName(res.data.client?.name ?? res.data.number)
      setDeadline('')
    } catch {
      setOpenError(true)
    } finally {
      setOpening(null)
    }
  }

  function submit() {
    if (!contract || !name.trim()) return
    onCreate({ contract, name: name.trim(), deadline })
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 md:items-center" onClick={onClose}>
      <div
        className="safe-bottom flex max-h-[85vh] w-full flex-col rounded-t-2xl border-t border-base-700 bg-base-900 md:max-w-md md:rounded-2xl md:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-base-600" />
        <div className="px-5 pb-2 pt-3">
          <h2 className="text-lg font-bold text-paper">{t('projects.new')}</h2>
          {!contract && <p className="mt-0.5 text-sm text-muted">{t('projects.selectContract')}</p>}
        </div>

        {!contract ? (
          <>
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 rounded-lg border border-base-600 bg-base-800 px-3 py-2.5">
                <Search size={17} className="text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('projects.searchContract')}
                  className="w-full bg-transparent text-[15px] text-paper outline-none placeholder:text-muted"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {(list.error || openError) && (
                <p className="mb-3 rounded-lg border border-alert/40 bg-alert/10 px-3 py-2 text-xs text-alert">{t('projects.contractsError')}</p>
              )}
              {!list.loading && !list.error && available.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">{t('projects.noContracts')}</p>
              ) : (
                available.length > 0 && (
                  <div className="divide-y divide-base-800 rounded-xl border border-base-700">
                    {available.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => selectContract(c)}
                        disabled={opening !== null}
                        className="tap flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-base-800 disabled:opacity-60"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-paper">{c.client?.name || '—'}</p>
                          <p className="truncate font-mono text-xs text-muted">
                            {c.number} {c.type && <span className="text-steel">· {c.type}</span>}
                          </p>
                        </div>
                        {opening === c.id ? (
                          <Loader2 size={16} className="shrink-0 animate-spin text-amber" />
                        ) : (
                          <span className="shrink-0 text-xs text-muted">
                            {t('projects.containersCount', { count: c.containers_count })}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}
              {list.loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-muted" />
                </div>
              ) : (
                !list.error && list.page < list.lastPage && (
                  <button onClick={loadMore} className="tap mt-3 w-full rounded-lg border border-base-600 py-2.5 text-sm font-semibold text-paper">
                    {t('projects.loadMore')}
                  </button>
                )
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <div className="rounded-lg border border-base-700 bg-base-800 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-paper">{contract.client?.name || '—'}</p>
                  <p className="font-mono text-xs text-muted">{contract.number}</p>
                </div>
                <button onClick={() => setContract(null)} className="tap shrink-0 text-xs font-semibold text-amber">
                  {t('add.change')}
                </button>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {t('projects.containersCount', { count: contract.containers.length })}
              </p>
              <ul className="mt-1.5 max-h-40 space-y-1 overflow-y-auto">
                {contract.containers.map((ct) => (
                  <li key={ct.id} className="flex items-center gap-2 text-[13px]">
                    <Box size={14} className="shrink-0 text-steel" />
                    <span className="font-mono text-xs text-muted">{ct.code}</span>
                    <span className="truncate text-paper">{ct.type}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted">{t('projects.name')}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('projects.namePlaceholder')}
                  className="mt-1 w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2.5 text-[15px] text-paper outline-none focus:border-amber"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted">{t('projects.deadline')}</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2.5 text-[15px] text-paper outline-none focus:border-amber"
                />
              </div>
            </div>
            <button
              onClick={submit}
              disabled={!name.trim()}
              className="tap mt-5 w-full rounded-lg bg-amber py-3.5 text-center text-[15px] font-bold text-ink disabled:opacity-40"
            >
              {t('projects.create')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
