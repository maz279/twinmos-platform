-- Zero-trust audit 2026-10-28 (ZT-033): newsletter double opt-in uses a
-- one-time, expiring confirmation token and a SEPARATE unsubscribe token.
ALTER TABLE "newsletter_subscriber" ADD COLUMN IF NOT EXISTS "unsubscribe_token" varchar(64);
--> statement-breakpoint
ALTER TABLE "newsletter_subscriber" ADD COLUMN IF NOT EXISTS "token_expires_at" timestamp with time zone;
--> statement-breakpoint
-- existing subscribers' mailed unsubscribe links carry the legacy shared token
UPDATE "newsletter_subscriber" SET "unsubscribe_token" = "token" WHERE "unsubscribe_token" IS NULL AND "token" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_sub_unsub_token_idx" ON "newsletter_subscriber" ("unsubscribe_token");
--> statement-breakpoint
-- ZT-034: "Was this helpful?" votes are stored for real (no PII: no IP, no UA).
CREATE TABLE IF NOT EXISTS "content_feedback" (
  "id" serial PRIMARY KEY NOT NULL,
  "entity" varchar(20) NOT NULL,
  "slug" varchar(200) NOT NULL,
  "locale" varchar(10) DEFAULT 'en' NOT NULL,
  "helpful" boolean NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_feedback_entity_slug_idx" ON "content_feedback" ("entity","slug");
