import type { FeedIncident } from '../../shared/types/threat'

export function dedupeKey(
  incident: Pick<FeedIncident, 'packageName' | 'title'> & { ecosystem: string }
) {
  return `${incident.ecosystem}:${incident.packageName}:${incident.title.toLowerCase()}`
}

export function dedupeIncidents<T extends Pick<FeedIncident, 'packageName' | 'title'> & { ecosystem: string }>(
  items: T[]
): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of items) {
    const key = dedupeKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }

  return result
}

export function titleSimilarity(a: string, b: string): number {
  const na = a.toLowerCase().split(/\s+/)
  const nb = new Set(b.toLowerCase().split(/\s+/))
  const overlap = na.filter((w) => nb.has(w)).length
  return overlap / Math.max(na.length, nb.size, 1)
}
