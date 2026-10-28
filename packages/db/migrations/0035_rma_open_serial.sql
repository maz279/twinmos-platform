-- ZT-068: "one open RMA per serial" (BR-6.2 intake) was a read-then-insert, so
-- two concurrent submissions could both pass the check. The database now holds
-- the rule; intake maps 23505 to the RMA_OPEN answer.
CREATE UNIQUE INDEX IF NOT EXISTS "rma_request_open_serial_uq" ON "rma_request" ("serial") WHERE "serial" IS NOT NULL AND "status" NOT IN ('closed', 'delivered');
--> statement-breakpoint
-- ZT-069: subscribers left pending by 0032 had no token expiry, and confirm
-- rejects a NULL expiry, so their mailed links could never work. Give them the
-- standard 7-day window from now.
UPDATE "newsletter_subscriber" SET "token_expires_at" = now() + interval '7 days' WHERE "status" = 'pending' AND "token" IS NOT NULL AND "token_expires_at" IS NULL;
