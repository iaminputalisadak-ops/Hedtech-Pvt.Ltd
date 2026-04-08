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
        <h1 className="section-title">Team</h1>
        <p className="section-lead">The people building your product with craft, speed, and accountability.</p>

        {loading ? <p className="page-state-text">Loading team…</p> : null}

        <div className="layout-grid-cards layout-grid-cards--wide">
          {(team || []).map((m) => (
            <article key={m.id} className="glass" style={{ padding: '1.1rem 1.2rem', display: 'grid', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-strong)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {m.photo_url ? (
                    <img
                      src={m.photo_url}
                      alt={`${m.name} photo`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span style={{ fontWeight: 800, color: 'var(--muted)' }}>{String(m.name || '?').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{m.name}</h2>
                  {m.role ? <p style={{ margin: '0.1rem 0 0', color: 'var(--muted)' }}>{m.role}</p> : null}
                </div>
              </div>

              {m.bio ? <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.65 }}>{m.bio}</p> : null}

              {m.linkedin_url ? (
                <a className="btn btn-ghost btn-compact" href={m.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ justifySelf: 'start' }}>
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

