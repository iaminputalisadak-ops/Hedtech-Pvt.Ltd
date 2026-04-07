import { useEffect } from 'react'

/**
 * After content is ready, scroll to document.getElementById(hashWithoutHash).
 */
export function useScrollToHash(hash, ready) {
  useEffect(() => {
    if (!ready || !hash) return
    const id = hash.replace(/^#/, '')
    if (!id) return

    let cancelled = false
    let attempts = 0
    const maxAttempts = 30

    const tick = () => {
      if (cancelled) return
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      attempts += 1
      if (attempts < maxAttempts) {
        requestAnimationFrame(tick)
      }
    }

    const t = window.setTimeout(tick, 80)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [hash, ready])
}
