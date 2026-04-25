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
  const isForm = typeof FormData !== 'undefined' && rest?.body instanceof FormData
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
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

const BOOTSTRAP_TTL_MS = 45_000
let bootstrapCache = { t: 0, data: null }

export async function getBootstrap(options = {}) {
  const force = Boolean(options.force)
  const now = Date.now()
  if (!force && bootstrapCache.data && now - bootstrapCache.t < BOOTSTRAP_TTL_MS) {
    return bootstrapCache.data
  }
  const data = await apiFetch('/public/bootstrap')
  bootstrapCache = { t: now, data }
  return data
}

export function getTeam() {
  return apiFetch('/public/team')
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

async function maybeCompressImageUpload(file, { kind = 'asset' } = {}) {
  if (!file || typeof file !== 'object') return file
  const type = String(file.type || '').toLowerCase()
  if (!type.startsWith('image/')) return file
  if (type.includes('svg') || type.includes('gif') || type.includes('x-icon')) return file

  // If it's already small enough, don't spend CPU recompressing.
  const bytes = Number(file.size || 0)
  if (bytes > 0 && bytes < 450_000) return file

  // Hero/OG assets are the biggest Lighthouse offenders → compress more aggressively.
  const heroLike = String(kind).includes('hero') || String(kind).includes('og')
  const maxEdge = heroLike ? 1600 : 1920
  const quality = heroLike ? 0.78 : 0.82

  try {
    const bitmap = await createImageBitmap(file)
    const sw = bitmap.width || 0
    const sh = bitmap.height || 0
    if (sw < 1 || sh < 1) return file
    const scale = Math.min(1, maxEdge / Math.max(sw, sh))
    const tw = Math.max(1, Math.round(sw * scale))
    const th = Math.max(1, Math.round(sh * scale))

    const canvas = document.createElement('canvas')
    canvas.width = tw
    canvas.height = th
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, tw, th)

    const blob = await new Promise((resolve) => {
      // Prefer WebP for big uploads; browsers that can’t encode will fall back below.
      canvas.toBlob(resolve, 'image/webp', quality)
    })

    if (blob && blob.size > 0 && blob.size < bytes) {
      const safeBase = String(file.name || 'upload').replace(/\.[^.]+$/, '')
      return new File([blob], `${safeBase}.webp`, { type: 'image/webp' })
    }

    return file
  } catch {
    return file
  }
}

export async function adminUpload(file, { kind = 'asset' } = {}) {
  const uploadFile = await maybeCompressImageUpload(file, { kind })
  const fd = new FormData()
  fd.set('file', uploadFile)
  fd.set('kind', kind)
  return apiFetch('/admin/upload', { method: 'POST', body: fd })
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
