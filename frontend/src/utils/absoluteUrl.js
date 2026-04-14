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

/**
 * Normalize CMS / upload URLs for `<img src>` on the current origin.
 * - Rewrites legacy `/uploads/…` to `/api/uploads/…` (cPanel deploys PHP under `/api/`).
 * - Rewrites `http(s)://localhost…` / `127.0.0.1` absolute URLs to the current origin when the
 *   page is not served from dev (fixes admin uploads saved with a dev base URL).
 * - Upgrades `http:` to `https:` for same host when the page is HTTPS (avoids mixed-content blocks).
 */
export function resolvePublicAssetUrl(src) {
  const raw = (src ?? '').toString().trim()
  if (!raw) return ''
  if (raw.startsWith('//')) return raw
  if (raw.startsWith('/uploads/')) return `/api${raw}`

  if (!/^https?:\/\//i.test(raw)) return raw

  try {
    const u = new URL(raw)
    if (typeof window !== 'undefined') {
      const here = window.location
      const isDevHost = (h) => h === 'localhost' || h === '127.0.0.1'
      // Vite (e.g. :5173) proxies `/api` to PHP — absolute `http://127.0.0.1:8080/api/...` uploads bypass the proxy and break.
      const hereOrigin = here.origin
      const urlOrigin = u.origin
      if (
        hereOrigin !== urlOrigin &&
        isDevHost(u.hostname) &&
        (u.port === '8080' || u.port === '8000')
      ) {
        return `${u.pathname}${u.search}${u.hash}`
      }
      if (isDevHost(u.hostname) && !isDevHost(here.hostname)) {
        return `${here.origin}${u.pathname}${u.search}${u.hash}`
      }
      if (here.protocol === 'https:' && u.protocol === 'http:' && u.hostname === here.hostname) {
        u.protocol = 'https:'
        return u.toString()
      }
    }
    return raw
  } catch {
    return raw
  }
}
