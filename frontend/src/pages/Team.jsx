import { Link } from 'react-router-dom'
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
      <SectionContainer>
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

        <div className="team-page-grid">
          {(team || []).map((m) => (
            <article key={m.id} className="glass team-page-card">
              <div className="team-page-card-media">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={`${m.name} — portrait`} loading="lazy" decoding="async" />
                ) : (
                  <span className="team-preview-initial" aria-hidden>
                    {String(m.name || '?')
                      .trim()
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div className="team-page-card-body">
                <h3 className="team-page-name">{m.name}</h3>
                {m.role ? <p className="team-page-role">{m.role}</p> : null}
                {m.bio ? <p className="team-page-bio">{m.bio}</p> : null}
              </div>
              {m.linkedin_url ? (
                <a className="btn btn-ghost btn-compact" href={m.linkedin_url} target="_blank" rel="noopener noreferrer">
                  LinkedIn →
                </a>
              ) : null}
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
