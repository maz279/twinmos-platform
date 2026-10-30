-- Migration 0022: Phase D search FTS, trigram, query log and newsletter subscribers
-- Newsletter Subscribers (Task D6: newsletter double opt-in)
CREATE TABLE IF NOT EXISTS "newsletter_subscriber" (
  "id" serial PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "token" varchar(64),
  "source" varchar(100) DEFAULT 'site_footer',
  "confirmed_at" timestamp with time zone,
  "unsubscribed_at" timestamp with time zone,
  "ip" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_sub_status_idx" ON "newsletter_subscriber" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_sub_token_idx" ON "newsletter_subscriber" ("token");
--> statement-breakpoint
-- Search Query Log (Task D7a: analytics with 0 personal data)
CREATE TABLE IF NOT EXISTS "search_query_log" (
  "id" serial PRIMARY KEY,
  "query" text NOT NULL,
  "locale" varchar(10) NOT NULL DEFAULT 'en',
  "results_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_log_created_idx" ON "search_query_log" ("created_at");

