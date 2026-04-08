import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import './admin.css'

const NAV = [
  { id: 'settings', label: 'Settings' },
  { id: 'services', label: 'Services' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog' },
  { id: 'trusted', label: 'Partner logos' },
  { id: 'testimonials', label: 'Client reviews' },
  { id: 'team', label: 'Team' },
  { id: 'messages', label: 'Messages' },
]

export default function AdminShell({ activeTab, onTabChange, onLogout, children, topTitle, loading }) {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

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
            {NAV.map(({ id, label }) => (
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
