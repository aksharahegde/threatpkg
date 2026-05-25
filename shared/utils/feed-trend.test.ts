import { describe, expect, it } from 'vitest'
import { fillTrendBuckets, trendBucketCount } from './feed-trend'

describe('trendBucketCount', () => {
  it('returns 24, 7, or 30 buckets by range', () => {
    expect(trendBucketCount('24h')).toBe(24)
    expect(trendBucketCount('7d')).toBe(7)
    expect(trendBucketCount('30d')).toBe(30)
    expect(trendBucketCount(undefined)).toBe(7)
  })
})

describe('fillTrendBuckets', () => {
  const now = new Date('2026-05-25T15:00:00.000Z')

  it('places daily counts in chronological order for 7d', () => {
    const counts = fillTrendBuckets(
      '7d',
      [
        { bucket: new Date('2026-05-23T10:00:00.000Z'), count: 3 },
        { bucket: new Date('2026-05-25T08:00:00.000Z'), count: 5 }
      ],
      now
    )
    expect(counts).toHaveLength(7)
    expect(counts[4]).toBe(3)
    expect(counts[6]).toBe(5)
  })

  it('places hourly counts for 24h', () => {
    const counts = fillTrendBuckets(
      '24h',
      [
        { bucket: new Date('2026-05-25T13:00:00.000Z'), count: 2 },
        { bucket: new Date('2026-05-25T14:00:00.000Z'), count: 4 }
      ],
      now
    )
    expect(counts).toHaveLength(24)
    expect(counts[21]).toBe(2)
    expect(counts[22]).toBe(4)
  })
})
