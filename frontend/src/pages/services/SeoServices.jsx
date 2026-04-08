import { Link } from 'react-router-dom'
import SectionContainer from '../../components/SectionContainer'
import Seo from '../../components/Seo'
import FaqStructuredData from '../../components/FaqStructuredData'

const FAQ = [
  { q: 'How do you improve rankings?', a: 'We fix technical SEO, improve content structure, add schema, and build pages that match search intent — then measure results.' },
  { q: 'Do you do international SEO?', a: 'Yes. We plan keyword intent by market and can create service pages that target global search demand.' },
  { q: 'Do you handle Core Web Vitals?', a: 'Yes. We optimize LCP/INP/CLS with performance budgets, image strategy, and code-splitting where needed.' },
]

export default function SeoServices() {
  return (
    <>
      <Seo
        title="SEO Services — Hedztech"
        description="Technical SEO, structured data, and performance-first improvements to grow organic traffic and international leads."
        path="/services/seo"
      />
      <FaqStructuredData path="/services/seo" title="SEO Services — Hedztech" items={FAQ} />

      <SectionContainer>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">SEO that earns organic leads</h1>
        <p className="section-lead">
          We combine technical fixes, content structure, and schema to help you rank and convert — with clear reporting and international-ready strategy.
        </p>

        <div className="layout-grid-cards layout-grid-cards--wide">
          <div className="glass content-panel">
            <h2 style={{ marginTop: 0 }}>Technical SEO</h2>
            <ul>
              <li>Indexability, crawl fixes, sitemap/robots</li>
              <li>Structured data (Organization, Article, FAQ)</li>
              <li>Canonical strategy for production deployments</li>
            </ul>
          </div>
          <div className="glass content-panel">
            <h2 style={{ marginTop: 0 }}>Performance</h2>
            <ul>
              <li>Core Web Vitals optimization</li>
              <li>Asset and image strategy</li>
              <li>Analytics + conversion tracking</li>
            </ul>
          </div>
        </div>

        <div className="section-actions">
          <Link to="/contact" className="btn btn-primary">
            Request an SEO audit
          </Link>
          <Link to="/blog" className="btn btn-ghost">
            Read SEO posts
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

