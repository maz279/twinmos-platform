-- P5 partner portal + anti-counterfeit — orgs, memberships, gated assets, SN-check log.
CREATE TABLE IF NOT EXISTS "partner_org" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL DEFAULT 'pending',
	"country" varchar(60),
	"contact_email" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "partner_org_type_status_idx" ON "partner_org" ("type","status");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partner_member" (
	"id" serial PRIMARY KEY,
	"org_id" integer NOT NULL REFERENCES "partner_org"("id") ON DELETE CASCADE,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
	"role" varchar(20) NOT NULL DEFAULT 'staff',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "partner_member_org_user_uq" ON "partner_member" ("org_id","user_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partner_asset" (
	"id" serial PRIMARY KEY,
	"org_id" integer REFERENCES "partner_org"("id") ON DELETE CASCADE,
	"category" varchar(30) NOT NULL,
	"title" text NOT NULL,
	"file_key" text NOT NULL,
	"mime" varchar(120) NOT NULL DEFAULT 'application/octet-stream',
	"bytes" integer NOT NULL DEFAULT 0,
	"visible_to_types" varchar(20)[] NOT NULL DEFAULT '{distributor,oem,si}',
	"uploaded_by" text REFERENCES "user"("id") ON DELETE SET NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "partner_asset_category_idx" ON "partner_asset" ("category","org_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sn_check" (
	"id" serial PRIMARY KEY,
	"serial" varchar(60) NOT NULL,
	"sku" varchar(40),
	"result" varchar(20) NOT NULL,
	"ip" text,
	"ua" text,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sn_check_serial_idx" ON "sn_check" ("serial","checked_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sn_check_checked_at_idx" ON "sn_check" ("checked_at");
