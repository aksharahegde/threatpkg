import { describe, expect, it } from 'vitest'
import {
  isVersionAffected,
  isVersionAffectedByIndicators,
  minFixedVersionFromRanges,
  parseVersionIndicators,
  rangesFromIndicators
} from './version-match'

describe('rangesFromIndicators', () => {
  it('pairs introduced and fixed constraints', () => {
    expect(
      rangesFromIndicators([
        { indicatorType: 'affected_version', value: '>=1.0.0' },
        { indicatorType: 'affected_version', value: '<2.0.0' }
      ])
    ).toEqual([{ introduced: '1.0.0', fixed: '2.0.0' }])
  })

  it('returns wildcard when no version indicators', () => {
    expect(
      rangesFromIndicators([{ indicatorType: 'ghsa', value: 'GHSA-xxxx' }])
    ).toBe('wildcard')
  })
})

describe('parseVersionIndicators', () => {
  it('ignores corrupted string.fixed indicators', () => {
    const data = parseVersionIndicators([
      { indicatorType: 'affected_version', value: '<function fixed() { [native code] }' }
    ])
    expect(data.wildcard).toBe(false)
    expect(data.ranges).toEqual([])
    expect(data.exactVersions).toEqual([])
  })

  it('matches exact version pins', () => {
    expect(
      isVersionAffectedByIndicators('npm', '99.0.0', [
        { indicatorType: 'affected_version', value: '=99.0.0' }
      ])
    ).toBe(true)
    expect(
      isVersionAffectedByIndicators('npm', '1.0.0', [
        { indicatorType: 'affected_version', value: '=99.0.0' }
      ])
    ).toBe(false)
  })
})

describe('isVersionAffected', () => {
  const ranges = [{ introduced: '1.0.0', fixed: '2.0.0' }]

  it('flags versions inside range', () => {
    expect(isVersionAffected('npm', '1.5.0', ranges)).toBe(true)
    expect(isVersionAffected('pypi', '1.5.0', ranges)).toBe(true)
  })

  it('clears versions at or above fixed', () => {
    expect(isVersionAffected('npm', '2.0.0', ranges)).toBe(false)
    expect(isVersionAffected('npm', '2.1.0', ranges)).toBe(false)
  })

  it('clears versions below introduced', () => {
    expect(isVersionAffected('npm', '0.9.0', ranges)).toBe(false)
  })

  it('treats wildcard as affected', () => {
    expect(isVersionAffected('npm', '9.9.9', 'wildcard')).toBe(true)
  })
})

describe('minFixedVersionFromRanges', () => {
  it('returns highest fixed version', () => {
    expect(
      minFixedVersionFromRanges('npm', [
        { introduced: '1.0.0', fixed: '1.5.0' },
        { introduced: '2.0.0', fixed: '2.3.0' }
      ])
    ).toBe('2.3.0')
  })

  it('returns null for wildcard', () => {
    expect(minFixedVersionFromRanges('npm', 'wildcard')).toBeNull()
  })
})
