import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import CmsImage from '../components/CmsImage'
import { CMS_SIZES } from '../constants/cmsImageSizes'
import Seo from '../components/Seo'
import { getProject } from '../api/client'
import { renderMarkdown } from '../utils/markdown'

function splitTags(raw) {
  if (!raw) return []
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getProject(slug)
        if (!cancelled) setItem(res.item)
      } catch (e) {
        if (!cancelled) setErr(e.message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (err) {
    return (
      <SectionContainer as="div">
        <h1 className="section-title">Project not found</h1>
        <p className="page-state-text page-state-text--block">{err}</p>
        <div className="section-actions">
          <Link to="/work" className="btn btn-primary">
            ← Portfolio
          </Link>
          <Link to="/contact" className="btn btn-ghost">
            Start a project
          </Link>
        </div>
      </SectionContainer>
    )
  }

  if (!item) {
    return (
      <SectionContainer as="div">
        <p className="page-state-text">Loading…</p>
      </SectionContainer>
    )
  }

  const heroSrc = (item.image_url || item.og_image || '').trim()
  const heroAlt = (item.og_image_alt || '').trim() || `${item.title} preview`
  const tags = splitTags(item.tags)
  const hasProgress = String(item.status || '').toLowerCase() === 'ongoing' && Number(item.progress ?? 0) > 0

  return (
    <>
      <Seo
        title={item.meta_title || `${item.title} — Hedztech`}
        description={item.meta_description || item.excerpt || ''}
        path={`/work/${item.slug}`}
        image={(item.og_image || item.image_url || '').trim() || undefined}
        imageAlt={heroAlt}
      />
      <SectionContainer as="article" containerClassName="container--reading">
        <p className="section-back">
          <Link to="/work" className="text-back-link">
            ← Portfolio
          </Link>
        </p>
        <header className="project-detail-head">
          <div className="project-detail-head-top">
            <div className="project-detail-badges">
              {item.category ? <span className="project-badge project-badge--accent">{item.category}</span> : null}
              {item.status ? (
                <span className={`project-badge ${String(item.status).toLowerCase() === 'ongoing' ? 'project-badge--warn' : 'project-badge--ok'}`}>
                  {String(item.status).toLowerCase() === 'ongoing' ? 'In progress' : 'Completed'}
                </span>
              ) : null}
            </div>
            <div className="project-detail-cta">
              {item.live_url ? (
                <a href={item.live_url} className="btn btn-primary" target="_blank" rel="noreferrer">
                  View live <ExternalLink size={18} />
                </a>
              ) : null}
              <Link to="/contact" className={item.live_url ? 'btn btn-ghost' : 'btn btn-primary'}>
                Start a similar project
              </Link>
            </div>
          </div>
          <h1 className="article-title project-detail-title">{item.title}</h1>
          {item.excerpt ? <p className="project-detail-subtitle">{item.excerpt}</p> : null}
        </header>

        {heroSrc ? (
          <figure className="article-hero">
            <CmsImage
              src={heroSrc}
              alt={heroAlt}
              className="article-hero-img"
              sizes={CMS_SIZES.projectHero}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </figure>
        ) : null}

        <div className="project-detail-grid">
          <div className="project-detail-main">
            <div className="glass article-body-panel">
              <div className="article-body-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }} />
            </div>
          </div>

          <aside className="project-detail-aside">
            <div className="glass project-overview">
              <h2 className="project-overview-title">Project overview</h2>
              <dl className="project-kv">
                {item.client_name ? (
                  <>
                    <dt>Client</dt>
                    <dd>{item.client_name}</dd>
                  </>
                ) : null}
                {item.service_type ? (
                  <>
                    <dt>Service</dt>
                    <dd>{item.service_type}</dd>
                  </>
                ) : null}
                {tags.length ? (
                  <>
                    <dt>Tags</dt>
                    <dd>
                      <div className="project-taglist">
                        {tags.slice(0, 10).map((t) => (
                          <span key={t} className="project-tagchip">
                            {t}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </>
                ) : null}
                {hasProgress ? (
                  <>
                    <dt>Progress</dt>
                    <dd>
                      <div className="project-progress-row">
                        <span className="project-progress-value">{Math.max(0, Math.min(100, Number(item.progress || 0)))}%</span>
                        <div className="project-progress-bar" aria-hidden>
                          <div
                            className="project-progress-bar-fill"
                            style={{ width: `${Math.max(0, Math.min(100, Number(item.progress || 0)))}%` }}
                          />
                        </div>
                      </div>
                    </dd>
                  </>
                ) : null}
                {item.live_url ? (
                  <>
                    <dt>Link</dt>
                    <dd>
                      <a className="project-link" href={item.live_url} target="_blank" rel="noreferrer">
                        {item.live_url}
                      </a>
                    </dd>
                  </>
                ) : null}
              </dl>
            </div>
          </aside>
        </div>
      </SectionContainer>
    </>
  )
}
