import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { useSite } from '../context/SiteContext'

export default function Work() {
  // Kept minimal: Work data comes from bootstrap via SiteContext.
  // This page is the "Our Work" board UI (tabs + chips) inspired by the provided static HTML.
  // (Case-study detail remains at /work/:slug.)
  const { projects, loading } = useSite()
  const [tab, setTab] = useState('all') // all | completed | ongoing
  const [cat, setCat] = useState('all') // all | web | seo | marketing | design

  const normalized = useMemo(() => {
    const toType = (p) => {
      const raw = String(p.service_type || p.category || 'web').toLowerCase()
      return ['web', 'seo', 'marketing', 'design'].includes(raw) ? raw : 'web'
    }
    const toStatus = (p) => {
      const raw = String(p.status || 'completed').toLowerCase()
      return raw === 'ongoing' ? 'ongoing' : 'completed'
    }
    const toTags = (p) => {
      const raw = p.tags ?? ''
      if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
      return String(raw)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    const toProgress = (p) => {
      const n = Number(p.progress ?? 0)
      if (!Number.isFinite(n)) return 0
      return Math.max(0, Math.min(100, Math.round(n)))
    }
    return (projects || []).map((p) => ({
      ...p,
      service_type: toType(p),
      status: toStatus(p),
      client_name: p.client_name ? String(p.client_name) : '',
      tags: toTags(p),
      progress: toProgress(p),
    }))
  }, [projects])

  const serviceCounts = useMemo(() => {
    const set = new Set(normalized.map((p) => p.service_type).filter(Boolean))
    return set.size
  }, [normalized])

  const list = useMemo(() => {
    let items = normalized
    if (tab !== 'all') {
      items = items.filter((p) => p.status === tab)
    }
    if (cat !== 'all') {
      items = items.filter((p) => p.service_type === cat)
    }
    return items
  }, [normalized, tab, cat])

  const completed = useMemo(() => normalized.filter((p) => p.status !== 'ongoing').length, [normalized])
  const ongoing = useMemo(() => normalized.filter((p) => p.status === 'ongoing').length, [normalized])

  const grouped = useMemo(() => {
    const comp = list.filter((p) => p.status !== 'ongoing')
    const ong = list.filter((p) => p.status === 'ongoing')
    return { comp, ong }
  }, [list])

  const badgeLabel = (serviceType) =>
    serviceType === 'web'
      ? 'Web Dev'
      : serviceType === 'seo'
        ? 'SEO'
        : serviceType === 'marketing'
          ? 'Marketing'
          : 'Design'

  const WorkCard = ({ p, ongoing }) => {
    const href = p.slug ? `/work/${encodeURIComponent(p.slug)}` : null
    const CardTag = href ? Link : 'article'
    const cardProps = href
      ? { to: href, 'aria-label': `Open project: ${p.title}`, className: 'workboard-card workboard-card--link' }
      : { className: 'workboard-card' }

    return (
      <CardTag key={p.id} {...cardProps} data-type={p.service_type}>
        <div className="workboard-card-top">
          <span className={`workboard-badge workboard-badge--${p.service_type}`}>{badgeLabel(p.service_type)}</span>
          <span
            className={`workboard-statusdot ${ongoing ? 'workboard-statusdot--ongoing' : 'workboard-statusdot--done'}`}
            title={ongoing ? 'In progress' : 'Completed'}
          />
        </div>
        <h2 className="workboard-card-title">{p.title}</h2>
        <p className="workboard-card-desc">{p.excerpt || '—'}</p>
        {ongoing ? (
          <>
            <p className="workboard-progress-label">{p.progress}% complete</p>
            <div className="workboard-progress" aria-hidden>
              <div className="workboard-progress-fill" style={{ width: `${p.progress}%` }} />
            </div>
          </>
        ) : null}
        <div className="workboard-card-foot">
          <span className="workboard-client">{p.client_name || '—'}</span>
          <div className="workboard-tags">
            {(p.tags || []).slice(0, 4).map((t) => (
              <span key={t} className="workboard-tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </CardTag>
    )
  }

  return (
    <>
      <Seo
        title="Our Work — Hedztech"
        description="Explore completed and ongoing projects across web development, SEO, marketing, and design."
        path="/work"
      />
      <SectionContainer className="workboard">
        <div className="workboard-hero">
          <p className="workboard-eyebrow">Our Work</p>
          <h1 className="workboard-title">
            Crafting <em>digital experiences</em>
            <br />
            that drive results
          </h1>
          <p className="workboard-lead">
            From full-stack web platforms to growth-focused SEO campaigns — explore our completed and ongoing projects across every
            service we offer.
          </p>
        </div>

        {loading ? (
          <div className="page-state">
            <p className="page-state-text">Loading projects…</p>
          </div>
        ) : (
          <>
            <div className="workboard-stats">
              <div className="workboard-stat">
                <p className="workboard-stat-value">{normalized.length}</p>
                <p className="workboard-stat-label">Total Projects</p>
              </div>
              <div className="workboard-stat">
                <p className="workboard-stat-value workboard-stat-value--ok">{completed}</p>
                <p className="workboard-stat-label">Completed</p>
              </div>
              <div className="workboard-stat">
                <p className="workboard-stat-value">{ongoing}</p>
                <p className="workboard-stat-label">In Progress</p>
              </div>
              <div className="workboard-stat">
                <p className="workboard-stat-value workboard-stat-value--violet">{serviceCounts}</p>
                <p className="workboard-stat-label">Service Types</p>
              </div>
            </div>

            <div className="workboard-controls">
              <div className="workboard-tabs" role="tablist" aria-label="Project status filter">
                <button type="button" className={`workboard-tab ${tab === 'all' ? 'is-active' : ''}`} onClick={() => setTab('all')}>
                  All Projects
                </button>
                <button
                  type="button"
                  className={`workboard-tab ${tab === 'completed' ? 'is-active' : ''}`}
                  onClick={() => setTab('completed')}
                >
                  Completed
                </button>
                <button
                  type="button"
                  className={`workboard-tab ${tab === 'ongoing' ? 'is-active' : ''}`}
                  onClick={() => setTab('ongoing')}
                >
                  Ongoing
                </button>
              </div>
              <div className="workboard-chips" aria-label="Service type filter">
                <button type="button" className={`workboard-chip ${cat === 'all' ? 'is-active' : ''}`} onClick={() => setCat('all')}>
                  All Services
                </button>
                <button type="button" className={`workboard-chip ${cat === 'web' ? 'is-active' : ''}`} onClick={() => setCat('web')}>
                  Web Dev
                </button>
                <button type="button" className={`workboard-chip ${cat === 'seo' ? 'is-active' : ''}`} onClick={() => setCat('seo')}>
                  SEO
                </button>
                <button
                  type="button"
                  className={`workboard-chip ${cat === 'marketing' ? 'is-active' : ''}`}
                  onClick={() => setCat('marketing')}
                >
                  Marketing
                </button>
                <button
                  type="button"
                  className={`workboard-chip ${cat === 'design' ? 'is-active' : ''}`}
                  onClick={() => setCat('design')}
                >
                  Design
                </button>
              </div>
            </div>

            {tab !== 'ongoing' ? (
              <div>
                <p className="workboard-section-label">Completed Projects</p>
                <div className="workboard-grid">
                  {!grouped.comp.length ? <p className="page-state-text">No projects in this category yet.</p> : null}
                  {grouped.comp.map((p) => (
                    <WorkCard key={p.id} p={p} ongoing={false} />
                  ))}
                </div>
              </div>
            ) : null}

            {tab !== 'completed' ? (
              <div style={{ marginTop: '1.75rem' }}>
                <p className="workboard-section-label">Ongoing Projects</p>
                <div className="workboard-grid">
                  {!grouped.ong.length ? <p className="page-state-text">No projects in this category yet.</p> : null}
                  {grouped.ong.map((p) => (
                    <WorkCard key={p.id} p={p} ongoing />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </SectionContainer>
    </>
  )
}
