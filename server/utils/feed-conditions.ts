import { and, eq, exists, gte, ilike, or, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type { FeedQuery } from '#shared/types/threat'
import { getDb } from '../db/index'
import { incidents, indicators } from '../db/schema'

export type FeedFilterQuery = Pick<
  FeedQuery,
  'ecosystem' | 'severity' | 'threatType' | 'source' | 'range' | 'q'
>

export function feedFilterFromQuery(params: FeedQuery): FeedFilterQuery {
  return {
    ecosystem: params.ecosystem,
    severity: params.severity,
    threatType: params.threatType,
    source: params.source,
    range: params.range,
    q: params.q
  }
}

function feedSearchCondition(db: ReturnType<typeof getDb>, q: string): SQL {
  const pattern = `%${q}%`
  return or(
    ilike(incidents.packageName, pattern),
    ilike(incidents.title, pattern),
    ilike(incidents.externalId, pattern),
    ilike(incidents.description, pattern),
    exists(
      db
        .select({ one: sql`1` })
        .from(indicators)
        .where(
          and(
            eq(indicators.incidentId, incidents.id),
            ilike(indicators.value, pattern)
          )
        )
    )
  )!
}

export function buildFeedFilterConditions(
  db: ReturnType<typeof getDb>,
  params: FeedFilterQuery
): SQL[] {
  const conditions: SQL[] = []

  if (params.ecosystem) {
    conditions.push(eq(incidents.ecosystem, params.ecosystem))
  }
  if (params.severity) {
    conditions.push(eq(incidents.severity, params.severity))
  }
  if (params.threatType) {
    conditions.push(eq(incidents.threatType, params.threatType))
  }
  if (params.source) {
    conditions.push(eq(incidents.source, params.source))
  }
  if (params.q?.trim()) {
    conditions.push(feedSearchCondition(db, params.q.trim()))
  }
  if (params.range) {
    const hours =
      params.range === '24h' ? 24 : params.range === '7d' ? 168 : 720
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    conditions.push(gte(incidents.publishedAt, cutoff))
  }

  return conditions
}

export function feedWhereClause(
  db: ReturnType<typeof getDb>,
  params: FeedFilterQuery
): SQL | undefined {
  const conditions = buildFeedFilterConditions(db, params)
  return conditions.length ? and(...conditions) : undefined
}
