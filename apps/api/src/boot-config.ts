// Production boot guards — refuses to start when fatal configuration defects exist.
// Pure functions over an env object so they are unit-testable.

/** forms.ts:56 replacement — bypass only on the exact value '1', never in production. */
export function turnstileBypassEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.NODE_ENV !== 'production' && env.API_ALLOW_NO_TURNSTILE === '1';
}

const MAIL_FROM_RE = /^(?:[^<>]*<)?\s*([^<>\s@]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\s*>?\s*$/;

/** Returns a list of fatal misconfigurations (empty list = OK to boot). */
export function bootConfigErrors(env: Record<string, string | undefined> = process.env): string[] {
  const errs: string[] = [];
  if (env.NODE_ENV !== 'production') return errs;

  // Dev-only switches must be ABSENT in production (any value, even '0' or 'false').
  for (const k of ['API_ALLOW_NO_TURNSTILE', 'API_DEV_AUTOLOGIN']) {
    if (env[k] !== undefined) {
      errs.push(`${k} must be unset when NODE_ENV=production (found ${JSON.stringify(env[k])})`);
    }
  }

  if (env.TEST !== undefined) {
    errs.push('TEST must not be set in production (causes shared rate-limit buckets)');
  }

  if (!env.DATABASE_URL) {
    errs.push('DATABASE_URL is required in production');
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    errs.push('TURNSTILE_SECRET_KEY is required in production');
  }

  // Better Auth config guards (T7.3.3 / Z-23: supports versioned BETTER_AUTH_SECRETS)
  if (env.BETTER_AUTH_SECRETS) {
    const entries = env.BETTER_AUTH_SECRETS.split(',').map((s) => s.trim()).filter(Boolean);
    if (entries.length === 0) {
      errs.push('BETTER_AUTH_SECRETS is present but empty');
    } else {
      for (const entry of entries) {
        const colonIdx = entry.indexOf(':');
        if (colonIdx === -1) {
          errs.push(`Invalid BETTER_AUTH_SECRETS entry: "${entry}". Expected format: "<version>:<secret>"`);
          continue;
        }
        const v = parseInt(entry.slice(0, colonIdx), 10);
        if (!Number.isInteger(v) || v < 0) {
          errs.push(`Invalid version in BETTER_AUTH_SECRETS: "${entry.slice(0, colonIdx)}". Must be non-negative integer`);
        }
        const secretVal = entry.slice(colonIdx + 1).trim();
        if (!secretVal || secretVal.length < 16) {
          errs.push(`BETTER_AUTH_SECRETS entry for version ${v} must be at least 16 characters in production`);
        }
      }
    }
  } else if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET === 'secret' || env.BETTER_AUTH_SECRET.length < 16) {
    errs.push('BETTER_AUTH_SECRET (or versioned BETTER_AUTH_SECRETS) is required, must not be default, and must be at least 16 characters in production');
  }

  if (!env.BETTER_AUTH_URL || !env.BETTER_AUTH_URL.startsWith('https://')) {
    errs.push(`BETTER_AUTH_URL must start with https:// in production (found ${JSON.stringify(env.BETTER_AUTH_URL)})`);
  }

  // Mailer: no silent fallback to on-disk outbox in production.
  if (!env.RESEND_API_KEY) {
    errs.push('RESEND_API_KEY is required in production (mailer would silently write to ./data/outbox)');
  } else if (!/^re_[A-Za-z0-9_]{8,}$/.test(env.RESEND_API_KEY)) {
    errs.push('RESEND_API_KEY does not look like a Resend key (re_...)');
  }

  const m = (env.MAIL_FROM ?? '').match(MAIL_FROM_RE);
  if (!m) {
    errs.push('MAIL_FROM is required in production ("Name <user@verified-domain>")');
  } else if (/(^|\.)resend\.dev$/i.test(m[2])) {
    errs.push(`MAIL_FROM uses ${m[2]} (Resend test domain) — use your verified domain`);
  }

  if (!env.FORMS_TO) {
    errs.push('FORMS_TO is required in production (form routing recipient)');
  }

  // Preview signing key (Roadmap R0.3 / Z-01)
  if (!env.PREVIEW_SIGNING_KEY || env.PREVIEW_SIGNING_KEY === 'dev-insecure-secret-twinmos-platform' || env.PREVIEW_SIGNING_KEY.length < 32) {
    errs.push('PREVIEW_SIGNING_KEY is required in production, must not be default, and must be at least 32 characters');
  }

  // Revalidation secret (Roadmap R0.3 / Z-01, Z-12)
  if (!env.REVALIDATE_SECRET || env.REVALIDATE_SECRET === 'dev-revalidate-secret' || env.REVALIDATE_SECRET.length < 32) {
    errs.push('REVALIDATE_SECRET is required in production, must not be default, and must be at least 32 characters');
  }

  // Internal Web URL for edge delivery and cache invalidation (Roadmap MS2.4 / T2.4.7 / S-08)
  if (!env.INTERNAL_WEB_URL) {
    errs.push('INTERNAL_WEB_URL is required in production');
  }

  // Staff MFA must never be disabled in production (Roadmap MS2.4 / T2.4.7 / S-08, S-13)
  if (env.ENFORCE_MFA === '0') {
    errs.push('ENFORCE_MFA must not be disabled (0) in production');
  }

  // Zero-trust audit 2026-10-28
  if (env.FORCE_PGLITE === '1') {
    errs.push('FORCE_PGLITE must not be set in production (embedded PGlite is dev/test only)');
  }
  // Links in staff/partner e-mails are built from these; a missing value used to
  // fall back to http://localhost:5173, which Better Auth rejects (ZT-013).
  for (const k of ['PUBLIC_SITE_URL', 'ADMIN_PUBLIC_URL'] as const) {
    if (env[k] && !env[k]!.startsWith('https://')) errs.push(`${k} must start with https:// in production`);
  }
  for (const k of ['BETTER_AUTH_URL', 'PUBLIC_SITE_URL', 'ADMIN_PUBLIC_URL'] as const) {
    if (env[k] && /^https:\/\/(localhost|127\.|0\.0\.0\.0|\[::1\])/i.test(env[k]!)) errs.push(`${k} must be the public site address, not ${env[k]}`);
  }

  // Cloudflare's published Turnstile test secrets always pass (or always fail),
  // and RESEND_BASE_URL redirects all mail to a mock: both are for the zero-trust
  // lab only, which acknowledges them explicitly (ZT-080). A real deployment that
  // copied a lab or staging .env refuses to start.
  const lab = env.TWINMOS_LAB_TEST_INTEGRATIONS === 'acknowledged-not-for-production';
  if (env.TURNSTILE_SECRET_KEY && /^[123]x0{30,}AA$/.test(env.TURNSTILE_SECRET_KEY) && !lab) {
    errs.push('TURNSTILE_SECRET_KEY is a Cloudflare test key (captcha always passes) — use the real secret');
  }
  if (env.RESEND_BASE_URL && !lab) {
    errs.push('RESEND_BASE_URL must be unset in production (it redirects every e-mail away from Resend)');
  }

  return errs;
}

export function assertBootConfig(env: Record<string, string | undefined> = process.env): void {
  const errs = bootConfigErrors(env);
  if (errs.length) {
    console.error('[boot] refusing to start in production:\n  - ' + errs.join('\n  - '));
    process.exit(1);
  }
}
