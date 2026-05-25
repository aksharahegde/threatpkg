import { eq, sql } from 'drizzle-orm'
import type { Ecosystem } from '#shared/types/threat'
import { getDb } from '../../../db/index'
import { incidents } from '../../../db/schema'
import { resolvePackageEcosystem } from '../../../utils/package-detail'

export default defineEventHandler(async (event) => {
  const nameParam = getRouterParam(event, 'name')
  if (!nameParam) {
    throw createError({ statusCode: 400, statusMessage: 'Missing package name' })
  }

  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL not configured'
    })
  }

  const packageName = decodeURIComponent(nameParam)
  const ecosystem = await resolvePackageEcosystem(packageName)

  if (!ecosystem) {
    throw createError({ statusCode: 404, statusMessage: 'Package not found' })
  }

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

  return {
    packageName,
    ecosystem,
    ecosystems: rows.map((r) => ({
      ecosystem: r.ecosystem as Ecosystem,
      incidentCount: r.count
    }))
  }
})
