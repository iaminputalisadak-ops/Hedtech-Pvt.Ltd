import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import MapSection from '../sections/MapSection'
import Contact from '../sections/Contact'

export default function ContactPage() {
  useEffect(() => {
    const t = window.setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <Seo title="Contact — Hedztech" description="Start a project or ask a question. We respond within one business day." path="/contact" />
      <SectionContainer className="page-stack section--pb-0" tight panelClassName="contact-page-intro">
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">Contact</h1>
        <p>Map, details, and the form below — same content as the homepage contact block.</p>
      </SectionContainer>
      <MapSection />
      <Contact />
    </>
  )
}
