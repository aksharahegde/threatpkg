import { closeDb } from '../db/index'
import { runSyncAll } from '../utils/run-sync-all'

async function main() {
  console.log('[sync] Fetching from OSV and GitHub Advisories...')
  const result = await runSyncAll()
  console.log(
    `[sync] Fetched osv=${result.fetched.osv} github=${result.fetched.github}`
  )
  console.log(`[sync] Removed ${result.removedRetired} retired-source rows`)
  console.log(`[sync] Removed ${result.removedLegacy} legacy rows without external_id`)
  console.log(
    `[sync] Persisted inserted=${result.inserted} updated=${result.updated} skipped=${result.skipped}`
  )
  await closeDb()
  console.log('[sync] Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
