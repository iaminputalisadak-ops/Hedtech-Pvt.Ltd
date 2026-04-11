import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import Expertise from '../sections/Expertise'
import { useSite } from '../context/SiteContext'

export default function ExpertisePage() {
  const { settings } = useSite()
  const site = (settings.site_name || '').trim() || 'Hedztech'

  return (
    <>
      <Seo
        title={`Expertise — ${site}`}
        description="Capabilities across product engineering, UX, SEO, and cloud — depth you can ship with."
        path="/expertise"
      />
      <SectionContainer className="page-stack section--pb-0" tight>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
      </SectionContainer>
      <Expertise />
    </>
  )
}
