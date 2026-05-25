import { describe, expect, it } from 'vitest'
import {
  absoluteSiteUrl,
  incidentMetaDescription,
  packageMetaDescription
} from './seo'

describe('absoluteSiteUrl', () => {
  it('builds absolute URLs from site base', () => {
    expect(absoluteSiteUrl('/incident/abc', 'https://threatpkg.example')).toBe(
      'https://threatpkg.example/incident/abc'
    )
  })
})

describe('incidentMetaDescription', () => {
  it('includes severity, package, and ecosystem context', () => {
    const description = incidentMetaDescription({
      title: 'Malware in evil-pkg',
      packageName: 'evil-pkg',
      ecosystem: 'npm',
      severity: 'critical',
      threatType: 'malware',
      description: 'Credential theft via postinstall script.',
      source: 'osv'
    })
    expect(description).toContain('evil-pkg')
    expect(description).toContain('NPM')
    expect(description.length).toBeLessThanOrEqual(160)
  })
})

describe('packageMetaDescription', () => {
  it('summarizes reputation metrics', () => {
    const description = packageMetaDescription({
      packageName: 'lodash',
      ecosystem: 'pypi',
      incidentCount: 2,
      riskScore: 72
    })
    expect(description).toContain('lodash')
    expect(description).toContain('PYPI')
    expect(description).toContain('2')
  })
})
