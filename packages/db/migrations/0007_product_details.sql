-- 0007: product catalog detail fields (P8 console iteration 2)
-- Rich product management needs marketing copy and list pricing on the record.
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "description" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "price_usd" numeric(10, 2);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "currency" char(3) NOT NULL DEFAULT 'USD';
