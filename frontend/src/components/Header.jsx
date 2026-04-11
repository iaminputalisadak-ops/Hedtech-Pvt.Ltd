import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion as Motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import SiteBrand from './SiteBrand'
import ThemeToggle from './ThemeToggle'
import { primaryNav } from './siteNav'

/** NavLink `end`: false so /work/*, /blog/*, and /services/* stay highlighted on child routes. */
const NAV_LINK_END_EXACT = new Set(['/about', '/expertise', '/reviews', '/team', '/contact'])

/** Same breakpoint as `.desktop-nav` / `.mobile-toggle` in this file — scroll-hide only applies here. */
const DESKTOP_HEADER_MQ = '(min-width: 961px)'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [shrunk, setShrunk] = useState(false)
  /** Desktop only: false = bar slid up (hidden); scroll down sets true. Mobile never uses false. */
  const [headerRevealed, setHeaderRevealed] = useState(true)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_HEADER_MQ).matches,
  )
  const toggleBtnRef = useRef(null)
  const sheetRef = useRef(null)
  const lastScrollY = useRef(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_HEADER_MQ)
    const onMq = () => {
      const d = mq.matches
      setIsDesktop(d)
      if (!d) setHeaderRevealed(true)
    }
    onMq()
    mq.addEventListener('change', onMq)
    return () => mq.removeEventListener('change', onMq)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setShrunk(y > 24)

      if (!window.matchMedia(DESKTOP_HEADER_MQ).matches) {
        lastScrollY.current = y
        return
      }
      if (open || reduceMotion) {
        setHeaderRevealed(true)
        lastScrollY.current = y
        return
      }

      if (y <= 0) {
        setHeaderRevealed(true)
        lastScrollY.current = y
        return
      }

      const prev = lastScrollY.current
      if (y < prev) {
        setHeaderRevealed(false)
      } else if (y > prev) {
        setHeaderRevealed(true)
      }
      lastScrollY.current = y
    }

    lastScrollY.current = window.scrollY
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open, reduceMotion])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return

      const root = sheetRef.current
      if (!root) return
      const focusables = root.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')
      const list = Array.from(focusables).filter((el) => el.offsetParent !== null)
      if (!list.length) return

      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => {
      const root = sheetRef.current
      const first = root?.querySelector('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])') || root
      first?.focus?.()
    }, 0)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (open) return
    toggleBtnRef.current?.focus?.()
  }, [open])

  const hideBarDesktop = isDesktop && !headerRevealed

  return (
    <Motion.header
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
      animate={{
        height: shrunk ? 64 : 72,
        y: hideBarDesktop ? '-100%' : 0,
      }}
      transition={{
        height: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0, ease: 'linear' },
      }}
    >
      <div className="container site-header-bar">
        <SiteBrand onClick={() => setOpen(false)} />

        <nav className="desktop-nav" aria-label="Primary">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={NAV_LINK_END_EXACT.has(item.to)}
              className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-theme-controls">
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
            ref={toggleBtnRef}
            onClick={() => setOpen((v) => !v)}
            style={{ padding: '0.55rem', borderRadius: 12, flexShrink: 0 }}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mobile-nav-layer" aria-hidden={false}>
          <button type="button" className="mobile-nav-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
          <Motion.aside
            id="mobile-menu"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            tabIndex={-1}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass mobile-nav-sheet"
          >
            <div className="mobile-nav-sheet-head">
              <SiteBrand onClick={() => setOpen(false)} />
              <button type="button" className="btn btn-ghost mobile-nav-close" onClick={() => setOpen(false)} aria-label="Close">
                <X size={22} aria-hidden />
              </button>
            </div>
            <nav className="mobile-nav-list" aria-label="Menu">
              {primaryNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={NAV_LINK_END_EXACT.has(item.to)}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `mobile-nav-item${isActive ? ' mobile-nav-item--active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to="/contact" className="btn btn-primary mobile-nav-cta" onClick={() => setOpen(false)}>
                Get started
              </Link>
            </nav>
          </Motion.aside>
        </div>
      ) : null}

      <style>{`
        .mobile-nav-layer {
          position: fixed;
          inset: 0;
          z-index: 90;
          pointer-events: auto;
        }
        .mobile-nav-backdrop {
          position: absolute;
          inset: 0;
          margin: 0;
          padding: 0;
          border: none;
          border-radius: 0;
          cursor: pointer;
          background: rgba(2, 6, 23, 0.72);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
        }
        html[data-theme='light'] .mobile-nav-backdrop {
          background: rgba(15, 23, 42, 0.44);
        }
        .mobile-nav-sheet {
          position: absolute;
          top: 0;
          right: 0;
          height: 100dvh;
          width: min(360px, 88vw);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow: hidden;
          border-left: 1px solid var(--border);
          /* Make the sheet opaque so page content doesn't show through */
          background: color-mix(in srgb, var(--bg-elevated) 96%, #000 4%);
          box-shadow:
            -24px 0 80px rgba(0, 0, 0, 0.45),
            -6px 0 22px rgba(0, 0, 0, 0.22);
        }
        html[data-theme='light'] .mobile-nav-sheet {
          background: color-mix(in srgb, var(--bg-elevated) 96%, #fff 4%);
          box-shadow:
            -24px 0 80px rgba(0, 0, 0, 0.18),
            -6px 0 22px rgba(0, 0, 0, 0.1);
        }
        .mobile-nav-sheet-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding-top: env(safe-area-inset-top, 0px);
        }
        .mobile-nav-close {
          padding: 0.55rem;
          border-radius: 12px;
        }
        .mobile-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow: auto;
          padding-bottom: max(1rem, env(safe-area-inset-bottom, 0px));
        }
        .mobile-nav-item {
          padding: 0.75rem 0.8rem;
          border-radius: 12px;
          font-weight: 650;
          color: var(--text);
          text-decoration: none;
        }
        .mobile-nav-item:hover {
          background: color-mix(in srgb, var(--surface-strong) 70%, transparent);
        }
        .mobile-nav-item--active {
          background: color-mix(in srgb, var(--accent) 14%, var(--surface-strong));
          color: var(--text);
        }
        .mobile-nav-item:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 2px;
        }
        .mobile-nav-cta {
          margin-top: 0.5rem;
          width: 100%;
          justify-content: center;
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
          .mobile-nav-layer {
            display: none !important;
          }
        }
      `}</style>
    </Motion.header>
  )
}
