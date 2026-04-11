import { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import MapSection from '../sections/MapSection'
import Contact from '../sections/Contact'
import { useSite } from '../context/SiteContext'

const DEFAULT_PAGE_H1 = 'Contact us'
const DEFAULT_PAGE_INTRO =
  'Use the map and details below, then send a message — the same experience as the contact section on our homepage.'
const FALLBACK_SEO_DESC = 'Start a project or ask a question. We respond within one business day.'

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
    return {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': `${url}#webpage`,
      url,
      name: pageH1,
      description: seoDescription,
      inLanguage: 'en',
      isPartOf: {
        '@type': 'WebSite',
        name: siteName,
        url: canonicalBase,
      },
    }
  }, [canonicalBase, pageH1, seoDescription, siteName])

  useEffect(() => {
    const t = window.setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} path="/contact" />
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
      </SectionContainer>
      <MapSection />
      <Contact />
    </>
  )
}
