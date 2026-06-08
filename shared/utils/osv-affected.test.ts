import { describe, expect, it } from 'vitest'
import {
  indicatorsFromOsvAffected,
  isInstalledVersionAffectedByOsv,
  isOsvMalwareRecord
} from './osv-affected'

describe('indicatorsFromOsvAffected', () => {
  it('stores explicit OSV version strings as exact pins', () => {
    expect(
      indicatorsFromOsvAffected([
        {
          package: { name: 'evil-pkg', ecosystem: 'npm' },
          versions: ['99.0.0']
        }
      ])
    ).toEqual([{ indicatorType: 'affected_version', value: '=99.0.0' }])
  })

  it('does not treat version strings as range objects', () => {
    const indicators = indicatorsFromOsvAffected([
      { versions: ['1.2.3'] }
    ])
    expect(indicators.some((i) => i.value.includes('native code'))).toBe(false)
  })

  it('parses range events', () => {
    expect(
      indicatorsFromOsvAffected([
        {
          ranges: [
            {
              events: [{ introduced: '1.0.0' }, { fixed: '2.0.0' }]
            }
          ]
        }
      ])
    ).toEqual([
      { indicatorType: 'affected_version', value: '>=1.0.0' },
      { indicatorType: 'affected_version', value: '<2.0.0' }
    ])
  })
})

describe('isInstalledVersionAffectedByOsv', () => {
  const vuln = {
    id: 'MAL-2024-1',
    summary: 'Malicious code in evil-pkg',
    database_specific: { 'malicious-packages-origins': [{}] },
    affected: [{ package: { name: 'evil-pkg', ecosystem: 'npm' }, versions: ['99.0.0'] }]
  }

  it('flags exact malicious version', () => {
    expect(isOsvMalwareRecord(vuln)).toBe(true)
    expect(isInstalledVersionAffectedByOsv('npm', '99.0.0', vuln)).toBe(true)
    expect(isInstalledVersionAffectedByOsv('npm', '1.0.0', vuln)).toBe(false)
  })
})
