import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion as Motion, useReducedMotion } from 'framer-motion'
import CmsImage from '../components/CmsImage'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { CMS_SIZES } from '../constants/cmsImageSizes'
import { getBlogList } from '../api/client'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })
const PAGE_SIZE = 12

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const [items, setItems] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getBlogList()
        if (!cancelled) {
          const s = new Set((res.items || []).map((i) => i.category).filter(Boolean))
          setAllCategories(Array.from(s))
        }
      } catch {
        if (!cancelled) setAllCategories([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await getBlogList({
          ...(q ? { q } : {}),
          ...(category ? { category } : {}),
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        })
        if (!cancelled) {
          setItems(res.items || [])
          setTotal(Number(res.total) || 0)
        }
      } catch {
        if (!cancelled) {
          setItems([])
          setTotal(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [q, category, page])

  const hasFilters = Boolean(q || category)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1)
  const isEmpty = !loading && items.length === 0

  return (
    <>
      <Seo title="Blog — Hedztech" description="Articles on performance, UX, SEO, and digital growth." path="/blog" />
      <SectionContainer>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">Blog</h1>
        <p className="section-lead">Search and filter published posts. Content is managed in the admin panel.</p>
        <form
          key={`${q}|${category}`}
          className="blog-toolbar"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            const next = new URLSearchParams()
            const nq = String(fd.get('q') || '').trim()
            const cat = String(fd.get('category') || '').trim()
            if (nq) next.set('q', nq)
            if (cat) next.set('category', cat)
            next.set('page', '1')
            setSearchParams(next)
          }}
        >
          <label className="sr-only" htmlFor="blog-q">
            Search
          </label>
          <input id="blog-q" name="q" defaultValue={q} placeholder="Search titles and tags" className="blog-field-input" />
          <label className="sr-only" htmlFor="blog-cat">
            Category
          </label>
          <select id="blog-cat" name="category" defaultValue={category} className="blog-field-select">
            <option value="">All categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Apply
          </button>
          {hasFilters ? (
            <button type="button" className="btn btn-ghost" onClick={() => setSearchParams(new URLSearchParams())}>
              Clear filters
            </button>
          ) : null}
        </form>
        {loading ? <p className="page-state-text">Loading posts…</p> : null}
        {isEmpty ? (
          <div className="glass blog-empty">
            <h2 className="blog-empty__title">{hasFilters ? 'No posts match your filters' : 'No published posts yet'}</h2>
            <p className="blog-empty__lead">
              {hasFilters
                ? 'Try a different keyword, clear filters, or pick another category.'
                : 'Your blog posts will appear here once they are marked as Published in the admin panel.'}
            </p>
            <div className="section-actions" style={{ marginTop: 12 }}>
              {hasFilters ? (
                <button type="button" className="btn btn-primary" onClick={() => setSearchParams(new URLSearchParams())}>
                  Clear filters
                </button>
              ) : (
                <Link to="/admin" className="btn btn-primary">
                  Open admin
                </Link>
              )}
              <Link to="/contact" className="btn btn-ghost">
                Work with us
              </Link>
            </div>
          </div>
        ) : (
          <div className="blog-post-grid">
            {items.map((post, i) => (
              <Motion.article
                key={post.id}
                className="glass blog-post-card"
                initial={fadeIn(reduce)}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                {(post.og_image || '').trim() ? (
                  <div className="blog-post-card__thumb">
                    <CmsImage
                      className="blog-post-card__thumb-img"
                      src={String(post.og_image).trim()}
                      alt={(post.og_image_alt || '').trim() || post.title}
                      sizes={CMS_SIZES.blogCardThumb}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                ) : null}
                <span className="blog-card__category">{post.category}</span>
                <h2>{post.title}</h2>
                <p className="blog-card__excerpt">{post.excerpt}</p>
                {post.tags ? <div className="blog-post-card__tags">Tags: {post.tags}</div> : null}
                <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="btn btn-ghost btn-compact">
                  Read article →
                </Link>
              </Motion.article>
            ))}
          </div>
        )}
        {!loading && totalPages > 1 ? (
          <div className="section-actions" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={page <= 1}
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.set('page', String(Math.max(1, page - 1)))
                setSearchParams(next)
              }}
            >
              ← Newer
            </button>
            <p className="page-state-text" style={{ margin: 0 }}>
              Page {page} of {totalPages}
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={page >= totalPages}
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.set('page', String(Math.min(totalPages, page + 1)))
                setSearchParams(next)
              }}
            >
              Older →
            </button>
          </div>
        ) : null}
        <div className="section-actions">
          <Link to="/contact" className="btn btn-primary">
            Work with us
          </Link>
        </div>
      </SectionContainer>
    </>
  )
}
