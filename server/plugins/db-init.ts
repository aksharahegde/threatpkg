export default defineNitroPlugin(() => {
  if (!process.env.DATABASE_URL) {
    console.error(
      '[threat-pkg] DATABASE_URL is required. Copy .env.example to .env and set your Postgres URL.'
    )
  }
})
