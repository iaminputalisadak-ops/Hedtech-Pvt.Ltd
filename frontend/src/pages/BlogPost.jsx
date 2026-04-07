import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import DesignSystemsShipBars, { DESIGN_SYSTEMS_SHIP_SLUG } from '../components/DesignSystemsShipBars'
import { getBlogPost } from '../api/client'

export default function BlogPost() {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getBlogPost(slug)
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
        <h1 className="section-title">Article not found</h1>
        <p className="page-state-text page-state-text--block">{err}</p>
        <div className="section-actions">
          <Link to="/blog" className="btn btn-primary">
            ← All posts
          </Link>
          <Link to="/" className="btn btn-ghost">
            Home
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
      <Seo title={`${item.title} — Hedztech Blog`} description={item.excerpt || ''} path={`/blog/${item.slug}`} />
      <SectionContainer as="article" containerClassName="container--narrow">
        <p className="section-back">
          <Link to="/blog" className="text-back-link">
            ← Blog
          </Link>
        </p>
        <p className="article-meta">{item.category}</p>
        <h1 className="article-title">{item.title}</h1>
        <p className="article-date">{new Date(item.created_at).toLocaleDateString()}</p>
        {item.tags ? <p className="article-tags">Tags: {item.tags}</p> : null}
        <div className="glass article-body-panel">
          <p className="article-lead">{item.excerpt}</p>
          {slug === DESIGN_SYSTEMS_SHIP_SLUG ? <DesignSystemsShipBars /> : null}
          <div className="article-body-text">{item.body}</div>
        </div>
        <div className="section-actions">
          <Link to="/contact" className="btn btn-primary">
            Discuss this topic
          </Link>
          <Link to="/work" className="btn btn-ghost">
            See our work
          </Link>
        </div>
      </SectionContainer>
    </>
  )
}
