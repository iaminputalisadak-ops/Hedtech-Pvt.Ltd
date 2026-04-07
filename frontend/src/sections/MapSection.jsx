import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Phone, Mail } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function MapSection() {
  const { settings } = useSite()
  const reduce = useReducedMotion()
  const embed = settings.map_embed_url

  return (
    <SectionContainer id="location">
      <h2 className="section-title">Visit & connect</h2>
      <p className="section-lead">Interactive map and direct lines to our team — editable from the admin panel.</p>
      <div className="map-layout">
        <motion.div
          className="glass map-info-card"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="map-info-row">
            <MapPin size={20} className="icon-accent icon-accent--offset" aria-hidden />
            <div>
              <div className="contact-aside-label">Address</div>
              <p className="map-address">{settings.address || 'Update in admin'}</p>
            </div>
          </div>
          <div className="map-info-row map-info-row--center">
            <Phone size={20} className="icon-accent" aria-hidden />
            {settings.business_phone ? (
              <a href={`tel:${(settings.business_phone || '').replace(/\s/g, '')}`}>{settings.business_phone}</a>
            ) : (
              <span className="map-placeholder">—</span>
            )}
          </div>
          <div className="map-info-row map-info-row--center">
            <Mail size={20} className="icon-accent" aria-hidden />
            {settings.business_email ? (
              <a href={`mailto:${settings.business_email}`}>{settings.business_email}</a>
            ) : (
              <span className="map-placeholder">—</span>
            )}
          </div>
        </motion.div>
        <motion.div
          className="glass map-frame"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {embed ? (
            <iframe title="Business location map" src={embed} loading="lazy" />
          ) : (
            <div className="map-frame-placeholder">Add a Google Maps embed URL in admin settings.</div>
          )}
        </motion.div>
      </div>
    </SectionContainer>
  )
}
