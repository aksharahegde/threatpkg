import { fetchGithubAdvisories } from '../fetchers/github'
import { fetchOsvIncidents } from '../fetchers/osv'
import { dedupeIncidents } from './dedupe'
import {
  persistIncidents,
  removeRetiredSourceIncidents,
  removeUnsyncedIncidents,
  touchSourceSync
} from './sync'

export type SyncAllResult = {
  fetched: { osv: number; github: number }
  removedRetired: number
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

  const [osv, github] = await Promise.all([
    fetchOsvIncidents(),
    fetchGithubAdvisories()
  ])

  const merged = dedupeIncidents([...osv, ...github])
  const removedRetired = await removeRetiredSourceIncidents()
  const removedLegacy = await removeUnsyncedIncidents()
  const result = await persistIncidents(merged)

  await Promise.all([
    touchSourceSync('OSV'),
    touchSourceSync('GitHub Advisories')
  ])

  return {
    fetched: { osv: osv.length, github: github.length },
    removedRetired,
    removedLegacy,
    ...result
  }
}
