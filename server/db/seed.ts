import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sources } from './schema'

async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is required for seeding')
    process.exit(1)
  }

  const client = postgres(url, { max: 1 })
  const db = drizzle(client)

  console.log('Seeding source registry...')

  await db.delete(sources)

  await db.insert(sources).values([
    { name: 'OSV', type: 'api', url: 'https://osv.dev/', enabled: true },
    { name: 'GitHub Advisories', type: 'api', url: 'https://github.com/advisories', enabled: true }
  ])

  await client.end()
  console.log('Source registry seeded. Run `bun run db:sync` to ingest incidents.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
