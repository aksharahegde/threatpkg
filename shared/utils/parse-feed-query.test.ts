import { describe, expect, it } from 'vitest'
import {
  FEED_DEFAULT_LIMIT,
  FEED_MAX_LIMIT,
  parseFeedQuery
} from './parse-feed-query'

describe('parseFeedQuery', () => {
  it('applies defaults', () => {
    expect(parseFeedQuery({})).toEqual({
      ecosystem: undefined,
      severity: undefined,
      threatType: undefined,
      source: undefined,
      range: undefined,
      q: undefined,
      sort: 'published',
      cursor: undefined,
      limit: FEED_DEFAULT_LIMIT
    })
  })

  it('caps limit and rejects invalid limit', () => {
    expect(parseFeedQuery({ limit: '9999' }).limit).toBe(FEED_MAX_LIMIT)
    expect(parseFeedQuery({ limit: '-1' }).limit).toBe(FEED_DEFAULT_LIMIT)
    expect(parseFeedQuery({ limit: 'abc' }).limit).toBe(FEED_DEFAULT_LIMIT)
  })

  it('accepts valid enums and drops invalid ones', () => {
    const parsed = parseFeedQuery({
      ecosystem: 'npm',
      severity: 'critical',
      range: '7d',
      sort: 'risk',
      threatType: 'not_real',
      source: 'osv'
    })
    expect(parsed.ecosystem).toBe('npm')
    expect(parsed.severity).toBe('critical')
    expect(parsed.range).toBe('7d')
    expect(parsed.sort).toBe('risk')
    expect(parsed.source).toBe('osv')
    expect(parsed.threatType).toBeUndefined()
  })

  it('truncates search query', () => {
    const long = 'a'.repeat(300)
    expect(parseFeedQuery({ q: long }).q).toHaveLength(200)
  })
})
