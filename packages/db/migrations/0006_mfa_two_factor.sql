-- P7+: MFA for the admin panel — Better Auth twoFactor plugin storage.
-- 1) flag on user (the plugin reads/writes this column)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS two_factor_enabled boolean NOT NULL DEFAULT false;
--> statement-breakpoint

-- 2) per-user 2FA state (columns per the plugin's schema object, probed from
--    better-auth@1.7.6 plugins/twoFactor: secret, backupCodes, userId FK,
--    verified, failedVerificationCount, lockedUntil)
CREATE TABLE IF NOT EXISTS two_factor (
  id text PRIMARY KEY,
  secret text NOT NULL,
  backup_codes text NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  verified boolean NOT NULL DEFAULT true,
  failed_verification_count integer NOT NULL DEFAULT 0,
  locked_until timestamp with time zone,
  constraint two_factor_user_id_unique unique (user_id)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS two_factor_user_id_idx ON two_factor (user_id);
