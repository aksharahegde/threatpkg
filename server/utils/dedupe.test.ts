import { describe, expect, it } from 'vitest'
import { dedupeIncidents, dedupeKey, titleSimilarity } from './dedupe'

describe('dedupeKey', () => {
  it('keys incidents by ecosystem, package, and lowercase title', () => {
    expect(
      dedupeKey({
        ecosystem: 'npm',
        packageName: 'lodash',
        title: 'Malware in lodash'
      })
    ).toBe('npm:lodash:malware in lodash')
  })
})

describe('dedupeIncidents', () => {
  it('keeps first occurrence of duplicate titles', () => {
    const items = [
      { ecosystem: 'npm', packageName: 'a', title: 'Same Title' },
      { ecosystem: 'npm', packageName: 'a', title: 'same title' },
      { ecosystem: 'npm', packageName: 'b', title: 'Other' }
    ]
    const result = dedupeIncidents(items)
    expect(result).toHaveLength(2)
    expect(result[0]?.title).toBe('Same Title')
    expect(result[1]?.packageName).toBe('b')
  })
})

describe('titleSimilarity', () => {
  it('returns higher overlap for similar titles', () => {
    expect(
      titleSimilarity('Malware in lodash package', 'Malware in lodash release')
    ).toBeGreaterThan(0.5)
    expect(titleSimilarity('completely different', 'nothing alike')).toBeLessThan(
      0.2
    )
  })
})
