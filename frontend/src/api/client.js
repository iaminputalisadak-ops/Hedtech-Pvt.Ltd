const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export async function parseJson(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  })
  const data = await parseJson(res)
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export function getBootstrap() {
  return apiFetch('/public/bootstrap')
}

export function getBlogList(params = {}) {
  const q = new URLSearchParams(params).toString()
  return apiFetch(`/public/blog${q ? `?${q}` : ''}`)
}

export function getBlogPost(slug) {
  return apiFetch(`/public/blog/${encodeURIComponent(slug)}`)
}

export function getProject(slug) {
  return apiFetch(`/public/projects/${encodeURIComponent(slug)}`)
}

export function submitContact(body) {
  return apiFetch('/public/contact', { method: 'POST', body: JSON.stringify(body) })
}

export function adminLogin(body) {
  return apiFetch('/admin/login', { method: 'POST', body: JSON.stringify(body) })
}

export function adminLogout() {
  return apiFetch('/admin/logout', { method: 'POST', body: JSON.stringify({}) })
}

export function adminMe() {
  return apiFetch('/admin/me')
}

export function adminPatchSettings(patch) {
  return apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(patch) })
}

export function adminList(resource) {
  return apiFetch(`/admin/${resource}`)
}

export function adminCreate(resource, body) {
  return apiFetch(`/admin/${resource}`, { method: 'POST', body: JSON.stringify(body) })
}

export function adminUpdate(resource, id, body) {
  return apiFetch(`/admin/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function adminDelete(resource, id) {
  return apiFetch(`/admin/${resource}/${id}`, { method: 'DELETE' })
}

export function adminContactMessages() {
  return apiFetch('/admin/contact-messages')
}
