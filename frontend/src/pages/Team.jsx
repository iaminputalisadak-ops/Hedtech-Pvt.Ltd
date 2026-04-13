import { Link } from 'react-router-dom'
import LinkedInIcon from '../components/LinkedInIcon'
import CmsImage from '../components/CmsImage'
import { CMS_SIZES } from '../constants/cmsImageSizes'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import { useSite } from '../context/SiteContext'

export default function Team() {
  const { team, loading } = useSite()

  return (
    <>
      <Seo
        title="Team — Hedztech"
        description="Meet the people behind Hedztech — design, engineering, and delivery."
        path="/team"
      />
      <SectionContainer className="team-showcase-section team-showcase-section--page">
        <p className="section-back">
          <Link to="/" className="text-back-link">
            ← Home
          </Link>
        </p>
        <div className="section-block-head">
          <p className="section-kicker">Our team</p>
          <h1 className="section-title">Team</h1>
          <p className="section-lead">The people building your product with craft, speed, and accountability.</p>
        </div>

        {loading ? <p className="page-state-text">Loading team…</p> : null}

        <div className="team-showcase-grid team-showcase-grid--page">
          {(team || []).map((m) => (
            <article key={m.id} className="team-showcase-card team-showcase-card--page">
              <div className="team-showcase-media">
                <div className="team-showcase-media-inner">
                  {m.photo_url ? (
                    <CmsImage
                      src={m.photo_url}
                      alt={`${m.name} — portrait`}
                      sizes={CMS_SIZES.teamPortrait}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  ) : (
                    <span className="team-showcase-initial" aria-hidden>
                      {String(m.name || '?')
                        .trim()
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                {m.linkedin_url ? (
                  <a
                    className="team-showcase-social"
                    href={m.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${m.name} on LinkedIn`}
                  >
                    <LinkedInIcon size={18} />
                  </a>
                ) : null}
              </div>
              <div className="team-showcase-body team-showcase-body--page">
                <h3 className="team-showcase-name">{m.name}</h3>
                {m.role ? <p className="team-showcase-role">{m.role}</p> : null}
                <span className="team-showcase-accent" aria-hidden />
                {m.bio ? <p className="team-showcase-bio">{m.bio}</p> : null}
              </div>
            </article>
          ))}
        </div>

        {!loading && (!team || team.length === 0) ? (
          <div className="glass" style={{ padding: '1.25rem' }}>
            <p className="page-state-text" style={{ margin: 0 }}>
              No team members yet. Add them in <strong>Admin → Team</strong>.
            </p>
          </div>
        ) : null}
      </SectionContainer>
    </>
  )
}
