import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

marked.setOptions({ gfm: true, breaks: true })

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'pre',
    'code',
    'hr',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td'
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (_tagName, attribs) => {
      const href = attribs.href?.trim() ?? ''
      const lower = href.toLowerCase()
      if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
        delete attribs.href
        delete attribs.target
        return { tagName: 'a', attribs }
      }

      const isExternal = /^https?:\/\//i.test(href)
      const rel = (attribs.rel ?? '').split(/\s+/).filter(Boolean)
      const hasNoopener = rel.includes('noopener')

      if (isExternal && !hasNoopener) {
        attribs.rel = 'noopener noreferrer'
      }

      if (attribs.target === '_blank' && !hasNoopener && !attribs.rel) {
        attribs.rel = 'noopener noreferrer'
      }

      if (!isExternal && attribs.target) {
        delete attribs.target
      }

      return { tagName: 'a', attribs }
    }
  }
}

export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false }) as string
  return sanitizeHtml(html, SANITIZE_OPTIONS)
}
