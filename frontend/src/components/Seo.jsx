import { Helmet } from 'react-helmet-async'
import { useSite } from '../context/SiteContext'
import { absoluteUrlFromBase } from '../utils/absoluteUrl'

function toArticleIso8601(value) {
  if (!value) return null
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d.toISOString()
  } catch {
    return null
  }
}

/**
 * @param {string} [ogType='website'] Use 'article' for blog posts.
 * @param {object} [article] When ogType is article: { publishedTime, section, tags?: string[] }
 * @param {string} [keywords] Comma-separated; emitted as meta keywords (optional signal for some crawlers).
 */
export default function Seo({
  title,
  description,
  path = '',
  image,
  imageAlt,
  keywords,
  ogType = 'website',
  article,
}) {
  const { settings } = useSite()
  const site = settings.site_name || 'Hedztech'
  const metaTitle = title || settings.meta_title || `${site} — Digital Products & Growth`
  const metaDesc = description || settings.meta_description || ''
  const base = (settings.canonical_base || '').replace(/\/$/, '')
  const canonical = base && path ? `${base}${path}` : base || undefined
  const rawOg = (image || settings.og_image || '').trim()
  const og = rawOg ? absoluteUrlFromBase(rawOg, base) : undefined
  const ogAlt =
    (imageAlt && String(imageAlt).trim()) ||
    (ogType === 'article' ? metaTitle : `${site} — share image`)

  const kw = (keywords || '').trim()
  const publishedIso = ogType === 'article' ? toArticleIso8601(article?.publishedTime) : null
  const tags = Array.isArray(article?.tags) ? article.tags.filter((t) => typeof t === 'string' && t.trim()) : []

  return (
    <Helmet>
      <title>{metaTitle}</title>
      {metaDesc ? <meta name="description" content={metaDesc} /> : null}
      {kw ? <meta name="keywords" content={kw} /> : null}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:title" content={metaTitle} />
      {metaDesc ? <meta property="og:description" content={metaDesc} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {og ? <meta property="og:image" content={og} /> : null}
      {og ? <meta property="og:image:alt" content={ogAlt} /> : null}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={site} />
      <meta property="og:locale" content="en_US" />
      {publishedIso ? <meta property="article:published_time" content={publishedIso} /> : null}
      {article?.section ? <meta property="article:section" content={String(article.section)} /> : null}
      {tags.map((t) => (
        <meta key={t} property="article:tag" content={t} />
      ))}
      <meta name="twitter:card" content={og ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={metaTitle} />
      {metaDesc ? <meta name="twitter:description" content={metaDesc} /> : null}
      {og ? <meta name="twitter:image" content={og} /> : null}
      {og && ogAlt ? <meta name="twitter:image:alt" content={ogAlt} /> : null}
    </Helmet>
  )
}
