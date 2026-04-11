import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { useScrollToHash } from '../hooks/useScrollToHash'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Services from '../sections/Services'
import { useSite } from '../context/SiteContext'

const Expertise = lazy(() => import('../sections/Expertise'))
const Portfolio = lazy(() => import('../sections/Portfolio'))
const TrustedBy = lazy(() => import('../sections/TrustedBy'))
const BlogPreview = lazy(() => import('../sections/BlogPreview'))
const TeamPreview = lazy(() => import('../sections/TeamPreview'))
const MapSection = lazy(() => import('../sections/MapSection'))
const Contact = lazy(() => import('../sections/Contact'))
const Testimonials = lazy(() => import('../sections/Testimonials'))

export default function Home() {
  const { loading, error, refresh, settings } = useSite()
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

  const showClientStories = (settings?.home_client_stories_enabled ?? '1') === '1'

  return (
    <>
      <Seo path="/" />
      <Hero />
      <About />
      <Services previewCount={5} />
      <Suspense fallback={null}>
        <Expertise />
      </Suspense>
      <Suspense fallback={null}>
        <Portfolio />
      </Suspense>
      <Suspense fallback={null}>
        <TrustedBy />
      </Suspense>
      <Suspense fallback={null}>
        <BlogPreview />
      </Suspense>
      {showClientStories ? (
        <Suspense fallback={<div className="section container section--testimonials-placeholder" aria-hidden />}>
          <Testimonials />
        </Suspense>
      ) : null}
      <Suspense fallback={null}>
        <TeamPreview />
      </Suspense>
      <Suspense fallback={null}>
        <MapSection />
      </Suspense>
      <Suspense fallback={null}>
        <Contact />
      </Suspense>
    </>
  )
}
