import type { H3Event } from 'h3'
import type { DependencyFileInput } from '#shared/types/scan'
import { scanDependencyFiles } from '../utils/dependency-scan'
import { validateScanFiles } from '../utils/scan-request'
const SCAN_RATE_WINDOW_MS = 60_000
const SCAN_MAX_PER_WINDOW = 10

type ScanBucket = { count: number; resetAt: number }
const scanBuckets = new Map<string, ScanBucket>()

function scanRateLimit(event: H3Event): void {
  const ip =
    getRequestIP(event, { xForwardedFor: true }) ??
    getHeader(event, 'x-real-ip') ??
    'unknown'
  const key = `scan:${ip}`
  const now = Date.now()
  let bucket = scanBuckets.get(key)
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + SCAN_RATE_WINDOW_MS }
    scanBuckets.set(key, bucket)
  }
  bucket.count += 1
  if (bucket.count > SCAN_MAX_PER_WINDOW) {
    setResponseHeader(event, 'Retry-After', Math.ceil(SCAN_RATE_WINDOW_MS / 1000))
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many scan requests'
    })
  }
}

export default defineEventHandler(async (event) => {
  scanRateLimit(event)

  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL not configured'
    })
  }

  const body = await readBody<{ files?: DependencyFileInput[] }>(event)
  const files = body?.files ?? []

  try {
    validateScanFiles(files)
  } catch (e) {
    throw createError({
      statusCode: 400,
      statusMessage: e instanceof Error ? e.message : 'Invalid scan request'
    })
  }

  return scanDependencyFiles(files)
})
