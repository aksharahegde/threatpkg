import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mockFetch } from '../test/mock-fetch'
import { fetchOsvIncidents } from './osv'

const NOW = Date.now()
const RECENT_CSV = `${new Date(NOW - 60_000).toISOString()},MAL-2024-0001\n`
const MALWARE_VULN = {
  id: 'MAL-2024-0001',
  summary: 'Malicious code in evil-osv-pkg',
  details: 'Malware campaign targeting npm users.',
  published: new Date(NOW - 3_600_000).toISOString(),
  modified: new Date(NOW - 3_600_000).toISOString(),
  affected: [{ package: { name: 'evil-osv-pkg', ecosystem: 'npm' } }],
  references: [{ type: 'ADVISORY', url: 'https://osv.dev/vulnerability/MAL-2024-0001' }]
}

const BENIGN_VULN = {
  id: 'CVE-2024-9999',
  summary: 'Buffer overflow in benign-lib',
  published: new Date(NOW - 3_600_000).toISOString(),
  affected: [{ package: { name: 'benign-lib', ecosystem: 'npm' } }]
}

describe('fetchOsvIncidents', () => {
  let restoreFetch: () => void

  beforeEach(() => {
    restoreFetch = mockFetch(async (url: string) => {
      const u = String(url)
      if (u.endsWith('modified_id.csv')) {
        return new Response(RECENT_CSV, { status: 200 })
      }
      if (u.includes('/vulns/MAL-')) {
        return Response.json(MALWARE_VULN, { status: 200 })
      }
      if (u.includes('/vulns/CVE-')) {
        return Response.json(BENIGN_VULN, { status: 200 })
      }
      return new Response('not found', { status: 404 })
    })
  })

  afterEach(() => {
    restoreFetch()
  })

  it('ingests malware OSV records and skips non-malware CVEs', async () => {
    const incidents = await fetchOsvIncidents()
    expect(incidents).toHaveLength(1)
    expect(incidents[0]).toMatchObject({
      externalId: 'MAL-2024-0001',
      packageName: 'evil-osv-pkg',
      ecosystem: 'npm',
      source: 'osv',
      threatType: 'malware'
    })
  })
})
