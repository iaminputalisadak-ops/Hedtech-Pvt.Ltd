import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { getBlogList } from '../api/client'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const [items, setItems] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
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
        })
        if (!cancelled) setItems(res.items || [])
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [q, category])

  const hasFilters = Boolean(q || category)

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
        <div className="blog-post-grid">
          {items.map((post, i) => (
            <motion.article
              key={post.id}
              className="glass blog-post-card"
              initial={fadeIn(reduce)}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <span className="blog-card__category">{post.category}</span>
              <h2>{post.title}</h2>
              <p className="blog-card__excerpt">{post.excerpt}</p>
              {post.tags ? <div className="blog-post-card__tags">Tags: {post.tags}</div> : null}
              <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="btn btn-ghost btn-compact">
                Read article →
              </Link>
            </motion.article>
          ))}
        </div>
        {!loading && items.length === 0 ? <p className="page-state-text">No posts match your filters.</p> : null}
        <div className="section-actions">
          <Link to="/contact" className="btn btn-primary">
            Work with us
          </Link>
        </div>
      </SectionContainer>
    </>
  )
}
