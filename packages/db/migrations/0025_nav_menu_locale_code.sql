ALTER TABLE "nav_menu" DROP CONSTRAINT IF EXISTS "nav_menu_code_unique";
--> statement-breakpoint
ALTER TABLE "nav_menu" DROP CONSTRAINT IF EXISTS "nav_menu_code_key";
--> statement-breakpoint
DROP INDEX IF EXISTS "nav_menu_code_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "nav_menu_code_locale_uq" ON "nav_menu" ("code", "locale");
