-- ZT-046: a warranty registration becomes ACTIVE only after the owner opens the
-- confirmation link sent to the registration e-mail. Pending rows never block
-- anyone (the partial unique index covers status = 'active' only).
ALTER TABLE "product_registration" ADD COLUMN IF NOT EXISTS "confirm_token" varchar(64);
--> statement-breakpoint
ALTER TABLE "product_registration" ADD COLUMN IF NOT EXISTS "confirm_expires_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "product_registration" ADD COLUMN IF NOT EXISTS "purchase_date_source" varchar(20) DEFAULT 'self-declared' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_registration_confirm_token_idx" ON "product_registration" ("confirm_token");
