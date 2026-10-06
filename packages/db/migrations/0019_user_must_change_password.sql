-- 0019 (P1.4): forced password rotation for invited accounts.
-- Invite flow generates a temporary credential; until the user sets their own
-- password, all /admin routes are refused server-side (403 problem+json).
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "must_change_password" boolean NOT NULL DEFAULT false;
