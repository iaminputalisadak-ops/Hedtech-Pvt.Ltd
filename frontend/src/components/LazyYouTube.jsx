import { useCallback, useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { youtubeEmbedSrc, youtubeThumbnailUrl, youtubeVideoId } from '../utils/youtube'

/**
 * Thumbnail + play affordance; iframe loads only after click (or reduced-motion: load on in-view click only).
 */
export default function LazyYouTube({ videoUrl, title }) {
  const id = youtubeVideoId(videoUrl)
  const [active, setActive] = useState(false)
  const [inView, setInView] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el || active) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true)
      },
      { rootMargin: '120px', threshold: 0.01 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [active])

  const loadIframe = useCallback(() => {
    if (id) setActive(true)
  }, [id])

  if (!id) {
    return (
      <div className="lazy-yt lazy-yt--empty" role="img" aria-label={title || 'Video'}>
        Invalid YouTube URL
      </div>
    )
  }

  const thumb = youtubeThumbnailUrl(id)

  return (
    <div ref={rootRef} className="lazy-yt">
      <div className="lazy-yt-inner">
        {active ? (
          <iframe
            title={title || 'YouTube video'}
            src={youtubeEmbedSrc(id, { autoplay: '1' })}
            className="lazy-yt-frame"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button type="button" className="lazy-yt-thumb-btn" onClick={loadIframe} aria-label={`Play video: ${title || 'Testimonial'}`}>
            {inView ? (
              <img src={thumb} alt="" className="lazy-yt-img" loading="lazy" decoding="async" fetchPriority="low" />
            ) : (
              <div className="lazy-yt-placeholder" aria-hidden />
            )}
            <span className="lazy-yt-play">
              <Play size={44} fill="currentColor" aria-hidden />
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
