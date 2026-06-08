import { describe, expect, it } from 'vitest'
import {
  extractIncidentSourceDigests,
  isDisplayableAffectedVersion,
  shouldCollapseIndicatorValue
} from './incident-description'

describe('extractIncidentSourceDigests', () => {
  it('extracts source digest and removes it from body', () => {
    const raw = `Summary paragraph.

---
_-= Per source details. Do not edit below this line.=-_

## Source: ghsa-malware (61f696f0e2dd839f3a95ac5bfd9e38dd4b3910253ae2d56e79fe088a08519db1)
More details here.`

    const { body, sources } = extractIncidentSourceDigests(raw)
    expect(sources).toEqual([
      {
        label: 'ghsa-malware',
        digest: '61f696f0e2dd839f3a95ac5bfd9e38dd4b3910253ae2d56e79fe088a08519db1'
      }
    ])
    expect(body).toContain('Summary paragraph.')
    expect(body).toContain('More details here.')
    expect(body).not.toContain('61f696f0')
  })
})

describe('isDisplayableAffectedVersion', () => {
  it('rejects bogus and advisory id strings', () => {
    expect(isDisplayableAffectedVersion('>=1.0.0')).toBe(true)
    expect(isDisplayableAffectedVersion('<function fixed() { [native code] }>')).toBe(false)
    expect(isDisplayableAffectedVersion('CVE-2025-1')).toBe(false)
  })
})

describe('shouldCollapseIndicatorValue', () => {
  it('flags long values and hex digests', () => {
    expect(shouldCollapseIndicatorValue('short')).toBe(false)
    expect(shouldCollapseIndicatorValue('a'.repeat(60))).toBe(true)
    expect(shouldCollapseIndicatorValue('a'.repeat(64))).toBe(true)
  })
})
