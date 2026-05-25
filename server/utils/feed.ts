import { createError } from 'h3'
import { and, desc, eq, lt, or } from 'drizzle-orm'
import type { FeedQuery, FeedIncident } from '#shared/types/threat'
import { getDb } from '../db/index'
import { incidents } from '../db/schema'
import {
  buildFeedFilterConditions,
  feedFilterFromQuery
} from './feed-conditions'
import { getFeedSummary } from './feed-summary'
import { getFeedTrend } from './feed-trend'

function rowToFeed(row: typeof incidents.$inferSelect): FeedIncident {
  return {
    id: row.id,
    packageName: row.packageName,
    ecosystem: row.ecosystem as FeedIncident['ecosystem'],
    title: row.title,
    description: row.description,
    severity: row.severity as FeedIncident['severity'],
    riskScore: row.riskScore,
    threatType: row.threatType as FeedIncident['threatType'],
    publishedAt: row.publishedAt.toISOString(),
    source: row.source as FeedIncident['source'],
    sourceUrl: row.sourceUrl,
    createdAt: row.createdAt.toISOString()
  }
}

export async function getFeed(params: FeedQuery) {
  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL not configured'
    })
  }

  const db = getDb()
  const limit = params.limit ?? 20
  const filterParams = feedFilterFromQuery(params)
  const conditions = [...buildFeedFilterConditions(db, filterParams)]

  if (params.cursor) {
    const [cursorRow] = await db
      .select({
        publishedAt: incidents.publishedAt,
        riskScore: incidents.riskScore,
        id: incidents.id
      })
      .from(incidents)
      .where(eq(incidents.id, params.cursor))
      .limit(1)

    if (cursorRow) {
      if (params.sort === 'risk') {
        conditions.push(
          or(
            lt(incidents.riskScore, cursorRow.riskScore),
            and(
              eq(incidents.riskScore, cursorRow.riskScore),
              lt(incidents.id, cursorRow.id)
            )
          )!
        )
      } else {
        conditions.push(
          or(
            lt(incidents.publishedAt, cursorRow.publishedAt),
            and(
              eq(incidents.publishedAt, cursorRow.publishedAt),
              lt(incidents.id, cursorRow.id)
            )
          )!
        )
      }
    }
  }

  const orderBy =
    params.sort === 'risk'
      ? [desc(incidents.riskScore), desc(incidents.id)]
      : [desc(incidents.publishedAt), desc(incidents.id)]

  const where = conditions.length ? and(...conditions) : undefined

  const [rows, summary, trend] = await Promise.all([
    db
      .select()
      .from(incidents)
      .where(where)
      .orderBy(...orderBy)
      .limit(limit + 1),
    getFeedSummary(filterParams),
    getFeedTrend(filterParams)
  ])

  const items = rows.slice(0, limit).map(rowToFeed)
  const nextCursor =
    rows.length > limit ? items[items.length - 1]?.id ?? null : null

  return { items, nextCursor, summary, trend }
}
