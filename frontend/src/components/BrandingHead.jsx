import { Helmet } from 'react-helmet-async'
import { useSite } from '../context/SiteContext'

export default function BrandingHead() {
  const { settings } = useSite()
  const faviconUrl = (settings.brand_favicon_url || '').trim()
  if (!faviconUrl) return null

  // Let admin override the favicon without code changes.
  return (
    <Helmet>
      <link rel="icon" href={faviconUrl} />
      <link rel="apple-touch-icon" href={faviconUrl} />
      <meta name="theme-color" content="#080a10" />
    </Helmet>
  )
}

