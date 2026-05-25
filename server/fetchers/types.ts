import type { Ecosystem } from '../../shared/types/threat'

export interface FetcherIndicator {
  indicatorType: string
  value: string
  confidence: number
}

export interface FetcherIncident {
  externalId: string
  packageName: string
  ecosystem: Ecosystem
  title: string
  description?: string
  severity?: string
  riskScore?: number
  threatType?: string
  publishedAt: string | Date
  source: string
  sourceUrl?: string | null
  indicators?: FetcherIndicator[]
}
