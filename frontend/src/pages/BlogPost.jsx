import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CmsImage from '../components/CmsImage'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { CMS_SIZES } from '../constants/cmsImageSizes'
import { DESIGN_SYSTEMS_SHIP_SLUG } from '../constants/blogSlugs'
import { getBlogList, getBlogPost } from '../api/client'
import { renderMarkdown } from '../utils/markdown'
import ArticleStructuredData from '../components/ArticleStructuredData'
import { Copy, Globe, Mail, MessageCircle, Share2 } from 'lucide-react'

const DesignSystemsShipBars = lazy(() => import('../components/DesignSystemsShipBars'))

function firstImageFromHtml(html = '') {
  const input = String(html ?? '')
  const m = input.match(/<img[^>]+src=["']([^"']+)["']/i)
  return (m?.[1] || '').trim()
}

export default function BlogPost() {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [err, setErr] = useState(null)
  const [related, setRelated] = useState([])
  const [copyState, setCopyState] = useState('idle') // idle | ok | err

  const shareUrl = useMemo(() => {
    if (!item?.slug) return ''
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/blog/${encodeURIComponent(item.slug)}`
  }, [item?.slug])

  const shareTitle = (item?.title || '').trim()
  const shareText = shareTitle ? `${shareTitle} — Hedztech` : 'Hedztech Blog'

  const shareLinks = useMemo(() => {
    if (!shareUrl) return null
    const u = encodeURIComponent(shareUrl)
    const t = encodeURIComponent(shareText)
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      email: `mailto:?subject=${t}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    }
  }, [shareText, shareUrl])

  async function copyLink() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyState('ok')
      window.setTimeout(() => setCopyState('idle'), 1600)
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = shareUrl
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        setCopyState(ok ? 'ok' : 'err')
        window.setTimeout(() => setCopyState('idle'), 1600)
      } catch {
        setCopyState('err')
        window.setTimeout(() => setCopyState('idle'), 1600)
      }
    }
  }

  async function nativeShare() {
    if (!shareUrl) return false
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false
    try {
      await navigator.share({ title: shareTitle || shareText, text: shareText, url: shareUrl })
      return true
    } catch {
      return false
    }
  }

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

  const heroSrc = (item.og_image || '').trim() || firstImageFromHtml(item.body)
  const heroAlt = (item.og_image_alt || '').trim() || item.title
  const tags = (item.tags || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const tagKeywords = tags.join(', ')

  return (
    <>
      <Seo
        title={item.meta_title || `${item.title} — Hedztech Blog`}
        description={item.meta_description || item.excerpt || ''}
        path={`/blog/${item.slug}`}
        image={heroSrc || undefined}
        imageAlt={heroAlt}
        keywords={tagKeywords || undefined}
        ogType="article"
        article={{
          publishedTime: item.created_at,
          section: item.category,
          tags,
        }}
      />
      <ArticleStructuredData item={item} />
      <SectionContainer as="article" containerClassName="container--narrow">
        <p className="section-back">
          <Link to="/blog" className="text-back-link">
            ← Blog
          </Link>
        </p>
        <div className="article-head-row">
          <p className="article-meta">{item.category}</p>
          <p className="article-date">{new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <h1 className="article-title">{item.title}</h1>
        {tags.length ? (
          <div className="article-tags-row" aria-label="Tags">
            {tags.slice(0, 10).map((t) => (
              <span key={t} className="tag-chip">
                {t}
              </span>
            ))}
          </div>
        ) : null}
        {heroSrc ? (
          <figure className="article-hero">
            <CmsImage
              className="article-hero-img"
              src={heroSrc}
              alt={heroAlt}
              sizes={CMS_SIZES.blogHero}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </figure>
        ) : null}
        <div className="glass article-body-panel">
          <p className="article-lead">{item.excerpt}</p>
          {slug === DESIGN_SYSTEMS_SHIP_SLUG ? (
            <Suspense fallback={null}>
              <DesignSystemsShipBars />
            </Suspense>
          ) : null}
          <div className="article-body-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }} />
        </div>

        {shareLinks ? (
          <aside className="glass article-share-panel" aria-label="Share this article">
            <div className="article-share-head">
              <div className="article-share-title">
                <Share2 size={18} aria-hidden="true" />
                <span>Share</span>
              </div>
            </div>
            <div className="article-share-actions">
              <button
                type="button"
                className="btn btn-primary btn-compact"
                onClick={async () => {
                  const ok = await nativeShare()
                  if (!ok) copyLink()
                }}
                title="Share (mobile) or copy link"
              >
                <Share2 size={16} aria-hidden="true" />
                Share
              </button>

              <a className="share-chip" href={shareLinks.facebook} target="_blank" rel="noreferrer" title="Share on Facebook">
                <Globe size={16} aria-hidden="true" />
                Facebook
              </a>
              <a className="share-chip" href={shareLinks.whatsapp} target="_blank" rel="noreferrer" title="Share on WhatsApp">
                <MessageCircle size={16} aria-hidden="true" />
                WhatsApp
              </a>
              <a className="share-chip" href={shareLinks.twitter} target="_blank" rel="noreferrer" title="Share on X / Twitter">
                <Globe size={16} aria-hidden="true" />
                X
              </a>
              <a className="share-chip" href={shareLinks.linkedin} target="_blank" rel="noreferrer" title="Share on LinkedIn">
                <Globe size={16} aria-hidden="true" />
                LinkedIn
              </a>
              <a className="share-chip" href={shareLinks.email} title="Share by email">
                <Mail size={16} aria-hidden="true" />
                Email
              </a>

              <button
                type="button"
                className="share-chip"
                onClick={copyLink}
                title={copyState === 'ok' ? 'Copied' : 'Copy link'}
              >
                <Copy size={16} aria-hidden="true" />
                {copyState === 'ok' ? 'Copied' : copyState === 'err' ? 'Copy failed' : 'Copy link'}
              </button>
            </div>
          </aside>
        ) : null}

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
