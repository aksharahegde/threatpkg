import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

marked.setOptions({ gfm: true, breaks: true })

const SANITIZE_OPTIONS: Parameters<typeof DOMPurify.sanitize>[1] = {
  USE_PROFILES: { html: true },
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  FORBID_TAGS: ['style']
}

let linkHookRegistered = false

function registerLinkRelHook() {
  if (linkHookRegistered) return
  linkHookRegistered = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName !== 'A') return

    const href = node.getAttribute('href')?.trim() ?? ''
    const lower = href.toLowerCase()
    if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
      node.removeAttribute('href')
      node.removeAttribute('target')
      return
    }

    const rel = (node.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean)
    const hasNoopener = rel.includes('noopener')
    const isExternal = /^https?:\/\//i.test(href)
    const target = node.getAttribute('target')

    if (isExternal && !hasNoopener) {
      node.setAttribute('rel', 'noopener noreferrer')
    }

    if (target === '_blank' && !hasNoopener && !node.getAttribute('rel')) {
      node.setAttribute('rel', 'noopener noreferrer')
    }

    if (!isExternal && target) {
      node.removeAttribute('target')
    }
  })
}

export function renderMarkdown(source: string): string {
  registerLinkRelHook()
  const html = marked.parse(source, { async: false }) as string
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS)
}
