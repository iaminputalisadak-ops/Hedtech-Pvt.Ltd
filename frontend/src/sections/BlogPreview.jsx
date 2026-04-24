import { Link } from 'react-router-dom'
import { motion as Motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import CmsImage from '../components/CmsImage'
import SectionContainer from '../components/SectionContainer'
import { CMS_SIZES } from '../constants/cmsImageSizes'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

function splitCsv(v) {
  if (!v) return []
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function BlogPreview() {
  const { blog, settings } = useSite()
  const reduce = useReducedMotion()
  const enabled = (settings?.home_blog_enabled ?? '1') === '1'
  const desiredCount = Math.max(1, Math.min(6, Number(settings?.home_blog_count ?? 3) || 3))
  const pinned = splitCsv(settings?.home_blog_pinned_slugs)

  const pickPosts = () => {
    const list = Array.isArray(blog) ? blog : []
    if (!pinned.length) return list.slice(0, desiredCount)
    const bySlug = new Map(list.map((p) => [String(p.slug || ''), p]))
    const pinnedPosts = pinned.map((s) => bySlug.get(s)).filter(Boolean)
    const rest = list.filter((p) => !pinned.includes(String(p.slug || '')))
    return [...pinnedPosts, ...rest].slice(0, desiredCount)
  }

  const posts = pickPosts()

  if (!enabled) return null
  if (!posts.length) return null

  return (
    <SectionContainer id="blog">
      <div className="section-header-row">
        <div>
          <p className="section-kicker section-kicker--left">{settings?.home_blog_kicker || 'News & blog'}</p>
          <h2 className="section-title">{settings?.home_blog_title || 'Insights'}</h2>
          <p className="section-lead">
            {settings?.home_blog_lead || ''}
          </p>
        </div>
        <Link to="/blog" className="btn btn-ghost">
          All articles <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="blog-preview-grid">
        {posts.map((post, i) => (
          <Motion.article
            key={post.id}
            className="glass blog-card"
            initial={fadeIn(reduce)}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            {(post.og_image || '').trim() ? (
              <div className="blog-card__thumb">
                <CmsImage
                  className="blog-card__thumb-img"
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
            <h3>{post.title}</h3>
            <p className="blog-card__excerpt">{post.excerpt}</p>
            <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="btn btn-ghost blog-card__link">
              Read more →
            </Link>
          </Motion.article>
        ))}
      </div>
    </SectionContainer>
  )
}
