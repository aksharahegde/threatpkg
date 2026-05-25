import { sql } from 'drizzle-orm'
import { fillTrendBuckets } from '#shared/utils/feed-trend'
import { getDb } from '../db/index'
import { incidents } from '../db/schema'
import {
  type FeedFilterQuery,
  feedWhereClause
} from './feed-conditions'

export async function getFeedTrend(params: FeedFilterQuery): Promise<number[]> {
  const db = getDb()
  const where = feedWhereClause(db, params)
  const range = params.range ?? '7d'
  const trunc = range === '24h' ? sql`'hour'` : sql`'day'`

  const rows = await db
    .select({
      bucket: sql<Date>`date_trunc(${trunc}, ${incidents.publishedAt})`,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(where)
    .groupBy(sql`date_trunc(${trunc}, ${incidents.publishedAt})`)

  return fillTrendBuckets(
    range,
    rows.map((row) => ({
      bucket: new Date(row.bucket),
      count: row.count
    }))
  )
}
