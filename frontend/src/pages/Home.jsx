import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { useScrollToHash } from '../hooks/useScrollToHash'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Services from '../sections/Services'
import Expertise from '../sections/Expertise'
import Portfolio from '../sections/Portfolio'
import TrustedBy from '../sections/TrustedBy'
import BlogPreview from '../sections/BlogPreview'
import MapSection from '../sections/MapSection'

const Testimonials = lazy(() => import('../sections/Testimonials'))
import Contact from '../sections/Contact'
import { useSite } from '../context/SiteContext'

export default function Home() {
  const { loading, error, refresh } = useSite()
  const { hash } = useLocation()
  const contentReady = !loading && !error
  useScrollToHash(hash, contentReady)

  if (loading) {
    return (
      <SectionContainer as="div" className="page-state page-state--center" panelClassName="page-state-panel">
        <p className="page-state-text">Almost ready…</p>
      </SectionContainer>
    )
  }

  if (error) {
    return (
      <SectionContainer as="div" className="page-state">
        <h1 className="section-title">We could not reach the API</h1>
        <p className="page-state-text page-state-text--block">{error}</p>
        <p className="page-state-hint">
          When you are developing locally, start PHP on port 8080 from <code>backend/public</code> and import{' '}
          <code>database/schema.sql</code>.
        </p>
        <div className="page-state-actions">
          <button type="button" className="btn btn-primary" onClick={() => refresh()}>
            Retry
          </button>
        </div>
      </SectionContainer>
    )
  }

  return (
    <>
      <Seo path="/" />
      <Hero />
      <About />
      <Services />
      <Expertise />
      <Portfolio />
      <TrustedBy />
      <BlogPreview />
      <Suspense fallback={<div className="section container section--testimonials-placeholder" aria-hidden />}>
        <Testimonials />
      </Suspense>
      <MapSection />
      <Contact />
    </>
  )
}
