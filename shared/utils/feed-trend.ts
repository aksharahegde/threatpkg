export type TrendRange = '24h' | '7d' | '30d'

export function trendBucketCount(range: string | undefined): number {
  if (range === '24h') return 24
  if (range === '30d') return 30
  return 7
}

export function fillTrendBuckets(
  range: string | undefined,
  rows: { bucket: Date; count: number }[],
  now = new Date()
): number[] {
  const size = trendBucketCount(range)
  const buckets = Array.from({ length: size }, () => 0)

  for (const row of rows) {
    const t = row.bucket.getTime()
    if (Number.isNaN(t)) continue

    let index: number
    if (range === '24h') {
      const hoursAgo = Math.floor((now.getTime() - t) / 3_600_000)
      if (hoursAgo < 0 || hoursAgo >= 24) continue
      index = 23 - hoursAgo
    } else {
      const todayStart = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
      const bucketStart = Date.UTC(
        row.bucket.getUTCFullYear(),
        row.bucket.getUTCMonth(),
        row.bucket.getUTCDate()
      )
      const daysAgo = Math.round((todayStart - bucketStart) / 86_400_000)
      if (daysAgo < 0 || daysAgo >= size) continue
      index = size - 1 - daysAgo
    }

    buckets[index] += row.count
  }

  return buckets
}
