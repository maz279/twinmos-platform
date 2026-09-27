CREATE TABLE IF NOT EXISTS "content_revision" (
	"id" serial PRIMARY KEY,
	"entity" varchar(20) NOT NULL,
	"entity_id" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"actor_id" text REFERENCES "user"("id") ON DELETE SET NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_revision_entity_idx" ON "content_revision" ("entity","entity_id");
