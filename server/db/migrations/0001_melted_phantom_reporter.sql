ALTER TABLE "incidents" ADD COLUMN "external_id" text;--> statement-breakpoint
CREATE INDEX "incidents_source_external_id_idx" ON "incidents" USING btree ("source","external_id");