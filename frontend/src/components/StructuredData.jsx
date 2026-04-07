import { Helmet } from 'react-helmet-async'
import { useSite } from '../context/SiteContext'

/**
 * Site-wide JSON-LD for Organization + WebSite (SEO, rich results).
 */
export default function StructuredData() {
  const { settings } = useSite()
  const base = (settings.canonical_base || '').replace(/\/$/, '')
  const name = settings.site_name || 'Hedztech'
  const description =
    settings.meta_description ||
    'Web development, UI/UX design, SEO, and digital growth — professional delivery with measurable outcomes.'

  if (!base) return null

  const logo = settings.og_image && /^https?:\/\//i.test(settings.og_image) ? settings.og_image : `${base}/favicon.svg`

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${base}/#organization`,
      name,
      url: base,
      logo: { '@type': 'ImageObject', url: logo },
      description,
    },
    {
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      name,
      url: base,
      description,
      publisher: { '@id': `${base}/#organization` },
      inLanguage: 'en',
    },
  ]

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
    </Helmet>
  )
}
