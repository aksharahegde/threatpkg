import { runSyncAll } from '../utils/run-sync-all'

export default defineTask({
  meta: {
    name: 'sync-all',
    description: 'Sync all threat intelligence sources'
  },
  async run() {
    const result = await runSyncAll()
    return { result }
  }
})
