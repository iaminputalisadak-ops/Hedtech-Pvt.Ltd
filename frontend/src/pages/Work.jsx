import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function Work() {
  const { projects, loading } = useSite()
  const reduce = useReducedMotion()
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [projects])
  const [filter, setFilter] = useState('all')
  const list = filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  if (loading) {
    return (
      <SectionContainer as="div" className="page-state">
        <p className="page-state-text">Loading projects…</p>
      </SectionContainer>
    )
  }

  return (
    <>
      <Seo title="Portfolio — Hedztech" description="Selected case studies across web, ecommerce, and growth." path="/work" />
      <SectionContainer>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">Portfolio</h1>
        <p className="section-lead">Explore work filtered by category. Each case study opens with full detail.</p>
        <div className="filter-toolbar">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`btn btn-ghost filter-pill ${filter === c ? 'is-active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
        <div className="layout-grid-cards layout-grid-cards--wide">
          {list.map((p, i) => (
            <motion.article
              key={p.id}
              className="glass portfolio-card"
              initial={fadeIn(reduce)}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.25) }}
            >
              <div className="portfolio-thumb">
                {p.image_url ? (
                  <img src={p.image_url} alt={`${p.title} — project preview`} loading="lazy" decoding="async" />
                ) : (
                  <div className="portfolio-thumb-placeholder">Preview</div>
                )}
              </div>
              <div className="portfolio-card-body">
                <h2>{p.title}</h2>
                <p>{p.excerpt}</p>
                <div className="portfolio-card-actions">
                  <Link to={`/work/${encodeURIComponent(p.slug)}`} className="btn btn-primary btn-compact">
                    Open case study
                  </Link>
                  {p.live_url ? (
                    <a href={p.live_url} className="btn btn-ghost btn-compact" target="_blank" rel="noreferrer">
                      Live <ExternalLink size={16} aria-hidden />
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="section-actions">
          <Link to="/" className="btn btn-ghost">
            ← Back home
          </Link>
          <Link to="/contact" className="btn btn-primary">
            Start a project
          </Link>
        </div>
        {!list.length ? <p className="page-state-text">No projects in this category yet.</p> : null}
      </SectionContainer>
    </>
  )
}
