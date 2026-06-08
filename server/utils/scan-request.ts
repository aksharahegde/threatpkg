import type { DependencyFileInput } from '#shared/types/scan'

export const SCAN_MAX_FILES = 5
export const SCAN_MAX_FILE_BYTES = 2 * 1024 * 1024
export const SCAN_MAX_TOTAL_BYTES = 10 * 1024 * 1024

export function validateScanFiles(files: DependencyFileInput[]): void {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('At least one file is required')
  }
  if (files.length > SCAN_MAX_FILES) {
    throw new Error(`Maximum ${SCAN_MAX_FILES} files allowed`)
  }

  let totalBytes = 0
  for (const file of files) {
    if (!file?.filename || typeof file.content !== 'string') {
      throw new Error('Each file must have filename and content')
    }
    const bytes = new TextEncoder().encode(file.content).length
    if (bytes > SCAN_MAX_FILE_BYTES) {
      throw new Error(`File ${file.filename} exceeds ${SCAN_MAX_FILE_BYTES} byte limit`)
    }
    totalBytes += bytes
  }

  if (totalBytes > SCAN_MAX_TOTAL_BYTES) {
    throw new Error(`Total upload exceeds ${SCAN_MAX_TOTAL_BYTES} byte limit`)
  }
}
