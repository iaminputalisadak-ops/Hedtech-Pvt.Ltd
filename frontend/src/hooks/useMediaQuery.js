import { useSyncExternalStore } from 'react'

/**
 * @param {string} query CSS media query, e.g. '(min-width: 1024px)'
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
