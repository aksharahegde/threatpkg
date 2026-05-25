import { parseFeedQuery } from '#shared/utils/parse-feed-query'
import { getFeed } from '../utils/feed'

export default defineEventHandler(async (event) => {
  return getFeed(parseFeedQuery(getQuery(event) as Record<string, unknown>))
})
