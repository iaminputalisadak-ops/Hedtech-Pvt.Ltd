import DOMPurify from 'dompurify'
import { marked } from 'marked'

// Minimal, safe markdown rendering for blog posts.
marked.setOptions({
  gfm: true,
  breaks: true,
})

export function renderMarkdown(markdownText = '') {
  const raw = marked.parse(String(markdownText ?? ''))
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    // Restrict potentially dangerous elements.
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style', 'onerror', 'onload'],
  })
}

