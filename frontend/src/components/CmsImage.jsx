import { CMS_SIZES } from '../constants/cmsImageSizes'
import { resolvePublicAssetUrl } from '../utils/absoluteUrl'

function isUploadUrl(resolved) {
  return typeof resolved === 'string' && (resolved.startsWith('/api/uploads/') || resolved.startsWith('/uploads/'))
}

function uploadFilenameFromUrl(resolved) {
  try {
    const p = resolved.split('?')[0].split('#')[0]
    const parts = p.split('/')
    return parts[parts.length - 1] || ''
  } catch {
    return ''
  }
}

function buildUploadSrc(resolved, w) {
  const f = uploadFilenameFromUrl(resolved)
  if (!f) return resolved
  const ww = Number(w)
  if (!Number.isFinite(ww) || ww <= 0) return resolved
  return `/api/public/image?f=${encodeURIComponent(f)}&w=${encodeURIComponent(String(Math.round(ww)))}`
}

/**
 * Images from the CMS (/api/uploads/…). Adds responsive `sizes` hints and async decode
 * so the browser can schedule network + decode work more efficiently than a bare <img>.
 */
export default function CmsImage({
  src,
  alt = '',
  className,
  sizes = CMS_SIZES.card16x9,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  srcSetWidths,
  ...rest
}) {
  if (!src) return null
  const resolved = resolvePublicAssetUrl(src)
  if (!resolved) return null

  const widths = Array.isArray(srcSetWidths) && srcSetWidths.length ? srcSetWidths : [320, 480, 640, 800, 960, 1200]
  const canSrcSet = isUploadUrl(resolved)
  const srcSet = canSrcSet
    ? widths
        .filter((w) => Number.isFinite(Number(w)) && Number(w) > 0)
        .map((w) => `${buildUploadSrc(resolved, w)} ${Number(w)}w`)
        .join(', ')
    : undefined

  return (
    <img
      src={canSrcSet ? buildUploadSrc(resolved, 800) : resolved}
      alt={alt}
      className={className}
      sizes={sizes}
      srcSet={srcSet}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      {...rest}
    />
  )
}
