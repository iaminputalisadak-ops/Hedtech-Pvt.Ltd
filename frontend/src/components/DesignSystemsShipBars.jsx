import { useRef } from 'react'
import { motion as Motion, useInView, useReducedMotion } from 'framer-motion'

/** Matches seeded post slug in database */
export const DESIGN_SYSTEMS_SHIP_SLUG = 'design-systems-that-ship'

const SKILLS = [
  { name: 'React & Modern JS', level: 95 },
  { name: 'PHP & APIs', level: 90 },
  { name: 'UI Systems & Design', level: 92 },
  { name: 'SEO & Analytics', level: 88 },
  { name: 'Cloud & DevOps', level: 82 },
]

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

function SkillRow({ name, level, index, reduce }) {
  const rowRef = useRef(null)
  const inView = useInView(rowRef, { once: true, amount: 0.45 })

  return (
    <Motion.div
      ref={rowRef}
      className="ds-ship-row"
      initial={fadeIn(reduce)}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <div className="ds-ship-row-head">
        <span className="ds-ship-name">{name}</span>
        <span className="ds-ship-pct" aria-live="polite">
          {level}
          <span className="ds-ship-pct-suffix">%</span>
        </span>
      </div>
      <div
        className="ds-ship-track"
        role="progressbar"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={name}
      >
        <Motion.div
          className="ds-ship-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView ? level / 100 : 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: index * 0.09 }
          }
        />
      </div>
    </Motion.div>
  )
}

export default function DesignSystemsShipBars() {
  const reduce = useReducedMotion()

  return (
    <div className="ds-ship-bars" aria-label="Capability levels">
      {SKILLS.map((sk, i) => (
        <SkillRow key={sk.name} name={sk.name} level={sk.level} index={i} reduce={reduce} />
      ))}
    </div>
  )
}
