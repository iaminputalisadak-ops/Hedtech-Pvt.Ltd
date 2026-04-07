import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import HomeHashLink from './HomeHashLink'
import SiteBrand from './SiteBrand'
import ThemeToggle from './ThemeToggle'
import { homeSections, navPillStyle, pathNav } from './siteNav'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [shrunk, setShrunk] = useState(false)

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <motion.header
      className="site-header site-chrome site-chrome--top"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        '--site-chrome-bg-pct': `${Math.round(shrunk ? 88 : 72)}%`,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
      initial={false}
      animate={{ height: shrunk ? 64 : 72 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {open ? (
        <button
          type="button"
          className="site-header-backdrop"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div
        className="container site-header-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          paddingBlock: '0.35rem',
          position: 'relative',
          zIndex: 2,
          gap: '0.5rem',
          minWidth: 0,
        }}
      >
        <SiteBrand onClick={() => setOpen(false)} />

        <nav className="desktop-nav" aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
          {homeSections.map((item) => (
            <HomeHashLink
              key={item.id}
              sectionId={item.id}
              className="nav-pill"
              style={navPillStyle(false)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </HomeHashLink>
          ))}
          {pathNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
              style={({ isActive }) => navPillStyle(isActive)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            className="nav-pill"
            style={navPillStyle(false)}
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
        </nav>

        <div className="header-theme-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <ThemeToggle />
          <Link to="/contact" className="btn btn-primary desktop-cta" onClick={() => setOpen(false)}>
            Get started
          </Link>
          <button
            type="button"
            className="mobile-toggle btn btn-ghost"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setOpen((v) => !v)}
            style={{ padding: '0.55rem', borderRadius: 12, flexShrink: 0 }}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>

      {open ? (
        <motion.div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="glass site-header-mobile-nav"
          style={{
            margin: '0.5rem max(1rem, var(--site-pad-x)) 1rem',
            marginBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            position: 'relative',
            zIndex: 2,
            maxHeight: 'min(70vh, calc(100dvh - 5.5rem))',
            overflowY: 'auto',
          }}
        >
          {homeSections.map((item) => (
            <HomeHashLink
              key={item.id}
              sectionId={item.id}
              onClick={() => setOpen(false)}
              style={{ padding: '0.65rem 0.75rem', borderRadius: 10, fontWeight: 600 }}
            >
              {item.label}
            </HomeHashLink>
          ))}
          {pathNav.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)} style={{ padding: '0.65rem 0.75rem', borderRadius: 10, fontWeight: 600 }}>
              {item.label}
            </Link>
          ))}
          <Link to="/contact" onClick={() => setOpen(false)} style={{ padding: '0.65rem 0.75rem', borderRadius: 10, fontWeight: 600 }}>
            Contact
          </Link>
          <Link to="/contact" className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => setOpen(false)}>
            Get started
          </Link>
        </motion.div>
      ) : null}

      <style>{`
        .site-header-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1;
          margin: 0;
          padding: 0;
          border: none;
          border-radius: 0;
          background: color-mix(in srgb, var(--text) 42%, transparent);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .site-header-backdrop:focus {
          outline: none;
        }
        html[data-theme='light'] .site-header-backdrop {
          background: color-mix(in srgb, var(--text) 28%, transparent);
        }
        @media (max-width: 960px) {
          .desktop-nav,
          .desktop-cta {
            display: none !important;
          }
        }
        @media (min-width: 961px) {
          .mobile-toggle {
            display: none !important;
          }
          .site-header-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </motion.header>
  )
}
