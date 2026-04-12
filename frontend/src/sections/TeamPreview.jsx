import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import LinkedInIcon from '../components/LinkedInIcon'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

/** Featured row on the home page — rest of the roster lives on /team */
const HOME_TEAM_FEATURED = 3

export default function TeamPreview() {
  const { team, loading } = useSite()
  const reduce = useReducedMotion()
  const members = (team || []).slice(0, HOME_TEAM_FEATURED)
  const n = members.length
  const countClass = n === 1 ? 'team-showcase-grid--n1' : n === 2 ? 'team-showcase-grid--n2' : 'team-showcase-grid--n3'

  if (loading || members.length === 0) {
    return null
  }

  return (
    <SectionContainer id="home-team" className="team-showcase-section">
      <div className="section-block-head">
        <p className="section-kicker">Our team</p>
        <h2 className="section-title">Meet the people behind the work</h2>
        <p className="section-lead">
          Design, engineering, and delivery — the same faces you will collaborate with from kickoff to launch.
        </p>
      </div>
      <div className={`team-showcase-grid team-showcase-grid--home ${countClass}`}>
        {members.map((m, i) => (
          <motion.article
            key={m.id}
            className="team-showcase-card"
            initial={fadeIn(reduce)}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.22) }}
            whileHover={reduce ? undefined : { y: -4 }}
          >
            <div className="team-showcase-media">
              <div className="team-showcase-media-inner">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={`${m.name} — portrait`} loading="lazy" decoding="async" />
                ) : (
                  <span className="team-showcase-initial" aria-hidden>
                    {String(m.name || '?')
                      .trim()
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              {m.linkedin_url ? (
                <a
                  className="team-showcase-social"
                  href={m.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${m.name} on LinkedIn`}
                >
                  <LinkedInIcon size={18} />
                </a>
              ) : null}
            </div>
            <div className="team-showcase-body">
              <h3 className="team-showcase-name">{m.name}</h3>
              {m.role ? <p className="team-showcase-role">{m.role}</p> : null}
              <span className="team-showcase-accent" aria-hidden />
            </div>
          </motion.article>
        ))}
      </div>
      <div className="team-showcase-foot">
        <Link to="/team" className="btn btn-primary">
          View full team <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </SectionContainer>
  )
}
