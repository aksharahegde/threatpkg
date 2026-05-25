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
  })
})
