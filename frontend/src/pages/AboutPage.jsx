import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import FaqStructuredData from '../components/FaqStructuredData'
import About from '../sections/About'
import { useSite } from '../context/SiteContext'

const ABOUT_FAQ = [
  { q: 'What does Hedztech do?', a: 'We design and build high-performance websites and web products with strong UX, technical SEO foundations, and clean engineering.' },
  { q: 'Where are you located?', a: 'We’re based in Nepal and work with teams worldwide. Most projects run async-friendly with clear milestones.' },
  { q: 'How do projects typically start?', a: 'Send a short message with your goals and timeline. We reply with clarifying questions and a clear next-step proposal.' },
]

export default function AboutPage() {
  const { settings } = useSite()
  const site = (settings.site_name || '').trim() || 'Hedztech'
  const canonicalBase = (settings.canonical_base || '').replace(/\/$/, '')
  const desc =
    (settings.about_intro || '').trim().slice(0, 165) ||
    (settings.mission || '').trim().slice(0, 165) ||
    'Who we are, what we stand for, and how we work with teams that care about quality and outcomes.'

  const title = `About — ${site}`
  const keywords = 'web development, ui ux design, seo, performance, nepal, agency, studio'

  const aboutJsonLd =
    canonicalBase
      ? {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': `${canonicalBase}/about#webpage`,
          url: `${canonicalBase}/about`,
          name: title,
          description: desc,
          inLanguage: 'en',
          isPartOf: { '@id': `${canonicalBase}/#website` },
          about: { '@id': `${canonicalBase}/#organization` },
          mainEntity: { '@id': `${canonicalBase}/#organization` },
        }
      : null

  return (
    <>
      <Seo title={title} description={desc} path="/about" keywords={keywords} />
      <FaqStructuredData path="/about" title={title} items={ABOUT_FAQ} />
      {aboutJsonLd ? (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(aboutJsonLd)}</script>
        </Helmet>
      ) : null}
      <SectionContainer className="page-stack section--pb-0" tight>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
      </SectionContainer>
      <About />

      <SectionContainer>
        <div className="section-block-head">
          <p className="section-kicker">FAQ</p>
          <h2 className="section-title">About Hedztech</h2>
          <p className="section-lead">Quick answers for visitors (and search engines).</p>
        </div>
        <div className="layout-grid-cards layout-grid-cards--wide">
          {ABOUT_FAQ.map((qa) => (
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
