-- ZT-068: "one open RMA per serial" (BR-6.2 intake) was a read-then-insert, so
-- two concurrent submissions could both pass the check. The database now holds
-- the rule; intake maps 23505 to the RMA_OPEN answer.
--
-- Before 0035 the serial was free text and never checked, so existing data may
-- hold placeholders or duplicate open cases. Placeholders become NULL (they
-- identify no product). Real duplicates are a staff decision (merge or close),
-- never an automatic one: the migration stops with a clear message instead of
-- an opaque unique violation (ZT-087).
UPDATE "rma_request" SET "serial" = NULL
WHERE "serial" IS NOT NULL AND upper(btrim("serial")) IN ('', '-', 'N/A', 'NA', 'NONE', 'UNKNOWN', 'TBD', '0');
--> statement-breakpoint
UPDATE "rma_request" SET "serial" = upper(btrim("serial")) WHERE "serial" IS NOT NULL AND "serial" <> upper(btrim("serial"));
--> statement-breakpoint
DO $$
DECLARE dup integer;
BEGIN
  SELECT count(*) INTO dup FROM (
    SELECT "serial" FROM "rma_request"
    WHERE "serial" IS NOT NULL AND "status" NOT IN ('closed', 'delivered')
    GROUP BY "serial" HAVING count(*) > 1
  ) d;
  IF dup > 0 THEN
    RAISE EXCEPTION '0035: % serial(s) have more than one open RMA. Close or merge the duplicates in the admin console (RMA board, search by serial), then re-run migrations. List them with: SELECT serial, array_agg(number) FROM rma_request WHERE serial IS NOT NULL AND status NOT IN (''closed'',''delivered'') GROUP BY serial HAVING count(*) > 1;', dup;
  END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rma_request_open_serial_uq" ON "rma_request" ("serial") WHERE "serial" IS NOT NULL AND "status" NOT IN ('closed', 'delivered');
--> statement-breakpoint
-- ZT-069: subscribers left pending by 0032 had no token expiry, and confirm
-- rejects a NULL expiry, so their mailed links could never work. Give them the
-- standard 7-day window from now.
UPDATE "newsletter_subscriber" SET "token_expires_at" = now() + interval '7 days' WHERE "status" = 'pending' AND "token" IS NOT NULL AND "token_expires_at" IS NULL;
