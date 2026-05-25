# ThreatPkg

Public realtime dashboard for open-source package threat intelligence across **npm** and **PyPI** — compromised packages, supply-chain incidents, and advisory IDs (CVE, GHSA, OSV) in one searchable feed.

## Features

- **Live threat feed** — filter by ecosystem, severity, threat type, source, and time range; paginated with auto-refresh
- **Three-column dashboard** — critical metrics, ecosystem distribution, trend chart, feed list, and inspector panel
- **Package lookup** — search npm or PyPI packages from the navbar; resolves to the correct ecosystem route
- **Incident detail** — markdown advisories, timeline, indicators, affected versions, related incidents
- **Package pages** — reputation score and incident history per package
- **Light / dark theme** — system preference with manual toggle (persisted in local storage)

## Stack

- [Nuxt 4](https://nuxt.com) SSR + Nitro
- [Nuxt UI](https://ui.nuxt.com) + Tailwind CSS
- PostgreSQL + [Drizzle ORM](https://orm.drizzle.team)
- [Bun](https://bun.sh) package manager
- [Vitest](https://vitest.dev) for unit tests

## Setup

```bash
bun install
cp .env.example .env
```

Set `DATABASE_URL` to your Postgres connection string, then:

```bash
bun run db:migrate
bun run db:seed
bun run db:sync
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

`DATABASE_URL` is required for all API routes. Without synced data the feed will be empty after seed (seed only registers sources).

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NUXT_PUBLIC_SITE_URL` | No | Canonical site URL for SEO / OG (default `http://localhost:3000`) |
| `GITHUB_TOKEN` | No | Raises GitHub Advisory API rate limits during sync |
| `SYNC_SECRET` | No | Protects `POST /api/sync` when set |
| `REDIS_URL` | No | Reserved for future use |
| `OPENAI_API_KEY` | No | Reserved for AI summary enrichment |

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Development server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run typecheck` | Nuxt TypeScript check |
| `bun run test` | Run Vitest unit tests |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply migrations |
| `bun run db:seed` | Seed source registry |
| `bun run db:sync` | Ingest incidents from OSV, GitHub Advisories, and RSS |

Scheduled sync runs every 30 minutes via Nitro (`sync-all` task) when the server is up.

## Data sources

| Source | Type | Notes |
|--------|------|-------|
| OSV | API | Recent npm / PyPI vulns and malware (modified-id lists) |
| GitHub Advisories | API | Optional `GITHUB_TOKEN` for higher rate limits |
| Snyk, Socket, Phylum, JFrog | RSS | Security research blog feeds |

## Routes

| Path | Description |
|------|-------------|
| `/` | Live threat feed |
| `/incident/[id]` | Incident detail |
| `/package/[ecosystem]/[name]` | Package reputation (`npm` or `pypi`) |
| `/package/[name]` | Redirects to ecosystem-scoped URL |
| `/about` | About the project |

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/feed` | Paginated incidents + summary + trend buckets |
| `GET /api/incidents/:id` | Full incident detail |
| `GET /api/packages/:ecosystem/:name` | Package reputation + history |
| `GET /api/packages/resolve/:name` | Resolve package name to primary ecosystem |
| `GET /api/sources` | Sync freshness / source status |
| `POST /api/sync` | Trigger ingest (requires `SYNC_SECRET` when configured) |

Query parameters for `/api/feed`: `ecosystem`, `severity`, `threatType`, `source`, `range` (`24h` \| `7d` \| `30d`), `q`, `sort` (`published` \| `risk`), `cursor`, `limit`.

## Spec

Product and data model: [../threat_pkg.md](../threat_pkg.md)
