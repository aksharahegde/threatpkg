import { fetchOsvIncidents } from '../fetchers/osv'
import { persistIncidents, touchSourceSync } from '../utils/sync'

export default defineTask({
  meta: {
    name: 'sync-osv',
    description: 'Sync malware incidents from OSV'
  },
  async run() {
    const items = await fetchOsvIncidents()
    const result = await persistIncidents(items)
    await touchSourceSync('OSV')
    return { result: { source: 'osv', fetched: items.length, ...result } }
  }
})
