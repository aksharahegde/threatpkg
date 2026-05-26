import type { Ecosystem, Severity, ThreatType, Source } from '../../shared/types/threat'
import { ECOSYSTEMS, severityFromScore } from '../../shared/types/threat'
import { mapOsvEcosystem } from '../../shared/constants/ecosystems'

export interface RawIncident {
  packageName: string
  ecosystem: string
  title: string
  description?: string
  riskScore?: number
  threatType?: string
  publishedAt: string | Date
  source: string
  sourceUrl?: string | null
}

export function normalizeEcosystem(value: string): Ecosystem | null {
  const trimmed = value.trim()
  if ((ECOSYSTEMS as readonly string[]).includes(trimmed)) {
    return trimmed as Ecosystem
  }
  return mapOsvEcosystem(trimmed)
}

export function normalizeSeverity(value: string | undefined, riskScore?: number): Severity {
  if (value && ['critical', 'high', 'medium', 'low'].includes(value)) {
    return value as Severity
  }
  return severityFromScore(riskScore ?? 0)
}

export function normalizeThreatType(value: string | undefined): ThreatType {
  const allowed = [
    'malware',
    'typosquatting',
    'protestware',
    'credential_theft',
    'crypto_miner',
    'maintainer_compromise',
    'dependency_confusion',
    'obfuscation'
  ] as const
  const v = (value ?? 'malware').toLowerCase().replace(/-/g, '_')
  if ((allowed as readonly string[]).includes(v)) {
    return v as ThreatType
  }
  return 'malware'
}

export function normalizeSource(value: string): Source {
  const v = value.toLowerCase()
  const allowed = ['osv', 'github'] as const
  if ((allowed as readonly string[]).includes(v)) {
    return v as Source
  }
  return 'osv'
}

export function normalizeIncident(raw: RawIncident) {
  const ecosystem = normalizeEcosystem(raw.ecosystem)
  if (!ecosystem) return null

  const riskScore = raw.riskScore ?? 0
  return {
    packageName: raw.packageName.trim(),
    ecosystem,
    title: raw.title.trim(),
    description: (raw.description ?? '').trim(),
    riskScore,
    severity: normalizeSeverity(undefined, riskScore),
    threatType: normalizeThreatType(raw.threatType),
    publishedAt:
      raw.publishedAt instanceof Date ? raw.publishedAt : new Date(raw.publishedAt),
    source: normalizeSource(raw.source),
    sourceUrl: raw.sourceUrl ?? null
  }
}
