import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function TeamPreview() {
  const { team, loading } = useSite()
  const reduce = useReducedMotion()
  const members = (team || []).slice(0, 4)

  if (loading || members.length === 0) {
    return null
  }

  return (
    <SectionContainer id="home-team">
      <div className="section-block-head">
        <p className="section-kicker">Our team</p>
        <h2 className="section-title">Meet the people behind the work</h2>
        <p className="section-lead">
          Design, engineering, and delivery — the same faces you will collaborate with from kickoff to launch.
        </p>
      </div>
      <div className="team-preview-grid">
        {members.map((m, i) => (
          <motion.article
            key={m.id}
            className="glass team-preview-card"
            initial={fadeIn(reduce)}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.2) }}
          >
            <div className="team-preview-photo">
              {m.photo_url ? (
                <img src={m.photo_url} alt={`${m.name} — portrait`} loading="lazy" decoding="async" />
              ) : (
                <span className="team-preview-initial" aria-hidden>
                  {String(m.name || '?')
                    .trim()
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="team-preview-name">{m.name}</h3>
            {m.role ? <p className="team-preview-role">{m.role}</p> : null}
          </motion.article>
        ))}
      </div>
      <div className="team-preview-foot">
        <Link to="/team" className="btn btn-primary">
          View full team <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </SectionContainer>
  )
}
