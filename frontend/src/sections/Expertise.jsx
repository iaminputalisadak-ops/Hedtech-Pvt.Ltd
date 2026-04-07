import { motion, useReducedMotion } from 'framer-motion'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function Expertise() {
  const { skills } = useSite()
  const reduce = useReducedMotion()

  return (
    <SectionContainer id="expertise">
      <h2 className="section-title">Expertise & capabilities</h2>
      <p className="section-lead">
        Depth across product engineering, experience design, and measurable growth — backed by tooling you can trust.
      </p>
      <div className="glass expertise-bars">
        {skills.map((sk, i) => (
          <motion.div
            key={sk.id}
            initial={fadeIn(reduce)}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          >
            <div className="skill-row">
              <span className="skill-row-name">{sk.name}</span>
              <span className="skill-row-level">{sk.level}%</span>
            </div>
            <div className="skill-track" role="progressbar" aria-valuenow={sk.level} aria-valuemin={0} aria-valuemax={100} aria-label={sk.name}>
              <motion.div
                className="skill-fill"
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: sk.level / 100 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 + i * 0.04 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <p className="expertise-footnote">
        Tooling highlights: React, Vite, PHP APIs, MySQL, analytics pipelines, structured data, and performance budgets on every release.
      </p>
    </SectionContainer>
  )
}
