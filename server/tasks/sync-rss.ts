import { fetchRssFeeds } from '../fetchers/rss'
import { persistIncidents, touchSourceSync } from '../utils/sync'

export default defineTask({
  meta: {
    name: 'sync-rss',
    description: 'Sync threat signals from security RSS feeds'
  },
  async run() {
    const items = await fetchRssFeeds()
    const result = await persistIncidents(items)
    await Promise.all([
      touchSourceSync('Snyk'),
      touchSourceSync('Socket'),
      touchSourceSync('Phylum'),
      touchSourceSync('JFrog Research')
    ])
    return { result: { source: 'rss', fetched: items.length, ...result } }
  }
})
