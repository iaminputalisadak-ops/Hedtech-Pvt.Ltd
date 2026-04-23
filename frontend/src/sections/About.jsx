import { motion as Motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'
import { displayedProjectCount } from '../utils/displayedProjectCount'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function About() {
  const { settings, projects, skills, loading } = useSite()
  const reduce = useReducedMotion()
  const statProjects = loading ? null : displayedProjectCount(settings, projects)
  const statTracks = loading ? null : String(skills?.length ?? 0)

  const intro =
    settings.about_intro ||
    'Hedztech partners with ambitious teams to design and ship high-performance websites, products, and campaigns.'

  const mission = settings.mission || 'Deliver reliable, beautiful technology that moves your business forward.'
  const vision = settings.vision || 'To be the studio teams trust for craft, communication, and outcomes.'

  let values = []
  try {
    const parsed = JSON.parse(settings.values || '[]')
    values = Array.isArray(parsed) ? parsed : []
  } catch {
    values = []
  }

  return (
    <SectionContainer id="about">
      <div className="section-block-head">
        <p className="section-kicker">About us</p>
        <Motion.h1
          className="section-title"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.35 }}
        >
          About {settings.site_name || 'Hedztech'}
        </Motion.h1>
        <Motion.p
          className="section-lead"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3 }}
        >
          {intro}
        </Motion.p>
      </div>

      <div className="about-hero-actions">
        <Link to="/contact" className="btn btn-primary">
          Start a project
        </Link>
        <Link to="/work" className="btn btn-ghost">
          View work
        </Link>
      </div>

      <Motion.div
        className="about-stats"
        initial={fadeIn(reduce)}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.35 }}
        aria-label="Studio highlights"
      >
        <div className="about-stat-card">
          <p className="about-stat-value">{statProjects == null ? '…' : `${statProjects}+`}</p>
          <p className="about-stat-label">Shipped milestones</p>
        </div>
        <div className="about-stat-card">
          <p className="about-stat-value">{statTracks == null ? '…' : statTracks}</p>
          <p className="about-stat-label">Core capability tracks</p>
        </div>
      </Motion.div>

      <div className="about-cred-strip" aria-label="What we’re known for">
        <div className="about-cred-pill">Performance-first builds</div>
        <div className="about-cred-pill">SEO-ready structure</div>
        <div className="about-cred-pill">Clear communication</div>
        <div className="about-cred-pill">Design systems</div>
      </div>

      <div className="layout-grid-2">
        <Motion.div
          className="glass nested-card"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <h3>Mission</h3>
          <p>{mission}</p>
        </Motion.div>
        <Motion.div
          className="glass nested-card"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h3>Vision</h3>
          <p>{vision}</p>
        </Motion.div>
      </div>
      {values.length ? (
        <Motion.div
          className="value-chips"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          {values.map((v) => (
            <span key={v} className="value-chip">
              {v}
            </span>
          ))}
        </Motion.div>
      ) : null}
    </SectionContainer>
  )
}
