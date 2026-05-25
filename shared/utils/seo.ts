import type { Ecosystem } from '../types/threat'
import { getEcosystemMeta } from '../constants/ecosystems'

export function absoluteSiteUrl(path: string, siteUrl: string): string {
  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return new URL(normalized, base).href
}

function trimDescription(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  return `${cleaned.slice(0, max - 1).trim()}…`
}

export function incidentMetaDescription(input: {
  title: string
  packageName: string
  ecosystem: Ecosystem | string
  severity: string
  threatType: string
  description: string
  source: string
}): string {
  const ecoLabel = getEcosystemMeta(input.ecosystem)?.label ?? input.ecosystem
  const lead = `${input.severity.toUpperCase()} ${input.threatType.replace(/_/g, ' ')} in ${input.packageName} (${ecoLabel}), sourced from ${input.source}.`
  const detail = input.description.trim()
  return trimDescription(detail ? `${lead} ${detail}` : lead || input.title)
}

export function packageMetaDescription(input: {
  packageName: string
  ecosystem: Ecosystem | string
  incidentCount: number
  riskScore: number
}): string {
  const ecoLabel = getEcosystemMeta(input.ecosystem)?.label ?? input.ecosystem
  return trimDescription(
    `ThreatPkg reputation for ${input.packageName} on ${ecoLabel}: ${input.incidentCount} recorded supply-chain incident(s), peak risk score ${input.riskScore}. Review history and related advisories.`
  )
}
