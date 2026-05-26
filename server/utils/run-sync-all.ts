import { fetchGithubAdvisories } from '../fetchers/github'
import { fetchOsvIncidents } from '../fetchers/osv'
import { fetchRssFeeds } from '../fetchers/rss'
import { dedupeIncidents } from './dedupe'
import {
  persistIncidents,
  removeUnsyncedIncidents,
  touchSourceSync
} from './sync'

export type SyncAllResult = {
  fetched: { osv: number; github: number; rss: number }
  removedLegacy: number
  inserted: number
  updated: number
  skipped: number
}

export async function runSyncAll(): Promise<SyncAllResult> {
  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DATABASE_URL not configured'
    })
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
    touchSourceSync('Phylum'),
    touchSourceSync('JFrog Blog')
  ])

  return {
    fetched: { osv: osv.length, github: github.length, rss: rss.length },
    removedLegacy,
    ...result
  }
}
