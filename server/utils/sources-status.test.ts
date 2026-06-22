import { describe, expect, it } from 'vitest'
import { freshestSyncAt, serializeSourceStatus } from './sources-status'

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
        type: 'api',
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

describe('serializeSourceStatus', () => {
  const baseRow = {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'OSV',
    type: 'api',
    url: 'https://osv.dev/',
    enabled: true
  }

  it('serializes Date sync timestamps', () => {
    expect(
      serializeSourceStatus({
        ...baseRow,
        lastSyncedAt: new Date('2024-06-01T12:00:00.000Z')
      })
    ).toEqual({
      name: 'OSV',
      type: 'api',
      url: 'https://osv.dev/',
      enabled: true,
      lastSyncedAt: '2024-06-01T12:00:00.000Z'
    })
  })

  it('preserves string sync timestamps returned by the runtime', () => {
    expect(
      serializeSourceStatus({
        ...baseRow,
        lastSyncedAt: '2024-06-01T12:00:00.000Z'
      })
    ).toEqual({
      name: 'OSV',
      type: 'api',
      url: 'https://osv.dev/',
      enabled: true,
      lastSyncedAt: '2024-06-01T12:00:00.000Z'
    })
  })
})
