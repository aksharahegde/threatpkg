CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_name" text NOT NULL,
	"ecosystem" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"severity" text NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"threat_type" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"source" text NOT NULL,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"indicator_type" text NOT NULL,
	"value" text NOT NULL,
	"confidence" integer DEFAULT 50 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_reputation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_name" text NOT NULL,
	"ecosystem" text NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"incident_count" integer DEFAULT 0 NOT NULL,
	"maintainer_count" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incidents_published_at_idx" ON "incidents" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "incidents_ecosystem_idx" ON "incidents" USING btree ("ecosystem");--> statement-breakpoint
CREATE INDEX "incidents_severity_idx" ON "incidents" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "incidents_package_name_idx" ON "incidents" USING btree ("package_name");--> statement-breakpoint
CREATE INDEX "indicators_incident_id_idx" ON "indicators" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "package_reputation_name_eco_idx" ON "package_reputation" USING btree ("package_name","ecosystem");