CREATE TABLE "media_folder" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"parent_id" integer REFERENCES "media_folder"("id") ON DELETE CASCADE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "media_asset" ADD COLUMN "folder_id" integer REFERENCES "media_folder"("id") ON DELETE SET NULL;--> statement-breakpoint
CREATE INDEX "media_folder_parent_idx" ON "media_folder" ("parent_id");--> statement-breakpoint
CREATE INDEX "media_asset_folder_idx" ON "media_asset" ("folder_id");
