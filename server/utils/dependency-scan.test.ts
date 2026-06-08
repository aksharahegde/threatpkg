import { describe, expect, it } from 'vitest'
import {
  isVersionAffected,
  rangesFromIndicators
} from '#shared/utils/version-match'

describe('dependency scan evaluation logic', () => {
  it('detects compromised npm version in range', () => {
    const ranges = rangesFromIndicators([
      { indicatorType: 'affected_version', value: '>=1.0.0' },
      { indicatorType: 'affected_version', value: '<2.0.0' }
    ])
    expect(ranges).not.toBe('wildcard')
    if (ranges !== 'wildcard') {
      expect(isVersionAffected('npm', '1.5.0', ranges)).toBe(true)
      expect(isVersionAffected('npm', '2.0.0', ranges)).toBe(false)
    }
  })

  it('flags wildcard incidents as affected at any version', () => {
    expect(isVersionAffected('npm', '0.0.1', 'wildcard')).toBe(true)
  })
})
