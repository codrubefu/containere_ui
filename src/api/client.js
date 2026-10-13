// Client minimal pentru container_api (Laravel + Sanctum, token Bearer).

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8093/api').replace(/\/$/, '')
const TOKEN_KEY = 'auth_token'

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `HTTP ${status}`)
    this.status = status // 0 = serverul nu a putut fi contactat
    this.body = body
  }

  // Primul câmp cu eroare de validare (422), ex. 'email', 'code', 'challenge_id'.
  get field() {
    return Object.keys(this.body?.errors ?? {})[0] ?? null
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, null)
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export const authApi = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password, device_name: 'ui' } }),
  verify: (challengeId, code) => api('/auth/verify', { method: 'POST', body: { challenge_id: challengeId, code } }),
  resend: (challengeId) => api('/auth/resend', { method: 'POST', body: { challenge_id: challengeId } }),
  me: () => api('/auth/me'),
  logout: () => api('/auth/logout', { method: 'POST' }),
}

// Contractele ERP — doar pentru popularea proiectelor noi (necesită projects.create).
export const contractsApi = {
  list: ({ search = '', page = 1 } = {}) =>
    api(`/contracts?${new URLSearchParams({ search, page, per_page: 30 })}`),
  show: (id) => api(`/contracts/${id}`),
}

// Nomenclatorul ERP de producție — pentru adăugarea materialelor.
const materialCatalog = (prefix) => ({
  list: ({ search = '', category = '', page = 1 } = {}) =>
    api(`${prefix}/materials?${new URLSearchParams({ search, category, page, per_page: 50 })}`),
  categories: () => api(`${prefix}/material-categories`),
})
export const materialsApi = materialCatalog('') // proiectanți (project_items.manage)
export const workMaterialsApi = materialCatalog('/work') // operatori (project_items.work)
