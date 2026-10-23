ALTER TABLE "office" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'published' NOT NULL;
--> statement-breakpoint
ALTER TABLE "office" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "office" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'published' NOT NULL;
--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN IF NOT EXISTS "permission_evidence" text;
--> statement-breakpoint
ALTER TABLE "distributor" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "distributor" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
ALTER TABLE "glossary_term" ADD COLUMN IF NOT EXISTS "source" text;
--> statement-breakpoint
ALTER TABLE "glossary_term" ADD COLUMN IF NOT EXISTS "approver" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "office_status_idx" ON "office" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testimonial_status_idx" ON "testimonial" ("status");
