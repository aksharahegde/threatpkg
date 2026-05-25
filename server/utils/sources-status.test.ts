import { describe, expect, it } from 'vitest'
import { freshestSyncAt } from './sources-status'

describe('freshestSyncAt', () => {
  it('returns the newest sync timestamp', () => {
    const result = freshestSyncAt([
      {
        name: 'A',
        type: 'api',
        url: 'https://a',
        enabled: true,
        lastSyncedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        name: 'B',
        type: 'rss',
        url: 'https://b',
        enabled: true,
        lastSyncedAt: '2024-06-01T12:00:00.000Z'
      }
    ])
    expect(result?.toISOString()).toBe('2024-06-01T12:00:00.000Z')
  })

  it('returns null when no sync times exist', () => {
    expect(
      freshestSyncAt([
        {
          name: 'A',
          type: 'api',
          url: 'https://a',
          enabled: true,
          lastSyncedAt: null
        }
      ])
    ).toBeNull()
  })
})
