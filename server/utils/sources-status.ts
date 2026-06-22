import { getDb } from '../db/index'
import { sources } from '../db/schema'

export interface SourceStatus {
  name: string
  type: string
  url: string
  enabled: boolean
  lastSyncedAt: string | null
}

type SourceRow = Omit<typeof sources.$inferSelect, 'lastSyncedAt'> & {
  lastSyncedAt: Date | string | null
}

export function serializeSourceStatus(row: SourceRow): SourceStatus {
  return {
    name: row.name,
    type: row.type,
    url: row.url,
    enabled: row.enabled,
    lastSyncedAt:
      row.lastSyncedAt instanceof Date
        ? row.lastSyncedAt.toISOString()
        : row.lastSyncedAt
  }
}

export async function getSourcesStatus(): Promise<SourceStatus[]> {
  const db = getDb()
  const rows = await db.select().from(sources)
  return rows.map(serializeSourceStatus)
}

export function freshestSyncAt(sourcesList: SourceStatus[]): Date | null {
  const times = sourcesList
    .map((s) => (s.lastSyncedAt ? new Date(s.lastSyncedAt).getTime() : NaN))
    .filter((t) => !Number.isNaN(t))
  if (!times.length) return null
  return new Date(Math.max(...times))
}
