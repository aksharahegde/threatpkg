import { describe, expect, it } from 'vitest'
import {
  SCAN_MAX_FILE_BYTES,
  SCAN_MAX_FILES,
  validateScanFiles
} from './scan-request'

describe('validateScanFiles', () => {
  it('requires at least one file', () => {
    expect(() => validateScanFiles([])).toThrow('At least one file')
  })

  it('rejects too many files', () => {
    const files = Array.from({ length: SCAN_MAX_FILES + 1 }, (_, i) => ({
      filename: `f${i}.txt`,
      content: 'x'
    }))
    expect(() => validateScanFiles(files)).toThrow(`Maximum ${SCAN_MAX_FILES}`)
  })

  it('rejects oversized file', () => {
    expect(() =>
      validateScanFiles([
        {
          filename: 'big.txt',
          content: 'x'.repeat(SCAN_MAX_FILE_BYTES + 1)
        }
      ])
    ).toThrow('exceeds')
  })

  it('accepts valid payload', () => {
    expect(() =>
      validateScanFiles([{ filename: 'requirements.txt', content: 'requests==1.0.0' }])
    ).not.toThrow()
  })
})
