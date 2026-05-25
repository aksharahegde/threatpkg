import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('strips script tags', () => {
    const html = renderMarkdown('Hello<script>alert(1)</script>')
    expect(html).not.toContain('<script')
    expect(html).toContain('Hello')
  })

  it('adds rel noopener on external links', () => {
    const html = renderMarkdown('[advisory](https://example.com/foo)')
    expect(html).toContain('href="https://example.com/foo"')
    expect(html).toMatch(/rel="[^"]*noopener/)
  })

  it('adds rel when target blank is present', () => {
    const html = renderMarkdown(
      '<a href="https://evil.test" target="_blank">click</a>'
    )
    expect(html).toMatch(/rel="[^"]*noopener/)
  })

  it('removes javascript: hrefs', () => {
    const html = renderMarkdown('<a href="javascript:alert(1)">x</a>')
    expect(html).not.toContain('javascript:')
  })
})
