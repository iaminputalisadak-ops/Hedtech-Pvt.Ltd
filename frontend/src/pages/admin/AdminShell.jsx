import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import './admin.css'

function resolveExternalUrl(raw, fallback) {
  const v = String(raw || '').trim()
  if (!v) return fallback
  if (/^https?:\/\//i.test(v)) return v
  if (v.startsWith('/')) return `${window.location.origin}${v}`
  return `${window.location.origin}/${v}`
}

export default function AdminShell({ activeTab, onTabChange, onLogout, children, topTitle, loading }) {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const frontendUrl = resolveExternalUrl(import.meta.env.VITE_FRONTEND_URL, window.location.origin)
  const backendUrl = resolveExternalUrl(
    import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE,
    `${window.location.origin}/api`,
  )

  const NAV_GROUPS = [
    {
      title: 'Website',
      items: [
        { id: 'settings', label: 'Settings' },
        { id: 'seo-pages', label: 'SEO' },
      ],
    },
    {
      title: 'Content',
      items: [
        { id: 'projects', label: 'Projects' },
        { id: 'blog', label: 'Blog' },
        { id: 'services', label: 'Services' },
        { id: 'team', label: 'Team' },
        { id: 'skills', label: 'Skills' },
      ],
    },
    {
      title: 'Social proof',
      items: [
        { id: 'testimonials', label: 'Client reviews' },
        { id: 'trusted', label: 'Partner logos' },
      ],
    },
    {
      title: 'Inbox',
      items: [{ id: 'messages', label: 'Messages' }],
    },
  ]

  return (
    <div className="admin-app">
      <div className={`admin-sidebar-backdrop ${open ? 'is-visible' : ''}`} aria-hidden={!open} onClick={() => setOpen(false)} />

      <div className="admin-shell">
        <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Menu">
          <div className="admin-sidebar-brand">
            <Link to="/" className="admin-sidebar-brand-link" onClick={() => setOpen(false)}>
              Hedztech admin
            </Link>
          </div>

          <nav className="admin-sidebar-nav">
            {NAV_GROUPS.map((g) => (
              <div key={g.title} className="admin-nav-group">
                <div className="admin-nav-group-title">{g.title}</div>
                {g.items.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`admin-nav-btn ${activeTab === id ? 'is-active' : ''}`}
                    onClick={() => {
                      onTabChange(id)
                      setOpen(false)
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <Link to="/" className="admin-nav-btn" onClick={() => setOpen(false)}>
              ← View website
            </Link>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--icon admin-menu-toggle"
                aria-label={open ? 'Close menu' : 'Menu'}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="admin-topbar-title">
                {topTitle || 'Admin'}
                {loading ? <span className="admin-spinner" aria-label="Loading" /> : null}
              </h1>
            </div>
            <div className="admin-topbar-actions">
              <a
                className="admin-btn admin-btn--ghost"
                href={frontendUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open frontend in a new tab"
              >
                <span className="admin-hide-sm">Open frontend</span>
                <span className="admin-hide-lg">Frontend</span>
              </a>
              <a
                className="admin-btn admin-btn--ghost"
                href={backendUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open backend in a new tab"
              >
                <span className="admin-hide-sm">Open backend</span>
                <span className="admin-hide-lg">Backend</span>
              </a>
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--icon" onClick={toggleTheme} aria-label="Theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={onLogout}>
                <LogOut size={16} />
                <span className="admin-hide-sm">Log out</span>
              </button>
            </div>
          </header>

          <div className="admin-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
