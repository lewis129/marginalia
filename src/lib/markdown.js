import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: true })

export function renderMarkdown(src) {
  return DOMPurify.sanitize(marked.parse(src ?? '', { async: false }))
}

export function stripMarkdown(src) {
  if (!src) return ''
  return marked
    .parse(src, { async: false })
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}