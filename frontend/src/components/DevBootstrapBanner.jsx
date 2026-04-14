import { useCallback, useState } from 'react'
import { useSite } from '../context/SiteContext'

const DISMISS_KEY = 'hedztech-dev-bootstrap-dismiss'

export default function DevBootstrapBanner() {
  const { error, refresh, loading } = useSite()
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* noop */
    }
    setDismissed(true)
  }, [])

  if (!import.meta.env.DEV || dismissed || !error) return null

  return (
    <div className="dev-bootstrap-banner" role="status">
      <div className="dev-bootstrap-banner-inner">
        <p>
          <strong>API unreachable.</strong> Content, images, and stats load from{' '}
          <code>/api/public/bootstrap</code>. Start PHP on port <strong>8080</strong> (repo root):
        </p>
        <pre className="dev-bootstrap-banner-cmd">php -S 127.0.0.1:8080 -t backend/public</pre>
        <p className="dev-bootstrap-banner-detail">{error}</p>
        <div className="dev-bootstrap-banner-actions">
          <button type="button" className="btn btn-primary btn-compact" disabled={loading} onClick={() => refresh({ force: true })}>
            Retry
          </button>
          <button type="button" className="btn btn-ghost btn-compact" onClick={dismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
