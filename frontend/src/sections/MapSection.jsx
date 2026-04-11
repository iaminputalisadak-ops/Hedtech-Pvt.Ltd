import { motion as Motion, useReducedMotion } from 'framer-motion'
import { MapPin, Phone, Mail } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

function normalizeMapsEmbed(input) {
  const raw = (input ?? '').toString().trim()
  if (!raw) return ''

  // Allow pasting either a plain URL or the full <iframe ...> embed snippet.
  if (raw.includes('<iframe')) {
    const m = raw.match(/\s+src=(?:"([^"]+)"|'([^']+)')/i)
    return (m?.[1] || m?.[2] || '').trim()
  }
  return raw
}

const DEFAULT_MAP_TITLE = 'Visit & connect'
const DEFAULT_MAP_LEAD = 'Interactive map and direct lines to our team — details are editable from the admin panel.'

export default function MapSection() {
  const { settings } = useSite()
  const reduce = useReducedMotion()
  const embed = normalizeMapsEmbed(settings.map_embed_url)
  const mapTitle = (settings.map_section_title || '').trim() || DEFAULT_MAP_TITLE
  const mapLead = (settings.map_section_lead || '').trim() || DEFAULT_MAP_LEAD

  return (
    <SectionContainer id="location">
      <h2 className="section-title">{mapTitle}</h2>
      <p className="section-lead">{mapLead}</p>
      <div className="map-layout">
        <Motion.div
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
        </Motion.div>
        <Motion.div
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
        </Motion.div>
      </div>
    </SectionContainer>
  )
}
