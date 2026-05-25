import { describe, expect, it } from 'vitest'
import { escapeLikePattern } from './escape-like'

describe('escapeLikePattern', () => {
  it('escapes LIKE metacharacters', () => {
    expect(escapeLikePattern('100%_\\')).toBe('100\\%\\_\\\\')
  })
})
