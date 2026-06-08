export type ScanEcosystem = 'npm' | 'pypi'

export interface ResolvedDependency {
  packageName: string
  version: string
  ecosystem: ScanEcosystem
}

export interface DependencyFileInput {
  filename: string
  content: string
}

export interface ParseResult {
  dependencies: ResolvedDependency[]
  warnings: string[]
}

export type ScanPackageStatus = 'safe' | 'compromised' | 'unknown'

export interface ScanIncidentRef {
  id: string
  title: string
  severity: string
  sourceUrl: string | null
}

export interface ScanPackageResult {
  packageName: string
  ecosystem: ScanEcosystem
  installedVersion: string
  status: ScanPackageStatus
  minFixedVersion: string | null
  incidents: ScanIncidentRef[]
}

export interface ScanSummary {
  total: number
  compromised: number
  safe: number
  unknown: number
  warnings: number
}

export interface ScanResponse {
  summary: ScanSummary
  results: ScanPackageResult[]
  warnings: string[]
}
