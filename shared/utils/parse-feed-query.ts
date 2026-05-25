import {
  ECOSYSTEMS,
  SEVERITIES,
  SOURCES,
  THREAT_TYPES,
  TIME_RANGES,
  type Ecosystem,
  type FeedQuery,
  type Severity,
  type Source,
  type ThreatType,
  type TimeRange
} from '../types/threat'

export const FEED_DEFAULT_LIMIT = 20
export const FEED_MAX_LIMIT = 100
export const FEED_MAX_Q_LENGTH = 200

const SORT_VALUES = ['published', 'risk'] as const

function firstString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  return trimmed || undefined
}

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | undefined {
  const s = firstString(value)
  if (!s) return undefined
  return (allowed as readonly string[]).includes(s) ? (s as T) : undefined
}

function parseLimit(value: unknown): number {
  if (value === undefined || value === null || value === '') {
    return FEED_DEFAULT_LIMIT
  }
  const raw = Array.isArray(value) ? value[0] : value
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return FEED_DEFAULT_LIMIT
  return Math.min(Math.floor(n), FEED_MAX_LIMIT)
}

/** Normalize raw HTTP query into a safe FeedQuery (invalid values are dropped). */
export function parseFeedQuery(input: Record<string, unknown>): FeedQuery {
  const q = firstString(input.q)
  const sort = pickEnum(input.sort, SORT_VALUES) ?? 'published'

  return {
    ecosystem: pickEnum(input.ecosystem, ECOSYSTEMS) as Ecosystem | undefined,
    severity: pickEnum(input.severity, SEVERITIES) as Severity | undefined,
    threatType: pickEnum(input.threatType, THREAT_TYPES) as ThreatType | undefined,
    source: pickEnum(input.source, SOURCES) as Source | undefined,
    range: pickEnum(input.range, TIME_RANGES) as TimeRange | undefined,
    q: q ? q.slice(0, FEED_MAX_Q_LENGTH) : undefined,
    sort,
    cursor: firstString(input.cursor),
    limit: parseLimit(input.limit)
  }
}
