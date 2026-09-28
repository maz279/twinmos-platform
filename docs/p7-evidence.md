# P7 Evidence — Hardening & Launch Readiness

**Date:** 2026-09-28 · **Scope (master plan §3 P7):** OWASP-class security hardening, WCAG 2.2 AA audit, load test, DR drill + runbooks, production/deployment artifacts. **Exit:** all local gates green; infrastructure gates (ZAP baseline, full-scale load, DR drill execution) run on the staging VM per the runbooks before cutover.

## 1. Security hardening (code, tested — `apps/api/test/p7-security.e2e.test.ts`, 11 tests; suite **104/104**)

| Hardening | What shipped |
|---|---|
| Security headers (every response) | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo/payment off), CSP `default-src 'none'; frame-ancestors 'none'` (API is JSON; kills any future HTML echo + clickjacking), `Strict-Transport-Security` when `TRUST_PROXY=1`/production. Tests assert on success AND error responses. |
| Rate-limit IP spoofing | `clientIp()` policy: forwarded headers (`cf-connecting-ip`/`x-forwarded-for`) trusted **only** with `TRUST_PROXY=1` (dev/test/behind-Cloudflare); production without the flag falls back to the **socket address** — a client rotating `X-Forwarded-For` can no longer dodge buckets. Unit-tested in all three modes. |
| Audit retention (docs/02 §12-month) | Boot sweep + unref'd daily interval deleting `audit_log` rows older than `AUDIT_RETENTION_DAYS` (365 default); never throws into the request path; disable/override via env. |
| CORS | allow-list unchanged but now TESTED: allowed origin reflected with credentials; evil origin gets no reflection; preflight answers the exact method/header set. |
| Session cookies | Tested: Better Auth session cookie is HttpOnly + SameSite=Lax + Path=/; `Secure` derives from `BETTER_AUTH_URL=https://…` in production (template enforces). |
| Banner leakage | Tested: no `X-Powered-By`/`Server` headers. |

## 2. WCAG 2.2 AA audit (axe-core, all 30 representative pages incl. ar/ru landings + SN-widget expanded state)

**Result:** the violation profile is exactly the P1-documented prototype-inherited residue — `color-contrast` (serious; 14 pages — prototype styling on muted text; the port-only a11y layer already darkens the fixable `.form-note`/`.eyebrow` families and parity gates prove the remaining pixels are byte-identical to the audited prototype, i.e. these ARE the prototype's colors), `heading-order`/`region` (moderate; 26/28 pages), `link-in-text-block` (search page, 1). **No new violation class from any P2–P6 port-only layer** (no aria/keyboard/name issues; locale landings fully CLEAN; SN widget expanded adds nothing). Harness: `tooling/audit-harness/p7-axe-sweep.html`. Further contrast fixes would violate the non-negotiable parity contract — standing a11y-over-parity exception list (docs/p5-evidence.md §5b) applies.

## 3. Load test (autocannon, local dev machine, 50 connections / 10 s)

| Target | Throughput | Avg latency | Notes |
|---|---|---|---|
| `GET /api/v1/health` | **~2,800 rps** | 17 ms | pure API overhead |
| `GET /api/v1/i18n/en` (DB read) | **~810 rps** | 61 ms | PGlite embedded — real Postgres will be faster |
| `POST /api/v1/sn-check` flood | **~3,200 rps of 429** | 15 ms | **rate limiter proof**: exactly 10×200 then 35,094×429, zero errors — the DoS path stays cheap |
| `GET /index.html` (static, dev preview) | ~1,860 rps | 26 ms | nginx/CDN in production |

The 1,000-concurrent checkout-class run (catalog F21.3 wording) is a staging-VM step — this local gate proves the API sustains flood traffic without latency collapse or error leakage.

## 4. OWASP ZAP / pen-test

ZAP is not installable on the dev workstation; the equivalent local gate is the p7-security suite above (headers/CORS/cookies/injection-safe query discipline already enforced by Drizzle-only SQL + RFC 9457 envelopes + the Mimosa sealed scans, latest `5d780438`/`d30ec5db` with the 15 guard-pattern false positives dispositioned in docs/p5-evidence.md §5). **Staging step (pre-cutover):** `zap-baseline.py -t https://staging.twinmos.com` + active scan of `/api/v1/*`; third-party pen-test remains a business decision booked via the launch checklist.

## 5. Deployment & operations artifacts

- `deploy/nginx/twinmos.conf` — one-origin edge: static web + admin SPA + `/api/` proxy, full security-header set for static surfaces, asset caching (immutable), gzip, 30 r/s coarse API guard, 30 MB body cap.
- `deploy/systemd/twinmos-api.service` — hardened unit (NoNewPrivileges, ProtectSystem=strict, ReadWritePaths only for data).
- `deploy/backup.sh` / `deploy/restore.sh` — nightly checksummed fulls (db -Fc + files) with rotation + B2 sync; restore requires stamp confirmation; `--drill` restores to a throwaway DB.
- `.env.production.example` — every production env var documented; secrets only from the store.
- Runbooks: `docs/runbooks/DEPLOY.md` (VM prep → services → bundles → Cloudflare → **cutover checklist** → rollback), `DR.md` (RTO 4h/RPO 15min architecture facts, quarterly drill procedure + incident quick-reference + drill log), `HYPERCARE.md` (14-day window, daily checks, escalation, exit criteria, incident log).

## 6. Remaining before production cutover (staging-VM gates — by design, per build→test→deploy)

1. Provision staging VM + real Postgres; run DEPLOY.md steps 0–4 there.
2. ZAP baseline + active scan against staging (§4).
3. 1,000-concurrent load run + first `restore.sh --drill` recorded in DR.md.
4. Cutover checklist (DEPLOY.md §6) executed on production.

All code-level P7 gates are green locally: suite **104/104** (11 new security tests), typecheck clean, parity untouched (no web pixels changed), worktree clean after commit.


## 7. Check-and-recheck audit iteration (2026-09-28)

1. **Live re-verification** — all P7 deliverables re-checked against the running system: 5 security-header families live on the API, runbook scripts present and `bash -n` clean, deploy artifacts intact, axe-sweep harness committed.
2. **`tooling/owasp-local-scan.mjs`** — an executable ZAP-baseline-equivalent (ZAP itself is not installable on the dev box): 14 check classes × 35 requests — headers on all public paths, CORS-reflection, authz on 6 admin/partner routes unauthenticated, path traversal on file-serving routes, SQLi strings (no reflection/5xx), XSS payload (not reflected), malformed JSON, verb tampering, rate-limit engagement, oversized bodies, RFC 9457 envelopes. **NO FINDINGS.** Host policy: http/https only; refuses loopback/private/resolved-private targets unless `--allow-private` is passed explicitly (refusal verified).
3. **DR drill executed locally** — `tooling/dr-drill.mjs` (dev-stack equivalent of `restore.sh --drill`): rebuilds a throwaway database from the declarative backup (migrations 5.1s + seed 2.3s + corpus 2.4s), runs the verification counts (1 user / 2 products / **395 articles** / 2 demo leads / 1 partner org — all as expected), boots the full API and probes health/i18n/authz/sn-check. **PASS in 11.0s** (RTO budget 4h). Result recorded in the DR.md drill log; two script bugs found and fixed on the way (Windows `pathToFileURL` imports; PGlite single-process handle needed re-opening after subprocess writes).
4. **Parity spot (index + quote @390)** — quote **99.57 PASS**. index measured 84.95 stably; the controls disprove any regression: **build-today vs build-this-morning = 100.00** (byte-identical rendering) while **prototype-today vs prototype-this-morning = 85.50** (the page's un-guarded Ken-Burns hero animation is phase-nondeterministic ACROSS capture sessions — within-session A-vs-A = 99.93). The 84.95 is therefore prototype self-nondeterminism under the documented parity protocol, not a build change.
5. Full gates re-run: suite **104/104**, typecheck clean, admin + web builds green.
