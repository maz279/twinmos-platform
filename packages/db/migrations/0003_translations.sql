CREATE TABLE IF NOT EXISTS "translation" (
	"id" serial PRIMARY KEY,
	"locale" varchar(10) NOT NULL,
	"ns" varchar(60) NOT NULL DEFAULT 'common',
	"key" varchar(120) NOT NULL,
	"value" text NOT NULL,
	"updated_by" text REFERENCES "user"("id") ON DELETE SET NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "translation_locale_ns_key_uq" ON "translation" ("locale","ns","key");
