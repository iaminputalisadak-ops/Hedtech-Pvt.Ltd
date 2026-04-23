import { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import FaqStructuredData from '../components/FaqStructuredData'
import MapSection from '../sections/MapSection'
import Contact from '../sections/Contact'
import { useSite } from '../context/SiteContext'

const DEFAULT_PAGE_H1 = 'Contact us'
const DEFAULT_PAGE_INTRO =
  'Use the map and details below, then send a message — the same experience as the contact section on our homepage.'
const FALLBACK_SEO_DESC = 'Start a project or ask a question. We respond within one business day.'

const CONTACT_FAQ = [
  { q: 'How fast do you respond?', a: 'Typically within one business day. If you have a deadline, include it in your message and we’ll prioritize scheduling.' },
  { q: 'What should I include in my message?', a: 'A short overview of what you’re building, your timeline, and any links (site, Figma, docs). That’s enough for a solid first reply.' },
  { q: 'Do you work with international clients?', a: 'Yes. We work async-friendly across timezones and share clear written updates with milestone-based delivery.' },
]

export default function ContactPage() {
  const { settings } = useSite()
  const siteName = (settings.site_name || '').trim() || 'Hedztech'
  const pageH1 = (settings.contact_page_h1 || '').trim() || DEFAULT_PAGE_H1
  const pageIntro = (settings.contact_page_intro || '').trim() || DEFAULT_PAGE_INTRO
  const seoTitleRaw = (settings.contact_seo_title || '').trim()
  const seoDescRaw = (settings.contact_seo_description || '').trim()

  const seoTitle = seoTitleRaw || `Contact — ${siteName}`
  const seoDescription = useMemo(() => {
    if (seoDescRaw) return seoDescRaw
    const fromIntro = pageIntro.replace(/\s+/g, ' ').trim()
    if (fromIntro.length > 20) return fromIntro.length > 165 ? `${fromIntro.slice(0, 162)}…` : fromIntro
    return FALLBACK_SEO_DESC
  }, [seoDescRaw, pageIntro])

  const canonicalBase = (settings.canonical_base || '').replace(/\/$/, '')
  const contactJsonLd = useMemo(() => {
    if (!canonicalBase) return null
    const url = `${canonicalBase}/contact`
    const phone = (settings.business_phone || '').toString().trim()
    const email = (settings.business_email || '').toString().trim()
    const streetAddress = (settings.address || '').toString().trim()
    const lat = Number(settings.map_lat)
    const lng = Number(settings.map_lng)
    const hasGeo = Number.isFinite(lat) && Number.isFinite(lng)
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

    const business = {
      '@type': 'ProfessionalService',
      '@id': `${canonicalBase}/#localbusiness`,
      name: siteName,
      url: canonicalBase,
      ...(phone ? { telephone: phone } : {}),
      ...(email ? { email } : {}),
      ...(streetAddress ? { address: { '@type': 'PostalAddress', streetAddress } } : {}),
      ...(hasGeo ? { geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    }

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ContactPage',
          '@id': `${url}#webpage`,
          url,
          name: pageH1,
          description: seoDescription,
          inLanguage: 'en',
          isPartOf: { '@id': `${canonicalBase}/#website` },
          about: { '@id': `${canonicalBase}/#organization` },
          mainEntity: { '@id': `${canonicalBase}/#localbusiness` },
        },
        business,
      ],
    }
  }, [canonicalBase, pageH1, seoDescription, siteName, settings])

  useEffect(() => {
    const t = window.setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} path="/contact" />
      <FaqStructuredData path="/contact" title={seoTitle} items={CONTACT_FAQ} />
      {contactJsonLd ? (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(contactJsonLd)}</script>
        </Helmet>
      ) : null}
      <SectionContainer className="page-stack section--pb-0" tight panelClassName="contact-page-intro">
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">{pageH1}</h1>
        <p className="section-lead contact-page-intro__lead">{pageIntro}</p>

        <div className="layout-grid-cards layout-grid-cards--wide contact-page-cards">
          <div className="glass content-panel">
            <h2 style={{ marginTop: 0 }}>What happens next</h2>
            <ul style={{ marginBottom: 0 }}>
              <li>We reply with 1–3 clarifying questions (or a suggested call agenda)</li>
              <li>You get a clear scope outline + timeline options</li>
              <li>If it’s a fit, we schedule kickoff and milestones</li>
            </ul>
          </div>
          <div className="glass content-panel">
            <h2 style={{ marginTop: 0 }}>Best ways to reach us</h2>
            <ul style={{ marginBottom: 0 }}>
              <li>Email for proposals, links, and longer context</li>
              <li>Phone for urgent timelines or quick questions</li>
              <li>Use the form below — it goes straight to the team</li>
            </ul>
          </div>
        </div>
      </SectionContainer>
      <MapSection />
      <Contact />

      <SectionContainer>
        <div className="section-block-head">
          <p className="section-kicker">FAQ</p>
          <h2 className="section-title">Before you message</h2>
          <p className="section-lead">Quick answers to common questions (also helps search engines understand the page).</p>
        </div>
        <div className="layout-grid-cards layout-grid-cards--wide">
          {CONTACT_FAQ.map((qa) => (
            <div key={qa.q} className="glass content-panel">
              <h3 style={{ marginTop: 0 }}>{qa.q}</h3>
              <p style={{ marginBottom: 0 }}>{qa.a}</p>
            </div>
          ))}
        </div>
      </SectionContainer>
    </>
  )
}
