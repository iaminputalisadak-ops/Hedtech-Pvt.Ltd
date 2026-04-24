import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getBootstrap } from '../api/client'

const SiteContext = createContext(null)

const empty = {
  settings: {},
  services: [],
  skills: [],
  projects: [],
  seo_pages: [],
  trusted: [],
  team: [],
  testimonials: [],
  blog: [],
}

export function SiteProvider({ children }) {
  const [data, setData] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async (opts = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getBootstrap({ force: opts.force === true })
      setData({
        settings: res.settings || {},
        services: res.services || [],
        skills: res.skills || [],
        projects: res.projects || [],
        seo_pages: res.seo_pages || [],
        trusted: res.trusted || [],
        team: res.team || [],
        testimonials: res.testimonials || [],
        blog: res.blog || [],
      })
    } catch (e) {
      setError(e.message || 'Failed to load content')
      setData(empty)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      ...data,
      loading,
      error,
      refresh,
      settings: data.settings,
    }),
    [data, loading, error, refresh],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used within SiteProvider')
  return ctx
}
