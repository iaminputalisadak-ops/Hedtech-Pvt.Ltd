import { Link } from 'react-router-dom'
import { useSite } from '../context/SiteContext'

export default function SiteBrand({ onClick, className = '' }) {
  const { settings } = useSite()
  const brand = settings.site_name || 'Hedztech'

  return (
    <Link
      to="/"
      className={`logo-link site-brand-link ${className}`.trim()}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}
    >
      <span aria-hidden className="site-brand-mark">
        H
      </span>
      <span className="site-brand-text" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
        {brand}
      </span>
    </Link>
  )
}
