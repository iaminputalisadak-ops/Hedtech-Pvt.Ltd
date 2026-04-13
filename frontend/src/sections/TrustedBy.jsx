import CmsImage from '../components/CmsImage'
import { CMS_SIZES } from '../constants/cmsImageSizes'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

function TrustedItem({ c }) {
  return (
    <div className="trusted-by-item">
      {c.logo_url ? (
        <CmsImage
          src={c.logo_url}
          alt={c.name}
          sizes={CMS_SIZES.logoStrip}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      ) : (
        c.name
      )}
    </div>
  )
}

/** Repeat the partner list so one segment is usually wider than the viewport — avoids empty “dead” space in the pill. */
function buildMarqueeRow(trusted) {
  const cycles = Math.max(6, Math.ceil(42 / Math.max(trusted.length, 1)))
  const row = []
  for (let i = 0; i < cycles; i += 1) {
    for (const c of trusted) {
      row.push({ c, k: `${c.id}--${i}` })
    }
  }
  return row
}

export default function TrustedBy() {
  const { trusted } = useSite()
  if (!trusted.length) return null

  const row = buildMarqueeRow(trusted)

  return (
    <SectionContainer aria-label="Trusted by companies" className="trusted-by-section">
      <div className="section-block-head">
        <p className="section-kicker">Partners</p>
        <h2 className="section-title">Trusted by teams</h2>
        <p className="section-lead">Partners who expect velocity without sacrificing quality.</p>
      </div>
      <div className="glass trusted-by-marquee">
        <div className="trusted-by-viewport">
          <div className="trusted-by-track">
            <div className="trusted-by-segment">
              {row.map(({ c, k }) => (
                <TrustedItem key={`a-${k}`} c={c} />
              ))}
            </div>
            <div className="trusted-by-segment" aria-hidden="true">
              {row.map(({ c, k }) => (
                <TrustedItem key={`b-${k}`} c={c} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
