import { describe, expect, it } from 'vitest'
import {
  inferEcosystemFromText,
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

describe('inferEcosystemFromText', () => {
  it('detects ecosystem from article text', () => {
    expect(inferEcosystemFromText('Malware in foo — npm supply chain')).toBe('npm')
    expect(inferEcosystemFromText('PyPI typosquat campaign')).toBe('pypi')
    expect(inferEcosystemFromText('crates.io malicious crate')).toBe('crates')
    expect(inferEcosystemFromText('Laravel Lang packages compromised')).toBe('packagist')
    expect(inferEcosystemFromText('Flutter pub.dev dependency attack')).toBe('pub')
    expect(inferEcosystemFromText('Unrelated product launch')).toBeNull()
  })
})

describe('remediationCommands', () => {
  it('returns ecosystem-specific remediation hints', () => {
    expect(remediationCommands('pypi', 'evil')[0]).toContain('pip uninstall')
    expect(remediationCommands('go', 'evil')[0]).toContain('go.mod')
    expect(remediationCommands('npm', 'evil')[0]).toContain('npm uninstall')
  })
})
