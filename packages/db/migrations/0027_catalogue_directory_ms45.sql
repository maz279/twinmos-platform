CREATE TABLE IF NOT EXISTS "spec_dictionary" (
  "id" serial PRIMARY KEY NOT NULL,
  "key" varchar(80) NOT NULL,
  "normalized_key" varchar(80) NOT NULL,
  "category_id" integer REFERENCES "category"("id") ON DELETE SET NULL,
  "data_type" varchar(30) DEFAULT 'string' NOT NULL,
  "unit" varchar(20),
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spec_dictionary_norm_idx" ON "spec_dictionary" ("normalized_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spec_dictionary_cat_idx" ON "spec_dictionary" ("category_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spec_template" (
  "id" serial PRIMARY KEY NOT NULL,
  "category_id" integer NOT NULL REFERENCES "category"("id") ON DELETE CASCADE,
  "name" varchar(80) NOT NULL,
  "spec_keys" text[] DEFAULT '{}' NOT NULL,
  "required_keys" text[] DEFAULT '{}' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spec_template_cat_idx" ON "spec_template" ("category_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "device_type_label" (
  "id" serial PRIMARY KEY NOT NULL,
  "device_type" varchar(30) NOT NULL UNIQUE,
  "label" varchar(80) NOT NULL,
  "sort" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "device_type_label" ("device_type", "label", "sort")
VALUES
  ('laptop', 'Laptop', 1),
  ('desktop', 'Desktop PC', 2),
  ('diy', 'Motherboard (DIY build)', 3),
  ('minipc', 'Mini PC / NUC', 4)
ON CONFLICT ("device_type") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "distributor" ADD COLUMN IF NOT EXISTS "iso_country" varchar(2);
--> statement-breakpoint
ALTER TABLE "distributor" ADD COLUMN IF NOT EXISTS "tagline" text;
--> statement-breakpoint
ALTER TABLE "distributor" ADD COLUMN IF NOT EXISTS "cta_config" jsonb DEFAULT '{}'::jsonb;
--> statement-breakpoint
ALTER TABLE "distributor" ADD COLUMN IF NOT EXISTS "sort" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "marketplace_listing" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "marketplace_listing" ADD COLUMN IF NOT EXISTS "cta_label" varchar(60);
--> statement-breakpoint
ALTER TABLE "marketplace_listing" ADD COLUMN IF NOT EXISTS "sort" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "compatibility_rule" ADD COLUMN IF NOT EXISTS "qvl_status" varchar(30) DEFAULT 'certified' NOT NULL;
