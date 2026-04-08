import { Helmet } from 'react-helmet-async'
import { useSite } from '../context/SiteContext'

export default function FaqStructuredData({ path = '', title = 'FAQ', items = [] }) {
  const { settings } = useSite()
  const base = (settings.canonical_base || '').replace(/\/$/, '')
  if (!base || !items?.length) return null

  const url = `${base}${path}`
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((qa) => ({
      '@type': 'Question',
      name: qa.q,
      acceptedAnswer: { '@type': 'Answer', text: qa.a },
    })),
  }

  return (
    <Helmet>
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

