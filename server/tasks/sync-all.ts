import { fetchGithubAdvisories } from '../fetchers/github'
import { fetchOsvIncidents } from '../fetchers/osv'
import { fetchRssFeeds } from '../fetchers/rss'
import { dedupeIncidents } from '../utils/dedupe'
import {
  persistIncidents,
  removeUnsyncedIncidents,
  touchSourceSync
} from '../utils/sync'

export default defineTask({
  meta: {
    name: 'sync-all',
    description: 'Sync all threat intelligence sources'
  },
  async run() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set')
    }

    const [osv, github, rss] = await Promise.all([
      fetchOsvIncidents(),
      fetchGithubAdvisories(),
      fetchRssFeeds()
    ])

    const merged = dedupeIncidents([...osv, ...github, ...rss])
    const removed = await removeUnsyncedIncidents()
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
      result: {
        fetched: { osv: osv.length, github: github.length, rss: rss.length },
        removedLegacy: removed,
        ...result
      }
    }
  }
})
