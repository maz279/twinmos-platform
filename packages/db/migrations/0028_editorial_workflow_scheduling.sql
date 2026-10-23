ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "publish_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "unpublish_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN IF NOT EXISTS "publish_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN IF NOT EXISTS "unpublish_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN IF NOT EXISTS "unpublish_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "news_post" ADD COLUMN IF NOT EXISTS "unpublish_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "publish_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "unpublish_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_status_sched_idx" ON "page" ("status", "publish_at", "unpublish_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "faq_status_sched_idx" ON "faq" ("status", "publish_at", "unpublish_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "article_status_sched_idx" ON "article" ("status", "publish_at", "unpublish_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "news_status_sched_idx" ON "news_post" ("status", "publish_at", "unpublish_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_status_sched_idx" ON "product" ("status", "publish_at", "unpublish_at");
