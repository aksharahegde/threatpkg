import { desc } from 'drizzle-orm'
import type { SitemapUrlInput } from '#sitemap/types'
import { packagePagePath } from '#shared/utils/package-path'
import type { Ecosystem } from '#shared/types/threat'
import { ECOSYSTEMS } from '#shared/constants/ecosystems'
import { getDb } from '../db/index'
import { incidents, packageReputation } from '../db/schema'

const MAX_INCIDENT_URLS = 5_000
const MAX_PACKAGE_URLS = 5_000

function isKnownEcosystem(value: string): value is Ecosystem {
  return (ECOSYSTEMS as readonly string[]).includes(value)
}

export async function getSitemapDynamicUrls(): Promise<SitemapUrlInput[]> {
  if (!process.env.DATABASE_URL) return []

  try {
    const db = getDb()
    const urls: SitemapUrlInput[] = []

    const incidentRows = await db
      .select({
        id: incidents.id,
        publishedAt: incidents.publishedAt,
        createdAt: incidents.createdAt
      })
      .from(incidents)
      .orderBy(desc(incidents.publishedAt))
      .limit(MAX_INCIDENT_URLS)

    for (const row of incidentRows) {
      urls.push({
        loc: `/incident/${row.id}`,
        lastmod: (row.publishedAt ?? row.createdAt).toISOString()
      })
    }

    const packageRows = await db
      .select({
        packageName: packageReputation.packageName,
        ecosystem: packageReputation.ecosystem,
        lastUpdated: packageReputation.lastUpdated
      })
      .from(packageReputation)
      .orderBy(desc(packageReputation.lastUpdated))
      .limit(MAX_PACKAGE_URLS)

    for (const row of packageRows) {
      if (!isKnownEcosystem(row.ecosystem)) continue
      urls.push({
        loc: packagePagePath(row.ecosystem, row.packageName),
        lastmod: row.lastUpdated.toISOString()
      })
    }

    return urls
  } catch {
    return []
  }
}
