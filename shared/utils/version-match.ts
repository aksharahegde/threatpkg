import semver from 'semver'
import type { ScanEcosystem } from '../types/scan'

export interface VersionRange {
  introduced: string | null
  fixed: string | null
}

export interface VersionIndicator {
  indicatorType: string
  value: string
}

export interface VersionMatchData {
  ranges: VersionRange[]
  exactVersions: string[]
  wildcard: boolean
}

const BOGUS_VALUE_RE = /\[native code\]|function\s+fixed/i

function parseConstraint(value: string): { op: string; version: string } | null {
  const trimmed = value.trim()
  if (BOGUS_VALUE_RE.test(trimmed)) return null
  const match = trimmed.match(/^(>=|<=|>|<|=)(.+)$/)
  if (match?.[1] && match[2]) {
    return { op: match[1], version: match[2].trim() }
  }
  return null
}

export function parseVersionIndicators(indicators: VersionIndicator[]): VersionMatchData {
  const versionValues = indicators
    .filter((i) => i.indicatorType === 'affected_version')
    .map((i) => i.value.trim())
    .filter(Boolean)
    .filter((v) => !BOGUS_VALUE_RE.test(v))

  if (!versionValues.length) {
    const hasMeta = indicators.some(
      (i) => i.indicatorType === 'alias' || i.indicatorType === 'ghsa'
    )
    return { ranges: [], exactVersions: [], wildcard: hasMeta }
  }

  const ranges: VersionRange[] = []
  const exactVersions: string[] = []
  let pendingIntroduced: string | null = null

  for (const raw of versionValues) {
    const c = parseConstraint(raw)
    if (!c) continue

    if (c.op === '=') {
      exactVersions.push(c.version)
    } else if (c.op === '>=') {
      pendingIntroduced = c.version
    } else if (c.op === '<' || c.op === '<=') {
      ranges.push({ introduced: pendingIntroduced, fixed: c.version })
      pendingIntroduced = null
    }
  }

  if (pendingIntroduced) {
    ranges.push({ introduced: pendingIntroduced, fixed: null })
  }

  if (!ranges.length && !exactVersions.length) {
    return { ranges: [], exactVersions: [], wildcard: true }
  }

  return { ranges, exactVersions, wildcard: false }
}

/** @deprecated use parseVersionIndicators */
export function rangesFromIndicators(
  indicators: VersionIndicator[]
): VersionRange[] | 'wildcard' {
  const data = parseVersionIndicators(indicators)
  if (data.wildcard && !data.ranges.length && !data.exactVersions.length) {
    return 'wildcard'
  }
  return data.ranges
}

function normalizePep440(version: string): string[] {
  const base = version.split('+')[0]?.split('-')[0] ?? version
  return base.split('.').map((p) => p.replace(/^0+(\d)/, '$1'))
}

function comparePep440(a: string, b: string): number {
  const pa = normalizePep440(a)
  const pb = normalizePep440(b)
  const len = Math.max(pa.length, pb.length)

  for (let i = 0; i < len; i++) {
    const na = parseInt(pa[i] ?? '0', 10)
    const nb = parseInt(pb[i] ?? '0', 10)
    if (Number.isNaN(na) || Number.isNaN(nb)) {
      return (pa[i] ?? '').localeCompare(pb[i] ?? '')
    }
    if (na !== nb) return na < nb ? -1 : 1
  }
  return 0
}

function compareVersions(ecosystem: ScanEcosystem, a: string, b: string): number {
  if (ecosystem === 'npm') {
    const coercedA = semver.coerce(a)?.version ?? a
    const coercedB = semver.coerce(b)?.version ?? b
    return semver.compare(coercedA, coercedB)
  }
  return comparePep440(a, b)
}

export function isVersionAffected(
  ecosystem: ScanEcosystem,
  version: string,
  ranges: VersionRange[] | 'wildcard'
): boolean {
  if (ranges === 'wildcard') return true

  return ranges.some((range) => {
    if (range.introduced && compareVersions(ecosystem, version, range.introduced) < 0) {
      return false
    }
    if (range.fixed && compareVersions(ecosystem, version, range.fixed) >= 0) {
      return false
    }
    return true
  })
}

export function isVersionAffectedByMatchData(
  ecosystem: ScanEcosystem,
  version: string,
  data: VersionMatchData
): boolean {
  if (data.wildcard && !data.ranges.length && !data.exactVersions.length) {
    return true
  }

  if (
    data.exactVersions.some(
      (exact) => compareVersions(ecosystem, version, exact) === 0
    )
  ) {
    return true
  }

  if (data.ranges.length && isVersionAffected(ecosystem, version, data.ranges)) {
    return true
  }

  return false
}

export function isVersionAffectedByIndicators(
  ecosystem: ScanEcosystem,
  version: string,
  indicators: VersionIndicator[]
): boolean {
  return isVersionAffectedByMatchData(ecosystem, version, parseVersionIndicators(indicators))
}

export function minFixedVersionFromRanges(
  ecosystem: ScanEcosystem,
  ranges: VersionRange[] | 'wildcard'
): string | null {
  if (ranges === 'wildcard') return null

  const fixedVersions = ranges
    .map((r) => r.fixed)
    .filter((v): v is string => Boolean(v))

  if (!fixedVersions.length) return null

  return fixedVersions.reduce((best, cur) =>
    compareVersions(ecosystem, cur, best) > 0 ? cur : best
  )
}

export function minFixedVersionFromMatchData(
  ecosystem: ScanEcosystem,
  data: VersionMatchData
): string | null {
  return minFixedVersionFromRanges(ecosystem, data.ranges)
}

export function compareVersionStrings(
  ecosystem: ScanEcosystem,
  a: string,
  b: string
): number {
  return compareVersions(ecosystem, a, b)
}
