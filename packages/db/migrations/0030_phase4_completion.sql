ALTER TABLE "article" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN IF NOT EXISTS "translation_group" varchar(60);
--> statement-breakpoint
ALTER TABLE "news_post" ADD COLUMN IF NOT EXISTS "seo" jsonb DEFAULT '{}'::jsonb;
--> statement-breakpoint
ALTER TABLE "news_post" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "news_post" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
ALTER TABLE "news_post" ADD COLUMN IF NOT EXISTS "translation_group" varchar(60);
--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "translation_group" varchar(60);
--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN IF NOT EXISTS "label" varchar(120);
--> statement-breakpoint
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "policy_document" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
ALTER TABLE "form_definition" ADD COLUMN IF NOT EXISTS "error_message" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entity_translation" (
  "id" serial PRIMARY KEY NOT NULL,
  "entity" varchar(20) NOT NULL,
  "entity_id" integer NOT NULL,
  "locale" varchar(10) NOT NULL,
  "field" varchar(60) NOT NULL,
  "value" text NOT NULL,
  "status" varchar(20) DEFAULT 'current' NOT NULL,
  "source_hash" varchar(64),
  "updated_by" text REFERENCES "user"("id") ON DELETE set null,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "entity_translation_uq" ON "entity_translation" ("entity","entity_id","locale","field");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entity_translation_locale_idx" ON "entity_translation" ("entity","locale");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "article_translation_group_idx" ON "article" ("translation_group");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "news_translation_group_idx" ON "news_post" ("translation_group");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_translation_group_idx" ON "product" ("translation_group");
