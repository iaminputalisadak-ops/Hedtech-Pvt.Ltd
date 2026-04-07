import { Link } from 'react-router-dom'

/**
 * Jump to a section on the homepage from any route (React Router hash navigation).
 * @param {string} sectionId - DOM id without # (e.g. "contact", "services")
 */
export default function HomeHashLink({ sectionId, children, className, style, onClick, ...rest }) {
  const hash = sectionId.startsWith('#') ? sectionId : `#${sectionId}`
  return (
    <Link
      to={{ pathname: '/', hash }}
      className={className}
      style={style}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Link>
  )
}
