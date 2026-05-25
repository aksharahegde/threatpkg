import { describe, expect, it } from 'vitest'
import { topThreatTypeFromCounts } from '#shared/utils/feed-summary'

describe('topThreatTypeFromCounts', () => {
  it('returns the threat type with the highest count', () => {
    expect(
      topThreatTypeFromCounts({
        malware: 12,
        typosquatting: 40,
        protestware: 3
      })
    ).toEqual({ type: 'typosquatting', count: 40 })
  })

  it('returns null when all counts are zero', () => {
    expect(topThreatTypeFromCounts({})).toBeNull()
    expect(topThreatTypeFromCounts({ malware: 0 })).toBeNull()
  })
})
