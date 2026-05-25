import { describe, expect, it } from 'vitest'
import {
  normalizeEcosystem,
  normalizeIncident,
  normalizeSeverity,
  normalizeSource,
  normalizeThreatType
} from './normalize'

describe('normalizeEcosystem', () => {
  it('normalizes known ecosystems and aliases', () => {
    expect(normalizeEcosystem('pypi')).toBe('pypi')
    expect(normalizeEcosystem('Python')).toBe('pypi')
    expect(normalizeEcosystem('npm')).toBe('npm')
    expect(normalizeEcosystem('NuGet')).toBe('nuget')
    expect(normalizeEcosystem('crates.io')).toBe('crates')
    expect(normalizeEcosystem('Go')).toBe('go')
    expect(normalizeEcosystem('Maven')).toBe('maven')
    expect(normalizeEcosystem('RubyGems')).toBe('rubygems')
  })

  it('returns null for unknown ecosystems', () => {
    expect(normalizeEcosystem('debian')).toBeNull()
    expect(normalizeEcosystem('')).toBeNull()
  })
})

describe('normalizeSeverity', () => {
  it('accepts valid severity strings', () => {
    expect(normalizeSeverity('critical')).toBe('critical')
    expect(normalizeSeverity('low')).toBe('low')
  })

  it('falls back to score-derived severity', () => {
    expect(normalizeSeverity(undefined, 85)).toBe('critical')
    expect(normalizeSeverity('bogus', 25)).toBe('low')
  })
})

describe('normalizeThreatType', () => {
  it('coerces hyphenated values and defaults unknown to malware', () => {
    expect(normalizeThreatType('typosquatting')).toBe('typosquatting')
    expect(normalizeThreatType('crypto-miner')).toBe('crypto_miner')
    expect(normalizeThreatType('unknown-thing')).toBe('malware')
  })
})

describe('normalizeSource', () => {
  it('maps known sources and defaults unknown to osv', () => {
    expect(normalizeSource('GitHub')).toBe('github')
    expect(normalizeSource('custom-feed')).toBe('osv')
  })
})

describe('normalizeIncident', () => {
  it('produces a unified incident shape', () => {
    const publishedAt = new Date('2024-06-01T12:00:00Z')
    const result = normalizeIncident({
      packageName: '  evil-pkg  ',
      ecosystem: 'pypi',
      title: '  Malware alert  ',
      description: '  details  ',
      riskScore: 72,
      threatType: 'malware',
      publishedAt,
      source: 'github',
      sourceUrl: 'https://example.com/advisory'
    })

    expect(result).toMatchObject({
      packageName: 'evil-pkg',
      ecosystem: 'pypi',
      title: 'Malware alert',
      description: 'details',
      riskScore: 72,
      severity: 'high',
      threatType: 'malware',
      source: 'github',
      sourceUrl: 'https://example.com/advisory'
    })
    expect(result!.publishedAt).toEqual(publishedAt)
  })

  it('returns null for unknown ecosystems', () => {
    const result = normalizeIncident({
      packageName: 'pkg',
      ecosystem: 'debian',
      title: 't',
      publishedAt: '2024-01-15T00:00:00.000Z',
      source: 'osv'
    })
    expect(result).toBeNull()
  })

  it('parses ISO date strings', () => {
    const result = normalizeIncident({
      packageName: 'pkg',
      ecosystem: 'npm',
      title: 't',
      publishedAt: '2024-01-15T00:00:00.000Z',
      source: 'osv'
    })
    expect(result!.publishedAt.toISOString()).toBe('2024-01-15T00:00:00.000Z')
  })
})
