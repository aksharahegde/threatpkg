import type { H3Event } from 'h3'

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set. */
export function assertCronAuthorized(event: H3Event): void {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const syncSecret = process.env.SYNC_SECRET?.trim()
  const auth = getHeader(event, 'authorization')?.trim()
  const headerSecret = getHeader(event, 'x-sync-secret')?.trim()

  if (cronSecret && auth === `Bearer ${cronSecret}`) return
  if (syncSecret && (auth === `Bearer ${syncSecret}` || headerSecret === syncSecret)) return

  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}

export function assertManualSyncAuthorized(event: H3Event): void {
  const secret = process.env.SYNC_SECRET?.trim()
  if (!secret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Manual sync is disabled (set SYNC_SECRET to enable)'
    })
  }

  const provided = getHeader(event, 'x-sync-secret')
  if (provided !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}
