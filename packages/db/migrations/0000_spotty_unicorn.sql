CREATE TYPE "public"."content_status" AS ENUM('draft', 'in_review', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."rma_status" AS ENUM('submitted', 'under_review', 'approved', 'in_repair', 'shipped', 'delivered', 'closed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'admin', 'editor', 'author', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('new', 'assigned', 'resolved', 'spam');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"title" text NOT NULL,
	"deck" text,
	"body" text DEFAULT '' NOT NULL,
	"category" varchar(40) DEFAULT 'Article' NOT NULL,
	"tags" text[] DEFAULT '{}',
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp with time zone,
	"author_id" text,
	"hero_media_id" integer,
	"seo" jsonb DEFAULT '{}'::jsonb,
	"revision_of" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" text,
	"action" varchar(60) NOT NULL,
	"entity" varchar(40) NOT NULL,
	"entity_id" text,
	"diff" jsonb,
	"request_id" text,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(60) NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "brand_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(60) NOT NULL,
	"name" text NOT NULL,
	"parent_id" integer,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "compatibility_rule" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_brand" text NOT NULL,
	"device_model" text NOT NULL,
	"memory_gen" varchar(12),
	"form_factor" varchar(12),
	"max_gb" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "distributor" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" varchar(60) NOT NULL,
	"region" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'authorized' NOT NULL,
	"cities" text[] DEFAULT '{}',
	"contact" jsonb DEFAULT '{}'::jsonb,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_key" varchar(40) NOT NULL,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submission" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(40) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"email" text NOT NULL,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"assignee_id" text,
	"ref_code" varchar(24) NOT NULL,
	"ip" text,
	"ua" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_submission_ref_code_unique" UNIQUE("ref_code")
);
--> statement-breakpoint
CREATE TABLE "job_application" (
	"id" serial PRIMARY KEY NOT NULL,
	"posting_id" integer,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"email" text NOT NULL,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"ref_code" varchar(24) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_application_ref_code_unique" UNIQUE("ref_code")
);
--> statement-breakpoint
CREATE TABLE "job_posting" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"dept" varchar(40) NOT NULL,
	"location" varchar(60) NOT NULL,
	"type" varchar(20) DEFAULT 'full-time' NOT NULL,
	"level" varchar(20) DEFAULT 'mid' NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"apply_by" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "locale" (
	"code" varchar(10) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"dir" varchar(3) DEFAULT 'ltr' NOT NULL,
	"active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_listing" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" varchar(40) NOT NULL,
	"url" text NOT NULL,
	"country" varchar(60),
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_asset" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"kind" varchar(20) DEFAULT 'image' NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text,
	"uploaded_by" text,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_asset_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "news_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"tag" text,
	"event_date" timestamp with time zone,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp with time zone,
	"hero_media_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "page" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"title" text NOT NULL,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"seo" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(40) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" text NOT NULL,
	"brand_id" integer,
	"category_id" integer,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"specs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"hero_media_id" integer,
	"gallery" integer[] DEFAULT '{}',
	"datasheets" jsonb DEFAULT '[]'::jsonb,
	"badges" text[] DEFAULT '{}',
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "product_sku_unique" UNIQUE("sku"),
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"attrs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sku" varchar(40) NOT NULL,
	CONSTRAINT "product_variant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "redirect" (
	"id" serial PRIMARY KEY NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"code" integer DEFAULT 301 NOT NULL,
	CONSTRAINT "redirect_from_unique" UNIQUE("from")
);
--> statement-breakpoint
CREATE TABLE "rma_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"rma_id" integer NOT NULL,
	"from_status" "rma_status" NOT NULL,
	"to_status" "rma_status" NOT NULL,
	"actor_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rma_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" varchar(24) NOT NULL,
	"product_sku" varchar(40),
	"serial" varchar(60),
	"issue" text DEFAULT '' NOT NULL,
	"status" "rma_status" DEFAULT 'submitted' NOT NULL,
	"customer" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"warranty_tier" varchar(20),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rma_request_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "serial_registry" (
	"serial" varchar(60) PRIMARY KEY NOT NULL,
	"sku" varchar(40),
	"manufactured_at" timestamp with time zone,
	"verified_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"role" "role" DEFAULT 'viewer' NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_hero_media_id_media_asset_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media_asset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_posting_id_job_posting_id_fk" FOREIGN KEY ("posting_id") REFERENCES "public"."job_posting"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brand"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_hero_media_id_media_asset_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media_asset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rma_event" ADD CONSTRAINT "rma_event_rma_id_rma_request_id_fk" FOREIGN KEY ("rma_id") REFERENCES "public"."rma_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rma_event" ADD CONSTRAINT "rma_event_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "article_slug_locale_uq" ON "article" USING btree ("slug","locale");--> statement-breakpoint
CREATE INDEX "article_status_idx" ON "article" USING btree ("status","publish_at");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "compat_device_idx" ON "compatibility_rule" USING btree ("device_brand","device_model");--> statement-breakpoint
CREATE INDEX "distributor_region_idx" ON "distributor" USING btree ("region","country");--> statement-breakpoint
CREATE INDEX "submission_type_status_idx" ON "form_submission" USING btree ("type","status");--> statement-breakpoint
CREATE UNIQUE INDEX "news_slug_locale_uq" ON "news_post" USING btree ("slug","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "page_slug_locale_uq" ON "page" USING btree ("slug","locale");--> statement-breakpoint
CREATE INDEX "product_status_idx" ON "product" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_cat_idx" ON "product" USING btree ("category_id");