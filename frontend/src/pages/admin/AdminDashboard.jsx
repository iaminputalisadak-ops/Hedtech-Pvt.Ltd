import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import {
  adminContactMessages,
  adminCreate,
  adminDelete,
  adminList,
  adminLogout,
  adminMe,
  adminPatchSettings,
  adminUpdate,
  adminUpload,
  apiFetch,
} from '../../api/client'
import AdminShell from './AdminShell'
import { useSite } from '../../context/SiteContext'

const HERO_BG_MODES = [
  { value: 'animated', label: 'Animated (default)' },
  { value: 'image', label: 'Image wallpaper' },
  { value: 'gradient', label: 'CSS gradient' },
]

const HERO_WALLPAPER_FIT = [
  { value: 'cover', label: 'Cover (fills, may crop)' },
  { value: 'contain', label: 'Contain (no crop)' },
]

const HERO_WALLPAPER_POS = [
  { value: 'center', label: 'Center' },
  { value: 'center top', label: 'Top' },
  { value: 'center bottom', label: 'Bottom' },
  { value: 'left center', label: 'Left' },
  { value: 'right center', label: 'Right' },
]

const SETTINGS_GROUPS = [
  {
    title: 'SEO',
    cols2: true,
    fields: [
      ['meta_title', 'Page title (browser tab)'],
      ['meta_description', 'Short description for Google'],
      ['og_image', 'Social share image URL'],
      ['canonical_base', 'Your site URL (https://…)'],
    ],
  },
  {
    title: 'Homepage text',
    cols2: false,
    fields: [
      ['site_name', 'Company name'],
      ['project_count', 'Number shown on homepage'],
      ['hero_headline', 'Main headline'],
      ['hero_tagline', 'Subtext under headline'],
      ['brand_logo_url', 'Brand logo URL (optional)'],
      ['brand_logo_upload', 'Upload website logo', 'upload', { kind: 'brand-logo', setKey: 'brand_logo_url', modeKey: null }],
      ['brand_mark_url', 'Brand mark/icon URL (optional)'],
      ['brand_mark_upload', 'Upload brand mark / icon', 'upload', { kind: 'brand-mark', setKey: 'brand_mark_url', modeKey: null }],
      ['brand_favicon_url', 'Favicon URL (optional)'],
      ['brand_favicon_upload', 'Upload favicon (.ico/.png/.svg)', 'upload', { kind: 'brand-favicon', setKey: 'brand_favicon_url', modeKey: null, accept: 'image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico' }],
      ['hero_bg_mode', 'Hero background type', 'select', HERO_BG_MODES],
      ['hero_wallpaper_url', 'Hero wallpaper image URL (optional)'],
      ['hero_wallpaper_upload', 'Upload hero wallpaper (recommended)', 'upload', { kind: 'hero-wallpaper', setKey: 'hero_wallpaper_url', modeKey: 'hero_bg_mode', modeValue: 'image' }],
      ['hero_wallpaper_opacity', 'Hero wallpaper opacity (0–1, optional)'],
      ['hero_wallpaper_fit', 'Hero wallpaper fit', 'select', HERO_WALLPAPER_FIT],
      ['hero_wallpaper_position', 'Hero wallpaper position', 'select', HERO_WALLPAPER_POS],
      ['hero_gradient_css', 'Hero gradient CSS (linear-gradient / radial-gradient)', 'text'],
      ['about_intro', 'About paragraph'],
      ['mission', 'Mission'],
      ['vision', 'Vision'],
      ['values', 'Values (JSON list)'],
    ],
  },
  {
    title: 'Contact & map',
    cols2: true,
    fields: [
      ['business_email', 'Email'],
      ['business_phone', 'Phone'],
      ['address', 'Address'],
      ['map_lat', 'Map latitude'],
      ['map_lng', 'Map longitude'],
      ['map_embed_url', 'Google Maps embed link'],
    ],
  },
  {
    title: 'Social',
    cols2: true,
    fields: [
      ['social_linkedin', 'LinkedIn'],
      ['social_twitter', 'X / Twitter'],
      ['social_github', 'GitHub'],
      ['social_facebook', 'Facebook'],
      ['social_instagram', 'Instagram'],
      ['social_youtube', 'YouTube'],
      ['social_tiktok', 'TikTok'],
      ['social_whatsapp', 'WhatsApp'],
    ],
  },
  {
    title: 'Reviews',
    cols2: false,
    fields: [['reviews_autoscroll', 'Auto-scroll the client reviews carousel (when off, visitors can still swipe or use arrows)', 'checkbox']],
  },
]

const svcFields = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description', multiline: true },
  { key: 'icon', label: 'Icon name' },
  { key: 'sort_order', label: 'Order', number: true },
]

const skillFields = [
  { key: 'name', label: 'Name' },
  { key: 'level', label: 'Level (0–100)', number: true, min: 0, max: 100 },
  { key: 'sort_order', label: 'Order', number: true },
]

const projectFields = [
  { key: 'title', label: 'Title' },
  { key: 'slug', label: 'URL slug' },
  { key: 'excerpt', label: 'Short summary', multiline: true },
  { key: 'body', label: 'Full text', multiline: true },
  { key: 'category', label: 'Category' },
  { key: 'image_url', label: 'Image URL' },
  { key: 'live_url', label: 'Live site URL' },
  { key: 'featured', label: 'Featured on home', boolean: true },
]

const blogFields = [
  { key: 'title', label: 'Title' },
  { key: 'slug', label: 'URL slug' },
  { key: 'excerpt', label: 'Summary', multiline: true },
  { key: 'body', label: 'Article text', multiline: true },
  { key: 'category', label: 'Category' },
  { key: 'tags', label: 'Tags' },
  { key: 'meta_title', label: 'SEO title (optional)' },
  { key: 'meta_description', label: 'SEO description (optional)', multiline: true },
  { key: 'og_image', label: 'OG image URL (optional)' },
  { key: 'published', label: 'Published', boolean: true },
]

const trustedFields = [
  { key: 'name', label: 'Name' },
  { key: 'logo_url', label: 'Logo URL' },
  { key: 'sort_order', label: 'Order', number: true },
]

const testimonialFields = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'video_url', label: 'YouTube URL (watch, embed, or youtu.be)' },
  { key: 'rating', label: 'Stars (1–5)', number: true, min: 1, max: 5 },
  { key: 'quote', label: 'Quote', multiline: true },
  { key: 'sort_order', label: 'Order', number: true },
  { key: 'published', label: 'Visible on site', boolean: true, default: true },
]

const teamFields = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'bio', label: 'Bio', multiline: true },
  { key: 'photo_url', label: 'Photo URL' },
  { key: 'photo_upload', label: 'Upload photo', uploadFor: 'photo_url', uploadKind: 'team-photo', accept: 'image/*,.svg' },
  { key: 'linkedin_url', label: 'LinkedIn URL (optional)' },
  { key: 'sort_order', label: 'Order', number: true },
  { key: 'published', label: 'Visible on site', boolean: true, default: true },
]

const TAB_FIELDS = {
  services: svcFields,
  skills: skillFields,
  projects: projectFields,
  blog: blogFields,
  trusted: trustedFields,
  testimonials: testimonialFields,
  team: teamFields,
}

const TAB_TITLES = {
  settings: 'Settings',
  services: 'Services',
  skills: 'Skills',
  projects: 'Projects',
  blog: 'Blog',
  trusted: 'Partner logos',
  testimonials: 'Client reviews',
  team: 'Team',
  messages: 'Messages',
}

export default function AdminDashboard() {
  const { refresh: refreshSite } = useSite()
  const [authed, setAuthed] = useState(null)
  const [tab, setTab] = useState('settings')
  const [items, setItems] = useState([])
  const [settingsForm, setSettingsForm] = useState({})
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [tabLoading, setTabLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState(null)
  const [listError, setListError] = useState(null)

  const refreshAuth = useCallback(async () => {
    try {
      await adminMe()
      setAuthed(true)
    } catch {
      setAuthed(false)
    }
  }, [])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  const loadTab = useCallback(async () => {
    if (!authed || tab === 'settings') return
    setTabLoading(true)
    setListError(null)
    try {
      if (tab === 'messages') {
        const r = await adminContactMessages()
        setItems(r.items || [])
      } else {
        const r = await adminList(tab)
        setItems(r.items || [])
      }
    } catch (e) {
      setListError(e.message || 'Could not load')
      setItems([])
    } finally {
      setTabLoading(false)
    }
  }, [authed, tab])

  useEffect(() => {
    loadTab()
  }, [loadTab])

  useEffect(() => {
    if (!authed || tab !== 'settings') return
    let cancelled = false
    ;(async () => {
      setSettingsLoading(true)
      try {
        const r = await apiFetch('/public/settings')
        if (!cancelled) setSettingsForm(r.settings || {})
      } catch {
        if (!cancelled) setSettingsForm({})
      } finally {
        if (!cancelled) setSettingsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authed, tab])

  async function saveSettings(e) {
    e.preventDefault()
    setBusy(true)
    setNote(null)
    try {
      await adminPatchSettings(settingsForm)
      refreshSite()
      setNote({ ok: true, text: 'Saved.' })
    } catch (ex) {
      setNote({ ok: false, text: ex.message })
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    await adminLogout()
    setAuthed(false)
  }

  if (authed === null) {
    return (
      <div className="admin-app admin-login-simple">
        <div className="admin-spinner" style={{ width: 32, height: 32 }} aria-label="Loading" />
      </div>
    )
  }

  if (!authed) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminShell
      activeTab={tab}
      onTabChange={(id) => {
        setTab(id)
        setNote(null)
        setListError(null)
      }}
      onLogout={logout}
      topTitle={TAB_TITLES[tab]}
      loading={tab !== 'settings' && tabLoading}
    >
      {note ? (
        <div className={`admin-alert ${note.ok ? 'admin-alert--success' : 'admin-alert--error'}`} role="status">
          {note.text}
        </div>
      ) : null}

      {tab === 'settings' ? (
        <form onSubmit={saveSettings}>
          {settingsLoading ? (
            <>
              <div className="admin-skeleton" />
              <div className="admin-skeleton" />
            </>
          ) : (
            SETTINGS_GROUPS.map((group) => (
              <section key={group.title} className="admin-section">
                <h2>{group.title}</h2>
                <div className={`admin-settings-grid ${group.cols2 ? 'cols-2' : ''}`}>
                  {group.fields.map((fieldDef) => {
                    const [key, label, kind, extra] =
                      fieldDef.length === 4 ? fieldDef : fieldDef.length === 3 ? [...fieldDef, undefined] : [...fieldDef, 'text', undefined]
                    if (kind === 'checkbox') {
                      const on = (settingsForm[key] ?? (key === 'reviews_autoscroll' ? '1' : '0')) === '1'
                      return (
                        <label key={key} className="admin-checkbox-row admin-field">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={(e) => setSettingsForm((s) => ({ ...s, [key]: e.target.checked ? '1' : '0' }))}
                          />
                          <span className="admin-label" style={{ textTransform: 'none', fontWeight: 500, color: 'var(--text)' }}>
                            {label}
                          </span>
                        </label>
                      )
                    }

                    if (kind === 'select') {
                      const options = Array.isArray(extra) ? extra : []
                      return (
                        <div key={key} className="admin-field">
                          <label className="admin-label" htmlFor={`set-${key}`}>
                            {label}
                          </label>
                          <select
                            id={`set-${key}`}
                            className="admin-input"
                            value={settingsForm[key] ?? options[0]?.value ?? ''}
                            onChange={(e) => setSettingsForm((s) => ({ ...s, [key]: e.target.value }))}
                          >
                            {options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    }

                    if (kind === 'upload') {
                      const cfg = extra && typeof extra === 'object' ? extra : {}
                      const setKey = String(cfg.setKey || '').trim()
                      const kindTag = String(cfg.kind || 'asset').trim()
                      const modeKey = cfg.modeKey ? String(cfg.modeKey) : null
                      const modeValue = cfg.modeValue ? String(cfg.modeValue) : null
                      const accept = String(cfg.accept || 'image/*,.svg,.ico')
                      const currentUrl = setKey ? (settingsForm[setKey] ?? '') : ''
                      return (
                        <div key={key} className="admin-field">
                          <div className="admin-label">{label}</div>
                          <input
                            type="file"
                            accept={accept}
                            className="admin-input"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setBusy(true)
                              setNote(null)
                              try {
                                const r = await adminUpload(file, { kind: kindTag })
                                const url = r?.url ? String(r.url) : ''
                                if (url) {
                                  const patch = {}
                                  if (setKey) patch[setKey] = url
                                  if (modeKey && modeValue) patch[modeKey] = modeValue
                                  setSettingsForm((s) => ({ ...s, ...patch }))
                                  // Save immediately so the homepage updates right away.
                                  await adminPatchSettings(patch)
                                  refreshSite()
                                  setNote({ ok: true, text: 'Uploaded and applied.' })
                                } else {
                                  setNote({ ok: false, text: 'Upload succeeded but no URL returned.' })
                                }
                              } catch (ex) {
                                setNote({ ok: false, text: ex.message || 'Upload failed' })
                              } finally {
                                setBusy(false)
                                // Allow picking the same file again
                                e.target.value = ''
                              }
                            }}
                          />
                          {currentUrl ? (
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              <img
                                src={String(currentUrl)}
                                alt="Uploaded preview"
                                style={{ width: 88, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                                loading="lazy"
                                decoding="async"
                              />
                              <button
                                type="button"
                                className="admin-btn admin-btn--ghost"
                                disabled={busy}
                                onClick={async () => {
                                  if (!setKey) return
                                  setBusy(true)
                                  setNote(null)
                                  try {
                                    const patch = { [setKey]: '' }
                                    if (modeKey && modeValue) {
                                      // Revert to animated when removing hero wallpaper
                                      patch[modeKey] = modeKey === 'hero_bg_mode' ? 'animated' : ''
                                    }
                                    setSettingsForm((s) => ({ ...s, ...patch }))
                                    await adminPatchSettings(patch)
                                    refreshSite()
                                    setNote({ ok: true, text: 'Removed.' })
                                  } catch (ex) {
                                    setNote({ ok: false, text: ex.message || 'Remove failed' })
                                  } finally {
                                    setBusy(false)
                                  }
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : null}
                        </div>
                      )
                    }

                    const tall = ['about_intro', 'hero_tagline', 'meta_description', 'values', 'map_embed_url'].includes(key)
                    return (
                      <div key={key} className="admin-field">
                        <label className="admin-label" htmlFor={`set-${key}`}>
                          {label}
                        </label>
                        <textarea
                          id={`set-${key}`}
                          className="admin-textarea"
                          rows={tall ? 3 : 2}
                          value={settingsForm[key] ?? ''}
                          onChange={(e) => setSettingsForm((s) => ({ ...s, [key]: e.target.value }))}
                        />
                      </div>
                    )
                  })}
                </div>
              </section>
            ))
          )}
          <button type="submit" className="admin-btn admin-btn--primary" disabled={busy || settingsLoading} style={{ marginTop: '0.5rem' }}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </form>
      ) : null}

      {tab === 'messages' ? (
        <>
          {listError ? (
            <div className="admin-alert admin-alert--error" role="alert">
              {listError}
            </div>
          ) : null}
          {tabLoading ? (
            <>
              <div className="admin-skeleton" />
              <div className="admin-skeleton" />
            </>
          ) : null}
          {!tabLoading && !items.length ? <div className="admin-empty">No messages yet.</div> : null}
          {!tabLoading
            ? items.map((m) => (
                <div key={m.id} className="admin-row">
                  <p className="admin-row-title" style={{ margin: '0 0 0.25rem' }}>
                    {m.name} · <a href={`mailto:${m.email}`}>{m.email}</a>
                  </p>
                  <p className="admin-row-sub">{m.created_at}</p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{m.message}</p>
                </div>
              ))
            : null}
        </>
      ) : null}

      {tab !== 'settings' && tab !== 'messages' && TAB_FIELDS[tab] ? (
        <CrudPanel key={tab} resource={tab} fields={TAB_FIELDS[tab]} items={items} loading={tabLoading} error={listError} onRefresh={loadTab} />
      ) : null}
    </AdminShell>
  )
}

function CrudPanel({ resource, fields, items, loading, error, onRefresh }) {
  const [draft, setDraft] = useState({})
  const [editing, setEditing] = useState(null)
  const [localError, setLocalError] = useState(null)
  const [saving, setSaving] = useState(false)
  const hasSortOrder = fields.some((f) => f.key === 'sort_order')

  function fk(id, key) {
    return `${id}__${key}`
  }

  function openEdit(row) {
    if (editing === row.id) {
      setEditing(null)
      setLocalError(null)
      return
    }
    const next = { ...draft }
    fields.forEach((f) => {
      const v = row[f.key]
      if (f.boolean) {
        next[fk(row.id, f.key)] =
          v === undefined || v === null ? f.default === true : !!(v == 1 || v === true)
      } else next[fk(row.id, f.key)] = v === null || v === undefined ? '' : String(v)
    })
    setDraft(next)
    setEditing(row.id)
    setLocalError(null)
  }

  async function createRow(e) {
    e.preventDefault()
    setLocalError(null)
    setSaving(true)
    try {
      const body = {}
      fields.forEach((f) => {
        if (f.boolean) {
          let v = draft[f.key]
          if ((v === undefined || v === '') && f.default === true) v = true
          body[f.key] = v ? 1 : 0
        } else {
          let v = draft[f.key]
          if (f.number) v = v === '' || v === undefined ? 0 : Number(v)
          body[f.key] = v
        }
      })
      await adminCreate(resource, body)
      setDraft({})
      await onRefresh()
    } catch (err) {
      setLocalError(err.message || 'Could not add')
    } finally {
      setSaving(false)
    }
  }

  async function saveRow(id, base) {
    setLocalError(null)
    setSaving(true)
    try {
      const body = {}
      fields.forEach((f) => {
        const k = fk(id, f.key)
        if (f.boolean) {
          let b = draft[k]
          if (b === undefined) {
            const o = base[f.key]
            b =
              o === undefined || o === null ? f.default === true : !!(o == 1 || o === true || o === '1')
          } else {
            b = b === true || b === 'true'
          }
          body[f.key] = b ? 1 : 0
          return
        }
        let v = draft[k]
        if (v === undefined) {
          const o = base[f.key]
          v = o === null || o === undefined ? '' : o
        }
        if (f.number) v = v === '' ? 0 : Number(v)
        body[f.key] = v
      })
      await adminUpdate(resource, id, body)
      setEditing(null)
      await onRefresh()
    } catch (err) {
      setLocalError(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  async function moveRow(row, dir) {
    if (!hasSortOrder) return
    const idx = items.findIndex((x) => x.id === row.id)
    const other = items[idx + dir]
    if (!other) return
    setLocalError(null)
    setSaving(true)
    try {
      const a = Number(row.sort_order ?? 0)
      const b = Number(other.sort_order ?? 0)
      await adminUpdate(resource, row.id, { sort_order: b })
      await adminUpdate(resource, other.id, { sort_order: a })
      await onRefresh()
    } catch (err) {
      setLocalError(err.message || 'Reorder failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {error ? (
        <div className="admin-alert admin-alert--error" role="alert">
          {error}
        </div>
      ) : null}
      {localError ? (
        <div className="admin-alert admin-alert--error" role="alert">
          {localError}
        </div>
      ) : null}

      <div className="admin-panel">
        <h3>Add new</h3>
        <form onSubmit={createRow} style={{ display: 'grid', gap: '0.65rem' }}>
          {fields.map((f) => (
            <FieldInput key={f.key} f={f} prefix="" draft={draft} setDraft={setDraft} />
          ))}
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Adding…' : 'Add'}
          </button>
        </form>
      </div>

      {loading ? (
        <>
          <div className="admin-skeleton" />
          <div className="admin-skeleton" />
        </>
      ) : !items.length ? (
        <div className="admin-empty">Nothing here yet. Add one above.</div>
      ) : (
        items.map((row) => (
          <div key={row.id} className="admin-row">
            <div className="admin-row-head">
              <RecordPreview resource={resource} row={row} />
              <div className="admin-row-actions">
                {hasSortOrder ? (
                  <>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      disabled={saving || items[0]?.id === row.id}
                      onClick={() => moveRow(row, -1)}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      disabled={saving || items[items.length - 1]?.id === row.id}
                      onClick={() => moveRow(row, +1)}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </>
                ) : null}
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => openEdit(row)}>
                  {editing === row.id ? 'Close' : 'Edit'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  disabled={saving}
                  onClick={async () => {
                    if (!confirm('Delete?')) return
                    setSaving(true)
                    try {
                      await adminDelete(resource, row.id)
                      setEditing(null)
                      await onRefresh()
                    } catch (err) {
                      setLocalError(err.message || 'Delete failed')
                    } finally {
                      setSaving(false)
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            {editing === row.id ? (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  {fields.map((f) => (
                    <FieldInput key={f.key} f={f} prefix={String(row.id)} draft={draft} setDraft={setDraft} />
                  ))}
                  <button type="button" className="admin-btn admin-btn--primary" disabled={saving} onClick={() => saveRow(row.id, row)}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  )
}

function FieldInput({ f, prefix, draft, setDraft }) {
  const dk = prefix ? `${prefix}__${f.key}` : f.key
  const val = draft[dk]
  const editorId = useMemo(() => `ck-${prefix || 'n'}-${f.key}`, [prefix, f.key])

  if (f.uploadFor) {
    const targetKey = prefix ? `${prefix}__${f.uploadFor}` : f.uploadFor
    const currentUrl = draft[targetKey] ?? ''
    return (
      <div className="admin-field">
        <div className="admin-label">{f.label}</div>
        <input
          type="file"
          accept={f.accept || 'image/*'}
          className="admin-input"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            try {
              const r = await adminUpload(file, { kind: f.uploadKind || 'asset' })
              const url = r?.url ? String(r.url) : ''
              if (url) {
                setDraft((d) => ({ ...d, [targetKey]: url }))
              }
            } finally {
              e.target.value = ''
            }
          }}
        />
        {currentUrl ? (
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <img
              src={String(currentUrl)}
              alt="Uploaded preview"
              style={{ width: 88, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
              loading="lazy"
              decoding="async"
            />
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setDraft((d) => ({ ...d, [targetKey]: '' }))}>
              Remove
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  if (f.boolean) {
    const raw = draft[dk]
    const checked =
      raw === undefined || raw === ''
        ? f.default === true
        : raw === true || raw === 'true' || raw === 1 || raw === '1'
    return (
      <label className="admin-checkbox-row admin-field">
        <input type="checkbox" checked={checked} onChange={(e) => setDraft((d) => ({ ...d, [dk]: e.target.checked }))} />
        <span className="admin-label" style={{ textTransform: 'none', fontWeight: 500, color: 'var(--text)' }}>
          {f.label}
        </span>
      </label>
    )
  }

  if (f.key === 'body' && f.multiline) {
    return (
      <div className="admin-field">
        <label className="admin-label" htmlFor={editorId}>
          {f.label}
        </label>
        <div className="admin-ckeditor">
          <CKEditor
            editor={ClassicEditor}
            data={val ?? ''}
            config={{
              toolbar: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'link',
                '|',
                'bulletedList',
                'numberedList',
                '|',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'blockQuote',
                'insertTable',
                'undo',
                'redo',
              ],
              heading: {
                // Keep SEO-friendly structure: H1 is the title field, editor starts at H2/H3.
                options: [
                  { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                  { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                  { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                ],
              },
              link: {
                addTargetToExternalLinks: true,
                decorators: {
                  openInNewTab: {
                    mode: 'automatic',
                    callback: (url) => /^https?:\/\//i.test(url),
                    attributes: {
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    },
                  },
                },
              },
            }}
            onChange={(_, editor) => {
              const data = editor.getData()
              setDraft((d) => ({ ...d, [dk]: data }))
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={`f-${prefix || 'n'}-${f.key}`}>
        {f.label}
      </label>
      {f.multiline ? (
        <textarea
          id={`f-${prefix || 'n'}-${f.key}`}
          className="admin-textarea"
          rows={f.key === 'body' ? 5 : 3}
          value={val ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, [dk]: e.target.value }))}
        />
      ) : (
        <input
          id={`f-${prefix || 'n'}-${f.key}`}
          className="admin-input"
          type={f.number ? 'number' : 'text'}
          min={f.min}
          max={f.max}
          value={val ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, [dk]: e.target.value }))}
        />
      )}
    </div>
  )
}

function RecordPreview({ resource, row }) {
  const title = row.title || row.name || `#${row.id}`
  const line = row.excerpt || row.description || row.quote || row.slug || row.role || ''

  return (
    <div style={{ minWidth: 0 }}>
      <h3 className="admin-row-title">{title}</h3>
      <p className="admin-row-sub">
        {row.category ? <span className="admin-tag">{row.category}</span> : null}
        {row.featured == 1 ? <span className="admin-tag admin-tag--ok">Featured</span> : null}
        {resource === 'blog' && row.published == 1 ? <span className="admin-tag admin-tag--ok">Live</span> : null}
        {resource === 'blog' && row.published != 1 ? <span className="admin-tag">Draft</span> : null}
        {resource === 'testimonials' && (row.published == null || row.published == 1) ? (
          <span className="admin-tag admin-tag--ok">Live</span>
        ) : null}
        {resource === 'testimonials' && row.published != null && row.published != 1 ? (
          <span className="admin-tag">Hidden</span>
        ) : null}
        {row.level != null ? `${row.level}% · ` : null}
        {line ? String(line).slice(0, 120) + (String(line).length > 120 ? '…' : '') : null}
      </p>
    </div>
  )
}
