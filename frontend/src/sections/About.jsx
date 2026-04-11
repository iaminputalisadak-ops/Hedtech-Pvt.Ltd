import { motion, useReducedMotion } from 'framer-motion'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function About() {
  const { settings, projects, skills } = useSite()
  const reduce = useReducedMotion()
  const statProjects = (settings.project_count || String(projects?.length || 0)).toString().trim()
  const statTracks = String(skills?.length || 0)

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
        <motion.h2
          className="section-title"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.35 }}
        >
          About
        </motion.h2>
        <motion.p
          className="section-lead"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3 }}
        >
          {intro}
        </motion.p>
      </div>
      <motion.div
        className="about-stats"
        initial={fadeIn(reduce)}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.35 }}
        aria-label="Studio highlights"
      >
        <div className="about-stat-card">
          <p className="about-stat-value">{statProjects}+</p>
          <p className="about-stat-label">Shipped milestones</p>
        </div>
        <div className="about-stat-card">
          <p className="about-stat-value">{statTracks}</p>
          <p className="about-stat-label">Core capability tracks</p>
        </div>
      </motion.div>
      <div className="layout-grid-2">
        <motion.div
          className="glass nested-card"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <h3>Mission</h3>
          <p>{mission}</p>
        </motion.div>
        <motion.div
          className="glass nested-card"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h3>Vision</h3>
          <p>{vision}</p>
        </motion.div>
      </div>
      {values.length ? (
        <motion.div
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
        </motion.div>
      ) : null}
    </SectionContainer>
  )
}
