import { Link, NavLink } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import SiteBrand from './SiteBrand'
import { pathNav } from './siteNav'

export default function Footer() {
  const { settings } = useSite()
  const year = new Date().getFullYear()
  const brand = settings.site_name || 'Hedztech'
  const blurb = settings.mission || settings.hero_tagline || 'Engineering trust at the speed of product.'
  const address = settings.address || ''
  const phone = settings.business_phone || ''
  const email = settings.business_email || ''

  return (
    <footer className="site-footer modern-ft">
      <div className="modern-ft-main">
        <div className="container modern-ft-grid">
          <div className="modern-ft-brand">
            <SiteBrand />
            <p className="modern-ft-desc">{blurb}</p>
          </div>

          <div className="modern-ft-col">
            <h3 className="modern-ft-heading">Quick links</h3>
            <ul className="modern-ft-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              {pathNav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to}>{item.label}</NavLink>
                </li>
              ))}
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="modern-ft-col">
            <h3 className="modern-ft-heading">Contact us</h3>
            <ul className="modern-ft-contact">
              {address ? (
                <li>
                  <MapPin size={18} className="modern-ft-icon" aria-hidden />
                  <span>{address}</span>
                </li>
              ) : null}
              {phone ? (
                <li>
                  <Phone size={18} className="modern-ft-icon" aria-hidden />
                  <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <Mail size={18} className="modern-ft-icon" aria-hidden />
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              ) : null}
              {!address && !phone && !email ? (
                <li className="modern-ft-muted">Update address, phone, and email in admin settings.</li>
              ) : null}
            </ul>
          </div>

          <div className="modern-ft-col">
            <h3 className="modern-ft-heading">Newsletter</h3>
            <p className="modern-ft-lead">Get updates on launches, articles, and studio notes — no spam.</p>
            <form className="modern-ft-form" action="/contact" method="get">
              <label htmlFor="modern-ft-email" className="sr-only">
                Email address
              </label>
              <input id="modern-ft-email" name="email" type="email" placeholder="Your email address" autoComplete="email" />
              <button type="submit" className="modern-ft-submit">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="container modern-ft-social-wrap">
          <div className="modern-ft-social" aria-label="Social links">
            {settings.social_linkedin ? (
              <a className="modern-ft-social-btn" href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg className="modern-ft-soc-svg" viewBox="0 0 24 24" width={20} height={20} aria-hidden>
                  <path
                    fill="currentColor"
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </a>
            ) : null}
            {settings.social_twitter ? (
              <a className="modern-ft-social-btn" href={settings.social_twitter} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                <svg className="modern-ft-soc-svg" viewBox="0 0 24 24" width={20} height={20} aria-hidden>
                  <path
                    fill="currentColor"
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </a>
            ) : null}
            {settings.social_github ? (
              <a className="modern-ft-social-btn" href={settings.social_github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg className="modern-ft-soc-svg" viewBox="0 0 24 24" width={20} height={20} aria-hidden>
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="modern-ft-bottom">
        <div className="container modern-ft-bottom-inner">
          <p className="modern-ft-copy">
            © {year} {brand}. All rights reserved.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <Link to="/privacy" className="modern-ft-admin">
              Privacy
            </Link>
            <Link to="/terms" className="modern-ft-admin">
              Terms
            </Link>
            <Link to="/admin" className="modern-ft-admin">
              Admin
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .modern-ft {
          margin-top: 2rem;
        }

        .modern-ft-main {
          padding: clamp(2.75rem, 6vw, 4rem) 0 clamp(1.75rem, 4vw, 2.25rem);
          /* slate-950 — matches bottom bar in light theme */
          background: #020617;
          color: rgba(255, 255, 255, 0.92);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modern-ft-main .site-brand-text {
          color: #ffffff;
        }

        .modern-ft-main .modern-ft-desc {
          color: rgba(255, 255, 255, 0.78);
        }

        .modern-ft-main .modern-ft-heading {
          color: #ffffff;
        }

        .modern-ft-main .modern-ft-links a {
          color: rgba(255, 255, 255, 0.84);
        }

        .modern-ft-main .modern-ft-links a:hover,
        .modern-ft-main .modern-ft-contact a:hover {
          color: #ffffff;
        }

        .modern-ft-main .modern-ft-contact li,
        .modern-ft-main .modern-ft-contact a {
          color: rgba(255, 255, 255, 0.82);
        }

        .modern-ft-main .modern-ft-icon {
          color: #e0f2fe;
          opacity: 1;
        }

        .modern-ft-main .modern-ft-muted {
          color: rgba(255, 255, 255, 0.65);
        }

        .modern-ft-main .modern-ft-lead {
          color: rgba(255, 255, 255, 0.78);
        }

        .modern-ft-main .modern-ft-form input {
          background: rgba(255, 255, 255, 0.96);
          border-color: rgba(255, 255, 255, 0.45);
          color: #0f172a;
        }

        .modern-ft-main .modern-ft-form input::placeholder {
          color: #64748b;
        }

        .modern-ft-main .modern-ft-form input:focus {
          border-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
        }

        .modern-ft-main .modern-ft-submit {
          background: #ffffff;
          color: var(--accent);
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.18);
        }

        .modern-ft-main .modern-ft-submit:hover {
          filter: brightness(1.04);
          transform: translateY(-1px);
        }

        .modern-ft-main .modern-ft-social-wrap {
          border-top-color: rgba(255, 255, 255, 0.22);
        }

        .modern-ft-main .modern-ft-social-btn {
          border-color: rgba(255, 255, 255, 0.35);
          color: rgba(255, 255, 255, 0.88);
          background: rgba(255, 255, 255, 0.1);
        }

        html[data-theme='light'] .modern-ft-main .modern-ft-social-btn {
          border-color: rgba(255, 255, 255, 0.35);
          color: rgba(255, 255, 255, 0.88);
        }

        .modern-ft-main .modern-ft-social-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.55);
          background: rgba(255, 255, 255, 0.2);
        }

        .modern-ft-grid {
          display: grid;
          grid-template-columns: 1.15fr repeat(3, minmax(0, 1fr));
          gap: clamp(1.75rem, 4vw, 2.75rem);
          align-items: start;
        }

        @media (max-width: 1024px) {
          .modern-ft-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .modern-ft-brand {
            grid-column: 1 / -1;
            max-width: 36rem;
          }
        }

        @media (max-width: 560px) {
          .modern-ft-grid {
            grid-template-columns: 1fr;
          }
        }

        .modern-ft-brand .site-brand-link {
          margin-bottom: 1rem;
        }

        .modern-ft-desc {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.65;
          color: color-mix(in srgb, var(--text) 62%, var(--muted));
          max-width: 32rem;
        }

        .modern-ft-heading {
          margin: 0 0 1.1rem;
          font-family: var(--font-display, system-ui, sans-serif);
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text);
        }

        .modern-ft-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .modern-ft-links a {
          font-size: 0.95rem;
          font-weight: 500;
          color: color-mix(in srgb, var(--text) 58%, var(--muted));
        }

        .modern-ft-links a:hover,
        .modern-ft-contact a:hover {
          color: color-mix(in srgb, var(--accent) 88%, #fff 12%);
        }

        .modern-ft-contact {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .modern-ft-contact li {
          display: flex;
          gap: 0.65rem;
          align-items: flex-start;
          font-size: 0.92rem;
          line-height: 1.5;
          color: color-mix(in srgb, var(--text) 58%, var(--muted));
        }

        .modern-ft-contact a {
          color: color-mix(in srgb, var(--text) 58%, var(--muted));
        }

        .modern-ft-icon {
          flex-shrink: 0;
          margin-top: 0.12rem;
          opacity: 0.85;
          color: color-mix(in srgb, var(--accent) 88%, #fff 12%);
        }

        /* Icon uses global --accent */

        .modern-ft-muted {
          font-size: 0.9rem;
        }

        .modern-ft-lead {
          margin: 0 0 1rem;
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--muted);
        }

        .modern-ft-form {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        @media (min-width: 400px) {
          .modern-ft-form {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: stretch;
          }
          .modern-ft-form input {
            flex: 1;
            min-width: 12rem;
          }
        }

        .modern-ft-form input {
          padding: 0.7rem 0.95rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: color-mix(in srgb, var(--bg-elevated) 52%, transparent);
          color: var(--text);
          font-size: 0.9rem;
          box-sizing: border-box;
        }

        .modern-ft-form input::placeholder {
          color: color-mix(in srgb, var(--muted) 90%, var(--text));
        }

        /* Inputs inherit tokenized colors in both themes */

        .modern-ft-form input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
        }

        .modern-ft-submit {
          padding: 0.7rem 1.35rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          background: linear-gradient(120deg, var(--accent), var(--accent-2));
          color: var(--on-accent);
          white-space: nowrap;
          transition: filter 0.2s ease, transform 0.2s ease;
          box-shadow: 0 14px 44px color-mix(in srgb, var(--glow) 70%, transparent);
        }

        .modern-ft-submit:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .modern-ft-social-wrap {
          margin-top: clamp(1.75rem, 4vw, 2.25rem);
          padding-top: clamp(1.5rem, 3vw, 2rem);
          border-top: 1px solid var(--border);
        }

        .modern-ft-social {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          justify-content: center;
        }

        .modern-ft-social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.65rem;
          height: 2.65rem;
          border-radius: 50%;
          border: 1px solid var(--border);
          color: var(--muted);
          transition:
            color 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        html[data-theme='light'] .modern-ft-social-btn {
          border-color: rgba(255, 255, 255, 0.14);
          color: #cbd5e1;
        }

        .modern-ft-social-btn:hover {
          color: var(--accent);
          border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          transform: translateY(-2px);
        }

        .modern-ft-soc-svg {
          display: block;
        }

        .modern-ft-bottom {
          padding: 1rem 0 max(1rem, env(safe-area-inset-bottom, 0px));
          /* Match footer main surface in dark mode */
          background: #020617;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        html[data-theme='light'] .modern-ft-bottom {
          /* In light mode, keep a subtle separation without looking like a dark bar */
          background: color-mix(in srgb, var(--bg-elevated) 92%, var(--bg) 8%);
          border-top-color: var(--border);
        }

        .modern-ft-bottom-inner {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem 1.25rem;
        }

        .modern-ft-copy {
          margin: 0;
          font-size: 0.875rem;
          color: var(--muted);
        }

        html[data-theme='light'] .modern-ft-copy {
          color: #94a3b8;
        }

        .modern-ft-admin {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--muted);
        }

        html[data-theme='light'] .modern-ft-admin {
          color: #94a3b8;
        }

        .modern-ft-admin:hover {
          color: var(--accent);
        }
      `}</style>
    </footer>
  )
}
