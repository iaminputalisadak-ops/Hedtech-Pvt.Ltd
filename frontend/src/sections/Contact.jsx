import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Send } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import { submitContact } from '../api/client'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function Contact() {
  const { settings } = useSite()
  const reduce = useReducedMotion()
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
      <h2 className="section-title">Contact</h2>
      <p className="section-lead">Tell us about your project. We typically respond within one business day.</p>

      <div className="contact-grid">
        <motion.div
          className="glass contact-aside"
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div>
            <div className="contact-aside-label">Email</div>
            {settings.business_email ? (
              <a href={`mailto:${settings.business_email}`} className="accent-link">
                {settings.business_email}
              </a>
            ) : (
              <span className="map-placeholder">Set in Admin → Settings</span>
            )}
          </div>
          <div>
            <div className="contact-aside-label">Phone</div>
            {settings.business_phone ? (
              <a href={`tel:${(settings.business_phone || '').replace(/\s/g, '')}`}>{settings.business_phone}</a>
            ) : (
              <span className="map-placeholder">—</span>
            )}
          </div>
          <div>
            <div className="contact-aside-label">Address</div>
            <p className="map-address">{settings.address || '—'}</p>
          </div>
          <div className="contact-social-row">
            {settings.social_linkedin ? (
              <a className="btn btn-ghost" href={settings.social_linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            ) : null}
            {settings.social_twitter ? (
              <a className="btn btn-ghost" href={settings.social_twitter} target="_blank" rel="noopener noreferrer">
                X / Twitter
              </a>
            ) : null}
            {settings.social_github ? (
              <a className="btn btn-ghost" href={settings.social_github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            ) : null}
            {settings.social_facebook ? (
              <a className="btn btn-ghost" href={settings.social_facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            ) : null}
            {settings.social_instagram ? (
              <a className="btn btn-ghost" href={settings.social_instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            ) : null}
            {settings.social_youtube ? (
              <a className="btn btn-ghost" href={settings.social_youtube} target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            ) : null}
            {settings.social_tiktok ? (
              <a className="btn btn-ghost" href={settings.social_tiktok} target="_blank" rel="noopener noreferrer">
                TikTok
              </a>
            ) : null}
            {settings.social_whatsapp ? (
              <a className="btn btn-ghost" href={settings.social_whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : null}
          </div>
        </motion.div>

        <motion.form
          className="glass contact-form-block"
          onSubmit={onSubmit}
          initial={fadeIn(reduce)}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <label htmlFor="contact-name" className="sr-only">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            className="contact-field-input"
            required
            placeholder="Name"
            autoComplete="name"
          />
          <label htmlFor="contact-email" className="sr-only">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className="contact-field-input"
            required
            placeholder="Email"
            autoComplete="email"
          />
          <label htmlFor="contact-message" className="sr-only">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            className="contact-field-input contact-field-textarea"
            required
            rows={5}
            placeholder="Your message"
          />
          {status ? (
            <p role="status" className={`contact-status ${status.ok ? 'contact-status--ok' : 'contact-status--err'}`}>
              {status.text}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'Sending…' : 'Send message'}
            <Send size={18} aria-hidden />
          </button>
        </motion.form>
      </div>
    </SectionContainer>
  )
}
