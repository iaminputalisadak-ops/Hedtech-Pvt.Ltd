import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { useSite } from '../context/SiteContext'
import LazyYouTube from '../components/LazyYouTube'
import { Star } from 'lucide-react'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

function ReviewCard({ t }) {
  return (
    <article className="review-card">
      <LazyYouTube videoUrl={t.video_url} title={`Video testimonial from ${t.name}`} />
      <div className="review-card-body">
        <div className="review-stars" aria-hidden>
          {Array.from({ length: Math.min(5, Math.max(1, Number(t.rating) || 5)) }).map((_, i) => (
            <Star key={i} size={18} fill="var(--accent)" color="var(--accent)" />
          ))}
        </div>
        <h3 className="review-name">{t.name}</h3>
        <p className="review-role">{t.role}</p>
        {t.quote ? <p className="review-quote">{t.quote}</p> : null}
      </div>
    </article>
  )
}

export default function Reviews() {
  const { testimonials, loading } = useSite()
  const reduce = useReducedMotion()

  if (loading) {
    return (
      <SectionContainer as="div" className="page-state">
        <p className="page-state-text">Loading reviews…</p>
      </SectionContainer>
    )
  }

  return (
    <>
      <Seo title="Client stories — Hedztech" description="Real feedback and video testimonials from our clients." path="/reviews" />
      <SectionContainer>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">Client stories</h1>
        <p className="section-lead">Real feedback and video testimonials from teams we have partnered with.</p>

        <div className="layout-grid-cards layout-grid-cards--wide">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={fadeIn(reduce)}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.25) }}
            >
              <ReviewCard t={t} />
            </motion.div>
          ))}
        </div>

        {!testimonials.length ? <p className="page-state-text">No reviews yet. Add some in the admin panel.</p> : null}
      </SectionContainer>
    </>
  )
}

