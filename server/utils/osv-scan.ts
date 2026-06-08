import { toOsvQueryEcosystem } from '#shared/constants/ecosystems'
import type { ResolvedDependency, ScanEcosystem, ScanIncidentRef } from '#shared/types/scan'
import {
  isInstalledVersionAffectedByOsv,
  isOsvMalwareRecord,
  minFixedVersionFromOsvVuln,
  osvAdvisoryUrl,
  type OsvVulnLike
} from '#shared/utils/osv-affected'
import { compareVersionStrings } from '#shared/utils/version-match'

const OSV_QUERY_BATCH = 'https://api.osv.dev/v1/querybatch'
const BATCH_SIZE = 500

interface OsvQueryResult {
  vulns?: OsvVulnLike[]
}

export interface OsvScanHit {
  vuln: OsvVulnLike
  minFixedVersion: string | null
}

function depKey(dep: ResolvedDependency) {
  return `${dep.ecosystem}:${dep.packageName.toLowerCase()}`
}

async function queryOsvBatch(
  deps: ResolvedDependency[]
): Promise<OsvQueryResult[]> {
  const queries = deps.map((dep) => ({
    package: {
      name: dep.packageName,
      ecosystem: toOsvQueryEcosystem(dep.ecosystem)
    },
    version: dep.version
  }))

  const res = await fetch(OSV_QUERY_BATCH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queries }),
    signal: AbortSignal.timeout(60_000)
  })

  if (!res.ok) {
    throw new Error(`OSV querybatch failed (${res.status})`)
  }

  const body = (await res.json()) as { results?: OsvQueryResult[] }
  return body.results ?? []
}

function malwareHitsForDep(
  dep: ResolvedDependency,
  result: OsvQueryResult | undefined
): OsvScanHit[] {
  const hits: OsvScanHit[] = []

  for (const vuln of result?.vulns ?? []) {
    if (!isOsvMalwareRecord(vuln)) continue
    if (!isInstalledVersionAffectedByOsv(dep.ecosystem, dep.version, vuln)) continue
    hits.push({
      vuln,
      minFixedVersion: minFixedVersionFromOsvVuln(dep.ecosystem, vuln)
    })
  }

  return hits
}

export function osvHitsToIncidentRefs(hits: OsvScanHit[]): ScanIncidentRef[] {
  return hits.map((hit) => ({
    id: `osv:${hit.vuln.id}`,
    title: hit.vuln.summary ?? hit.vuln.id,
    severity: 'critical',
    sourceUrl: osvAdvisoryUrl(hit.vuln)
  }))
}

export async function queryOsvMalwareByDependency(
  deps: ResolvedDependency[]
): Promise<Map<string, OsvScanHit[]>> {
  const byDep = new Map<string, OsvScanHit[]>()
  if (!deps.length) return byDep

  for (let i = 0; i < deps.length; i += BATCH_SIZE) {
    const chunk = deps.slice(i, i + BATCH_SIZE)
    const results = await queryOsvBatch(chunk)

    for (let j = 0; j < chunk.length; j++) {
      const dep = chunk[j]!
      const hits = malwareHitsForDep(dep, results[j])
      if (hits.length) byDep.set(depKey(dep), hits)
    }
  }

  return byDep
}

export function mergeMinFixed(
  ecosystem: ScanEcosystem,
  versions: (string | null)[]
): string | null {
  const fixed = versions.filter((v): v is string => Boolean(v))
  if (!fixed.length) return null
  return fixed.reduce((best, cur) =>
    compareVersionStrings(ecosystem, cur, best) > 0 ? cur : best
  )
}
