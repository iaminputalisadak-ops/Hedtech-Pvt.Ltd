import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Always start in dark mode on load/refresh.
  // Light mode is available via the toggle, but is intentionally not persisted.
  const [theme, setTheme] = useState('dark')

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.removeAttribute('data-palette')
  }, [theme])

  useEffect(() => {
    localStorage.removeItem('hedztech-palette')
    localStorage.removeItem('hedztech-theme')
    localStorage.removeItem('hedztech-theme-user-override')
  }, [])

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
