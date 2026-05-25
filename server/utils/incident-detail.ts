import { and, desc, eq, ne, or } from 'drizzle-orm'
import type { FeedIncident } from '#shared/types/threat'
import { getDb } from '../db/index'
import { incidents, indicators } from '../db/schema'

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

export async function getRelatedIncidents(
  incidentId: string,
  packageName: string,
  ecosystem: string,
  threatType: string,
  limit = 5
): Promise<FeedIncident[]> {
  const db = getDb()
  const rows = await db
    .select()
    .from(incidents)
    .where(
      and(
        ne(incidents.id, incidentId),
        or(
          and(
            eq(incidents.packageName, packageName),
            eq(incidents.ecosystem, ecosystem)
          ),
          eq(incidents.threatType, threatType)
        )
      )
    )
    .orderBy(desc(incidents.publishedAt))
    .limit(limit)

  return rows.map(rowToFeed)
}

export function affectedVersionsFromIndicators(
  indicatorRows: { indicatorType: string; value: string }[]
): string[] {
  const versions = indicatorRows
    .filter((ind) => ind.indicatorType === 'affected_version')
    .map((ind) => ind.value.trim())
    .filter(Boolean)

  if (versions.length) return [...new Set(versions)]

  const alias = indicatorRows.find((ind) => ind.indicatorType === 'alias')?.value
  if (alias) {
    const ids = alias.split(',').map((s) => s.trim()).filter(Boolean)
    if (ids.length) return ids
  }

  return ['*']
}
