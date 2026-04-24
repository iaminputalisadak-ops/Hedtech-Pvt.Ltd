import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useSite } from '../context/SiteContext'
import { resolvePublicAssetUrl } from '../utils/absoluteUrl'
import { displayedProjectCount } from '../utils/displayedProjectCount'

const HERO_COPY_DEFAULTS = {
  headline: 'High‑performing digital experiences that convert',
  tagline: 'Modern web, UI/UX, and SEO that drive real results—not vanity metrics.',
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
function disposeCanvasParticles(CanvasParticles, instance) {
  if (!CanvasParticles || !instance?.canvas) return
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
      <Motion.div
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
      <Motion.div
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

function parseHeroCarouselUrls(raw) {
  if (raw == null || raw === '') return []
  try {
    const v = JSON.parse(String(raw))
    if (!Array.isArray(v)) return []
    return v.map((s) => String(s || '').trim()).filter(Boolean)
  } catch {
    return []
  }
}

/**
 * Hero wallpaper must fill the full viewport band (no letterboxing). Admin "contain"
 * is useful for previews/logos; on the public hero we always use cover so Earth/graph
 * backgrounds reach the left and right edges.
 */
function HeroWallpaper({
  url,
  opacity = 0.28,
  position = 'center',
  theme,
  loading = 'eager',
  fetchPriority = 'high',
}) {
  const safeOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.28
  if (!url) return null
  const src = resolvePublicAssetUrl(url)
  if (!src) return null
  const objectFit = 'cover'
  const objectPosition = safeWallpaperPosition(position)
  const isLight = theme === 'light'
  /* screen() lifts dark art on dark bg; on light bg it blows out. normal + slightly higher opacity keeps line art visible. */
  const mixBlendMode = isLight ? 'normal' : 'screen'
  // Light mode: keep wallpaper subtle so copy + graph read cleanly.
  const opacityOut = isLight ? Math.min(1, safeOpacity * 0.78 + 0.03) : safeOpacity
  const contrast = isLight ? 'saturate(0.95) contrast(1.02) brightness(1.02)' : 'saturate(1.05) contrast(1.02)'
  return (
    <img
      src={url}
      alt=""
      sizes="100vw"
      decoding="async"
      loading={loading}
      fetchPriority={fetchPriority}
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

const HERO_CAROUSEL_MS = 4000

function HeroWallpaperCarousel({ urls, opacity, position, theme, reducedMotion }) {
  const n = urls.length
  const [active, setActive] = useState(0)
  const rotate = !reducedMotion && n >= 2

  useEffect(() => {
    if (!rotate || n < 2) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % n)
    }, HERO_CAROUSEL_MS)
    return () => window.clearInterval(id)
  }, [rotate, n])

  if (n === 0) return null

  const visibleIndex = rotate ? active : 0

  return (
    <div className="hero-wallpaper-stack" aria-hidden>
      {urls.map((url, i) => (
        <div
          key={`${url}-${i}`}
          className={`hero-wallpaper-slide${i === visibleIndex ? ' hero-wallpaper-slide--active' : ''}`}
        >
          <HeroWallpaper
            url={url}
            opacity={opacity}
            position={position}
            theme={theme}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'low'}
          />
        </div>
      ))}
    </div>
  )
}

function safeGradientCss(input) {
  const raw = (input ?? '').toString().trim()
  if (!raw) return ''
  // Allow only gradient functions; keep it simple to avoid arbitrary CSS injection.
  const okPrefix = raw.startsWith('linear-gradient(') || raw.startsWith('radial-gradient(') || raw.startsWith('conic-gradient(')
  if (!okPrefix) return ''
  // Allow common characters used in gradients.
  if (!/^[a-z0-9\s(),.%#+/-]*$/i.test(raw)) return ''
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
  const { settings, projects, loading } = useSite()
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const canvasRef = useRef(null)
  const particlesRef = useRef(null)
  const particlesLibRef = useRef(null)
  const count = loading ? null : displayedProjectCount(settings, projects)

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
  const carouselUrls = parseHeroCarouselUrls(settings.hero_banner_carousel_json)
  const wallpaperOpacityRaw = (settings.hero_wallpaper_opacity || '').trim()
  const wallpaperOpacity = wallpaperOpacityRaw === '' ? 0.28 : Number(wallpaperOpacityRaw)
  const wallpaperPosition = (settings.hero_wallpaper_position || '').toString().trim()
  const explicitBgMode = (settings.hero_bg_mode || '').toString().trim()
  // Carousel-only heroes used to stay on "animated" because wallpaper URL was empty — slides never rendered.
  const bgMode =
    explicitBgMode ||
    (carouselUrls.length >= 1 || wallpaperUrl ? 'image' : 'animated')
  const gradientCss = (settings.hero_gradient_css || '').toString().trim()

  const heroImageUrls =
    carouselUrls.length >= 2
      ? carouselUrls
      : carouselUrls.length === 1
        ? carouselUrls
        : wallpaperUrl
          ? [wallpaperUrl]
          : []

  useLayoutEffect(() => {
    if (reduce) {
      disposeCanvasParticles(particlesLibRef.current, particlesRef.current)
      particlesRef.current = null
      particlesLibRef.current = null
      return
    }
    if (!canvasRef.current) return

    let cancelled = false
    disposeCanvasParticles(particlesLibRef.current, particlesRef.current)
    particlesRef.current = null
    particlesLibRef.current = null

    const overlay = bgMode !== 'animated'
    const particleColor = overlay
      ? theme === 'dark'
        ? 'rgba(255, 255, 255, 0.62)'
        : 'rgba(0, 0, 0, 0.64)'
      : theme === 'dark'
        ? 'rgba(255, 255, 255, 0.7)'
        : 'rgba(0, 0, 0, 0.78)'

    ;(async () => {
      let CanvasParticles
      try {
        ;({ default: CanvasParticles } = await import('canvasparticles-js'))
      } catch {
        return
      }
      if (cancelled || !canvasRef.current) return
      particlesLibRef.current = CanvasParticles
      try {
        const instance = new CanvasParticles(canvasRef.current, {
          animation: {
            // Big performance win: don't animate when offscreen.
            startOnEnter: true,
            stopOnLeave: true,
          },
          particles: {
            // Keep the visual, reduce CPU/GPU work.
            relSpeed: overlay ? 2.0 : 2.6,
            relSize: overlay ? (theme === 'light' ? 1.7 : 1.55) : theme === 'light' ? 1.9 : 1.7,
            rotationSpeed: overlay ? 24 : 30,
            color: particleColor,
          },
        }).start()
        if (!cancelled) {
          particlesRef.current = instance
        } else {
          disposeCanvasParticles(CanvasParticles, instance)
        }
      } catch {
        /* noop */
      }
    })()

    return () => {
      cancelled = true
      disposeCanvasParticles(particlesLibRef.current, particlesRef.current)
      particlesRef.current = null
      particlesLibRef.current = null
    }
  }, [reduce, theme, bgMode])

  const backdropFill = bgMode === 'image' || bgMode === 'gradient'
  const showGraph = !reduce && (bgMode === 'animated' || bgMode === 'image' || bgMode === 'gradient')
  const graphVariant = bgMode === 'animated' ? 'full' : 'overlay'

  return (
    <section className={`section hero-section${backdropFill ? ' hero-section--backdrop-fill' : ''}`.trim()}>
      {/* Full-bleed behind the graph (canvas): same bounds as particle field, not the text card */}
      <div className="hero-media" aria-hidden>
        {bgMode === 'image' && heroImageUrls.length >= 2 ? (
          <HeroWallpaperCarousel
            urls={heroImageUrls}
            opacity={wallpaperOpacity}
            position={wallpaperPosition}
            theme={theme}
            reducedMotion={reduce}
          />
        ) : null}
        {bgMode === 'image' && heroImageUrls.length === 1 ? (
          <HeroWallpaper
            url={heroImageUrls[0]}
            opacity={wallpaperOpacity}
            position={wallpaperPosition}
            theme={theme}
          />
        ) : null}
        {bgMode === 'gradient' ? <HeroGradient gradient={gradientCss} opacity={0.7} theme={theme} /> : null}
        {!reduce && bgMode === 'animated' ? <Orbs theme={theme} /> : null}
      </div>
      {showGraph ? (
        <canvas
          ref={canvasRef}
          id="showcase-movement"
          aria-hidden
          className={`hero-canvas${graphVariant === 'overlay' ? ' hero-canvas--overlay' : ''}`}
        />
      ) : null}
      <div className="hero-container hero-container--full">
        <div className="content-panel content-panel--hero section-panel section-panel--hero hero-panel">
          <div className="hero-panel-copy hero-panel-copy--pro">
            <Motion.p
              className="hero-eyebrow"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              {eyebrow}
            </Motion.p>
            <Motion.h1
              className="hero-title"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              {headline}
            </Motion.h1>
            <Motion.p
              className="hero-lead"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
            >
              {tagline}
            </Motion.p>
            <Motion.div
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
            </Motion.div>
          </div>
          <Motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="hero-stats-bar hero-stats-bar--pro"
          >
            <div className="hero-stats-bar-inner">
              <div className="hero-stat-primary">
                <div className="hero-stat-value">{count == null ? '…' : `${count}+`}</div>
                <div className="hero-stat-label">{statLabel}</div>
              </div>
              <p className="hero-stat-aside">{statAside}</p>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  )
}
