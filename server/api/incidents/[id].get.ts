import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { incidents, indicators } from '../../db/schema'
import {
  affectedVersionsFromIndicators,
  getRelatedIncidents
} from '../../utils/incident-detail'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing incident id' })
  }

  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL not configured'
    })
  }

  const db = getDb()
  const [row] = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1)

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Incident not found' })
  }

  const indicatorRows = await db
    .select()
    .from(indicators)
    .where(eq(indicators.incidentId, id))

  const relatedIncidents = await getRelatedIncidents(
    id,
    row.packageName,
    row.ecosystem,
    row.threatType
  )

  return {
    id: row.id,
    packageName: row.packageName,
    ecosystem: row.ecosystem,
    title: row.title,
    description: row.description,
    severity: row.severity,
    riskScore: row.riskScore,
    threatType: row.threatType,
    publishedAt: row.publishedAt.toISOString(),
    source: row.source,
    sourceUrl: row.sourceUrl,
    createdAt: row.createdAt.toISOString(),
    aiSummary: `Indexed incident for ${row.packageName} (${row.ecosystem}).`,
    affectedVersions: affectedVersionsFromIndicators(indicatorRows),
    indicators: indicatorRows.map((ind) => ({
      id: ind.id,
      incidentId: ind.incidentId,
      indicatorType: ind.indicatorType,
      value: ind.value,
      confidence: ind.confidence
    })),
    timeline: [
      { at: row.publishedAt.toISOString(), label: 'Advisory published' },
      { at: row.createdAt.toISOString(), label: 'Indexed by ThreatPkg' }
    ],
    relatedIncidents
  }
})
