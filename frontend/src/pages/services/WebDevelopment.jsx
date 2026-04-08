import { Link } from 'react-router-dom'
import SectionContainer from '../../components/SectionContainer'
import Seo from '../../components/Seo'
import FaqStructuredData from '../../components/FaqStructuredData'

const FAQ = [
  { q: 'Do you work with international clients?', a: 'Yes. We work async-friendly across timezones and run clear weekly milestones with demos and written updates.' },
  { q: 'What stacks do you build with?', a: 'Modern React/Vite frontends, fast PHP APIs, and MySQL — plus integrations, analytics, and SEO-friendly delivery.' },
  { q: 'How fast can you ship?', a: 'Small sites can ship in 2–4 weeks. Larger builds are delivered in milestones with measurable performance targets.' },
]

export default function WebDevelopment() {
  return (
    <>
      <Seo
        title="Web Development Services — Hedztech"
        description="High-performance websites and web apps for international teams. Fast delivery, clean UX, SEO foundations, and measurable results."
        path="/services/web-development"
      />
      <FaqStructuredData path="/services/web-development" title="Web Development Services — Hedztech" items={FAQ} />

      <SectionContainer>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">Web development that converts</h1>
        <p className="section-lead">
          We build fast, scalable sites and web products with clear communication and performance budgets — ideal for international teams.
        </p>

        <div className="layout-grid-cards layout-grid-cards--wide">
          <div className="glass content-panel">
            <h2 style={{ marginTop: 0 }}>What you get</h2>
            <ul>
              <li>Conversion-focused UX with accessible components</li>
              <li>Technical SEO foundations (structure, speed, schema)</li>
              <li>API integrations, forms, tracking, and dashboards</li>
              <li>Performance targets (Core Web Vitals) and launch checklists</li>
            </ul>
          </div>
          <div className="glass content-panel">
            <h2 style={{ marginTop: 0 }}>Best for</h2>
            <ul>
              <li>Company websites that need leads</li>
              <li>Landing pages and marketing funnels</li>
              <li>Admin-managed content sites</li>
              <li>Product MVPs</li>
            </ul>
          </div>
        </div>

        <div className="section-actions">
          <Link to="/contact" className="btn btn-primary">
            Get a quote
          </Link>
          <Link to="/work" className="btn btn-ghost">
            See projects
          </Link>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.35rem' }}>
            FAQ
          </h2>
          <div className="layout-grid-cards layout-grid-cards--wide">
            {FAQ.map((qa) => (
              <div key={qa.q} className="glass content-panel">
                <h3 style={{ marginTop: 0 }}>{qa.q}</h3>
                <p style={{ marginBottom: 0 }}>{qa.a}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    </>
  )
}

