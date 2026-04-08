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

function HeroWallpaper({ url, opacity = 0.28 }) {
  const safeOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.28
  if (!url) return null
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: safeOpacity,
        filter: 'saturate(1.05) contrast(1.02)',
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

  return (
    <section className="section hero-section">
      {!reduce ? (
        <canvas ref={canvasRef} id="showcase-movement" aria-hidden className="hero-canvas" />
      ) : null}
      <div className="container hero-container">
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <HeroWallpaper url={wallpaperUrl} opacity={wallpaperOpacity} />
          {!reduce && !wallpaperUrl ? <Orbs /> : null}
        </div>
        <div className="content-panel section-panel section-panel--hero hero-panel">
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
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="glass hero-stats-bar"
          >
            <div>
              <div className="hero-stat-value">{count}+</div>
              <div className="hero-stat-label">Shipped milestones</div>
            </div>
            <div className="hero-stat-divider" aria-hidden />
            <div className="hero-stat-aside hero-stat-aside-narrow">
              Core Web Vitals–minded builds, accessible UI, and SEO that earns the click.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
