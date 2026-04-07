import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { adminLogin, adminMe } from '../../api/client'
import { useTheme } from '../../context/ThemeContext'
import './admin.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await adminMe()
        if (!cancelled) setAuthed(true)
      } catch {
        /* not logged in */
      } finally {
        if (!cancelled) setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setErr(null)
    setSubmitting(true)
    try {
      await adminLogin({ username, password })
      setAuthed(true)
    } catch (ex) {
      setErr(ex.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="admin-app admin-login-simple">
        <div className="admin-spinner" style={{ width: 32, height: 32 }} aria-label="Loading" />
      </div>
    )
  }

  if (authed) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="admin-app admin-login-simple">
      <div className="admin-login-card-simple" style={{ position: 'relative' }}>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          style={{ position: 'absolute', top: 12, right: 12 }}
        >
          {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
        </button>

        <h1>Admin login</h1>
        <p>Sign in to edit your site.</p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-user">
              Username
            </label>
            <input
              id="admin-user"
              className="admin-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-pass">
              Password
            </label>
            <input
              id="admin-pass"
              className="admin-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {err ? (
            <div className="admin-alert admin-alert--error" role="alert">
              {err}
            </div>
          ) : null}

          <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ margin: '1.25rem 0 0', fontSize: '0.85rem' }}>
          <Link to="/" className="text-back-link">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}
