-- Phase C: Content model and editors schema additions (Task C1..C11b)
ALTER TABLE "media_asset" ADD COLUMN IF NOT EXISTS "variants" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "media_asset" ADD COLUMN IF NOT EXISTS "focal_point" jsonb DEFAULT '{"x":50,"y":50}'::jsonb;--> statement-breakpoint
ALTER TABLE "media_asset" ADD COLUMN IF NOT EXISTS "is_decorative" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "path" varchar(200);--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "template" varchar(60) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "parent_id" integer;--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "translation_group" varchar(60);--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "seo_title" text;--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "seo_description" text;--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "og_media_id" integer REFERENCES "media_asset"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "noindex" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "legacy_paths" text[] DEFAULT ARRAY[]::text[];--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_path_locale_idx" ON "page" ("path", "locale");--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN IF NOT EXISTS "structured_body" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN IF NOT EXISTS "reading_time_min" integer;--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "launch_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "is_coming_soon" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "warranty_tier" varchar(40);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "specs_dictionary" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "faq_group_locale_idx" ON "faq" ("group_key", "locale");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nav_menu" (
	"id" serial PRIMARY KEY,
	"code" varchar(40) NOT NULL UNIQUE,
	"title" text NOT NULL,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nav_item" (
	"id" serial PRIMARY KEY,
	"menu_id" integer NOT NULL REFERENCES "nav_menu"("id") ON DELETE CASCADE,
	"parent_id" integer REFERENCES "nav_item"("id") ON DELETE CASCADE,
	"title" text NOT NULL,
	"target_type" varchar(30) DEFAULT 'url' NOT NULL,
	"target_url" text,
	"target_id" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"icon" varchar(60),
	"badge" varchar(40)
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nav_item_menu_idx" ON "nav_item" ("menu_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nav_item_parent_idx" ON "nav_item" ("parent_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "glossary_term" (
	"id" serial PRIMARY KEY,
	"term" text NOT NULL,
	"definition" text NOT NULL,
	"letter" varchar(2) NOT NULL,
	"explainer_slug" text,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"translation_group" varchar(60),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "glossary_term_letter_idx" ON "glossary_term" ("letter", "locale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "glossary_term_group_idx" ON "glossary_term" ("translation_group");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "office" (
	"id" serial PRIMARY KEY,
	"role" varchar(60) NOT NULL,
	"title" text NOT NULL,
	"entity" text NOT NULL,
	"address" text NOT NULL,
	"flag" varchar(20),
	"note" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "office_locale_sort_idx" ON "office" ("locale", "sort");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testimonial" (
	"id" serial PRIMARY KEY,
	"quote" text NOT NULL,
	"author" text NOT NULL,
	"role" text,
	"context" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"permission_flag" boolean DEFAULT true NOT NULL,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testimonial_locale_sort_idx" ON "testimonial" ("locale", "sort");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "policy_document" (
	"id" serial PRIMARY KEY,
	"slug" varchar(120) NOT NULL,
	"title" text NOT NULL,
	"version" varchar(20) DEFAULT '1.0' NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"effective_date" timestamp with time zone,
	"summary" text,
	"body" text DEFAULT '' NOT NULL,
	"cookie_categories" jsonb DEFAULT '[]'::jsonb,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"translation_group" varchar(60),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "policy_doc_slug_locale_uq" ON "policy_document" ("slug", "locale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "policy_doc_status_idx" ON "policy_document" ("status");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_definition" (
	"id" serial PRIMARY KEY,
	"type" varchar(40) NOT NULL UNIQUE,
	"title" text NOT NULL,
	"description" text,
	"success_message" text,
	"routing_email" text,
	"privacy_notice" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_field" (
	"id" serial PRIMARY KEY,
	"form_id" integer NOT NULL REFERENCES "form_definition"("id") ON DELETE CASCADE,
	"name" varchar(60) NOT NULL,
	"label" text NOT NULL,
	"type" varchar(30) DEFAULT 'text' NOT NULL,
	"placeholder" text,
	"help_text" text,
	"required" boolean DEFAULT false NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb,
	"sort" integer DEFAULT 0 NOT NULL,
	"validation_regex" text
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "form_field_form_idx" ON "form_field" ("form_id", "sort");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "outbox" (
	"id" serial PRIMARY KEY,
	"event_type" varchar(80) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outbox_status_idx" ON "outbox" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outbox_created_at_idx" ON "outbox" ("created_at");
