import { api } from './client'

// API-ul folosește id-uri numerice și snake_case; ecranele lucrează cu 's1' / 'u3' și camelCase
// (vezi normalizeUser din auth/permissions.js).

export function normalizeItem(item) {
  return {
    id: item.id,
    containerId: item.container_id,
    sectionId: `s${item.section_id}`,
    material: item.material,
    plannedQty: item.planned_qty,
    actualQty: item.actual_qty,
    status: item.status,
    workerId: item.worker_id ? `u${item.worker_id}` : null,
    comments: (item.comments ?? []).map((c) => ({ id: c.id, author: c.author, text: c.body, createdAt: c.created_at })),
    container: item.container ?? null, // doar în răspunsurile /work
    createdBy: item.created_by ?? null, // { id, name } — cine a adăugat materialul
    updatedBy: item.updated_by ?? null, // { id, name } — cine l-a modificat ultimul
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export function normalizeProject(project) {
  return {
    id: project.id,
    name: project.name,
    code: project.contract.number,
    status: project.status,
    deadline: project.deadline,
    contract: project.contract,
    containers: project.containers ?? [],
    items: (project.items ?? []).map(normalizeItem),
  }
}

export const sectionNumber = (sectionId) => Number(String(sectionId).replace(/^s/, ''))
const one = (res) => normalizeProject(res.data)

// Toate modificările întorc proiectul complet, actualizat.
export const projectsApi = {
  list: () => api('/projects').then((res) => res.data.map(normalizeProject)),
  create: ({ contractId, name, deadline }) =>
    api('/projects', { method: 'POST', body: { contract_id: contractId, name, deadline: deadline || null } }).then(one),
  close: (projectId) => api(`/projects/${projectId}/close`, { method: 'POST' }).then(one),
  reopen: (projectId) => api(`/projects/${projectId}/reopen`, { method: 'POST' }).then(one),
  addItems: (projectId, { containerIds, material, plannedQty, sectionId }) =>
    api(`/projects/${projectId}/items`, {
      method: 'POST',
      body: { container_ids: containerIds, material_id: material.id, planned_qty: plannedQty, section_id: sectionNumber(sectionId) },
    }).then(one),
  updateItem: (itemId, { status, actualQty }) => {
    const body = {}
    if (status !== undefined) body.status = status
    if (actualQty !== undefined) body.actual_qty = actualQty
    return api(`/project-items/${itemId}`, { method: 'PATCH', body }).then(one)
  },
  removeItem: (itemId) => api(`/project-items/${itemId}`, { method: 'DELETE' }).then(one),
  addComment: (itemId, text) => api(`/project-items/${itemId}/comments`, { method: 'POST', body: { body: text } }).then(one),
}
