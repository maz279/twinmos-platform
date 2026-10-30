-- Warranty registration + lookup (BRD §F8.3, URD UR-6.1.7 / UR-6.4.3 / UR-17.1.5,
-- BR-6.2). One ACTIVE registration per factory serial; the warranty term is
-- copied from the product at registration time so later catalogue edits never
-- silently change a customer's entitlement. expires_at NULL = lifetime/unknown.
CREATE TABLE IF NOT EXISTS "product_registration" (
  "id" serial PRIMARY KEY NOT NULL,
  "serial" varchar(60) NOT NULL REFERENCES "serial_registry"("serial") ON DELETE RESTRICT,
  "sku" varchar(40),
  "email" text NOT NULL,
  "name" text NOT NULL,
  "country" varchar(80),
  "purchase_date" date NOT NULL,
  "retailer" varchar(120),
  "warranty_term" varchar(80),
  "warranty_expires_at" timestamp with time zone,
  "status" varchar(20) DEFAULT 'active' NOT NULL,
  "void_reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_registration_active_serial_uq" ON "product_registration" ("serial") WHERE "status" = 'active';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_registration_email_idx" ON "product_registration" ("email");
