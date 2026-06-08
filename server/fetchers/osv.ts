import type { FetcherIncident, FetcherIndicator } from './types'
import { ECOSYSTEM_META, mapOsvEcosystem } from '../../shared/constants/ecosystems'
import {
  indicatorsFromOsvAffected,
  isOsvMalwareRecord,
  type OsvAffectedPackage,
  type OsvVulnLike
} from '../../shared/utils/osv-affected'
import {
  extractPackageFromTitle,
  inferSeverity,
  inferThreatType,
  severityToRiskScore
} from '../utils/infer-threat'

const OSV_API = 'https://api.osv.dev/v1'

const MAX_IDS_PER_ECOSYSTEM = 40
const MAX_IDS_GLOBAL = 200
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

type OsvVuln = OsvVulnLike & {
  published?: string
  modified?: string
  aliases?: string[]
  affected?: OsvAffectedPackage[]
}

/** Collect recent malicious-package IDs (MAL-*) from an OSV modified CSV. */
function parseModifiedCsv(text: string, cutoff: Date): string[] {
  const ids: string[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const comma = trimmed.indexOf(',')
    if (comma === -1) continue
    const modifiedAt = new Date(trimmed.slice(0, comma))
    const id = trimmed.slice(comma + 1).trim()
    if (Number.isNaN(modifiedAt.getTime()) || !id) continue
    if (modifiedAt < cutoff) break
    // Recent rows are often CVE/GHSA updates; skip them and keep scanning for MAL-*.
    if (!id.startsWith('MAL-')) continue
    ids.push(id)
    if (ids.length >= MAX_IDS_PER_ECOSYSTEM) break
  }
  return ids
}

async function fetchRecentIds(csvUrl: string): Promise<string[]> {
  const res = await fetch(csvUrl, {
    headers: { Accept: 'text/plain' },
    signal: AbortSignal.timeout(30_000)
  })
  if (!res.ok) {
    throw new Error(`OSV modified list failed (${res.status})`)
  }
  const cutoff = new Date(Date.now() - MAX_AGE_MS)
  return parseModifiedCsv(await res.text(), cutoff)
}

async function fetchVuln(id: string): Promise<OsvVuln | null> {
  const res = await fetch(`${OSV_API}/vulns/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000)
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`OSV vuln ${id} failed (${res.status})`)
  }
  return (await res.json()) as OsvVuln
}

function vulnToIncident(vuln: OsvVuln): FetcherIncident | null {
  if (!isOsvMalwareRecord(vuln)) return null

  const affected = vuln.affected?.[0]?.package
  const ecosystemRaw = affected?.ecosystem ?? ''
  const ecosystem = mapOsvEcosystem(ecosystemRaw)
  if (!ecosystem) return null

  const packageName =
    affected?.name ??
    extractPackageFromTitle(vuln.summary ?? '') ??
    'unknown'

  const text = `${vuln.summary ?? ''} ${vuln.details ?? ''}`
  const riskScore = severityToRiskScore('critical')
  const threatType = inferThreatType(text)
  const advisoryUrl =
    vuln.references?.find((r) => r.type === 'ADVISORY')?.url ??
    `https://osv.dev/vulnerability/${vuln.id}`

  const indicatorList: FetcherIndicator[] = []
  if (vuln.aliases?.length) {
    indicatorList.push({
      indicatorType: 'alias',
      value: vuln.aliases.join(', '),
      confidence: 90
    })
  }
  if (vuln.id.startsWith('CVE-') || vuln.id.startsWith('GHSA-')) {
    indicatorList.push({
      indicatorType: 'alias',
      value: vuln.id,
      confidence: 95
    })
  }
  for (const indicator of indicatorsFromOsvAffected(vuln.affected)) {
    indicatorList.push({ ...indicator, confidence: 75 })
  }

  return {
    externalId: vuln.id,
    packageName,
    ecosystem,
    title: vuln.summary ?? `Malicious package ${packageName}`,
    description: (vuln.details ?? '').slice(0, 4000),
    severity: inferSeverity('critical', riskScore),
    riskScore,
    threatType,
    publishedAt: vuln.published ?? vuln.modified ?? new Date().toISOString(),
    source: 'osv',
    sourceUrl: advisoryUrl,
    indicators: indicatorList.length ? indicatorList : undefined
  }
}

export async function fetchOsvIncidents(): Promise<FetcherIncident[]> {
  const idLists = await Promise.all(
    ECOSYSTEM_META.map((meta) => fetchRecentIds(meta.osvCsvUrl))
  )

  const uniqueIds = [...new Set(idLists.flat())].slice(0, MAX_IDS_GLOBAL)
  const results: FetcherIncident[] = []
  const batchSize = 8

  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize)
    const vulns = await Promise.all(batch.map((id) => fetchVuln(id)))
    for (const vuln of vulns) {
      if (!vuln) continue
      const incident = vulnToIncident(vuln)
      if (incident) results.push(incident)
    }
  }

  return results
}
