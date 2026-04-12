import { motion, useReducedMotion } from 'framer-motion'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function Expertise() {
  const { skills } = useSite()
  const reduce = useReducedMotion()

  return (
    <SectionContainer id="expertise">
      <div className="section-block-head">
        <p className="section-kicker">Capabilities</p>
        <h2 className="section-title">Expertise & capabilities</h2>
        <p className="section-lead">
          Depth across product engineering, experience design, and measurable growth — backed by tooling you can trust.
        </p>
      </div>
      <div className="glass expertise-bars">
        {skills.map((sk, i) => {
          const pct = Math.min(100, Math.max(0, Math.round(Number(sk.level) || 0)))
          return (
            <motion.div
              key={sk.id}
              className="expertise-skill-block"
              initial={fadeIn(reduce)}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <div className="skill-row">
                <span className="skill-row-name">{sk.name}</span>
                <span className="skill-row-level">{pct}%</span>
              </div>
              <div
                className={`expertise-glitch-range ${reduce ? 'expertise-glitch-range--reduce' : ''}`}
                style={{ '--p': pct, '--i': i }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${sk.name}, ${pct} percent`}
              />
            </motion.div>
          )
        })}
      </div>
      <p className="expertise-footnote">
        Tooling highlights: React, Vite, PHP APIs, MySQL, analytics pipelines, structured data, and performance budgets on every release.
      </p>
    </SectionContainer>
  )
}
