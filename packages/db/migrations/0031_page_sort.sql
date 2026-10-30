ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "sort" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_parent_sort_idx" ON "page" ("parent_id","sort");
