import { and, eq, inArray, isNull, sql } from 'drizzle-orm'
import type { FetcherIncident } from '../fetchers/types'
import { getDb } from '../db/index'
import { incidents, indicators, packageReputation, sources } from '../db/schema'
import { normalizeIncident } from './normalize'

export interface PersistResult {
  inserted: number
  updated: number
  skipped: number
}

function incidentKey(source: string, externalId: string) {
  return `${source}:${externalId}`
}

export async function persistIncidents(
  items: FetcherIncident[]
): Promise<PersistResult> {
  const db = getDb()
  const normalized = items
    .filter((raw) => raw.externalId?.trim())
    .map((raw) => {
      const data = normalizeIncident(raw)
      if (!data) return null
      return {
        raw,
        externalId: raw.externalId.trim(),
        data
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  if (normalized.length === 0) {
    return { inserted: 0, updated: 0, skipped: items.length }
  }

  const sourcesList = [...new Set(normalized.map((n) => n.data.source))]
  const externalIds = normalized.map((n) => n.externalId)

  const existingRows = await db
    .select({
      id: incidents.id,
      source: incidents.source,
      externalId: incidents.externalId,
      publishedAt: incidents.publishedAt
    })
    .from(incidents)
    .where(
      and(
        inArray(incidents.source, sourcesList),
        inArray(incidents.externalId, externalIds)
      )
    )

  const existingMap = new Map(
    existingRows
      .filter((row) => row.externalId)
      .map((row) => [incidentKey(row.source, row.externalId!), row])
  )

  const toInsert: typeof normalized = []
  const toUpdate: {
    id: string
    data: (typeof normalized)[0]
  }[] = []
  let skipped = items.length - normalized.length

  for (const entry of normalized) {
    const key = incidentKey(entry.data.source, entry.externalId)
    const existing = existingMap.get(key)

    if (!existing) {
      toInsert.push(entry)
      continue
    }

    if (existing.publishedAt >= entry.data.publishedAt) {
      skipped++
      continue
    }

    toUpdate.push({ id: existing.id, data: entry })
  }

  if (toInsert.length) {
    const insertedRows = await db
      .insert(incidents)
      .values(
        toInsert.map(({ externalId, data }) => ({
          packageName: data.packageName,
          ecosystem: data.ecosystem,
          title: data.title,
          description: data.description,
          severity: data.severity,
          riskScore: data.riskScore,
          threatType: data.threatType,
          publishedAt: data.publishedAt,
          source: data.source,
          sourceUrl: data.sourceUrl,
          externalId
        }))
      )
      .returning({ id: incidents.id })

    for (let i = 0; i < insertedRows.length; i++) {
      const inds = toInsert[i]?.raw.indicators
      if (!inds?.length) continue
      await db.insert(indicators).values(
        inds.map((ind) => ({
          incidentId: insertedRows[i]!.id,
          indicatorType: ind.indicatorType,
          value: ind.value,
          confidence: ind.confidence
        }))
      )
    }
  }

  for (const { id, data } of toUpdate) {
    await db
      .update(incidents)
      .set({
        packageName: data.data.packageName,
        ecosystem: data.data.ecosystem,
        title: data.data.title,
        description: data.data.description,
        severity: data.data.severity,
        riskScore: data.data.riskScore,
        threatType: data.data.threatType,
        publishedAt: data.data.publishedAt,
        sourceUrl: data.data.sourceUrl
      })
      .where(eq(incidents.id, id))

    if (data.raw.indicators?.length) {
      await db.delete(indicators).where(eq(indicators.incidentId, id))
      await db.insert(indicators).values(
        data.raw.indicators.map((ind) => ({
          incidentId: id,
          indicatorType: ind.indicatorType,
          value: ind.value,
          confidence: ind.confidence
        }))
      )
    }
  }

  await refreshPackageReputation()

  return {
    inserted: toInsert.length,
    updated: toUpdate.length,
    skipped
  }
}

export async function refreshPackageReputation() {
  const db = getDb()

  await db.delete(packageReputation)

  await db.execute(sql`
    INSERT INTO package_reputation (
      id, package_name, ecosystem, risk_score, incident_count, maintainer_count, last_updated
    )
    SELECT
      gen_random_uuid(),
      package_name,
      ecosystem,
      MAX(risk_score),
      COUNT(*)::int,
      1,
      NOW()
    FROM incidents
    GROUP BY package_name, ecosystem
  `)
}

const RETIRED_SOURCES = ['snyk', 'phylum', 'jfrog'] as const

export async function removeRetiredSourceIncidents() {
  const db = getDb()
  const deleted = await db
    .delete(incidents)
    .where(inArray(incidents.source, [...RETIRED_SOURCES]))
    .returning({ id: incidents.id })
  if (deleted.length > 0) {
    await refreshPackageReputation()
  }
  return deleted.length
}

export async function removeUnsyncedIncidents() {
  const db = getDb()
  const deleted = await db
    .delete(incidents)
    .where(isNull(incidents.externalId))
    .returning({ id: incidents.id })
  await refreshPackageReputation()
  return deleted.length
}

export async function touchSourceSync(name: string) {
  const db = getDb()
  await db
    .update(sources)
    .set({ lastSyncedAt: new Date() })
    .where(eq(sources.name, name))
}
