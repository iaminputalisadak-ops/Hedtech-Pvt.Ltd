/** Turn a site-relative path (/api/...) or absolute URL into a full URL for meta / JSON-LD. */
export function absoluteUrlFromBase(pathOrUrl, baseNoSlash) {
  const raw = (pathOrUrl || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  const b = (baseNoSlash || '').replace(/\/$/, '')
  if (!b) return raw
  if (raw.startsWith('/')) return `${b}${raw}`
  return `${b}/${raw}`
}
