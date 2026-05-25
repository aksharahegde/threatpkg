import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  index
} from 'drizzle-orm/pg-core'

export const incidents = pgTable(
  'incidents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    packageName: text('package_name').notNull(),
    ecosystem: text('ecosystem').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    severity: text('severity').notNull(),
    riskScore: integer('risk_score').notNull().default(0),
    threatType: text('threat_type').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
    source: text('source').notNull(),
    sourceUrl: text('source_url'),
    externalId: text('external_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index('incidents_published_at_idx').on(table.publishedAt),
    index('incidents_ecosystem_idx').on(table.ecosystem),
    index('incidents_severity_idx').on(table.severity),
    index('incidents_package_name_idx').on(table.packageName),
    index('incidents_source_external_id_idx').on(table.source, table.externalId)
  ]
)

export const packageReputation = pgTable(
  'package_reputation',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    packageName: text('package_name').notNull(),
    ecosystem: text('ecosystem').notNull(),
    riskScore: integer('risk_score').notNull().default(0),
    incidentCount: integer('incident_count').notNull().default(0),
    maintainerCount: integer('maintainer_count').notNull().default(0),
    lastUpdated: timestamp('last_updated', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index('package_reputation_name_eco_idx').on(
      table.packageName,
      table.ecosystem
    )
  ]
)

export const indicators = pgTable(
  'indicators',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    incidentId: uuid('incident_id')
      .notNull()
      .references(() => incidents.id, { onDelete: 'cascade' }),
    indicatorType: text('indicator_type').notNull(),
    value: text('value').notNull(),
    confidence: integer('confidence').notNull().default(50)
  },
  (table) => [index('indicators_incident_id_idx').on(table.incidentId)]
)

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  url: text('url').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true })
})
