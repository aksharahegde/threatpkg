import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchGithubAdvisories } from './github'

const ADVISORY = {
  ghsa_id: 'GHSA-xxxx-yyyy-zzzz',
  html_url: 'https://github.com/advisories/GHSA-xxxx-yyyy-zzzz',
  summary: 'Malware in test-malware-pkg',
  description: 'Credential theft via install script.',
  severity: 'high',
  published_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  withdrawn_at: null,
  vulnerabilities: [
    { package: { ecosystem: 'npm', name: 'test-malware-pkg' } }
  ]
}

describe('fetchGithubAdvisories', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json([ADVISORY], {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps malware advisories to fetcher incidents', async () => {
    const incidents = await fetchGithubAdvisories()
    expect(incidents).toHaveLength(1)
    expect(incidents[0]).toMatchObject({
      externalId: 'GHSA-xxxx-yyyy-zzzz',
      packageName: 'test-malware-pkg',
      ecosystem: 'npm',
      source: 'github',
      sourceUrl: ADVISORY.html_url
    })
    expect(incidents[0]?.indicators?.[0]?.indicatorType).toBe('ghsa')
  })

  it('skips withdrawn advisories', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          [{ ...ADVISORY, withdrawn_at: new Date().toISOString() }],
          { status: 200 }
        )
      )
    )
    const incidents = await fetchGithubAdvisories()
    expect(incidents).toHaveLength(0)
  })
})
