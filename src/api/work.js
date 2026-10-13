import { api } from './client'
import { normalizeItem, sectionNumber } from './projects'

// API-ul pentru cei care lucrează pe secții: doar secțiile lor și materialele acelor secții.
// Secțiile/proiectele închise nu apar; răspunsurile la modificări conțin doar materialele schimbate.
export const workApi = {
  sections: () =>
    api('/work/sections').then((res) => res.data.map((s) => ({ id: `s${s.id}`, pendingCount: s.pending_count }))),
  projects: (sectionId) =>
    api(`/work/sections/${sectionNumber(sectionId)}/projects`).then((res) =>
      res.data.map((p) => ({ id: p.id, name: p.name, code: p.code, itemsCount: p.items_count, pendingCount: p.pending_count }))
    ),
  items: (sectionId, projectId) =>
    api(`/work/sections/${sectionNumber(sectionId)}/projects/${projectId}/items`).then((res) => ({
      project: res.project,
      items: res.data.map(normalizeItem),
    })),
  // Operatorul adaugă un material doar pe secția lui; întoarce materialele noi (câte unul per container).
  addItems: (sectionId, projectId, { containerIds, material, plannedQty }) =>
    api(`/work/sections/${sectionNumber(sectionId)}/projects/${projectId}/items`, {
      method: 'POST',
      body: { container_ids: containerIds, material_id: material.id, planned_qty: plannedQty },
    }).then((res) => res.data.map(normalizeItem)),
  updateItem: (itemId, { status, actualQty }) => {
    const body = {}
    if (status !== undefined) body.status = status
    if (actualQty !== undefined) body.actual_qty = actualQty
    return api(`/work/items/${itemId}`, { method: 'PATCH', body }).then((res) => normalizeItem(res.data))
  },
  addComment: (itemId, text) =>
    api(`/work/items/${itemId}/comments`, { method: 'POST', body: { body: text } }).then((res) => normalizeItem(res.data)),
}
