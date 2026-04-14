import { Helmet } from 'react-helmet-async'
import { useSite } from '../context/SiteContext'
import { absoluteUrlFromBase, resolvePublicAssetUrl } from '../utils/absoluteUrl'

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

  const ogRaw = (settings.og_image || '').trim()
  const ogNorm = ogRaw ? resolvePublicAssetUrl(ogRaw) : ''
  const logo = ogNorm ? absoluteUrlFromBase(ogNorm, base) : `${base}/favicon.svg`
  const sameAs = [
    settings.social_linkedin,
    settings.social_twitter,
    settings.social_github,
    settings.social_facebook,
    settings.social_instagram,
    settings.social_youtube,
    settings.social_tiktok,
    settings.social_whatsapp,
  ].filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u))

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${base}/#organization`,
      name,
      url: base,
      logo: { '@type': 'ImageObject', url: logo },
      description,
      ...(sameAs.length ? { sameAs } : {}),
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
