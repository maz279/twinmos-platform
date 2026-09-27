// Starts the API in dev mode with the full P5 environment (log goes to
// ../../_p1/api.log via the caller; this file only configures env + boots).
process.env.API_ALLOW_NO_TURNSTILE ??= '1';
process.env.FORMS_TO ??= 'support@twinmos.dev';
process.env.MAIL_OUTBOX_DIR ??= './data/outbox';
process.env.MEDIA_DIR ??= './data/media';
process.env.PARTNER_FILES_DIR ??= './data/partner-files';
process.env.ALLOWED_ORIGIN ??= 'http://localhost:4321,http://localhost:5173,http://localhost:5174';
process.env.BETTER_AUTH_URL ??= 'http://localhost:8787';
process.env.BETTER_AUTH_TRUSTED_ORIGINS ??= 'http://localhost:5173,http://localhost:5174,http://localhost:4321';
await import('../src/index.ts');
