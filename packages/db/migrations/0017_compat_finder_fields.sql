ALTER TABLE "compatibility_rule" ADD COLUMN IF NOT EXISTS "device_type" varchar(20) NOT NULL DEFAULT 'laptop';--> statement-breakpoint
ALTER TABLE "compatibility_rule" ADD COLUMN IF NOT EXISTS "slots" integer;--> statement-breakpoint
ALTER TABLE "compatibility_rule" ADD COLUMN IF NOT EXISTS "speed" varchar(30);--> statement-breakpoint
ALTER TABLE "compatibility_rule" ADD COLUMN IF NOT EXISTS "cats" text[] NOT NULL DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "compatibility_rule" ADD COLUMN IF NOT EXISTS "ssd_note" varchar(120);--> statement-breakpoint
ALTER TABLE "compatibility_rule" ADD COLUMN IF NOT EXISTS "ssd_cats" text[] NOT NULL DEFAULT '{}';
