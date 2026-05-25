import { fetchGithubAdvisories } from '../fetchers/github'
import { persistIncidents, touchSourceSync } from '../utils/sync'

export default defineTask({
  meta: {
    name: 'sync-github',
    description: 'Sync malware advisories from GitHub'
  },
  async run() {
    const items = await fetchGithubAdvisories()
    const result = await persistIncidents(items)
    await touchSourceSync('GitHub Advisories')
    return { result: { source: 'github', fetched: items.length, ...result } }
  }
})
