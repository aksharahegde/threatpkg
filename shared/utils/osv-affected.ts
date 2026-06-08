import type { ScanEcosystem } from '../types/scan'
import {
  isVersionAffectedByIndicators,
  minFixedVersionFromMatchData,
  parseVersionIndicators,
  type VersionIndicator
} from './version-match'

export interface OsvAffectedPackage {
  package?: { name?: string; ecosystem?: string }
  versions?: string[]
  ranges?: {
    type?: string
    events?: { introduced?: string; fixed?: string; last_affected?: string }[]
  }[]
}

export interface OsvVulnLike {
  id: string
  summary?: string
  details?: string
  references?: { type?: string; url?: string }[]
  database_specific?: Record<string, unknown>
  affected?: OsvAffectedPackage[]
}

export function isOsvMalwareRecord(vuln: OsvVulnLike): boolean {
  if (vuln.id.startsWith('MAL-')) return true
  const summary = (vuln.summary ?? '').toLowerCase()
  if (summary.includes('malicious') || summary.includes('malware')) return true
  const origins = vuln.database_specific?.['malicious-packages-origins']
  return Array.isArray(origins) && origins.length > 0
}

export function indicatorsFromOsvAffected(
  affected: OsvAffectedPackage[] | undefined
): VersionIndicator[] {
  const indicators: VersionIndicator[] = []

  for (const aff of affected ?? []) {
    for (const version of aff.versions ?? []) {
      if (typeof version !== 'string' || !version.trim()) continue
      indicators.push({
        indicatorType: 'affected_version',
        value: `=${version.trim()}`
      })
    }

    for (const range of aff.ranges ?? []) {
      for (const event of range.events ?? []) {
        if (event.introduced) {
          indicators.push({
            indicatorType: 'affected_version',
            value: `>=${event.introduced}`
          })
        }
        if (event.fixed) {
          indicators.push({
            indicatorType: 'affected_version',
            value: `<${event.fixed}`
          })
        }
      }
    }
  }

  return indicators
}

export function osvAdvisoryUrl(vuln: OsvVulnLike): string {
  return (
    vuln.references?.find((r) => r.type === 'ADVISORY')?.url ??
    `https://osv.dev/vulnerability/${vuln.id}`
  )
}

export function isInstalledVersionAffectedByOsv(
  ecosystem: ScanEcosystem,
  installedVersion: string,
  vuln: OsvVulnLike
): boolean {
  const indicators = indicatorsFromOsvAffected(vuln.affected)
  if (!indicators.length) return true
  return isVersionAffectedByIndicators(ecosystem, installedVersion, indicators)
}

export function minFixedVersionFromOsvVuln(
  ecosystem: ScanEcosystem,
  vuln: OsvVulnLike
): string | null {
  const indicators = indicatorsFromOsvAffected(vuln.affected)
  if (!indicators.length) return null
  return minFixedVersionFromMatchData(ecosystem, parseVersionIndicators(indicators))
}
