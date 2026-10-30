DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'page_parent_id_page_id_fk'
  ) THEN
    ALTER TABLE "page" ADD CONSTRAINT "page_parent_id_page_id_fk" FOREIGN KEY ("parent_id") REFERENCES "page"("id") ON DELETE SET NULL;
  END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "page_locale_path_uq" ON "page" ("locale", "path");
