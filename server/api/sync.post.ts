import { fetchGithubAdvisories } from '../fetchers/github'
import { fetchOsvIncidents } from '../fetchers/osv'
import { fetchRssFeeds } from '../fetchers/rss'
import { dedupeIncidents } from '../utils/dedupe'
import {
  persistIncidents,
  removeUnsyncedIncidents,
  touchSourceSync
} from '../utils/sync'

export default defineEventHandler(async (event) => {
  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL not configured'
    })
  }

  const secret = process.env.SYNC_SECRET
  if (secret) {
    const provided =
      getHeader(event, 'x-sync-secret') ??
      getQuery(event).secret
    if (provided !== secret) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
  }

  const [osv, github, rss] = await Promise.all([
    fetchOsvIncidents(),
    fetchGithubAdvisories(),
    fetchRssFeeds()
  ])

  const merged = dedupeIncidents([...osv, ...github, ...rss])
  const removedLegacy = await removeUnsyncedIncidents()
  const result = await persistIncidents(merged)

  await Promise.all([
    touchSourceSync('OSV'),
    touchSourceSync('GitHub Advisories'),
    touchSourceSync('Snyk'),
    touchSourceSync('Socket'),
    touchSourceSync('Phylum'),
    touchSourceSync('JFrog Research')
  ])

  return {
    ok: true,
    fetched: { osv: osv.length, github: github.length, rss: rss.length },
    removedLegacy,
    ...result
  }
})
