import { motion as Motion, useReducedMotion } from 'framer-motion'
import SectionContainer from '../components/SectionContainer'
import { DynamicIcon } from '../utils/icons'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function Services({ showHeader = true }) {
  const { services } = useSite()
  const reduce = useReducedMotion()

  return (
    <SectionContainer id="services">
      {showHeader ? (
        <>
          <h2 className="section-title">Services</h2>
          <p className="section-lead">
            End-to-end delivery focused on speed, accessibility, and ROI — from first prototype to ongoing optimization.
          </p>
        </>
      ) : null}
      <div className="layout-grid-cards layout-grid-cards--wide">
        {services.map((s, i) => (
          <Motion.article
            key={s.id}
            className="glass service-card"
            initial={fadeIn(reduce)}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.24) }}
          >
            <div className="service-card-glow" aria-hidden />
            <div className="service-card-head">
              <span className="glass service-card-icon-wrap">
                <DynamicIcon name={s.icon} />
              </span>
              <h3>{s.title}</h3>
            </div>
            <p className="service-card-desc">{s.description}</p>
          </Motion.article>
        ))}
      </div>
    </SectionContainer>
  )
}
