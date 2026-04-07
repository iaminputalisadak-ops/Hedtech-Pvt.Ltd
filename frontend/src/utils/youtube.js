/**
 * Extract 11-char YouTube video id from embed, watch, or short URLs.
 */
export function youtubeVideoId(input) {
  if (input == null || input === '') return null
  const s = String(input).trim()
  const patterns = [
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?[^#]*v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = s.match(re)
    if (m) return m[1]
  }
  return null
}

export function youtubeEmbedSrc(videoId, params = {}) {
  if (!videoId) return ''
  const q = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    ...params,
  })
  return `https://www.youtube.com/embed/${videoId}?${q}`
}

export function youtubeThumbnailUrl(videoId, quality = 'hqdefault') {
  if (!videoId) return ''
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`
}
