import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import About from '../sections/About'
import { useSite } from '../context/SiteContext'

export default function AboutPage() {
  const { settings } = useSite()
  const site = (settings.site_name || '').trim() || 'Hedztech'
  const desc =
    (settings.about_intro || '').trim().slice(0, 165) ||
    (settings.mission || '').trim().slice(0, 165) ||
    'Who we are, what we stand for, and how we work with teams that care about quality and outcomes.'

  return (
    <>
      <Seo title={`About — ${site}`} description={desc} path="/about" />
      <SectionContainer className="page-stack section--pb-0" tight>
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
      </SectionContainer>
      <About />
    </>
  )
}
