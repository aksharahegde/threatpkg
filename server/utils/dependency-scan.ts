import { and, eq, inArray, or, sql } from 'drizzle-orm'
import type {
  DependencyFileInput,
  ResolvedDependency,
  ScanPackageResult,
  ScanResponse,
  ScanSummary
} from '#shared/types/scan'
import { mergeDependencySets } from '#shared/utils/parse-dependency-files'
import {
  compareVersionStrings,
  isVersionAffectedByIndicators,
  minFixedVersionFromMatchData,
  parseVersionIndicators
} from '#shared/utils/version-match'
import { getDb } from '../db/index'
import { incidents, indicators } from '../db/schema'
import {
  mergeMinFixed,
  osvHitsToIncidentRefs,
  queryOsvMalwareByDependency,
  type OsvScanHit
} from './osv-scan'

interface IncidentWithIndicators {
  id: string
  title: string
  severity: string
  sourceUrl: string | null
  packageName: string
  ecosystem: string
  indicatorRows: { indicatorType: string; value: string }[]
}

function packageNameInList(column: typeof incidents.packageName, names: string[]) {
  if (!names.length) return sql`false`
  const lowered = names.map((n) => n.toLowerCase())
  return sql`lower(${column}) in (${sql.join(
    lowered.map((n) => sql`${n}`),
    sql`, `
  )})`
}

async function loadIncidentsForDeps(
  deps: ResolvedDependency[]
): Promise<IncidentWithIndicators[]> {
  if (!deps.length) return []

  const db = getDb()
  const npmNames = [...new Set(deps.filter((d) => d.ecosystem === 'npm').map((d) => d.packageName))]
  const pypiNames = [...new Set(deps.filter((d) => d.ecosystem === 'pypi').map((d) => d.packageName))]

  const conditions = []
  if (npmNames.length) {
    conditions.push(
      and(eq(incidents.ecosystem, 'npm'), packageNameInList(incidents.packageName, npmNames))
    )
  }
  if (pypiNames.length) {
    conditions.push(
      and(eq(incidents.ecosystem, 'pypi'), packageNameInList(incidents.packageName, pypiNames))
    )
  }
  if (!conditions.length) return []

  const incidentRows = await db
    .select()
    .from(incidents)
    .where(or(...conditions))

  if (!incidentRows.length) return []

  const incidentIds = incidentRows.map((r) => r.id)
  const indicatorRows = await db
    .select()
    .from(indicators)
    .where(inArray(indicators.incidentId, incidentIds))

  const byIncident = new Map<string, { indicatorType: string; value: string }[]>()
  for (const ind of indicatorRows) {
    const list = byIncident.get(ind.incidentId) ?? []
    list.push({ indicatorType: ind.indicatorType, value: ind.value })
    byIncident.set(ind.incidentId, list)
  }

  return incidentRows.map((row) => ({
    id: row.id,
    title: row.title,
    severity: row.severity,
    sourceUrl: row.sourceUrl,
    packageName: row.packageName,
    ecosystem: row.ecosystem,
    indicatorRows: byIncident.get(row.id) ?? []
  }))
}

function evaluateLocalDependency(
  dep: ResolvedDependency,
  incidentList: IncidentWithIndicators[]
): ScanPackageResult {
  const matchingIncidents = incidentList.filter(
    (inc) =>
      inc.packageName.toLowerCase() === dep.packageName.toLowerCase() &&
      inc.ecosystem === dep.ecosystem
  )

  if (!matchingIncidents.length) {
    return {
      packageName: dep.packageName,
      ecosystem: dep.ecosystem,
      installedVersion: dep.version,
      status: 'safe',
      minFixedVersion: null,
      incidents: []
    }
  }

  const affectedRefs: ScanPackageResult['incidents'] = []
  const fixedVersions: string[] = []
  let hasWildcard = false

  for (const inc of matchingIncidents) {
    const matchData = parseVersionIndicators(inc.indicatorRows)
    if (matchData.wildcard && !matchData.ranges.length && !matchData.exactVersions.length) {
      hasWildcard = true
      affectedRefs.push({
        id: inc.id,
        title: inc.title,
        severity: inc.severity,
        sourceUrl: inc.sourceUrl
      })
      continue
    }

    if (isVersionAffectedByIndicators(dep.ecosystem, dep.version, inc.indicatorRows)) {
      affectedRefs.push({
        id: inc.id,
        title: inc.title,
        severity: inc.severity,
        sourceUrl: inc.sourceUrl
      })
      const fixed = minFixedVersionFromMatchData(dep.ecosystem, matchData)
      if (fixed) fixedVersions.push(fixed)
    }
  }

  if (!affectedRefs.length) {
    return {
      packageName: dep.packageName,
      ecosystem: dep.ecosystem,
      installedVersion: dep.version,
      status: 'safe',
      minFixedVersion: null,
      incidents: []
    }
  }

  const minFixedVersion = fixedVersions.length
    ? fixedVersions.reduce((best, cur) =>
        compareVersionStrings(dep.ecosystem, cur, best) > 0 ? cur : best
      )
    : null

  const status = hasWildcard && !fixedVersions.length ? 'unknown' : 'compromised'

  return {
    packageName: dep.packageName,
    ecosystem: dep.ecosystem,
    installedVersion: dep.version,
    status,
    minFixedVersion,
    incidents: affectedRefs
  }
}

function depKey(dep: ResolvedDependency) {
  return `${dep.ecosystem}:${dep.packageName.toLowerCase()}`
}

function mergeWithOsv(
  local: ScanPackageResult,
  osvHits: OsvScanHit[] | undefined
): ScanPackageResult {
  if (!osvHits?.length) return local
  if (local.status === 'compromised') return local

  const osvIncidents = osvHitsToIncidentRefs(osvHits)
  const minFixedVersion = mergeMinFixed(
    local.ecosystem,
    [local.minFixedVersion, ...osvHits.map((h) => h.minFixedVersion)]
  )

  const hasUnknownOnly = osvHits.every((h) => !h.minFixedVersion)

  return {
    ...local,
    status: hasUnknownOnly && !minFixedVersion ? 'unknown' : 'compromised',
    minFixedVersion,
    incidents: [...local.incidents, ...osvIncidents]
  }
}

function buildSummary(
  results: ScanPackageResult[],
  warningCount: number
): ScanSummary {
  return {
    total: results.length,
    compromised: results.filter((r) => r.status === 'compromised').length,
    safe: results.filter((r) => r.status === 'safe').length,
    unknown: results.filter((r) => r.status === 'unknown').length,
    warnings: warningCount
  }
}

export async function scanDependencyFiles(
  files: DependencyFileInput[]
): Promise<ScanResponse> {
  const { dependencies, warnings } = mergeDependencySets(files)

  if (!dependencies.length) {
    return {
      summary: buildSummary([], warnings.length),
      results: [],
      warnings
    }
  }

  const [incidentsForDeps, osvByDep] = await Promise.all([
    loadIncidentsForDeps(dependencies),
    queryOsvMalwareByDependency(dependencies)
  ])

  const results = dependencies.map((dep) => {
    const local = evaluateLocalDependency(dep, incidentsForDeps)
    return mergeWithOsv(local, osvByDep.get(depKey(dep)))
  })

  const compromisedFirst = [...results].sort((a, b) => {
    const order = { compromised: 0, unknown: 1, safe: 2 }
    const diff = order[a.status] - order[b.status]
    if (diff !== 0) return diff
    return a.packageName.localeCompare(b.packageName)
  })

  return {
    summary: buildSummary(compromisedFirst, warnings.length),
    results: compromisedFirst,
    warnings
  }
}
