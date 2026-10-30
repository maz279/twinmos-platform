ALTER TABLE "glossary_term" ADD COLUMN IF NOT EXISTS "status" "content_status" NOT NULL DEFAULT 'published';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "glossary_term_status_idx" ON "glossary_term" ("status");
--> statement-breakpoint
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "legal_approved" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "approved_by" text;
--> statement-breakpoint
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "change_summary" text;
--> statement-breakpoint
DROP INDEX IF EXISTS "policy_doc_slug_locale_uq";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "policy_doc_slug_locale_ver_uq" ON "policy_document" ("slug", "locale", "version");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "policy_doc_slug_locale_idx" ON "policy_document" ("slug", "locale");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "policy_doc_legal_idx" ON "policy_document" ("legal_approved");
