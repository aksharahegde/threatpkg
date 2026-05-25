import type { H3Event } from 'h3'

const WINDOW_MS = 60_000
const MAX_API_REQUESTS = 120

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function clientKey(event: H3Event): string {
  return (
    getRequestIP(event, { xForwardedFor: true }) ??
    getHeader(event, 'x-real-ip') ??
    'unknown'
  )
}

function takeToken(key: string, max: number): boolean {
  const now = Date.now()
  let bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(key, bucket)
  }

  bucket.count += 1

  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k)
    }
  }

  return bucket.count <= max
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return

  const key = `${clientKey(event)}:${event.method}`
  if (!takeToken(key, MAX_API_REQUESTS)) {
    setResponseHeader(event, 'Retry-After', Math.ceil(WINDOW_MS / 1000))
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests'
    })
  }
})
