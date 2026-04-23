import { useState } from 'react'
import { motion as Motion, useReducedMotion } from 'framer-motion'
import { Mail, Phone, Send } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import { submitContact } from '../api/client'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

const DEFAULT_CONTACT_TITLE = 'Contact'
const DEFAULT_CONTACT_LEAD = 'Tell us about your project. We typically respond within one business day.'

export default function Contact() {
  const { settings } = useSite()
  const reduce = useReducedMotion()
  const sectionTitle = (settings.contact_section_title || '').trim() || DEFAULT_CONTACT_TITLE
  const sectionLead = (settings.contact_section_lead || '').trim() || DEFAULT_CONTACT_LEAD
  const [status, setStatus] = useState(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    const body = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      message: String(fd.get('message') || ''),
    }
    setPending(true)
    setStatus(null)
    try {
      await submitContact(body)
      setStatus({ ok: true, text: 'Thanks — we received your message and will reply soon.' })
      e.target.reset()
    } catch (err) {
      setStatus({ ok: false, text: err.message || 'Something went wrong.' })
    } finally {
      setPending(false)
    }
  }

  return (
    <SectionContainer id="contact">
      <div className="section-block-head">
        <p className="section-kicker">Get in touch</p>
        <h2 className="section-title">{sectionTitle}</h2>
        <p className="section-lead">{sectionLead}</p>
      </div>

      <div className="contact-layout-pro">
        <Motion.div
          className="contact-info-tiles"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="contact-tile contact-tile--cta">
            <div className="contact-tile-label">Quick contact</div>
            <div className="contact-quick-row">
              {settings.business_email ? (
                <a href={`mailto:${settings.business_email}`} className="contact-quick-link">
                  <Mail size={18} aria-hidden />
                  {settings.business_email}
                </a>
              ) : null}
              {settings.business_phone ? (
                <a href={`tel:${(settings.business_phone || '').replace(/\s/g, '')}`} className="contact-quick-link">
                  <Phone size={18} aria-hidden />
                  {settings.business_phone}
                </a>
              ) : null}
            </div>
            <p className="contact-microcopy">Include your timeline and any helpful links. We typically reply within one business day.</p>
          </div>
          <div className="contact-tile">
            <div className="contact-tile-label">Email</div>
            {settings.business_email ? (
              <a href={`mailto:${settings.business_email}`} className="accent-link">
                {settings.business_email}
              </a>
            ) : (
              <span className="map-placeholder">Set in Admin → Settings</span>
            )}
          </div>
          <div className="contact-tile">
            <div className="contact-tile-label">Phone</div>
            {settings.business_phone ? (
              <a href={`tel:${(settings.business_phone || '').replace(/\s/g, '')}`}>{settings.business_phone}</a>
            ) : (
              <span className="map-placeholder">—</span>
            )}
          </div>
          <div className="contact-tile">
            <div className="contact-tile-label">Address</div>
            <p className="map-address">{settings.address || '—'}</p>
          </div>
          <div className="contact-tile">
            <div className="contact-tile-label">Social</div>
            <div className="contact-social-row">
            {settings.social_facebook ? (
              <a className="contact-social-icon" href={settings.social_facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
                  <path
                    fill="currentColor"
                    d="M22 12a10 10 0 10-11.56 9.87v-6.99H8.08V12h2.36V9.8c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.09.18 2.09.18v2.3h-1.18c-1.16 0-1.52.72-1.52 1.46V12h2.59l-.41 2.88h-2.18v6.99A10 10 0 0022 12z"
                  />
                </svg>
              </a>
            ) : null}
            {settings.social_instagram ? (
              <a className="contact-social-icon" href={settings.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
                  <path
                    fill="currentColor"
                    d="M7.5 2h9A5.5 5.5 0 0122 7.5v9A5.5 5.5 0 0116.5 22h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zm0 2A3.5 3.5 0 004 7.5v9A3.5 3.5 0 007.5 20h9a3.5 3.5 0 003.5-3.5v-9A3.5 3.5 0 0016.5 4h-9z"
                  />
                  <path fill="currentColor" d="M12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" />
                  <path fill="currentColor" d="M17.8 6.2a1 1 0 110 2 1 1 0 010-2z" />
                </svg>
              </a>
            ) : null}
            {settings.social_tiktok ? (
              <a className="contact-social-icon" href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
                  <path
                    fill="currentColor"
                    d="M16 3h2c.2 2.2 1.4 3.8 4 4v2c-1.7 0-3.1-.5-4-1.2v7.4c0 3.2-2.6 5.8-5.8 5.8S6.4 18.4 6.4 15.2c0-3.1 2.5-5.7 5.6-5.8V12c-.2 0-.4-.1-.6-.1-1.6 0-3 1.3-3 3 0 1.8 1.4 3.2 3.2 3.2 1.9 0 3.4-1.5 3.4-3.4V3z"
                  />
                </svg>
              </a>
            ) : null}
            {settings.social_youtube ? (
              <a className="contact-social-icon" href={settings.social_youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
                  <path
                    fill="currentColor"
                    d="M21.6 7.2a3 3 0 00-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 002.4 7.2 31.7 31.7 0 002.1 12c0 1.6.1 3.2.3 4.8a3 3 0 002.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 002.1-2.1c.2-1.6.3-3.2.3-4.8 0-1.6-.1-3.2-.3-4.8zM10.2 15V9l5.2 3-5.2 3z"
                  />
                </svg>
              </a>
            ) : null}
            {settings.social_whatsapp ? (
              <a className="contact-social-icon" href={settings.social_whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
                  <path
                    fill="currentColor"
                    d="M12.04 2a9.94 9.94 0 00-8.6 14.98L2 22l5.2-1.36A9.95 9.95 0 1012.04 2zm5.82 14.48c-.25.7-1.45 1.33-2.01 1.4-.51.06-1.16.09-1.87-.12-.43-.13-.98-.32-1.69-.63-2.98-1.3-4.93-4.5-5.08-4.7-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.38.79-.38.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.6.84 2.07.91 2.22.07.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.32-.13.62.18.3.78 1.29 1.67 2.09 1.15 1.02 2.12 1.34 2.42 1.49.3.15.48.13.66-.08.18-.2.76-.89.97-1.2.2-.3.41-.25.68-.15.27.1 1.74.82 2.03.97.29.15.49.23.56.35.07.12.07.71-.18 1.4z"
                  />
                </svg>
              </a>
            ) : null}
            {settings.social_linkedin ? (
              <a className="contact-social-icon" href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
                  <path
                    fill="currentColor"
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </a>
            ) : null}
            {settings.social_twitter ? (
              <a className="contact-social-icon" href={settings.social_twitter} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
                  <path
                    fill="currentColor"
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </a>
            ) : null}
            {settings.social_github ? (
              <a className="contact-social-icon" href={settings.social_github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
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
        </Motion.div>

        <Motion.form
          className="glass contact-form-block contact-form-panel"
          onSubmit={onSubmit}
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="contact-form-head">
            <h3 className="contact-form-title">Send a message</h3>
            <p className="contact-form-lead">The more context you share, the faster we can give you a useful reply.</p>
          </div>

          <div className="contact-field">
            <label htmlFor="contact-name" className="contact-field-label">
              Name
            </label>
            <input id="contact-name" name="name" className="contact-field-input" required autoComplete="name" />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email" className="contact-field-label">
              Email
            </label>
            <input id="contact-email" name="email" type="email" className="contact-field-input" required autoComplete="email" />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message" className="contact-field-label">
              Message
            </label>
            <textarea id="contact-message" name="message" className="contact-field-input contact-field-textarea" required rows={6} />
            <p className="contact-field-hint">Tip: include your timeline, budget range (optional), and links to your current site or references.</p>
          </div>
          {status ? (
            <p role="status" className={`contact-status ${status.ok ? 'contact-status--ok' : 'contact-status--err'}`}>
              {status.text}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'Sending…' : 'Send message'}
            <Send size={18} aria-hidden />
          </button>
        </Motion.form>
      </div>
    </SectionContainer>
  )
}
