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
    { name: 'GitHub Advisories', type: 'api', url: 'https://github.com/advisories', enabled: true },
    { name: 'Snyk', type: 'rss', url: 'https://snyk.io/blog/feed/', enabled: true },
    { name: 'Phylum', type: 'rss', url: 'https://blog.phylum.io/rss.xml', enabled: true },
    {
      name: 'JFrog Blog',
      type: 'rss',
      url: 'https://jfrog.com/blog/feed/',
      enabled: true
    }
  ])

  await client.end()
  console.log('Source registry seeded. Run `bun run db:sync` to ingest incidents.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
