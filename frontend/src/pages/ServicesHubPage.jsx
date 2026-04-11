import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import Services from '../sections/Services'
import { useSite } from '../context/SiteContext'

const OFFERINGS = [
  {
    to: '/services/web-development',
    title: 'Web development',
    desc: 'Fast, accessible sites and apps — performance budgets, clean UX, and SEO-ready delivery.',
  },
  {
    to: '/services/seo',
    title: 'SEO & analytics',
    desc: 'Technical SEO, structured data, and measurement so growth is visible in the numbers.',
  },
  {
    to: '/services/ui-ux',
    title: 'UI / UX',
    desc: 'Product-grade interfaces, design systems, and research-backed flows your team can maintain.',
  },
]

export default function ServicesHubPage() {
  const { settings } = useSite()
  const site = (settings.site_name || '').trim() || 'Hedztech'

  return (
    <>
      <Seo
        title={`Services — ${site}`}
        description="Web development, SEO, and UI/UX — end-to-end delivery with clarity, speed, and measurable outcomes."
        path="/services"
      />
      <SectionContainer className="page-stack" tight>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">Services</h1>
        <p className="section-lead">
          Explore how we help teams ship — then open a capability page for scope, FAQs, and next steps.
        </p>
        <div className="layout-grid-cards layout-grid-cards--wide" style={{ marginTop: 'var(--space-5)' }}>
          {OFFERINGS.map((item) => (
            <Link key={item.to} to={item.to} className="glass service-card service-card--link">
              <div className="service-card-head">
                <h2 className="service-card-link-title">{item.title}</h2>
              </div>
              <p className="service-card-desc">{item.desc}</p>
              <span className="service-card-cta">View details →</span>
            </Link>
          ))}
        </div>
      </SectionContainer>
      <Services showHeader={false} previewCount={0} />
    </>
  )
}
