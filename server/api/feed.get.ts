import type { FeedQuery } from '#shared/types/threat'
import { getFeed } from '../utils/feed'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const params: FeedQuery = {
    ecosystem: query.ecosystem as FeedQuery['ecosystem'],
    severity: query.severity as FeedQuery['severity'],
    threatType: query.threatType as FeedQuery['threatType'],
    source: query.source as FeedQuery['source'],
    range: query.range as FeedQuery['range'],
    q: query.q as string | undefined,
    sort: (query.sort as FeedQuery['sort']) || 'published',
    cursor: query.cursor as string | undefined,
    limit: query.limit ? Number(query.limit) : 20
  }

  return getFeed(params)
})
