import DOMPurify from 'dompurify'
import { marked } from 'marked'

// Minimal, safe markdown rendering for blog posts.
marked.setOptions({
  gfm: true,
  breaks: true,
})

export function renderMarkdown(markdownText = '') {
  const input = String(markdownText ?? '')
  // If content already contains HTML (e.g. CKEditor output), don't re-markdown it.
  const raw = /<\/[a-z][\s\S]*>/i.test(input) ? input : marked.parse(input)
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    // Restrict potentially dangerous elements.
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style', 'onerror', 'onload'],
  })
}

