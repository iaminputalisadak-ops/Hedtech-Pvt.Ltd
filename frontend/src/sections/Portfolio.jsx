import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function Portfolio() {
  const { projects } = useSite()
  const reduce = useReducedMotion()
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [projects])
  const [filter, setFilter] = useState('all')
  const list = filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  return (
    <SectionContainer id="work">
      <div className="section-block-head">
        <p className="section-kicker">Portfolio</p>
        <h2 className="section-title">Selected projects</h2>
        <p className="section-lead">
          Product-grade interfaces, resilient backends, and SEO-aware launches — filtered by focus area.
        </p>
      </div>
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
            className="glass portfolio-card portfolio-card--pro"
            initial={fadeIn(reduce)}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.22) }}
          >
            <div className="portfolio-thumb">
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={`${p.title} — project preview`}
                  loading="lazy"
                  decoding="async"
                  className={p.image_fit === 'cover' ? 'portfolio-thumb-img is-cover' : 'portfolio-thumb-img is-contain'}
                />
              ) : (
                <div className="portfolio-thumb-placeholder">Preview</div>
              )}
              <span className="portfolio-badge">{p.category}</span>
            </div>
            <div className="portfolio-card-body">
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
              <Link to={`/work/${encodeURIComponent(p.slug)}`} className="portfolio-readmore">
                Read more →
              </Link>
              <div className="portfolio-card-actions">
                <Link to={`/work/${encodeURIComponent(p.slug)}`} className="btn btn-primary btn-compact">
                  Case study
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
        <Link to="/work" className="btn btn-ghost">
          View full portfolio
        </Link>
        <Link to="/contact" className="btn btn-primary">
          Start a project
        </Link>
      </div>
    </SectionContainer>
  )
}
