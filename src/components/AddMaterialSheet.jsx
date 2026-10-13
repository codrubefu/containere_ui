import { useEffect, useState } from 'react'
import { Search, Loader2, Check } from 'lucide-react'
import { SECTIONS } from '../data/mockData'
import { materialsApi } from '../api/client'
import { useI18n } from '../i18n'

// `catalog`: materialsApi (proiectanți) sau workMaterialsApi (operatori).
// Cu `fixedSectionId` secția nu se mai alege — operatorii adaugă doar pe secția lor.
export default function AddMaterialSheet({ containers, initialContainerIds, catalog = materialsApi, fixedSectionId, onClose, onAdd }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState('')
  const [sectionId, setSectionId] = useState(fixedSectionId ?? '')
  const [containerIds, setContainerIds] = useState(initialContainerIds)
  const allSelected = containerIds.length === containers.length

  function toggleContainer(id) {
    setContainerIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }

  const [categories, setCategories] = useState([])
  const [list, setList] = useState({ items: [], page: 0, lastPage: 1, loading: true, error: false })

  useEffect(() => {
    catalog
      .categories()
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
  }, [])

  // Căutare cu debounce; orice schimbare de text/categorie repornește de la pagina 1.
  useEffect(() => {
    let cancelled = false
    setList((l) => ({ ...l, loading: true, error: false }))
    const timer = setTimeout(() => {
      catalog
        .list({ search: query.trim(), category, page: 1 })
        .then((res) => !cancelled && setList({ items: res.data, page: 1, lastPage: res.meta.last_page, loading: false, error: false }))
        .catch(() => !cancelled && setList({ items: [], page: 0, lastPage: 1, loading: false, error: true }))
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, category])

  function loadMore() {
    setList((l) => ({ ...l, loading: true }))
    catalog
      .list({ search: query.trim(), category, page: list.page + 1 })
      .then((res) => setList((l) => ({ items: [...l.items, ...res.data], page: res.meta.current_page, lastPage: res.meta.last_page, loading: false, error: false })))
      .catch(() => setList((l) => ({ ...l, loading: false, error: true })))
  }

  function submit() {
    if (!selected || !qty || !sectionId || containerIds.length === 0) return
    const { id, code, name, unit } = selected
    onAdd({ containerIds, material: { id, code, name, unit }, plannedQty: Number(qty), sectionId })
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 md:items-center" onClick={onClose}>
      <div
        className="safe-bottom flex max-h-[85vh] w-full flex-col rounded-t-2xl border-t border-base-700 bg-base-900 md:max-w-2xl md:rounded-2xl md:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-base-600" />
        <div className="px-5 pb-2 pt-3">
          <h2 className="text-lg font-bold text-paper">{t('project.addMaterial')}</h2>
        </div>

        {!selected ? (
          <>
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 rounded-lg border border-base-600 bg-base-800 px-3 py-2.5">
                <Search size={17} className="text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('common.searchNameOrCode')}
                  className="w-full bg-transparent text-[15px] text-paper outline-none placeholder:text-muted"
                />
              </div>
              <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setCategory('')}
                  className={`tap shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    category === '' ? 'border-amber bg-amber/15 text-amber' : 'border-base-600 text-muted'
                  }`}
                >
                  {t('add.all')}
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`tap shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      category === c ? 'border-amber bg-amber/15 text-amber' : 'border-base-600 text-muted'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-6">
              {list.error && (
                <p className="mx-2 mb-3 rounded-lg border border-alert/40 bg-alert/10 px-3 py-2 text-xs text-alert">{t('add.loadError')}</p>
              )}
              {!list.loading && !list.error && list.items.length === 0 && (
                <p className="px-2 py-6 text-center text-sm text-muted">{t('add.none')}</p>
              )}
              {list.items.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-base-700">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead className="sticky top-0 bg-base-800">
                      <tr>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('add.colName')}</th>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('add.colCode')}</th>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('add.colCategory')}</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">{t('add.colUnit')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-800">
                      {list.items.map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => setSelected(m)}
                          className="tap cursor-pointer active:bg-base-800"
                        >
                          <td className="px-3 py-2.5 text-[14px] text-paper">{m.name}</td>
                          <td className="px-3 py-2.5 font-mono text-xs text-muted">{m.code}</td>
                          <td className="px-3 py-2.5 text-xs text-steel">{m.category}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs text-muted">{m.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            <div className="mb-4 flex items-center justify-between rounded-lg border border-base-700 bg-base-800 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-paper">{selected.name}</p>
                <p className="font-mono text-xs text-muted">
                  {selected.code} <span className="text-steel">· {selected.category}</span>
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="tap shrink-0 text-xs font-semibold text-amber">
                {t('add.change')}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t('add.containers')} <span className="normal-case">· {containerIds.length}/{containers.length}</span>
              </label>
              {containers.length > 1 && (
                <button
                  onClick={() => setContainerIds(allSelected ? [] : containers.map((c) => c.id))}
                  className="tap text-xs font-semibold text-amber"
                >
                  {allSelected ? t('add.selectNone') : t('add.selectAll')}
                </button>
              )}
            </div>
            <div className="mb-4 mt-1 grid max-h-56 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {containers.map((c) => {
                const checked = containerIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleContainer(c.id)}
                    aria-pressed={checked}
                    className={`tap flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left ${
                      checked ? 'border-amber bg-amber/15' : 'border-base-600 bg-base-800'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked ? 'border-amber bg-amber text-ink' : 'border-base-600'
                      }`}
                    >
                      {checked && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className={`block truncate text-sm font-medium ${checked ? 'text-amber' : 'text-paper'}`}>{c.type}</span>
                      <span className="block font-mono text-[11px] text-muted">{c.code}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              {containerIds.length > 1
                ? t('add.requiredQtyPerContainer', { unit: selected.unit })
                : t('add.requiredQty', { unit: selected.unit })}
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2.5 font-mono text-[15px] text-paper outline-none focus:border-amber"
            />

            {fixedSectionId && (
              <p className="mt-4 text-xs text-muted">{t('work.addHint', { section: t(`section.${fixedSectionId}`) })}</p>
            )}
            {!fixedSectionId && (
            <>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-muted">
              {t('add.section')}
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSectionId(s.id)}
                  className={`tap rounded-lg border px-3 py-2.5 text-sm font-medium ${
                    sectionId === s.id
                      ? 'border-amber bg-amber/15 text-amber'
                      : 'border-base-600 bg-base-800 text-paper'
                  }`}
                >
                  {t(`section.${s.id}`)}
                </button>
              ))}
            </div>
            </>
            )}

            <button
              onClick={submit}
              disabled={!qty || !sectionId || containerIds.length === 0}
              className="tap mt-6 w-full rounded-lg bg-amber py-3.5 text-center text-[15px] font-bold text-ink disabled:opacity-40"
            >
              {containerIds.length > 1 ? t('add.submitMany', { count: containerIds.length }) : t('add.submit')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
