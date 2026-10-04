ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "short_spec" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "facets" jsonb NOT NULL DEFAULT '{}'::jsonb;
