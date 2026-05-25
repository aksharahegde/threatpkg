import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchRssFeeds } from './rss'

const SAMPLE_RSS = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>Malware in evil-lodash — npm supply chain attack</title>
    <link>https://example.com/posts/1</link>
    <description>Typosquat package with malicious postinstall.</description>
    <pubDate>Mon, 20 May 2026 10:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Unrelated product launch</title>
    <link>https://example.com/posts/2</link>
    <description>Company news only.</description>
    <pubDate>Mon, 20 May 2026 09:00:00 GMT</pubDate>
  </item>
</channel></rss>`

describe('fetchRssFeeds', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('socket.dev')) {
          return new Response('', { status: 503 })
        }
        return new Response(SAMPLE_RSS, {
          status: 200,
          headers: { 'Content-Type': 'application/rss+xml' }
        })
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses malware-related items and skips unrelated posts', async () => {
    const incidents = await fetchRssFeeds()
    expect(incidents.length).toBeGreaterThan(0)
    expect(
      incidents.some(
        (i) =>
          i.packageName === 'evil-lodash' &&
          ['snyk', 'phylum', 'jfrog'].includes(i.source)
      )
    ).toBe(true)
    expect(incidents.every((i) => i.externalId.includes(':https://'))).toBe(true)
  })

  it('continues when individual feeds fail', async () => {
    const incidents = await fetchRssFeeds()
    expect(incidents.some((i) => i.source === 'snyk')).toBe(true)
  })
})
