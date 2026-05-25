export const ECOSYSTEMS = ['npm', 'pypi'] as const
export type Ecosystem = (typeof ECOSYSTEMS)[number]

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const
export type Severity = (typeof SEVERITIES)[number]

export const THREAT_TYPES = [
  'malware',
  'typosquatting',
  'protestware',
  'credential_theft',
  'crypto_miner',
  'maintainer_compromise',
  'dependency_confusion',
  'obfuscation'
] as const
export type ThreatType = (typeof THREAT_TYPES)[number]

export const SOURCES = ['osv', 'github', 'snyk', 'phylum', 'jfrog'] as const
export type Source = (typeof SOURCES)[number]

export const TIME_RANGES = ['24h', '7d', '30d'] as const
export type TimeRange = (typeof TIME_RANGES)[number]

export interface FeedIncident {
  id: string
  packageName: string
  ecosystem: Ecosystem
  title: string
  description: string
  severity: Severity
  riskScore: number
  threatType: ThreatType
  publishedAt: string
  source: Source
  sourceUrl: string | null
  createdAt: string
}

export interface FeedSummary {
  total: number
  critical: number
  high: number
  uniquePackages: number
  byEcosystem: Record<Ecosystem, number>
  byThreatType: Partial<Record<ThreatType, number>>
}

export interface FeedResponse {
  items: FeedIncident[]
  nextCursor: string | null
  summary: FeedSummary
  /** Incident counts per time bucket (hourly for 24h, daily for 7d/30d). */
  trend: number[]
}

export interface Indicator {
  id: string
  incidentId: string
  indicatorType: string
  value: string
  confidence: number
}

export interface IncidentDetail extends FeedIncident {
  aiSummary: string | null
  affectedVersions: string[]
  indicators: Indicator[]
  timeline: { at: string; label: string }[]
  relatedIncidents: FeedIncident[]
}

export interface PackageReputation {
  id: string
  packageName: string
  ecosystem: Ecosystem
  riskScore: number
  incidentCount: number
  maintainerCount: number
  lastUpdated: string
}

export interface PackageDetail {
  reputation: PackageReputation
  incidents: FeedIncident[]
  suspiciousSignals: string[]
  maintainers: string[]
}

export interface FeedQuery {
  ecosystem?: Ecosystem
  severity?: Severity
  threatType?: ThreatType
  source?: Source
  range?: TimeRange
  q?: string
  sort?: 'published' | 'risk'
  cursor?: string
  limit?: number
}

export function severityFromScore(score: number): Severity {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}
