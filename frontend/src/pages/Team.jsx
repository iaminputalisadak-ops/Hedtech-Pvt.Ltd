import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LinkedInIcon from '../components/LinkedInIcon'
import CmsImage from '../components/CmsImage'
import { CMS_SIZES } from '../constants/cmsImageSizes'
import SectionContainer from '../components/SectionContainer'
import Seo from '../components/Seo'
import FaqStructuredData from '../components/FaqStructuredData'
import { getTeam } from '../api/client'

const TEAM_FAQ = [
  { q: 'Who will I work with day-to-day?', a: 'The same people you meet at kickoff stay involved through delivery. You’ll have a clear point of contact and predictable updates.' },
  { q: 'Can I hire Hedztech for ongoing support?', a: 'Yes. We offer maintenance and support for performance, security updates, and iterative improvements.' },
  { q: 'Do you work with international clients?', a: 'Yes. We’re async-friendly across timezones with milestone-based delivery and written weekly updates.' },
]

export default function Team() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getTeam()
        if (!cancelled) setTeam(res.items || [])
      } catch {
        if (!cancelled) setTeam([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Seo
        title="Team — Hedztech"
        description="Meet the Hedztech team — design, engineering, and delivery. The people who build, ship, and support your product."
        path="/team"
        keywords="hedztech team, web development team, designers, developers, nepali agency"
      />
      <FaqStructuredData path="/team" title="Team — Hedztech" items={TEAM_FAQ} />
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

        <div className="team-showcase-grid team-showcase-grid--page team-showcase-grid--dense">
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

        <div className="team-page-cta">
          <div className="glass team-page-cta__panel">
            <h2 style={{ marginTop: 0 }}>Want to work with us?</h2>
            <p style={{ marginTop: '0.5rem', marginBottom: '1rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              Tell us what you’re building and your timeline. We’ll reply with clear next steps and options.
            </p>
            <div className="team-page-cta__actions">
              <Link to="/contact" className="btn btn-primary">
                Contact us
              </Link>
              <Link to="/work" className="btn btn-ghost">
                View projects
              </Link>
            </div>
          </div>
        </div>
      </SectionContainer>
    </>
  )
}
