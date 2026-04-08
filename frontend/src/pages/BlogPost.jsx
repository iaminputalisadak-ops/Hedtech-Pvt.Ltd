import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import DesignSystemsShipBars, { DESIGN_SYSTEMS_SHIP_SLUG } from '../components/DesignSystemsShipBars'
import { getBlogList, getBlogPost } from '../api/client'
import { renderMarkdown } from '../utils/markdown'
import ArticleStructuredData from '../components/ArticleStructuredData'

export default function BlogPost() {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [err, setErr] = useState(null)
  const [related, setRelated] = useState([])

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

  useEffect(() => {
    if (!item?.category) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await getBlogList({ category: item.category, limit: 6, offset: 0 })
        const list = (res.items || []).filter((p) => p.slug !== item.slug).slice(0, 3)
        if (!cancelled) setRelated(list)
      } catch {
        if (!cancelled) setRelated([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [item?.category, item?.slug])

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
      <Seo
        title={item.meta_title || `${item.title} — Hedztech Blog`}
        description={item.meta_description || item.excerpt || ''}
        path={`/blog/${item.slug}`}
        image={item.og_image || undefined}
      />
      <ArticleStructuredData item={item} />
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
          <div className="article-body-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }} />
        </div>
        {related.length ? (
          <div style={{ marginTop: '1.25rem' }}>
            <h2 className="section-title" style={{ fontSize: '1.35rem' }}>
              Related posts
            </h2>
            <div className="blog-post-grid">
              {related.map((p) => (
                <article key={p.id} className="glass blog-post-card">
                  <span className="blog-card__category">{p.category}</span>
                  <h3 style={{ marginTop: 8 }}>{p.title}</h3>
                  <p className="blog-card__excerpt">{p.excerpt}</p>
                  <Link to={`/blog/${encodeURIComponent(p.slug)}`} className="btn btn-ghost btn-compact">
                    Read →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ) : null}
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
