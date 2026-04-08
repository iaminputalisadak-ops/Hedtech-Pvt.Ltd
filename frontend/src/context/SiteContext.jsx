import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getBootstrap } from '../api/client'

const SiteContext = createContext(null)

const empty = {
  settings: {},
  services: [],
  skills: [],
  projects: [],
  trusted: [],
  team: [],
  testimonials: [],
  blog: [],
}

export function SiteProvider({ children }) {
  const [data, setData] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getBootstrap()
      setData({
        settings: res.settings || {},
        services: res.services || [],
        skills: res.skills || [],
        projects: res.projects || [],
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

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used within SiteProvider')
  return ctx
}
