import { describe, expect, it } from 'vitest'
import { getActiveRssFeeds, RSS_FEEDS } from './rss-feeds'

describe('getActiveRssFeeds', () => {
  it('returns the configured RSS feeds', () => {
    expect(getActiveRssFeeds()).toEqual(RSS_FEEDS)
    expect(getActiveRssFeeds().map((f) => f.source)).toEqual([
      'snyk',
      'phylum',
      'jfrog'
    ])
    expect(getActiveRssFeeds().find((f) => f.source === 'jfrog')?.url).toBe(
      'https://jfrog.com/blog/feed/'
    )
  })
})
