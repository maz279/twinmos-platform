// content_part3.js — Sections 6-10: Daily ops, deployment, testing, troubleshooting, appendices
const H = require("./helpers.js");
const { h1, h2, h3, p, bold, mono, plain, bullets, steps, codeBlock, dataTable, figure, callout, spacer } = H;

const part3 = [];

// ================= 6. DAILY OPERATIONS =================
part3.push(h1("6. Daily Operations Runbook (Webmaster)"));
part3.push(h2("6.1 Morning Check (10 minutes)"));
part3.push(...steps([
  [plain("Open the "), bold("Dashboard"), plain(". Anything in the SLA risk queue? Open and triage those leads first.")],
  [plain("Check the leads analytics strip: is the waiting-for-first-reply count growing? Answer new leads with "), bold("Reply to customer"), plain(" — the five-minute rule is the single biggest conversion lever.")],
  [plain("Glance at RMA board columns for submitted cases; run the serial check on any case whose card shows a serial.")],
  [plain("Confirm media alt-text compliance is at 100% (dashboard widget links straight to the filtered media list).")],
  [plain("Review the Content Studio Review Queue if authors submitted overnight.")],
]));
part3.push(h2("6.2 Publishing Content to the Live Site"));
part3.push(p("Publish inside the modules as described in \u00A75; production builds export content automatically. If you operate a long-running staging or dev server and need changes visible immediately without a rebuild, re-run the exporter (see \u00A77.6) and the merge layer picks them up on page refresh."));
part3.push(h2("6.3 Weekly Rhythm"));
part3.push(...bullets([
  "Careers: close expiring postings (the list shows red closed-Xd-ago / amber closes-in-Xd warnings); review applications and reply.",
  "Serials: run the anomaly scan; investigate flagged serials with the drill-down; email the ops alert if the list is non-empty.",
  "Partners: review pending portal organizations; refresh the where-to-buy directory from channel updates (CSV import).",
  "Media: clear missing-alt items; flag low-resolution masters for replacement.",
  "Users: review the security strip — MFA coverage, active session count, suspended accounts — and offboard leavers (revoke sessions, then suspend).",
]));
part3.push(h2("6.4 Access Management Rules"));
part3.push(...bullets([
  "Every staff member gets an individual account with the minimum role that lets them work; shared logins are prohibited.",
  "TOTP two-factor is offered at sign-in and enforced by policy — assist enrollment rather than exempting accounts.",
  "Role changes are audited; the system always preserves at least one active super_admin, so demote carefully.",
  "On termination: revoke sessions first (immediate logout), then suspend with reason. The audit trail remains readable.",
]));

// ================= 7. DEPLOYMENT =================
part3.push(h1("7. Cloud Deployment Guide (Software Engineer)"));
part3.push(p([plain("The codebase is production-ready and this runbook mirrors "), mono("docs/runbooks/DEPLOY.md"), plain(" in the repository, which remains the source of record. The verified topology is: "), bold("Cloudflare (TLS, WAF) \u2192 VM nginx \u2192 static web + admin bundles on disk, /api/ reverse-proxied to a Node systemd service \u2192 PostgreSQL 16"), plain(". One origin keeps Better Auth cookies same-site.")]));
part3.push(h2("7.1 Production Topology and Sizing"));
part3.push(dataTable(
  ["Component", "Recommendation", "Notes"],
  [
    ["VM", "2 vCPU / 4 GB RAM / 40 GB SSD (web+api+db on one box to start)", "Static assets are CDN-cached; the API is the only compute"],
    ["Node.js", "v24 LTS (nodesource)", "TypeScript executed natively — no build step for the API"],
    ["PostgreSQL", "16 (pgdg)", "Enable WAL archiving for the 15-minute RPO (see DR.md)"],
    ["nginx", "Stable branch", "Config shipped: deploy/nginx/twinmos.conf"],
    ["Edge", "Cloudflare proxied", "TLS full-strict; Brotli; WAF; origin cert on nginx"],
  ],
  { widths: [1700, 3300, 4200] }
));
part3.push(spacer());
part3.push(h2("7.2 Step 1 — Provision and Prepare the VM (once)"));
part3.push(codeBlock([
  "# user + directories",
  "sudo useradd -r -s /usr/sbin/nologin twinmos",
  "sudo mkdir -p /opt/twinmos/api /var/www/twinmos/web /var/www/twinmos/admin \\",
  "             /var/lib/twinmos/partner-files /var/lib/twinmos/media \\",
  "             /etc/twinmos /var/backups/twinmos",
  "sudo chown -R twinmos:twinmos /var/lib/twinmos",
  "",
  "# node 24 + postgres 16 + nginx (nodesource / pgdg / distro)",
]));
part3.push(h2("7.3 Step 2 — Database"));
part3.push(codeBlock([
  "sudo -u postgres createuser twinmos",
  "sudo -u postgres createdb twinmos -O twinmos",
  "# Enable WAL archiving (archive_command -> B2/backup volume) — see docs/runbooks/DR.md",
]));
part3.push(h2("7.4 Step 3 — API Service"));
part3.push(...steps([
  [plain("Ship the repository (git clone or rsync) to the VM, then install API dependencies: "), mono("cd apps/api && npm ci --omit=dev"), plain(".")],
  [plain("Create the secrets file from the template — "), mono("sudo $EDITOR /etc/twinmos/api.env"), plain(" copying "), mono(".env.production.example"), plain(", chmod 600. Fill every value: DATABASE_URL, BETTER_AUTH_URL=https://www.twinmos.com, BETTER_AUTH_SECRET, ALLOWED_ORIGIN, TRUST_PROXY=1, RESEND_API_KEY, MAIL_FROM, FORMS_TO, TURNSTILE_SECRET_KEY, upload dirs. All secrets come from the secret store — never commit filled copies.")],
  [plain("Migrate and seed: "), mono("export $(cat /etc/twinmos/api.env | xargs) && npm run db:migrate && npm run db:seed"), plain(" (seed on first boot only; rotate the seeded admin password at first sign-in).")],
  [plain("Install and start the service: "), mono("sudo cp deploy/systemd/twinmos-api.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now twinmos-api"), plain(".")],
  [plain("Verify: "), mono("curl -s http://127.0.0.1:8787/api/v1/health"), plain(" must return "), mono('{\"status\":\"ok\"}'), plain(".")],
]));
part3.push(callout("warn", "The systemd unit ships hardened (NoNewPrivileges, ProtectSystem=strict, ReadWritePaths limited to /var/lib/twinmos and the api data dir). Do not weaken these directives to work around permission errors — fix the path ownership instead."));
part3.push(h2("7.5 Step 4 — Web + Admin Static Bundles"));
part3.push(...steps([
  [plain("Build on a clean clone. The web build bakes environment into HTML: "), mono("PUBLIC_API_URL"), plain(" must stay "), bold("unset"), plain(" (empty = same-origin /api/v1 behind nginx, exactly correct). Only the Turnstile site key needs setting — on Linux: "), mono("PUBLIC_TURNSTILE_SITE_KEY=0xXXXX npm run build"), plain("; or place it in apps/web/.env (gitignored). A guard aborts the production build if a stray apps/web/.env is present.")],
]));
part3.push(callout("danger", "Never assign PUBLIC_API_URL=/api/v1 as a shell variable on Git Bash / Windows — MSYS rewrites the leading slash into a Windows path (C:/Program Files/Git/api/v1) which gets baked into the HTML. Build from a clean clone or use apps/web/.env."));
part3.push(...steps([
  [mono("cd apps/web && npm ci && npm run build"), plain("  (the prebuild step syncs vendored assets and runs the CMS content export automatically)")],
  [mono("cd ../admin && npm ci && npm run build")],
  [mono("sudo rsync -a --delete apps/web/dist/  /var/www/twinmos/web/"), plain(" and "), mono("sudo rsync -a --delete apps/admin/dist/ /var/www/twinmos/admin/")],
]));
part3.push(h2("7.6 Content Export and Rebuild Cycle"));
part3.push(p([plain("Published content reaches the static site through "), mono("cms-content.js"), plain(", regenerated by the web build's prebuild. To refresh content without a full redeploy, re-run the exporter and re-sync: ")]));
part3.push(codeBlock([
  "cd /opt/twinmos/repo",
  "PGLITE_DATA='' DATABASE_URL=$DATABASE_URL node --experimental-strip-types \\",
  "     --no-warnings tooling/export-content.mjs   # regenerates cms-content.js",
  "sudo rsync -a apps/web/public/assets/js/cms-content.js /var/www/twinmos/web/assets/js/",
]));
part3.push(p("(In development the same command runs with PGLITE_DATA pointing at the embedded database and the API stopped — single-writer discipline; the command is documented in the repo README.)"));
part3.push(h2("7.7 Step 5 — nginx + Cloudflare"));
part3.push(...steps([
  [mono("sudo cp deploy/nginx/twinmos.conf /etc/nginx/sites-available/twinmos.conf"), plain(" and symlink into sites-enabled; then "), mono("sudo nginx -t && sudo systemctl reload nginx"), plain(".")],
  [plain("Point Cloudflare DNS at the VM (proxied). Edge settings: TLS Full (strict), Brotli, and an origin certificate installed at "), mono("/etc/nginx/certs/twinmos.pem"), plain(".")],
  [plain("Confirm "), mono("TRUST_PROXY=1"), plain(" is set in the api env (it ships in the template) so rate limiting reads cf-connecting-ip instead of the proxy address.")],
]));
part3.push(p("The shipped nginx config handles: one-origin routing (static web, /admin SPA with immutable hashed assets, /api/ proxy), the full security-header set, gzip, a 30 r/s coarse API guard, a 30 MB body cap, and the branded 404 page."));
part3.push(h2("7.8 Step 6 — Backups and DR"));
part3.push(codeBlock([
  "sudo cp deploy/backup.sh /opt/twinmos/ && sudo chmod 700 /opt/twinmos/backup.sh",
  "# cron (root): 15 2 * * * BACKUP_ROOT=/var/backups/twinmos DATABASE_URL=... /opt/twinmos/backup.sh",
  "# restore: deploy/restore.sh  (production restore asks for the stamp; --drill restores to a throwaway DB)",
]));
part3.push(p("Targets: RTO 4 hours / RPO 15 minutes. DR.md documents the quarterly drill procedure; a local drill equivalent (tooling/dr-drill.mjs) is already recorded green in the phase evidence."));
part3.push(h2("7.9 Step 7 — Cutover Checklist"));
part3.push(...bullets([
  [mono("curl https://www.twinmos.com/api/v1/health"), plain(" returns ok.")],
  "Sign in to /admin with the seeded admin and rotate the password immediately; create real staff accounts with MFA.",
  "Turnstile live on both sides (site key baked into the web build; secret in api.env); remove the dev bypass flag from the environment entirely.",
  "Resend live: submit the quote form and confirm the auto-reply arrives.",
  "Rate limits verified: rapid curl triggers 429 with Retry-After.",
  "Partner portal E2E on production (sign-in \u2192 gated download).",
  "SN-check on production with a registry serial \u2192 genuine verdict.",
  "First backup.sh run completed and one restore.sh --drill recorded in DR.md.",
  "Monitoring: uptime check on /health; log shipping for twinmos-api.",
  "ZAP baseline + load test re-run against production, recorded in the phase evidence.",
]));
part3.push(h2("7.10 Rollback"));
part3.push(...bullets([
  "Static bundles: keep the last three dated dist copies on the VM; redeploy the previous one.",
  "API: git checkout <previous tag> and restart twinmos-api.",
  [bold("Database migrations are forward-only"), plain(" — if a migration must be undone, restore from backup with restore.sh.")],
]));
part3.push(h2("7.11 Post-Deployment Monitoring"));
part3.push(...bullets([
  "Watch /api/v1/health (uptime alert) and systemd status for restarts (Restart=always with 3s backoff is configured).",
  "Watch the audit log volume — a sudden drop suggests submissions are failing upstream.",
  "Review Cloudflare analytics for WAF blocks on /api/ (tune rules if legitimate traffic is challenged).",
  "Hypercare: the repository's HYPERCARE.md runbook defines a 14-day window with daily checks and exit criteria.",
]));

// ================= 8. TESTING & VERIFICATION =================
part3.push(h1("8. Testing and Quality Gates"));
part3.push(h2("8.1 Automated Suites"));
part3.push(dataTable(
  ["Gate", "What it covers", "Result at handover"],
  [
    ["Vitest (26 suites)", "253 end-to-end + unit tests: auth/MFA lifecycle, RBAC races, CMS workflow, catalog, leads, RMA, directory, serials, media, settings, security headers", "253/253 passed"],
    ["Typecheck", "TypeScript across api, admin, db, shared", "Clean"],
    ["Local OWASP-equivalent scan", "tooling/owasp-local-scan.mjs — 14 check classes, 35 requests: headers, CORS, authz, traversal, SQLi/XSS reflection, verb tampering, rate limits, RFC 9457", "NO FINDINGS"],
    ["Parity gates (CI)", "Playwright screenshot-diff vs the audited prototype", "Passing (documented in phase evidence)"],
    ["Accessibility", "axe-core sweep with zero criticals", "Passing"],
  ],
  { widths: [2100, 5100, 1800] }
));
part3.push(spacer());
part3.push(h2("8.2 Running the Gates"));
part3.push(codeBlock([
  "cd twinmso_codebase",
  "npm run test          # full suite (isolated temp databases per suite)",
  "npm run typecheck     # tsc across all packages",
  "node tooling/owasp-local-scan.mjs --target https://staging.twinmos.com",
]));
part3.push(callout("note", "The test suites use their own embedded databases (per-suite temp dirs) and are safe to run while the dev stack is up. The DR drill tool rebuilds a throwaway database from migrations + seed and probes a booted API — it is the fastest full-stack smoke test available."));

// ================= 9. TROUBLESHOOTING =================
part3.push(h1("9. Troubleshooting"));
part3.push(h2("9.1 Common Issues and Fixes"));
part3.push(dataTable(
  ["Symptom", "Likely cause", "Fix"],
  [
    ["Admin login rejected with 403 (not 401)", "Auth origin not trusted — BETTER_AUTH_TRUSTED_ORIGINS missing the admin surface origin", "Add the origin (e.g. http://localhost:5173) to .env and restart the API"],
    ["Public forms / SN-check show unavailable (dev)", "CORS: ALLOWED_ORIGIN unset so the browser blocks cross-origin API calls from :4321", "Set ALLOWED_ORIGIN=http://localhost:4321 in the dev .env; restart"],
    ["API boots then queries fail with WASM abort (dev)", "PGlite corrupted by concurrent access or force-kill", "Restore from the data backup or npm run db:reset (dev data is reproducible); never run DB-writing tooling while the API is live"],
    ["Health says ok but content queries 500", "A migration was journaled but not applied (known embedded-migrator trap)", "Verify new columns in information_schema; apply the migration SQL directly if missing (forward-only, idempotent statements)"],
    ["Admin edits don't appear on the site", "Content export not re-run (dev/staging)", "Re-run tooling/export-content.mjs and refresh; production builds export automatically"],
    ["429s from legitimate traffic", "Rate buckets keyed on proxy IP — TRUST_PROXY unset", "Set TRUST_PROXY=1 so cf-connecting-ip is honored"],
    ["Turnstile never renders", "PUBLIC_TURNSTILE_SITE_KEY not baked into the build", "Rebuild the web bundle with the site key (see \u00A77.5)"],
    ["Uploads fail with size errors", "nginx client_max_body_size vs MEDIA/PARTNER caps", "nginx caps at 30 MB; env caps default 10 MB media / 25 MB partner files"],
  ],
  { widths: [2500, 2900, 3600] }
));
part3.push(spacer());
part3.push(h2("9.2 Escalation Path"));
part3.push(...bullets([
  "Check systemd journal for twinmos-api first (journalctl -u twinmos-api -n 200).",
  "Reproduce API issues directly: curl the endpoint on 127.0.0.1:8787 to bypass edge and browser layers.",
  "Consult docs/runbooks/DR.md for data-layer incidents and HYPERCARE.md during the post-launch window.",
  "The audit log answers who changed what; the phase-evidence files document every gate's last green run.",
]));

// ================= 10. APPENDICES =================
part3.push(h1("10. Appendices"));
part3.push(h2("10.1 Appendix A — Environment Variables Reference (Production)"));
part3.push(dataTable(
  ["Variable", "Required", "Purpose"],
  [
    ["NODE_ENV", "Yes", "production — also hard-refuses PGlite and dev bypass flags"],
    ["PORT", "Yes", "API listen port (8787)"],
    ["DATABASE_URL", "Yes", "postgres://user:pass@host:5432/twinmos"],
    ["BETTER_AUTH_URL", "Yes", "Public HTTPS origin; derives Secure cookies"],
    ["BETTER_AUTH_SECRET", "Yes", "From secret store"],
    ["ALLOWED_ORIGIN", "Yes", "CORS origin (same-origin in production)"],
    ["TRUST_PROXY", "Yes", "Trust cf-connecting-ip for rate limiting"],
    ["RESEND_API_KEY / MAIL_FROM / FORMS_TO", "Yes", "Transactional mail and routing (per-type overrides: RMA_TO, QUOTE_TO\u2026)"],
    ["TURNSTILE_SECRET_KEY", "Yes", "Server-side captcha verification"],
    ["PUBLIC_TURNSTILE_SITE_KEY", "Build-time", "Baked into the web bundle to render the widget"],
    ["MEDIA_DIR / PARTNER_FILES_DIR", "Yes", "Upload storage paths"],
    ["MEDIA_MAX_BYTES / PARTNER_MAX_BYTES", "No", "Upload caps (defaults 10 MB / 25 MB)"],
    ["AUDIT_RETENTION_DAYS", "No", "Audit retention (default 365)"],
  ],
  { widths: [3000, 1200, 4800] }
));
part3.push(spacer());
part3.push(callout("danger", "Never set API_ALLOW_NO_TURNSTILE=1 or API_DEV_AUTOLOGIN=1 in production. The API hard-refuses them under NODE_ENV=production regardless — keep them unset so misconfiguration is impossible."));
part3.push(h2("10.2 Appendix B — API Route Map (Public + Auth + Admin)"));
part3.push(dataTable(
  ["Area", "Routes"],
  [
    ["Public", "POST /forms/:type (15 types) \u00B7 GET /rma/:number \u00B7 POST /sn-check \u00B7 GET /i18n/:locale \u00B7 GET /preview/:token \u00B7 GET /media/:id/file (images) \u00B7 GET /health"],
    ["Auth", "POST /auth/sign-in/email \u00B7 /auth/sign-out \u00B7 two-factor verify \u00B7 GET /auth/get-session (Better Auth mount)"],
    ["Partner portal", "GET /partner/me \u00B7 GET /partner/assets \u00B7 GET /partner/assets/:id/download (member-gated)"],
    ["Admin content", "CRUD /admin/content/:entity \u00B7 transitions \u00B7 revisions \u00B7 comments \u00B7 preview tokens"],
    ["Admin catalog", "CRUD /admin/products (+variants, import/export CSV) \u00B7 /admin/compatibility (+import) \u00B7 /admin/taxonomy"],
    ["Admin support", "/admin/submissions (+reply, notes, CSV) \u00B7 /admin/rma (+transition, assign, reply, serial-check)"],
    ["Admin channel", "/admin/partner-orgs (+members, assets, delete) \u00B7 /admin/distributors (+import, export) \u00B7 /admin/marketplace-listings"],
    ["Admin brand protection", "/admin/serials (+analytics, :serial drill-down/delete, import, export, anomalies) \u00B7 /admin/sn-checks"],
    ["Admin careers", "/admin/job-postings \u00B7 /admin/job-applications (+reply) \u00B7 /admin/job-analytics"],
    ["Admin media", "/admin/media (+analytics, :id/usage, variants) \u00B7 /admin/media-folders"],
    ["Admin governance", "/admin/users (+invite, role, ban, revoke-sessions, :id/activity, analytics) \u00B7 /admin/audit \u00B7 /admin/settings \u00B7 /admin/redirects \u00B7 /admin/locales \u00B7 /admin/analytics/* \u00B7 /admin/staff-options"],
  ],
  { widths: [2100, 6900] }
));
part3.push(spacer());
part3.push(h2("10.3 Appendix C — Role Permission Matrix"));
part3.push(dataTable(
  ["Capability", "Viewer", "Author", "Editor", "Admin", "Super Admin"],
  [
    ["Read all modules", "\u2713", "\u2713", "\u2713", "\u2713", "\u2713"],
    ["Write content drafts", "\u2014", "\u2713", "\u2713", "\u2713", "\u2713"],
    ["Publish / approve", "\u2014", "\u2014", "\u2713", "\u2713", "\u2713"],
    ["Catalog / directory / serials CRUD", "\u2014", "\u2014", "\u2713", "\u2713", "\u2713"],
    ["Partner org lifecycle", "\u2014", "\u2014", "\u2014", "\u2713", "\u2713"],
    ["User management / locale activation", "\u2014", "\u2014", "\u2014", "\u2014", "\u2713"],
    ["Audit log read", "\u2014", "\u2014", "\u2713", "\u2713", "\u2713"],
  ],
  { widths: [3300, 1150, 1150, 1150, 1150, 1300] }
));
part3.push(spacer());
part3.push(h2("10.4 Appendix D — Glossary"));
part3.push(dataTable(
  ["Term", "Definition"],
  [
    ["Bridge (export/merge)", "The build-time pipeline that turns published DB rows into cms-content.js and merges them into the static site"],
    ["DAM", "Digital Asset Management — the media library with variants, folders and usage tracking"],
    ["Deduped append", "Merge-layer behavior: entries are matched by natural key and only genuinely new ones are added"],
    ["PGlite", "Embedded Postgres (WASM) used for dev/test; refused in production"],
    ["QVL", "Qualified Vendor List — the validated-device compatibility matrix"],
    ["SLA risk queue", "Dashboard list of open leads past (or near) their first-response deadline"],
    ["SN-check", "Public anti-counterfeit serial verification; also the module that manages the registry"],
    ["Speed-to-lead", "Time from lead arrival to first staff reply — the primary conversion KPI"],
    ["Stakeholders: Webmaster / Engineer", "Content-and-support operator vs deploy-and-operate engineer — the two audiences of this manual"],
  ],
  { widths: [2800, 6200] }
));
part3.push(spacer());
part3.push(h2("10.5 Appendix E — File Manifest (Deployment-Critical)"));
part3.push(dataTable(
  ["Path", "Purpose"],
  [
    ["deploy/nginx/twinmos.conf", "One-origin edge config: static web, admin SPA, /api proxy, headers, caching"],
    ["deploy/systemd/twinmos-api.service", "Hardened service unit with EnvironmentFile"],
    ["deploy/backup.sh / restore.sh", "Nightly checksummed backups with rotation; stamped restore and --drill"],
    [".env.production.example", "Every production variable documented; secrets only from the store"],
    ["apps/api/scripts/{migrate,seed,reset}.ts", "Database lifecycle scripts"],
    ["tooling/export-content.mjs", "The CMS export bridge (regenerates cms-content.js)"],
    ["tooling/owasp-local-scan.mjs", "Executable ZAP-baseline equivalent (14 check classes)"],
    ["tooling/dr-drill.mjs", "Full-stack DR drill: rebuild, verify counts, boot, probe"],
    ["docs/runbooks/{DEPLOY,DR,HYPERCARE}.md", "Operational runbooks of record"],
  ],
  { widths: [3900, 5100] }
));

module.exports = part3;
