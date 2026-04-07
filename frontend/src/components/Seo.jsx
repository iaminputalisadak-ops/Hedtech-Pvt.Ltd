import { Helmet } from 'react-helmet-async'
import { useSite } from '../context/SiteContext'

export default function Seo({ title, description, path = '', image }) {
  const { settings } = useSite()
  const site = settings.site_name || 'Hedztech'
  const metaTitle = title || settings.meta_title || `${site} — Digital Products & Growth`
  const metaDesc = description || settings.meta_description || ''
  const base = (settings.canonical_base || '').replace(/\/$/, '')
  const canonical = base && path ? `${base}${path}` : base || undefined
  const og = image || settings.og_image || undefined

  return (
    <Helmet>
      <title>{metaTitle}</title>
      {metaDesc ? <meta name="description" content={metaDesc} /> : null}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:title" content={metaTitle} />
      {metaDesc ? <meta property="og:description" content={metaDesc} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {og ? <meta property="og:image" content={og} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      {metaDesc ? <meta name="twitter:description" content={metaDesc} /> : null}
      {og ? <meta name="twitter:image" content={og} /> : null}
    </Helmet>
  )
}
