import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, PlayCircle } from 'lucide-react'
import CanvasParticles from 'canvasparticles-js'
import { useTheme } from '../context/ThemeContext'
import { useSite } from '../context/SiteContext'

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

function Orbs() {
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
          background: 'radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 45%, transparent), transparent 65%)',
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
          background: 'radial-gradient(circle at 70% 40%, color-mix(in srgb, var(--accent-2) 40%, transparent), transparent 62%)',
          filter: 'blur(2px)',
        }}
        animate={{ x: [0, -14, 0], y: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function safeWallpaperFit(input) {
  const raw = (input ?? '').toString().trim().toLowerCase()
  return raw === 'contain' ? 'contain' : 'cover'
}

function safeWallpaperPosition(input) {
  const raw = (input ?? '').toString().trim().toLowerCase()
  const allowed = new Set(['center', 'center top', 'center bottom', 'left center', 'right center'])
  return allowed.has(raw) ? raw : 'center'
}

function HeroWallpaper({ url, opacity = 0.28, fit = 'cover', position = 'center' }) {
  const safeOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.28
  if (!url) return null
  const objectFit = safeWallpaperFit(fit)
  const objectPosition = safeWallpaperPosition(position)
  return (
    <img
      src={url}
      alt=""
      decoding="async"
      aria-hidden
      className={`hero-wallpaper-img${objectFit === 'contain' ? ' hero-wallpaper-img--contain' : ''}`}
      style={{
        opacity: safeOpacity,
        objectFit,
        objectPosition,
        filter: 'saturate(1.05) contrast(1.02)',
        mixBlendMode: 'screen',
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

function HeroGradient({ gradient, opacity = 0.6 }) {
  const safe = safeGradientCss(gradient)
  if (!safe) return null
  const safeOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.6
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: safe,
        opacity: safeOpacity,
        mixBlendMode: 'screen',
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

  const headline = settings.hero_headline || 'Build products people trust'
  const tagline =
    settings.hero_tagline ||
    'Strategy, design, and engineering for teams that care about quality, speed, and measurable outcomes.'

  const wallpaperUrl = (settings.hero_wallpaper_url || '').trim()
  const wallpaperOpacityRaw = (settings.hero_wallpaper_opacity || '').trim()
  const wallpaperOpacity = wallpaperOpacityRaw === '' ? 0.28 : Number(wallpaperOpacityRaw)
  const wallpaperFit = (settings.hero_wallpaper_fit || '').toString().trim() || 'cover'
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
      theme === 'dark' ? 'rgba(226, 232, 240, 0.35)' : 'rgba(15, 23, 42, 0.32)'

    let instance
    try {
      instance = new CanvasParticles(el, {
        animation: {
          startOnEnter: false,
          stopOnLeave: false,
        },
        particles: {
          relSpeed: 3,
          relSize: 2,
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
          <HeroWallpaper url={wallpaperUrl} opacity={wallpaperOpacity} fit={wallpaperFit} position={wallpaperPosition} />
        ) : null}
        {bgMode === 'gradient' ? <HeroGradient gradient={gradientCss} opacity={0.7} /> : null}
        {!reduce && bgMode === 'animated' ? <Orbs /> : null}
      </div>
      {!reduce ? (
        <canvas ref={canvasRef} id="showcase-movement" aria-hidden className="hero-canvas" />
      ) : null}
      <div className="hero-container hero-container--full">
        <div className="content-panel content-panel--hero section-panel section-panel--hero hero-panel">
          <div className="hero-panel-copy">
            <motion.p
              className="hero-eyebrow"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              Digital studio · Performance · SEO
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
              <Link to="/contact" className="btn btn-primary">
                Start a project <ArrowRight size={18} />
              </Link>
              <Link to="/work" className="btn btn-ghost">
                <PlayCircle size={18} aria-hidden /> View selected work
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="hero-stats-bar"
          >
            <div className="hero-stats-bar-inner">
              <div className="hero-stat-primary">
                <div className="hero-stat-value">{count}+</div>
                <div className="hero-stat-label">Shipped milestones</div>
              </div>
              <p className="hero-stat-aside">
                Core Web Vitals–minded builds, accessible UI, and SEO that earns the click.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
