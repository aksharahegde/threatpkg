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
      uniquePackages: sql<number>`count(distinct (${incidents.packageName}, ${incidents.ecosystem}))::int`
    })
    .from(incidents)
    .where(where)

  const ecosystemRows = await db
    .select({
      ecosystem: incidents.ecosystem,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(where)
    .groupBy(incidents.ecosystem)

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

  for (const row of ecosystemRows) {
    const eco = row.ecosystem as Ecosystem
    if ((ECOSYSTEMS as readonly string[]).includes(eco)) {
      byEcosystem[eco] = row.count
    }
  }

  return {
    total: aggregate?.total ?? 0,
    critical: aggregate?.critical ?? 0,
    high: aggregate?.high ?? 0,
    uniquePackages: aggregate?.uniquePackages ?? 0,
    byEcosystem,
    byThreatType
  }
}
