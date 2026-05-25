export type RssFeedSource = 'snyk' | 'phylum' | 'jfrog'

export interface RssFeedConfig {
  url: string
  source: RssFeedSource
}

export const RSS_FEEDS: RssFeedConfig[] = [
  { url: 'https://snyk.io/blog/feed/', source: 'snyk' },
  { url: 'https://blog.phylum.io/rss.xml', source: 'phylum' },
  { url: 'https://jfrog.com/blog/feed/', source: 'jfrog' }
]

export function getActiveRssFeeds(): RssFeedConfig[] {
  return [...RSS_FEEDS]
}
