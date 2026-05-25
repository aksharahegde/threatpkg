import { and, desc, eq, sql } from 'drizzle-orm'
import type { Ecosystem, FeedIncident, PackageDetail } from '#shared/types/threat'
import { ECOSYSTEMS } from '#shared/types/threat'
import { getDb } from '../db/index'
import { incidents, packageReputation } from '../db/schema'

export function normalizePackageEcosystem(value: string): Ecosystem | null {
  const v = value.toLowerCase()
  return (ECOSYSTEMS as readonly string[]).includes(v) ? (v as Ecosystem) : null
}

export async function resolvePackageEcosystem(
  packageName: string
): Promise<Ecosystem | null> {
  const db = getDb()
  const rows = await db
    .select({
      ecosystem: incidents.ecosystem,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(eq(incidents.packageName, packageName))
    .groupBy(incidents.ecosystem)
    .orderBy(sql`count(*) desc`)

  return (rows[0]?.ecosystem as Ecosystem) ?? null
}

export async function getPackageDetail(
  ecosystem: Ecosystem,
  packageName: string
): Promise<PackageDetail | null> {
  const db = getDb()
  const [rep] = await db
    .select()
    .from(packageReputation)
    .where(
      and(
        eq(packageReputation.packageName, packageName),
        eq(packageReputation.ecosystem, ecosystem)
      )
    )
    .limit(1)

  const incidentRows = await db
    .select()
    .from(incidents)
    .where(
      and(
        eq(incidents.packageName, packageName),
        eq(incidents.ecosystem, ecosystem)
      )
    )
    .orderBy(desc(incidents.publishedAt))

  if (!rep && incidentRows.length === 0) {
    return null
  }

  return {
    reputation: rep
      ? {
          id: rep.id,
          packageName: rep.packageName,
          ecosystem: rep.ecosystem as Ecosystem,
          riskScore: rep.riskScore,
          incidentCount: rep.incidentCount,
          maintainerCount: rep.maintainerCount,
          lastUpdated: rep.lastUpdated.toISOString()
        }
      : {
          id: 'generated',
          packageName,
          ecosystem,
          riskScore: incidentRows[0]?.riskScore ?? 0,
          incidentCount: incidentRows.length,
          maintainerCount: 0,
          lastUpdated:
            incidentRows[0]?.publishedAt.toISOString() ?? new Date().toISOString()
        },
    incidents: incidentRows.map(
      (row): FeedIncident => ({
        id: row.id,
        packageName: row.packageName,
        ecosystem: row.ecosystem as Ecosystem,
        title: row.title,
        description: row.description,
        severity: row.severity as FeedIncident['severity'],
        riskScore: row.riskScore,
        threatType: row.threatType as FeedIncident['threatType'],
        publishedAt: row.publishedAt.toISOString(),
        source: row.source as FeedIncident['source'],
        sourceUrl: row.sourceUrl,
        createdAt: row.createdAt.toISOString()
      })
    ),
    suspiciousSignals: [],
    maintainers: []
  }
}
