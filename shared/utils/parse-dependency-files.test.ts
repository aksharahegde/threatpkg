import { describe, expect, it } from 'vitest'
import {
  mergeDependencySets,
  parseBunLock,
  parsePnpmLock,
  parsePackageJson,
  parsePackageLock,
  parsePoetryLock,
  parseRequirementsTxt,
  parseYarnLock
} from './parse-dependency-files'

describe('parsePackageLock', () => {
  it('parses lockfile v2/v3 packages', () => {
    const content = JSON.stringify({
      name: 'root',
      packages: {
        '': { name: 'root', version: '1.0.0' },
        'node_modules/lodash': { name: 'lodash', version: '4.17.21' },
        'node_modules/evil-pkg': { version: '2.0.0' }
      }
    })
    const { dependencies } = parsePackageLock(content)
    expect(dependencies).toContainEqual({
      packageName: 'lodash',
      version: '4.17.21',
      ecosystem: 'npm'
    })
    expect(dependencies.some((d) => d.packageName === 'evil-pkg')).toBe(true)
  })

  it('parses lockfile v1 nested dependencies', () => {
    const content = JSON.stringify({
      dependencies: {
        leftpad: { version: '1.0.0', dependencies: { chalk: { version: '2.4.2' } } }
      }
    })
    const { dependencies } = parsePackageLock(content)
    expect(dependencies).toContainEqual({
      packageName: 'leftpad',
      version: '1.0.0',
      ecosystem: 'npm'
    })
    expect(dependencies).toContainEqual({
      packageName: 'chalk',
      version: '2.4.2',
      ecosystem: 'npm'
    })
  })
})

describe('parsePackageJson', () => {
  it('accepts exact versions and warns on ranges', () => {
    const content = JSON.stringify({
      dependencies: { pinned: '1.2.3', ranged: '^1.0.0' },
      devDependencies: { exact: '0.0.1' }
    })
    const { dependencies, warnings } = parsePackageJson(content)
    expect(dependencies).toEqual([
      { packageName: 'pinned', version: '1.2.3', ecosystem: 'npm' },
      { packageName: 'exact', version: '0.0.1', ecosystem: 'npm' }
    ])
    expect(warnings.some((w) => w.includes('ranged'))).toBe(true)
  })
})

describe('parsePoetryLock', () => {
  it('parses [[package]] blocks', () => {
    const content = `
[[package]]
name = "requests"
version = "2.31.0"

[[package]]
name = "urllib3"
version = "2.0.7"
`
    const { dependencies } = parsePoetryLock(content)
    expect(dependencies).toEqual([
      { packageName: 'requests', version: '2.31.0', ecosystem: 'pypi' },
      { packageName: 'urllib3', version: '2.0.7', ecosystem: 'pypi' }
    ])
  })
})

describe('parseRequirementsTxt', () => {
  it('parses pinned requirements and warns on unpinned', () => {
    const content = `
requests==2.31.0
django===4.2.0
flask  # unpinned
-r other.txt
`
    const { dependencies, warnings } = parseRequirementsTxt(content)
    expect(dependencies).toEqual([
      { packageName: 'requests', version: '2.31.0', ecosystem: 'pypi' },
      { packageName: 'django', version: '4.2.0', ecosystem: 'pypi' }
    ])
    expect(warnings.some((w) => w.includes('flask'))).toBe(true)
    expect(warnings.some((w) => w.includes('-r'))).toBe(true)
  })
})

describe('parseYarnLock', () => {
  it('parses classic yarn v1 lockfile blocks', () => {
    const content = `
lodash@^4.17.21:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"

"@scope/pkg@^1.0.0":
  version "1.2.3"
`
    const { dependencies } = parseYarnLock(content)
    expect(dependencies).toContainEqual({
      packageName: 'lodash',
      version: '4.17.21',
      ecosystem: 'npm'
    })
    expect(dependencies).toContainEqual({
      packageName: '@scope/pkg',
      version: '1.2.3',
      ecosystem: 'npm'
    })
  })

  it('parses yarn berry version lines', () => {
    const content = `
"lodash@npm:4.17.21":
  version: 4.17.21
  resolution: "lodash@npm:4.17.21"
`
    const { dependencies } = parseYarnLock(content)
    expect(dependencies).toContainEqual({
      packageName: 'lodash',
      version: '4.17.21',
      ecosystem: 'npm'
    })
  })
})

describe('parsePnpmLock', () => {
  it('parses pnpm v6 packages with leading slash', () => {
    const content = `
lockfileVersion: '6.0'

importers:
  .:
    dependencies:
      lodash:
        specifier: ^4.17.21
        version: 4.17.21

packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512-abc}
    engines: {node: '>=0.10.0'}
  /@scope/pkg@1.2.3:
    resolution: {integrity: sha512-def}
`
    const { dependencies } = parsePnpmLock(content)
    expect(dependencies).toContainEqual({
      packageName: 'lodash',
      version: '4.17.21',
      ecosystem: 'npm'
    })
    expect(dependencies).toContainEqual({
      packageName: '@scope/pkg',
      version: '1.2.3',
      ecosystem: 'npm'
    })
  })

  it('parses pnpm v9 packages without leading slash', () => {
    const content = `
lockfileVersion: '9.0'

packages:
  chalk@5.3.0:
    resolution: {integrity: sha512-ghi}
  "@types/node@18.19.0":
    resolution: {integrity: sha512-jkl}
`
    const { dependencies } = parsePnpmLock(content)
    expect(dependencies).toContainEqual({
      packageName: 'chalk',
      version: '5.3.0',
      ecosystem: 'npm'
    })
    expect(dependencies).toContainEqual({
      packageName: '@types/node',
      version: '18.19.0',
      ecosystem: 'npm'
    })
  })

  it('strips peer dependency suffix from package keys', () => {
    const content = `
packages:
  /foo@1.0.0(bar@2.0.0):
    resolution: {integrity: sha512-mno}
`
    const { dependencies } = parsePnpmLock(content)
    expect(dependencies).toEqual([
      { packageName: 'foo', version: '1.0.0', ecosystem: 'npm' }
    ])
  })
})

describe('parseBunLock', () => {
  it('parses bun.lock packages map', () => {
    const content = JSON.stringify({
      lockfileVersion: 1,
      packages: {
        semver: ['semver@7.8.2', '', {}, 'sha512-abc'],
        '@babel/core': [
          '@babel/core@7.29.7',
          '',
          { dependencies: { semver: '^6.3.1' } },
          'sha512-def'
        ]
      }
    })
    const { dependencies } = parseBunLock(content)
    expect(dependencies).toContainEqual({
      packageName: 'semver',
      version: '7.8.2',
      ecosystem: 'npm'
    })
    expect(dependencies).toContainEqual({
      packageName: '@babel/core',
      version: '7.29.7',
      ecosystem: 'npm'
    })
  })
})

describe('mergeDependencySets', () => {
  it('prefers lock file versions over manifest', () => {
    const result = mergeDependencySets([
      {
        filename: 'package.json',
        content: JSON.stringify({ dependencies: { lodash: '4.17.20' } })
      },
      {
        filename: 'package-lock.json',
        content: JSON.stringify({
          packages: {
            'node_modules/lodash': { name: 'lodash', version: '4.17.21' }
          }
        })
      }
    ])
    expect(result.dependencies).toEqual([
      { packageName: 'lodash', version: '4.17.21', ecosystem: 'npm' }
    ])
  })

  it('prefers pnpm-lock.yaml over package.json', () => {
    const result = mergeDependencySets([
      {
        filename: 'package.json',
        content: JSON.stringify({ dependencies: { leftpad: '1.0.0' } })
      },
      {
        filename: 'pnpm-lock.yaml',
        content: `
packages:
  /leftpad@1.0.1:
    resolution: {integrity: sha512-abc}
`
      }
    ])
    expect(result.dependencies).toEqual([
      { packageName: 'leftpad', version: '1.0.1', ecosystem: 'npm' }
    ])
  })

  it('keeps multiple versions of the same package across lockfiles', () => {
    const result = mergeDependencySets([
      {
        filename: 'a/yarn.lock',
        content: `lodash@^4.17.20:\n  version "4.17.20"\n`
      },
      {
        filename: 'b/yarn.lock',
        content: `lodash@^4.17.21:\n  version "4.17.21"\n`
      }
    ])
    expect(result.dependencies).toEqual(
      expect.arrayContaining([
        { packageName: 'lodash', version: '4.17.20', ecosystem: 'npm' },
        { packageName: 'lodash', version: '4.17.21', ecosystem: 'npm' }
      ])
    )
    expect(result.dependencies).toHaveLength(2)
  })

  it('prefers yarn.lock over package.json', () => {
    const result = mergeDependencySets([
      {
        filename: 'package.json',
        content: JSON.stringify({ dependencies: { chalk: '5.0.0' } })
      },
      {
        filename: 'yarn.lock',
        content: `chalk@^5.0.0:\n  version "5.3.0"\n`
      }
    ])
    expect(result.dependencies).toEqual([
      { packageName: 'chalk', version: '5.3.0', ecosystem: 'npm' }
    ])
  })
})
