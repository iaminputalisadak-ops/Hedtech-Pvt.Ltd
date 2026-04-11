import { motion, useReducedMotion } from 'framer-motion'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

export default function TrustedBy() {
  const { trusted } = useSite()
  const reduce = useReducedMotion()
  if (!trusted.length) return null
  const doubled = [...trusted, ...trusted]

  return (
    <SectionContainer aria-label="Trusted by companies" className="trusted-by-section">
      <div className="section-block-head">
        <p className="section-kicker">Partners</p>
        <h2 className="section-title">Trusted by teams</h2>
        <p className="section-lead">Partners who expect velocity without sacrificing quality.</p>
      </div>
      <div className="glass trusted-by-marquee">
        <motion.div
          className="trusted-by-track"
          animate={reduce ? undefined : { x: ['0%', '-50%'] }}
          transition={reduce ? undefined : { duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {doubled.map((c, i) => (
            <div key={`${c.id}-${i}`} className="trusted-by-item">
              {c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy" /> : c.name}
            </div>
          ))}
        </motion.div>
      </div>
    </SectionContainer>
  )
}
