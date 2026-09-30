ALTER TABLE "sn_check" ADD COLUMN "country" varchar(8);--> statement-breakpoint
ALTER TABLE "serial_registry" ADD COLUMN "batch" varchar(40);--> statement-breakpoint
CREATE INDEX "sn_check_country_idx" ON "sn_check" ("country");
