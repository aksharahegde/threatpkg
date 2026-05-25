import { fetchGithubAdvisories } from '../fetchers/github'
import { fetchOsvIncidents } from '../fetchers/osv'
import { fetchRssFeeds } from '../fetchers/rss'
import { closeDb } from '../db/index'
import {
  persistIncidents,
  removeUnsyncedIncidents,
  touchSourceSync
} from '../utils/sync'
import { dedupeIncidents } from '../utils/dedupe'

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }

  console.log('[sync] Fetching from OSV, GitHub, RSS...')
  const [osv, github, rss] = await Promise.all([
    fetchOsvIncidents(),
    fetchGithubAdvisories(),
    fetchRssFeeds()
  ])

  console.log(`[sync] Fetched osv=${osv.length} github=${github.length} rss=${rss.length}`)

  const merged = dedupeIncidents([...osv, ...github, ...rss])
  const removed = await removeUnsyncedIncidents()
  console.log(`[sync] Removed ${removed} legacy rows without external_id`)

  const result = await persistIncidents(merged)
  console.log(
    `[sync] Persisted inserted=${result.inserted} updated=${result.updated} skipped=${result.skipped}`
  )

  await Promise.all([
    touchSourceSync('OSV'),
    touchSourceSync('GitHub Advisories'),
    touchSourceSync('Snyk'),
    touchSourceSync('Phylum'),
    touchSourceSync('JFrog Blog')
  ])

  await closeDb()
  console.log('[sync] Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
