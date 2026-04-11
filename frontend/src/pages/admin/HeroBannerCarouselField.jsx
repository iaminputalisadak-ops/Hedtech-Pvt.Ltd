import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react'
import { adminPatchSettings, adminUpload } from '../../api/client'

const CAROUSEL_KEY = 'hero_banner_carousel_json'

function parseUrls(raw) {
  if (raw == null || raw === '') return []
  try {
    const v = JSON.parse(String(raw))
    if (!Array.isArray(v)) return []
    return v.map((s) => String(s || '').trim()).filter(Boolean)
  } catch {
    return []
  }
}

function stringifyUrls(urls) {
  return JSON.stringify(urls)
}

export default function HeroBannerCarouselField({
  label,
  value,
  setSettingsForm,
  busy,
  setBusy,
  setNote,
  refreshSite,
}) {
  const [local, setLocal] = useState(() => parseUrls(value))
  const localRef = useRef(local)
  localRef.current = local

  useEffect(() => {
    setLocal(parseUrls(value))
  }, [value])

  const persist = useCallback(
    async (nextUrls) => {
      const json = stringifyUrls(nextUrls)
      setBusy(true)
      setNote(null)
      try {
        await adminPatchSettings({ [CAROUSEL_KEY]: json })
        setSettingsForm((s) => ({ ...s, [CAROUSEL_KEY]: json }))
        await refreshSite()
        setNote({ ok: true, text: 'Banner carousel saved.' })
      } catch (ex) {
        setNote({ ok: false, text: ex.message || 'Save failed' })
      } finally {
        setBusy(false)
      }
    },
    [refreshSite, setBusy, setNote, setSettingsForm],
  )

  const move = (index, dir) => {
    const cur = localRef.current
    const j = index + dir
    if (j < 0 || j >= cur.length) return
    const next = [...cur]
    ;[next[index], next[j]] = [next[j], next[index]]
    setLocal(next)
    persist(next)
  }

  const removeAt = (index) => {
    const next = localRef.current.filter((_, i) => i !== index)
    setLocal(next)
    persist(next)
  }

  const appendUrl = async (url) => {
    const u = String(url || '').trim()
    if (!u) return
    const next = [...localRef.current, u]
    setLocal(next)
    await persist(next)
  }

  return (
    <div className="admin-field admin-hero-carousel">
      <div className="admin-label">{label}</div>
      <p className="admin-help admin-hero-carousel__hint">
        With <strong>Image wallpaper</strong> selected, two or more images here rotate in the hero every 2 seconds. Reorder
        with arrows. If empty or one image, the single wallpaper URL field above is used alone.
      </p>
      <div className="admin-hero-carousel__toolbar">
        <label className="admin-btn admin-btn--ghost admin-hero-carousel__upload">
          <ImagePlus size={18} aria-hidden />
          Add image
          <input
            type="file"
            accept="image/*,.svg"
            className="sr-only"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              setBusy(true)
              setNote(null)
              try {
                await adminPatchSettings({ hero_bg_mode: 'image' })
                setSettingsForm((s) => ({ ...s, hero_bg_mode: 'image' }))
                const r = await adminUpload(file, { kind: 'hero-banner-slide' })
                const url = r?.url ? String(r.url) : ''
                if (url) {
                  await appendUrl(url)
                  setNote({ ok: true, text: 'Image added. Hero set to Image wallpaper.' })
                } else {
                  setNote({ ok: false, text: 'Upload succeeded but no URL returned.' })
                }
              } catch (ex) {
                setNote({ ok: false, text: ex.message || 'Upload failed' })
              } finally {
                setBusy(false)
              }
            }}
          />
        </label>
      </div>
      {local.length === 0 ? (
        <p className="admin-muted">No carousel slides — use uploads here or the single wallpaper URL.</p>
      ) : (
        <ul className="admin-hero-carousel__list">
          {local.map((url, index) => (
            <li key={`${url}-${index}`} className="admin-hero-carousel__row">
              <div className="admin-hero-carousel__preview">
                <img src={url} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="admin-hero-carousel__meta">
                <code className="admin-hero-carousel__url">{url.length > 72 ? `${url.slice(0, 72)}…` : url}</code>
                <div className="admin-hero-carousel__actions">
                  <button
                    type="button"
                    className="admin-icon-btn"
                    disabled={busy || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move slide ${index + 1} up`}
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    disabled={busy || index >= local.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move slide ${index + 1} down`}
                  >
                    <ArrowDown size={18} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn--danger"
                    disabled={busy}
                    onClick={() => removeAt(index)}
                    aria-label={`Remove slide ${index + 1}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
