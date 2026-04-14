import { CMS_SIZES } from '../constants/cmsImageSizes'
import { resolvePublicAssetUrl } from '../utils/absoluteUrl'

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
  ...rest
}) {
  if (!src) return null
  const resolved = resolvePublicAssetUrl(src)
  if (!resolved) return null
  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      sizes={sizes}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      {...rest}
    />
  )
}
