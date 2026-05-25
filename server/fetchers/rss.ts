import type { FetcherIncident } from './types'
import {
  extractPackageFromTitle,
  inferSeverity,
  inferThreatType,
  severityToRiskScore
} from '../utils/infer-threat'

interface RssFeedConfig {
  url: string
  source: 'snyk' | 'socket' | 'phylum' | 'jfrog'
}

const RSS_FEEDS: RssFeedConfig[] = [
  { url: 'https://snyk.io/blog/feed/', source: 'snyk' },
  {
    url: 'https://socket.dev/api/blog/rss.xml',
    source: 'socket'
  },
  { url: 'https://blog.phylum.io/rss.xml', source: 'phylum' },
  {
    url: 'https://research.jfrog.com/feed/',
    source: 'jfrog'
  }
]

const MALWARE_KEYWORDS =
  /\b(malware|malicious|typosquat|supply[- ]chain|compromised|npm attack|pypi attack|dependency confusion)\b/i

interface RssItem {
  title: string
  link: string
  description: string
  pubDate: string
}

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? []

  for (const block of itemBlocks) {
    const title = decodeXml(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
    const link = decodeXml(block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? '')
    const description = decodeXml(
      block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ?? ''
    )
    const pubDate = decodeXml(
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] ??
        block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1] ??
        ''
    )

    if (title && link) {
      items.push({ title, link, description, pubDate })
    }
  }

  return items
}

function itemToIncident(item: RssItem, source: RssFeedConfig['source']): FetcherIncident | null {
  const text = `${item.title} ${item.description}`
  if (!MALWARE_KEYWORDS.test(text)) return null

  const packageName = extractPackageFromTitle(item.title)
  if (!packageName) return null

  const textLower = text.toLowerCase()
  const ecosystem =
    textLower.includes('pypi') || textLower.includes('python package')
      ? 'pypi'
      : 'npm'

  const riskScore = severityToRiskScore('high')
  const threatType = inferThreatType(text)

  let publishedAt = new Date()
  if (item.pubDate) {
    const parsed = new Date(item.pubDate)
    if (!Number.isNaN(parsed.getTime())) publishedAt = parsed
  }

  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  if (publishedAt.getTime() < cutoff) return null

  return {
    externalId: `${source}:${item.link}`,
    packageName,
    ecosystem,
    title: item.title,
    description: item.description.slice(0, 4000),
    severity: inferSeverity('high', riskScore),
    riskScore,
    threatType,
    publishedAt,
    source,
    sourceUrl: item.link
  }
}

async function fetchFeed(config: RssFeedConfig): Promise<FetcherIncident[]> {
  const res = await fetch(config.url, {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(20_000)
  })

  if (!res.ok) {
    console.warn(`[rss] ${config.source} feed failed (${res.status})`)
    return []
  }

  const xml = await res.text()
  const items = parseRssItems(xml)
  const results: FetcherIncident[] = []

  for (const item of items.slice(0, 40)) {
    const incident = itemToIncident(item, config.source)
    if (incident) results.push(incident)
  }

  return results
}

export async function fetchRssFeeds(): Promise<FetcherIncident[]> {
  const batches = await Promise.allSettled(RSS_FEEDS.map(fetchFeed))
  const results: FetcherIncident[] = []
  const seen = new Set<string>()

  for (const batch of batches) {
    if (batch.status !== 'fulfilled') continue
    for (const incident of batch.value) {
      if (seen.has(incident.externalId)) continue
      seen.add(incident.externalId)
      results.push(incident)
    }
  }

  return results
}
