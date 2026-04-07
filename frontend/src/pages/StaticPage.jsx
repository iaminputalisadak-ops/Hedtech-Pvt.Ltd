import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'

/**
 * Legal / static pages with the same framed container as other routes.
 */
export default function StaticPage({ title, description, path, children }) {
  return (
    <>
      <Seo title={`${title} — Hedztech`} description={description} path={path} />
      <SectionContainer>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <h1 className="section-title">{title}</h1>
        <div className="static-prose">{children}</div>
      </SectionContainer>
    </>
  )
}
