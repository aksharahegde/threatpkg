import { describe, expect, it } from 'vitest'
import { severityFromScore } from './threat'

describe('severityFromScore', () => {
  it('maps score bands to severity labels', () => {
    expect(severityFromScore(80)).toBe('critical')
    expect(severityFromScore(100)).toBe('critical')
    expect(severityFromScore(60)).toBe('high')
    expect(severityFromScore(79)).toBe('high')
    expect(severityFromScore(40)).toBe('medium')
    expect(severityFromScore(59)).toBe('medium')
    expect(severityFromScore(0)).toBe('low')
    expect(severityFromScore(39)).toBe('low')
  })
})
