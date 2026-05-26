import { assertCronAuthorized } from '../../utils/sync-auth'
import { runSyncAll } from '../../utils/run-sync-all'

export default defineEventHandler(async (event) => {
  assertCronAuthorized(event)
  const result = await runSyncAll()
  return { ok: true, ...result }
})
