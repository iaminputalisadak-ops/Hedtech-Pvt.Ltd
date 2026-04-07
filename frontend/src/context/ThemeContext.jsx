import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const THEME_KEY = 'hedztech-theme'
const USER_OVERRIDE_KEY = 'hedztech-theme-user-override'

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readUserOverride() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(USER_OVERRIDE_KEY) === '1'
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  if (readUserOverride()) {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  }
  return getSystemTheme()
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const [userOverride, setUserOverride] = useState(readUserOverride)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.removeAttribute('data-palette')
  }, [theme])

  useEffect(() => {
    if (userOverride) {
      localStorage.setItem(THEME_KEY, theme)
      localStorage.setItem(USER_OVERRIDE_KEY, '1')
    }
  }, [theme, userOverride])

  useEffect(() => {
    localStorage.removeItem('hedztech-palette')
  }, [])

  useEffect(() => {
    if (userOverride) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      setTheme(mq.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [userOverride])

  const toggleTheme = () => {
    setUserOverride(true)
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  const value = useMemo(
    () => ({
      theme,
      userOverride,
      toggleTheme,
      setTheme,
      useSystemTheme: () => {
        localStorage.removeItem(USER_OVERRIDE_KEY)
        localStorage.removeItem(THEME_KEY)
        setUserOverride(false)
        setTheme(getSystemTheme())
      },
    }),
    [theme, userOverride],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
