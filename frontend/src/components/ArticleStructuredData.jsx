import { Helmet } from 'react-helmet-async'
import { useSite } from '../context/SiteContext'
import { absoluteUrlFromBase, resolvePublicAssetUrl } from '../utils/absoluteUrl'

export default function ArticleStructuredData({ item }) {
  const { settings } = useSite()
  const base = (settings.canonical_base || '').replace(/\/$/, '')
  if (!base || !item) return null

  const url = `${base}/blog/${encodeURIComponent(item.slug)}`
  const siteName = settings.site_name || 'Hedztech'
  const logoRaw = (settings.og_image || '').trim()
  const logoNorm = logoRaw ? resolvePublicAssetUrl(logoRaw) : ''
  const logo = logoNorm ? absoluteUrlFromBase(logoNorm, base) : `${base}/favicon.svg`

  const rawImg = (item.og_image || '').trim()
  const imgNorm = rawImg ? resolvePublicAssetUrl(rawImg) : ''
  const img = imgNorm ? absoluteUrlFromBase(imgNorm, base) : undefined
  const imgName = (item.og_image_alt || item.title || '').trim() || item.title

  const tagList = (item.tags || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: item.title,
    description: item.meta_description || item.excerpt || '',
    datePublished: item.created_at,
    dateModified: item.created_at,
    author: { '@type': 'Organization', name: siteName },
    publisher: { '@type': 'Organization', name: siteName, logo: { '@type': 'ImageObject', url: logo } },
    inLanguage: 'en',
    ...(item.category ? { articleSection: item.category } : {}),
    ...(tagList.length ? { keywords: tagList.join(', ') } : {}),
    ...(img
      ? {
          image: {
            '@type': 'ImageObject',
            url: img,
            name: imgName,
            caption: imgName,
          },
        }
      : {}),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/blog` },
      { '@type': 'ListItem', position: 3, name: item.title, item: url },
    ],
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(article)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
    </Helmet>
  )
}
