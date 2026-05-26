import { describe, expect, it } from 'vitest'
import {
  mapGithubEcosystem,
  mapOsvEcosystem,
  remediationCommands
} from './ecosystems'

describe('mapOsvEcosystem', () => {
  it('maps OSV ecosystem strings to internal slugs', () => {
    expect(mapOsvEcosystem('PyPI')).toBe('pypi')
    expect(mapOsvEcosystem('crates.io')).toBe('crates')
    expect(mapOsvEcosystem('Go')).toBe('go')
    expect(mapOsvEcosystem('NuGet')).toBe('nuget')
    expect(mapOsvEcosystem('Packagist')).toBe('packagist')
    expect(mapOsvEcosystem('composer')).toBe('packagist')
    expect(mapOsvEcosystem('Pub')).toBe('pub')
  })
})

describe('mapGithubEcosystem', () => {
  it('maps GitHub ecosystem strings to internal slugs', () => {
    expect(mapGithubEcosystem('pip')).toBe('pypi')
    expect(mapGithubEcosystem('rust')).toBe('crates')
    expect(mapGithubEcosystem('go')).toBe('go')
    expect(mapGithubEcosystem('composer')).toBe('packagist')
    expect(mapGithubEcosystem('pub')).toBe('pub')
  })
})

describe('remediationCommands', () => {
  it('returns ecosystem-specific remediation hints', () => {
    expect(remediationCommands('pypi', 'evil')[0]).toContain('pip uninstall')
    expect(remediationCommands('go', 'evil')[0]).toContain('go.mod')
    expect(remediationCommands('npm', 'evil')[0]).toContain('npm uninstall')
  })
})
