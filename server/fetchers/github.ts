import type { FetcherIncident } from './types'
import {
  ECOSYSTEM_META,
  mapGithubEcosystem
} from '../../shared/constants/ecosystems'
import {
  extractPackageFromTitle,
  inferSeverity,
  inferThreatType,
  severityToRiskScore
} from '../utils/infer-threat'

const GITHUB_API = 'https://api.github.com/advisories'

interface GithubAdvisory {
  ghsa_id: string
  html_url: string
  summary: string
  description: string | null
  severity: string
  published_at: string
  updated_at: string
  withdrawn_at: string | null
  vulnerabilities: {
    package: { ecosystem: string; name: string }
  }[]
}

function advisoryToIncident(advisory: GithubAdvisory): FetcherIncident | null {
  if (advisory.withdrawn_at) return null

  const vuln = advisory.vulnerabilities[0]
  if (!vuln) return null

  const ecosystem = mapGithubEcosystem(vuln.package.ecosystem)
  if (!ecosystem) return null

  const packageName =
    vuln.package.name ??
    extractPackageFromTitle(advisory.summary) ??
    'unknown'

  const text = `${advisory.summary} ${advisory.description ?? ''}`
  const riskScore = severityToRiskScore(advisory.severity)
  const threatType = inferThreatType(text)

  return {
    externalId: advisory.ghsa_id,
    packageName,
    ecosystem,
    title: advisory.summary,
    description: (advisory.description ?? '').slice(0, 4000),
    severity: inferSeverity(advisory.severity, riskScore),
    riskScore,
    threatType,
    publishedAt: advisory.published_at,
    source: 'github',
    sourceUrl: advisory.html_url,
    indicators: [
      {
        indicatorType: 'ghsa',
        value: advisory.ghsa_id,
        confidence: 95
      }
    ]
  }
}

async function fetchPage(
  url: string,
  token?: string
): Promise<{ advisories: GithubAdvisory[]; nextUrl: string | null }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(30_000)
  })

  if (!res.ok) {
    if (res.status === 403 || res.status === 422) {
      return { advisories: [], nextUrl: null }
    }
    throw new Error(`GitHub advisories failed (${res.status})`)
  }

  const link = res.headers.get('link')
  let nextUrl: string | null = null
  if (link) {
    const match = link.match(/<([^>]+)>;\s*rel="next"/)
    nextUrl = match?.[1] ?? null
  }

  return {
    advisories: (await res.json()) as GithubAdvisory[],
    nextUrl
  }
}

/** GitHub accepts one advisory ecosystem slug per query (e.g. pip, not pypi). */
const GITHUB_MALWARE_ECOSYSTEMS = ECOSYSTEM_META.map((meta) => meta.githubNames[0])

export async function fetchGithubAdvisories(): Promise<FetcherIncident[]> {
  const token = process.env.GITHUB_TOKEN
  const publishedAfter = Date.now() - 30 * 24 * 60 * 60 * 1000

  const results: FetcherIncident[] = []
  const seen = new Set<string>()
  const maxPagesPerEcosystem = 1

  for (const ecosystem of GITHUB_MALWARE_ECOSYSTEMS) {
    let url: string | null =
      `${GITHUB_API}?type=malware&per_page=100&ecosystem=${encodeURIComponent(ecosystem)}`
    let pages = 0

    while (url && pages < maxPagesPerEcosystem) {
      const { advisories, nextUrl } = await fetchPage(url, token)
      let stopPagination = false

      for (const advisory of advisories) {
        const publishedAt = new Date(advisory.published_at).getTime()
        if (publishedAt < publishedAfter) {
          stopPagination = true
          continue
        }

        const incident = advisoryToIncident(advisory)
        if (!incident || seen.has(incident.externalId)) continue
        seen.add(incident.externalId)
        results.push(incident)
      }

      if (stopPagination) break
      url = nextUrl
      pages++
    }
  }

  return results
}
