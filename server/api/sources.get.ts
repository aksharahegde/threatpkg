import { freshestSyncAt, getSourcesStatus } from '../utils/sources-status'

export default defineEventHandler(async () => {
  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL not configured'
    })
  }

  const sources = await getSourcesStatus()
  const lastSyncedAt = freshestSyncAt(sources)
  return {
    sources,
    lastSyncedAt: lastSyncedAt?.toISOString() ?? null
  }
})
