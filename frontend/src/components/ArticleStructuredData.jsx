import { Helmet } from 'react-helmet-async'
import { useSite } from '../context/SiteContext'

export default function ArticleStructuredData({ item }) {
  const { settings } = useSite()
  const base = (settings.canonical_base || '').replace(/\/$/, '')
  if (!base || !item) return null

  const url = `${base}/blog/${encodeURIComponent(item.slug)}`
  const siteName = settings.site_name || 'Hedztech'
  const logo = settings.og_image && /^https?:\/\//i.test(settings.og_image) ? settings.og_image : `${base}/favicon.svg`

  const img = item.og_image && /^https?:\/\//i.test(item.og_image) ? item.og_image : undefined

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
    ...(img ? { image: [img] } : {}),
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

