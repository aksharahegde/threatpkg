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

  it('filters bogus version indicators', () => {
    expect(
      affectedVersionsFromIndicators([
        { indicatorType: 'affected_version', value: '<function fixed() { [native code] }' },
        { indicatorType: 'affected_version', value: '>=1.0.0' }
      ])
    ).toEqual(['>=1.0.0'])
  })

  it('does not use alias ids as affected versions', () => {
    expect(
      affectedVersionsFromIndicators([
        { indicatorType: 'alias', value: 'CVE-2024-1, GHSA-xxxx' }
      ])
    ).toEqual([])
  })

  it('returns empty when no version data', () => {
    expect(affectedVersionsFromIndicators([])).toEqual([])
  })
})
