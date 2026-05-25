import { describe, expect, it } from 'vitest'
import { affectedVersionsFromIndicators } from './incident-detail'

describe('affectedVersionsFromIndicators', () => {
  it('returns version indicators when present', () => {
    expect(
      affectedVersionsFromIndicators([
        { indicatorType: 'affected_version', value: '>=1.0.0' },
        { indicatorType: 'affected_version', value: '<2.0.0' }
      ])
    ).toEqual(['>=1.0.0', '<2.0.0'])
  })

  it('falls back to alias ids', () => {
    expect(
      affectedVersionsFromIndicators([
        { indicatorType: 'alias', value: 'CVE-2024-1, GHSA-xxxx' }
      ])
    ).toEqual(['CVE-2024-1', 'GHSA-xxxx'])
  })

  it('defaults to wildcard when empty', () => {
    expect(affectedVersionsFromIndicators([])).toEqual(['*'])
  })
})
