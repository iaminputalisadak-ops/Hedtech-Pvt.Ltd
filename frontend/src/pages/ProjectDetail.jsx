import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { getProject } from '../api/client'

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

  return (
    <>
      <Seo title={`${item.title} — Hedztech`} description={item.excerpt || ''} path={`/work/${item.slug}`} image={item.image_url} />
      <SectionContainer as="article" containerClassName="container--reading">
        <p className="section-back">
          <Link to="/work" className="text-back-link">
            ← Portfolio
          </Link>
        </p>
        <h1 className="article-title">{item.title}</h1>
        <p className="project-category">{item.category}</p>
        {item.image_url ? <img src={item.image_url} alt={`${item.title} preview`} className="project-hero-img" /> : null}
        <div className="section-actions project-detail-actions">
          {item.live_url ? (
            <a href={item.live_url} className="btn btn-primary" target="_blank" rel="noreferrer">
              View live <ExternalLink size={18} />
            </a>
          ) : null}
          <Link to="/contact" className={item.live_url ? 'btn btn-ghost' : 'btn btn-primary'}>
            Start a similar project
          </Link>
        </div>
        <div className="glass article-body-panel">
          <p className="article-lead">{item.excerpt}</p>
          <div className="article-body-text article-body-text--muted">{item.body}</div>
        </div>
      </SectionContainer>
    </>
  )
}
