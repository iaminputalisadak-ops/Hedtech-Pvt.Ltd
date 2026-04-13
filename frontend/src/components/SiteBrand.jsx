import { Link, useLocation } from 'react-router-dom'
import { useSite } from '../context/SiteContext'

export default function SiteBrand({ onClick, className = '' }) {
  const { settings } = useSite()
  const brand = settings.site_name || 'Hedztech'
  const { pathname } = useLocation()

  const logoUrl = (settings.brand_logo_url || '').trim()
  const markUrl = (settings.brand_mark_url || '').trim()
  const useImg = logoUrl || markUrl

  return (
    <Link
      to="/"
      className={`logo-link site-brand-link ${className}`.trim()}
      onClick={(e) => {
        onClick?.(e)
        // Always return to homepage hero and scroll to top smoothly.
        // If already on homepage, prevent a no-op navigation and just scroll.
        if (pathname === '/') {
          e.preventDefault()
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      }}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}
    >
      {useImg ? (
        <span aria-hidden className="site-brand-mark site-brand-mark--img">
          <img
            src={markUrl || logoUrl}
            alt=""
            sizes="160px"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </span>
      ) : (
        <span aria-hidden className="site-brand-mark">
          H
        </span>
      )}
      <span className="site-brand-text">{brand}</span>
    </Link>
  )
}
