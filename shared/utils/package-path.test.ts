import { describe, expect, it } from 'vitest'
import { packagePagePath } from './package-path'

describe('packagePagePath', () => {
  it('builds ecosystem-scoped paths', () => {
    expect(packagePagePath('npm', '@scope/pkg')).toBe(
      '/package/npm/%40scope%2Fpkg'
    )
    expect(packagePagePath('pypi', 'requests-toolbelt')).toBe(
      '/package/pypi/requests-toolbelt'
    )
    expect(packagePagePath('go', 'github.com/foo/bar')).toBe(
      '/package/go/github.com%2Ffoo%2Fbar'
    )
    expect(packagePagePath('packagist', 'laravel-lang/lang')).toBe(
      '/package/packagist/laravel-lang%2Flang'
    )
    expect(packagePagePath('pub', 'firebase_core')).toBe('/package/pub/firebase_core')
  })
})
