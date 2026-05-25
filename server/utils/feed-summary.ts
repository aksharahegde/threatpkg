import { sql } from 'drizzle-orm'
import type { Ecosystem, FeedSummary, ThreatType } from '#shared/types/threat'
import { ECOSYSTEMS, THREAT_TYPES } from '#shared/types/threat'
import { getDb } from '../db/index'
import { incidents } from '../db/schema'
import {
  type FeedFilterQuery,
  feedWhereClause
} from './feed-conditions'

export async function getFeedSummary(
  params: FeedFilterQuery
): Promise<FeedSummary> {
  const db = getDb()
  const where = feedWhereClause(db, params)

  const [aggregate] = await db
    .select({
      total: sql<number>`count(*)::int`,
      critical: sql<number>`count(*) filter (where ${incidents.severity} = 'critical')::int`,
      high: sql<number>`count(*) filter (where ${incidents.severity} = 'high')::int`,
      uniquePackages: sql<number>`count(distinct (${incidents.packageName}, ${incidents.ecosystem}))::int`,
      npm: sql<number>`count(*) filter (where ${incidents.ecosystem} = 'npm')::int`,
      pypi: sql<number>`count(*) filter (where ${incidents.ecosystem} = 'pypi')::int`
    })
    .from(incidents)
    .where(where)

  const threatRows = await db
    .select({
      threatType: incidents.threatType,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(where)
    .groupBy(incidents.threatType)

  const byThreatType: Partial<Record<ThreatType, number>> = {}
  for (const row of threatRows) {
    const type = row.threatType as ThreatType
    if (THREAT_TYPES.includes(type)) {
      byThreatType[type] = row.count
    }
  }

  const byEcosystem = Object.fromEntries(
    ECOSYSTEMS.map((eco) => [eco, 0])
  ) as Record<Ecosystem, number>
  byEcosystem.npm = aggregate?.npm ?? 0
  byEcosystem.pypi = aggregate?.pypi ?? 0

  return {
    total: aggregate?.total ?? 0,
    critical: aggregate?.critical ?? 0,
    high: aggregate?.high ?? 0,
    uniquePackages: aggregate?.uniquePackages ?? 0,
    byEcosystem,
    byThreatType
  }
}
