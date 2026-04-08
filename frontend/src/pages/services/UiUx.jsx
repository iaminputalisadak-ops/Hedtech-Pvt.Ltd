import { Link } from 'react-router-dom'
import SectionContainer from '../../components/SectionContainer'
import Seo from '../../components/Seo'
import FaqStructuredData from '../../components/FaqStructuredData'

const FAQ = [
  { q: 'Do you redesign existing websites?', a: 'Yes. We audit UX, refresh the UI system, and ship improvements without breaking existing SEO or tracking.' },
  { q: 'Do you include accessibility?', a: 'Yes. We build with accessibility in mind (contrast, keyboard navigation, semantics) to improve UX and SEO.' },
  { q: 'What deliverables do you provide?', a: 'A reusable component system, responsive layouts, and guidelines so your team can keep shipping consistently.' },
]

export default function UiUx() {
  return (
    <>
      <Seo
        title="UI/UX Design Services — Hedztech"
        description="Modern UI/UX design and design systems that improve conversions. Clean interfaces, motion, accessibility, and scalable components."
        path="/services/ui-ux"
      />
      <FaqStructuredData path="/services/ui-ux" title="UI/UX Design Services — Hedztech" items={FAQ} />

      <SectionContainer>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">UI/UX design that feels premium</h1>
        <p className="section-lead">We craft modern interfaces and design systems that keep your site consistent, fast, and conversion-focused.</p>

        <div className="layout-grid-cards layout-grid-cards--wide">
          <div className="glass content-panel">
            <h2 style={{ marginTop: 0 }}>UX improvements</h2>
            <ul>
              <li>Information architecture and page flow</li>
              <li>Conversion-oriented layout and CTAs</li>
              <li>Copy structure and hierarchy</li>
            </ul>
          </div>
          <div className="glass content-panel">
            <h2 style={{ marginTop: 0 }}>Design systems</h2>
            <ul>
              <li>Reusable components and tokens</li>
              <li>Responsive patterns for all devices</li>
              <li>Motion that supports clarity (not noise)</li>
            </ul>
          </div>
        </div>

        <div className="section-actions">
          <Link to="/contact" className="btn btn-primary">
            Book a design call
          </Link>
          <Link to="/work" className="btn btn-ghost">
            View work
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

