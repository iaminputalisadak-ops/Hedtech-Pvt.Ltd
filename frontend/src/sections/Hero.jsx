import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, PlayCircle } from 'lucide-react'
import CanvasParticles from 'canvasparticles-js'
import { useTheme } from '../context/ThemeContext'
import { useSite } from '../context/SiteContext'

const HERO_COPY_DEFAULTS = {
  headline: 'Build products people trust',
  tagline:
    'Strategy, design, and engineering for teams that care about quality, speed, and measurable outcomes.',
  eyebrow: 'Digital studio · Performance · SEO',
  ctaPrimaryLabel: 'Start a project',
  ctaPrimaryHref: '/contact',
  ctaSecondaryLabel: 'View selected work',
  ctaSecondaryHref: '/work',
  statLabel: 'Shipped milestones',
  statAside: 'Core Web Vitals–minded builds, accessible UI, and SEO that earns the click.',
}

function trimSetting(v) {
  return (v ?? '').toString().trim()
}

function isExternalHref(href) {
  const h = trimSetting(href)
  if (!h) return false
  return /^https?:\/\//i.test(h) || h.startsWith('//') || h.startsWith('mailto:') || h.startsWith('tel:')
}

function normalizePath(href) {
  const h = trimSetting(href)
  if (!h || isExternalHref(h)) return h || '/'
  return h.startsWith('/') ? h : `/${h}`
}

function HeroCtaLink({ href, className, children }) {
  const raw = trimSetting(href)
  if (isExternalHref(raw)) {
    const newTab = /^https?:\/\//i.test(raw) || raw.startsWith('//')
    return (
      <a
        href={raw}
        className={className}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }
  const to = normalizePath(raw || '/')
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}

/**
 * Library destroy() calls canvas.remove(), which breaks React-managed nodes.
 * Unobserve + stop only; leave the <canvas> in the DOM.
 */
function disposeCanvasParticles(instance) {
  if (!instance?.canvas) return
  try {
    instance.stop({ clear: false })
  } catch {
    /* noop */
  }
  try {
    CanvasParticles.canvasIntersectionObserver.unobserve(instance.canvas)
    CanvasParticles.canvasResizeObserver.unobserve(instance.canvas)
    CanvasParticles.instances.delete(instance)
    delete instance.canvas.instance
  } catch {
    /* noop */
  }
}

function Orbs({ theme }) {
  const accentA = theme === 'light' ? '58%' : '45%'
  const accentB = theme === 'light' ? '52%' : '40%'
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <motion.div
        style={{
          position: 'absolute',
          width: 'min(520px, 90vw)',
          height: 'min(520px, 90vw)',
          borderRadius: '50%',
          left: '8%',
          top: '12%',
          background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) ${accentA}, transparent), transparent 65%)`,
          filter: 'blur(2px)',
        }}
        animate={{ x: [0, 18, 0], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 'min(420px, 80vw)',
          height: 'min(420px, 80vw)',
          borderRadius: '50%',
          right: '4%',
          bottom: '8%',
          background: `radial-gradient(circle at 70% 40%, color-mix(in srgb, var(--accent-2) ${accentB}, transparent), transparent 62%)`,
          filter: 'blur(2px)',
        }}
        animate={{ x: [0, -14, 0], y: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function safeWallpaperPosition(input) {
  const raw = (input ?? '').toString().trim().toLowerCase()
  const allowed = new Set(['center', 'center top', 'center bottom', 'left center', 'right center'])
  return allowed.has(raw) ? raw : 'center'
}

/**
 * Hero wallpaper must fill the full viewport band (no letterboxing). Admin "contain"
 * is useful for previews/logos; on the public hero we always use cover so Earth/graph
 * backgrounds reach the left and right edges.
 */
function HeroWallpaper({ url, opacity = 0.28, position = 'center', theme }) {
  const safeOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.28
  if (!url) return null
  const objectFit = 'cover'
  const objectPosition = safeWallpaperPosition(position)
  const isLight = theme === 'light'
  /* screen() lifts dark art on dark bg; on light bg it blows out. normal + slightly higher opacity keeps line art visible. */
  const mixBlendMode = isLight ? 'normal' : 'screen'
  const opacityOut = isLight ? Math.min(1, safeOpacity * 1.2 + 0.06) : safeOpacity
  const contrast = isLight ? 'saturate(1.02) contrast(1.08)' : 'saturate(1.05) contrast(1.02)'
  return (
    <img
      src={url}
      alt=""
      decoding="async"
      loading="eager"
      fetchPriority="high"
      aria-hidden
      className="hero-wallpaper-img"
      style={{
        opacity: opacityOut,
        objectFit,
        objectPosition,
        filter: contrast,
        mixBlendMode,
      }}
    />
  )
}

function safeGradientCss(input) {
  const raw = (input ?? '').toString().trim()
  if (!raw) return ''
  // Allow only gradient functions; keep it simple to avoid arbitrary CSS injection.
  const okPrefix = raw.startsWith('linear-gradient(') || raw.startsWith('radial-gradient(') || raw.startsWith('conic-gradient(')
  if (!okPrefix) return ''
  // Allow common characters used in gradients.
  if (!/^[a-z0-9\s(),.%#\-+\/]*$/i.test(raw)) return ''
  return raw
}

function HeroGradient({ gradient, opacity = 0.6, theme }) {
  const safe = safeGradientCss(gradient)
  if (!safe) return null
  const safeOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.6
  const isLight = theme === 'light'
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: safe,
        opacity: isLight ? Math.min(1, safeOpacity * 0.72) : safeOpacity,
        mixBlendMode: isLight ? 'normal' : 'screen',
      }}
    />
  )
}

export default function Hero() {
  const { settings, projects } = useSite()
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const canvasRef = useRef(null)
  const particlesRef = useRef(null)
  const count = settings.project_count || String(projects?.length || 0)

  const headline = trimSetting(settings.hero_headline) || HERO_COPY_DEFAULTS.headline
  const tagline = trimSetting(settings.hero_tagline) || HERO_COPY_DEFAULTS.tagline
  const eyebrow = trimSetting(settings.hero_eyebrow) || HERO_COPY_DEFAULTS.eyebrow
  const ctaPrimaryLabel = trimSetting(settings.hero_cta_primary_label) || HERO_COPY_DEFAULTS.ctaPrimaryLabel
  const ctaPrimaryHref = trimSetting(settings.hero_cta_primary_href) || HERO_COPY_DEFAULTS.ctaPrimaryHref
  const ctaSecondaryLabel = trimSetting(settings.hero_cta_secondary_label) || HERO_COPY_DEFAULTS.ctaSecondaryLabel
  const ctaSecondaryHref = trimSetting(settings.hero_cta_secondary_href) || HERO_COPY_DEFAULTS.ctaSecondaryHref
  const statLabel = trimSetting(settings.hero_stat_label) || HERO_COPY_DEFAULTS.statLabel
  const statAside = trimSetting(settings.hero_stat_aside) || HERO_COPY_DEFAULTS.statAside

  const wallpaperUrl = (settings.hero_wallpaper_url || '').trim()
  const wallpaperOpacityRaw = (settings.hero_wallpaper_opacity || '').trim()
  const wallpaperOpacity = wallpaperOpacityRaw === '' ? 0.28 : Number(wallpaperOpacityRaw)
  const wallpaperPosition = (settings.hero_wallpaper_position || '').toString().trim()
  const bgMode = (settings.hero_bg_mode || '').toString().trim() || (wallpaperUrl ? 'image' : 'animated')
  const gradientCss = (settings.hero_gradient_css || '').toString().trim()

  useLayoutEffect(() => {
    if (reduce) return
    const el = canvasRef.current
    if (!el) return

    disposeCanvasParticles(particlesRef.current)
    particlesRef.current = null

    const particleColor =
      theme === 'dark' ? 'rgba(226, 232, 240, 0.38)' : 'rgba(30, 41, 59, 0.52)'

    let instance
    try {
      instance = new CanvasParticles(el, {
        animation: {
          startOnEnter: false,
          stopOnLeave: false,
        },
        particles: {
          relSpeed: 3,
          relSize: theme === 'light' ? 2.35 : 2,
          rotationSpeed: 40,
          color: particleColor,
        },
      }).start()
    } catch {
      return
    }
    particlesRef.current = instance
    return () => {
      disposeCanvasParticles(particlesRef.current)
      particlesRef.current = null
    }
  }, [reduce, theme])

  const backdropFill = bgMode === 'image' || bgMode === 'gradient'

  return (
    <section className={`section hero-section${backdropFill ? ' hero-section--backdrop-fill' : ''}`.trim()}>
      {/* Full-bleed behind the graph (canvas): same bounds as particle field, not the text card */}
      <div className="hero-media" aria-hidden>
        {bgMode === 'image' ? (
          <HeroWallpaper
            url={wallpaperUrl}
            opacity={wallpaperOpacity}
            position={wallpaperPosition}
            theme={theme}
          />
        ) : null}
        {bgMode === 'gradient' ? <HeroGradient gradient={gradientCss} opacity={0.7} theme={theme} /> : null}
        {!reduce && bgMode === 'animated' ? <Orbs theme={theme} /> : null}
      </div>
      {!reduce ? (
        <canvas ref={canvasRef} id="showcase-movement" aria-hidden className="hero-canvas" />
      ) : null}
      <div className="hero-container hero-container--full">
        <div className="content-panel content-panel--hero section-panel section-panel--hero hero-panel">
          <div className="hero-panel-copy hero-panel-copy--pro">
            <motion.p
              className="hero-eyebrow"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              {eyebrow}
            </motion.p>
            <motion.h1
              className="hero-title"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              {headline}
            </motion.h1>
            <motion.p
              className="hero-lead"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
            >
              {tagline}
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <HeroCtaLink href={ctaPrimaryHref} className="btn btn-primary">
                {ctaPrimaryLabel} <ArrowRight size={18} aria-hidden />
              </HeroCtaLink>
              <HeroCtaLink href={ctaSecondaryHref} className="btn btn-ghost">
                <PlayCircle size={18} aria-hidden /> {ctaSecondaryLabel}
              </HeroCtaLink>
            </motion.div>
          </div>
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="hero-stats-bar hero-stats-bar--pro"
          >
            <div className="hero-stats-bar-inner">
              <div className="hero-stat-primary">
                <div className="hero-stat-value">{count}+</div>
                <div className="hero-stat-label">{statLabel}</div>
              </div>
              <p className="hero-stat-aside">{statAside}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
