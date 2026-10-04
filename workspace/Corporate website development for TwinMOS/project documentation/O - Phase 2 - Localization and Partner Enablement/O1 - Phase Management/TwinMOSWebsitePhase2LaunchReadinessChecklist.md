# Phase 2 Launch Readiness Checklist

**Document Reference:** TWN-P2-LAUNCH-READY-2027-001  
**Project:** TwinMOS Technologies Corporate Website  
**Engagement:** Unisoft Engineering  
**Phase:** Phase 2 — Localization and Partner Enablement  
**Version:** 1.0  
**Status:** Draft — To be executed April 14–25, 2027  
**Author:** Unisoft Engineering  
**Last Updated:** 2027-01-05  

**Target Launch Date:** April 25, 2027 (End of Month 9)  
**Go/No-Go Review Meeting:** April 22, 2027 (10:00 UAE time)  
**Hypercare Window:** April 25 – May 9, 2027 (Weeks 35–36)  

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Phase 2 Kickoff Document | TWN-P2-KICKOFF-2027-001 |
| Partner Portal Spec | TWN-P2-PARTNER-2027-001 |
| RMA Workflow Spec | TWN-P2-RMA-2027-001 |
| Anti-Counterfeit Spec | TWN-P2-ANTICOUNTERFEIT-2027-001 |
| Compatibility Finder Spec | TWN-P2-FINDER-2027-001 |
| QVL Ingest Spec | TWN-P2-QVL-INGEST-2027-001 |
| Watermarked PDF Spec | TWN-P2-PDF-2027-001 |
| RGB Visualizer Spec | TWN-P2-RGB-VIZ-2027-001 |
| Build Submission Moderation Spec | TWN-P2-BUILD-MOD-2027-001 |
| Tech Stack Specification | TwinMOS_Website_Technology_Stack.md v1.1 |

---

## How to Use This Document

This checklist is the **definitive gate document** for Phase 2 launch. Every item must be verified before the Go/No-Go meeting on April 22, 2027. Items are grouped into domains. Each item carries:

- **Owner** — the role responsible for completing verification
- **Verifier** — the role that confirms completion (may differ from owner)
- **Method** — how to verify (test, review, screenshot, sign-off, etc.)
- **Status** — `[ ]` open → `[X]` passed → `[!]` blocked (requires escalation)
- **Blocker** — whether this item is a **HARD BLOCKER** (launch cannot proceed until resolved) or **ADVISORY** (risk accepted in writing if not resolved)

**HARD BLOCKER items must be 100% green before launch is approved.**  
ADVISORY items may be accepted-at-risk by the Project Sponsor in writing at the Go/No-Go meeting.

---

## Checklist Domains

1. [Infrastructure and Environment](#1-infrastructure-and-environment)
2. [Security and Compliance](#2-security-and-compliance)
3. [Technical — Core Platform](#3-technical--core-platform)
4. [Technical — Partner Portal](#4-technical--partner-portal)
5. [Technical — Anti-Counterfeit System](#5-technical--anti-counterfeit-system)
6. [Technical — RMA Workflow](#6-technical--rma-workflow)
7. [Technical — Compatibility Finder and QVL](#7-technical--compatibility-finder-and-qvl)
8. [Technical — Watermarked PDF System](#8-technical--watermarked-pdf-system)
9. [Technical — RGB Visualizer](#9-technical--rgb-visualizer)
10. [Technical — Build Gallery and Moderation](#10-technical--build-gallery-and-moderation)
11. [Localization and Content](#11-localization-and-content)
12. [Legal and Regulatory](#12-legal-and-regulatory)
13. [Partner Operations](#13-partner-operations)
14. [Marketing and Communications](#14-marketing-and-communications)
15. [Monitoring and Alerting](#15-monitoring-and-alerting)
16. [Final Sign-Off](#16-final-sign-off)

---

## 1. Infrastructure and Environment

### 1.1 Hetzner Server Upgrade

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| INF-01 | Hetzner server upgraded from CX32 to CX42 (4 vCPU, 16GB RAM) | Dev B | IT Lead | Hetzner console screenshot showing CX42 instance | HARD | `[ ]` |
| INF-02 | Coolify v4 deployed and functional on new server | Dev B | Dev A | Coolify dashboard accessible; all services showing "Running" | HARD | `[ ]` |
| INF-03 | PostgreSQL 16 migrated to CX42; Phase 1 data intact | Dev B | Dev B | `pg_dump` + `pg_restore` checksum verified; record count match | HARD | `[ ]` |
| INF-04 | Redis 7.x deployed via Coolify; accessible from Strapi and Astro | Dev B | Dev A | `redis-cli ping` → `PONG`; cache hit observed in Strapi logs | HARD | `[ ]` |
| INF-05 | Backblaze B2 bucket policies updated for Phase 2 (partner-pdfs, build-submissions) | Dev B | Dev B | B2 console showing two new buckets with correct lifecycle rules | HARD | `[ ]` |
| INF-06 | Cloudflare Pages: Phase 2 build succeeds in < 5 minutes | Dev A | Dev A | CI logs showing build time | ADVISORY | `[ ]` |
| INF-07 | DNS: all Phase 2 subdomains and locale paths resolve correctly | Dev B | Dev A | Manual browser check + `dig` / `nslookup` for each locale | HARD | `[ ]` |
| INF-08 | Server disk utilisation < 60% after deployment | Dev B | IT Lead | `df -h` output; alert threshold documented | ADVISORY | `[ ]` |

### 1.2 PDF Service Container

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| INF-09 | PDF service container (Puppeteer 21.x + pdf-lib 1.17.x) deployed and healthy | Dev B | Dev B | `GET /pdf-service/health` → 200; container logs clean | HARD | `[ ]` |
| INF-10 | PDF service accessible from Strapi via internal HTTP call | Dev B | Dev A | Test PDF generation endpoint returns valid PDF in < 8s | HARD | `[ ]` |
| INF-11 | PDF container resource limits set (CPU: 1 core, Memory: 1GB) | Dev B | Dev B | Coolify resource config screenshot | ADVISORY | `[ ]` |

---

## 2. Security and Compliance

### 2.1 Security Scanning

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| SEC-01 | OWASP ZAP automated scan completed on production; no Critical or High findings unresolved | Dev A | IT Lead | ZAP HTML report; all Critical/High items have documented resolution or accepted risk | HARD | `[ ]` |
| SEC-02 | Dependency audit: `npm audit` shows 0 critical vulnerabilities | Dev A | Dev A | `npm audit --audit-level=critical` passes in CI | HARD | `[ ]` |
| SEC-03 | All Coolify secrets (DB passwords, API keys, HMAC pepper, TOTP secrets) stored in Coolify secret manager — NOT in `.env` files in repository | Dev B | IT Lead | Repository search for `.env` committed files; Coolify secrets panel review | HARD | `[ ]` |
| SEC-04 | HMAC-SHA256 pepper for anti-counterfeit system confirmed stored in Coolify secrets only | Dev B | IT Lead | Code review: `process.env.SERIAL_HMAC_PEPPER` references only; no hardcoded value | HARD | `[ ]` |
| SEC-05 | Better Auth session cookie uses `__Host-` prefix; `Secure`, `HttpOnly`, `SameSite=Strict` confirmed | Dev A | Dev A | Browser DevTools → Cookies panel on `/partner/dashboard/`; verify all attributes | HARD | `[ ]` |
| SEC-06 | Cloudflare Turnstile active on: build submission form, serial check form, RMA submission form | Dev A | Dev A | Manual test on each form: submit without Turnstile → blocked | HARD | `[ ]` |
| SEC-07 | CSP headers validated; no `unsafe-eval` or `unsafe-inline` without nonce | Dev A | Dev A | `curl -I https://twinmos.com` response headers; CSP Evaluator tool | ADVISORY | `[ ]` |
| SEC-08 | Rate limiting active on all Phase 2 API endpoints (serial check, build submit, PDF download) | Dev B | Dev A | Manual: submit > rate limit → 429; verify Cloudflare WAF rule | HARD | `[ ]` |
| SEC-09 | TLS certificate renewed and valid for ≥ 60 days beyond launch date | Dev B | IT Lead | SSL Labs test: A+ rating; cert expiry > June 25, 2027 | HARD | `[ ]` |

### 2.2 GDPR / Privacy

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| SEC-10 | Cookie consent banner updated for Phase 2: covers Plausible analytics, Chatwoot chat widget, all 4 locales | Dev A | Legal | Manual review in each locale (EN/AR/BN/HI); consent logs to be tested | HARD | `[ ]` |
| SEC-11 | GDPR data processing agreement (DPA) with Resend reviewed and on file | IT Lead | Legal | Legal sign-off email on file | HARD | `[ ]` |
| SEC-12 | Backblaze B2 DPA reviewed and on file | IT Lead | Legal | Legal sign-off email on file | ADVISORY | `[ ]` |
| SEC-13 | Build submission PII handling compliant: email/full name never returned in public API responses | Dev B | Dev A | API response audit: `GET /api/v1/builds/gallery/{slug}` — no PII fields present | HARD | `[ ]` |

---

## 3. Technical — Core Platform

### 3.1 Phase 2 Deployment

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| CORE-01 | All Phase 2 features deployed to production and stable for ≥ 48 hours before Go/No-Go meeting | Dev A + Dev B | PM | Production deployment timestamp; Sentry error rate < 0.1% over 48h window | HARD | `[ ]` |
| CORE-02 | Astro 5 Phase 2 build: all SSR and SSG routes render without errors | Dev A | Dev A | Cloudflare Pages build log: 0 errors; random sample of 20 routes manually checked | HARD | `[ ]` |
| CORE-03 | Strapi v5 Phase 2 content types deployed: `BuildSubmission`, `RMARequest`, `ValidSerial`, `PartnerAsset`, `QVLEntry` (if applicable) | Dev B | Dev B | Strapi admin panel showing all new content types; migration log clean | HARD | `[ ]` |
| CORE-04 | MeiliSearch Phase 2 indexes created and populated: `build_gallery`, expanded `qvl_entries` | Dev B | Dev A | MeiliSearch dashboard: index stats showing document counts > 0 | HARD | `[ ]` |
| CORE-05 | Redis connection from Strapi stable; cache hit rate > 0 (at least one read verified) | Dev B | Dev B | Redis `INFO stats` keyspace_hits > 0 after 10 minutes of staging traffic replay | ADVISORY | `[ ]` |
| CORE-06 | Lighthouse CI: all Phase 2 key pages score ≥ 90 Performance in EN | Dev A | Dev A | GitHub Actions Lighthouse CI report for all Phase 2 routes | HARD | `[ ]` |
| CORE-07 | Web Vitals: LCP ≤ 2.5s on all Phase 2 pages across EN/AR/BN/HI (measured in Cloudflare RUM or Plausible) | Dev A | Dev A | Plausible Web Vitals dashboard showing p75 LCP ≤ 2.5s | ADVISORY | `[ ]` |
| CORE-08 | Rollback plan documented and tested: staging → production rollback takes < 15 minutes | Dev A + Dev B | IT Lead | Rollback run-through documented; estimated time recorded | HARD | `[ ]` |

### 3.2 Chatwoot Live Chat

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| CORE-09 | Chatwoot 3.x deployed on Hetzner CX42; accessible at internal URL | Dev B | Dev B | Chatwoot admin dashboard accessible; agent login tested | HARD | `[ ]` |
| CORE-10 | Chatwoot widget embedded on website for all 4 locales (EN/AR/BN/HI) | Dev A | Dev A | Manual test: widget appears on each locale homepage; chat initiated | HARD | `[ ]` |
| CORE-11 | Chatwoot agents created for: Technical Support, Partner Support, RMA Support | IT Lead | Marketing | Chatwoot → Agents panel showing three agent accounts | HARD | `[ ]` |
| CORE-12 | Chatwoot multilingual: widget language matches page locale | Dev A | Dev A | AR locale: widget in Arabic; BN locale: widget in Bengali | ADVISORY | `[ ]` |
| CORE-13 | Chatwoot business hours configured; offline message configured for out-of-hours | IT Lead | Marketing | Chatwoot settings panel; tested at off-hours with simulated chat | ADVISORY | `[ ]` |

### 3.3 ERP Integration

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| CORE-14 | ERP sync: one full product master sync cycle completed without errors | Dev B | IT Lead | Sync log showing 0 errors; Strapi product count matches ERP export | ADVISORY | `[ ]` |
| CORE-15 | ERP sync failure alerting: Slack `#twinmos-ops` notified on sync error | Dev B | Dev B | Simulate ERP timeout; verify Slack message received within 5 minutes | ADVISORY | `[ ]` |

---

## 4. Technical — Partner Portal

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| PP-01 | Better Auth v1.x deployed; TOTP MFA plugin active | Dev A | Dev A | Sign-in as distributor test user → TOTP prompt appears; valid TOTP grants access | HARD | `[ ]` |
| PP-02 | Session cookie: `__Host-twinmos-session`, `HttpOnly`, `Secure`, `SameSite=Strict`, 8h expiry, 30-min idle timeout | Dev A | Dev A | Browser DevTools cookie inspection; idle timeout tested by waiting 31 minutes | HARD | `[ ]` |
| PP-03 | RBAC: Distributor (Elite) can access price list; Registered tier cannot | Dev A | Dev A | Log in as each tier; verify `/partner/price-list/` access matches RBAC matrix in TWN-P2-PARTNER-2027-001 | HARD | `[ ]` |
| PP-04 | Session timeout warning at 25 minutes (per URD §34.1 / UR-7.1.4) | Dev A | Dev A | Fast-forward session clock; warning modal appears at 25 min; "Extend" button refreshes session | HARD | `[ ]` |
| PP-05 | TOTP mandatory for Distributor and OEM roles; optional for Reseller and System Builder | Dev A | Dev A | Register each role type; verify TOTP enrollment prompt behaviour per role | HARD | `[ ]` |
| PP-06 | Partner Portal dashboard loads all expected widgets for each partner type | Dev A | Dev A | Log in as Distributor, Reseller, OEM, System Builder — screenshot each dashboard | HARD | `[ ]` |
| PP-07 | Watermarked PDF download: price list download generates per-partner PDF with correct watermark | Dev A + Dev B | Marketing | Log in as Certified Distributor; download price list; verify watermark shows Partner ID, date, session suffix | HARD | `[ ]` |
| PP-08 | Partner portal URL namespace: all authenticated routes under `/partner/`; no 404s on portal navigation | Dev A | Dev A | Automated link check within portal namespace | HARD | `[ ]` |
| PP-09 | End-to-end UAT completed and signed off by TwinMOS Marketing | Marketing + Dev A | Marketing Director | UAT sign-off form (Annex A) completed | HARD | `[ ]` |
| PP-10 | Account lockout after 5 failed login attempts; lockout notification email sent | Dev A | Dev A | Test: submit 5 wrong passwords → locked; check email | HARD | `[ ]` |
| PP-11 | Partner Portal accessible in all 4 launch locales (EN/AR/BN/HI) | Dev A | Dev A | Login to portal with `?locale=ar`; verify UI in RTL Arabic; dashboard renders correctly | ADVISORY | `[ ]` |

---

## 5. Technical — Anti-Counterfeit System

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| AC-01 | Serial ingest pipeline: manufacturing team has uploaded initial serial batch | IT Lead + Manufacturing | Dev B | `valid_serials` collection in Strapi has > 0 records; manufacturing team confirmation email | HARD | `[ ]` |
| AC-02 | Manufacturing team has validated 100 test serials in production (per §17.1 Kickoff) | Manufacturing + Dev B | IT Lead | Validation report: 100 serials verified GENUINE from production environment | HARD | `[ ]` |
| AC-03 | `POST /api/v1/serial/check`: VERIFIED_GENUINE response for known valid serial | Dev B | Dev A | Manual API test with 5 known valid serials; all return `VERIFIED_GENUINE` | HARD | `[ ]` |
| AC-04 | `POST /api/v1/serial/check`: NOT_FOUND response for unknown serial | Dev B | Dev A | Manual API test with 5 fabricated serials; all return `NOT_FOUND` | HARD | `[ ]` |
| AC-05 | Response time parity: FOUND and NOT_FOUND take same ±10ms response time (anti-enumeration) | Dev B | Dev B | Timing test: 100 FOUND + 100 NOT_FOUND; compare p99 — must be within 10ms | HARD | `[ ]` |
| AC-06 | Rate limit: 5 requests/IP/minute enforced; 6th request returns 429 | Dev B | Dev A | Automated test: 6 requests in 60s from same IP; 6th returns 429 | HARD | `[ ]` |
| AC-07 | Cloudflare Turnstile appears after 3rd serial check (same session) | Dev A | Dev A | Manual test: 3rd check on same page → Turnstile widget appears before 4th check | HARD | `[ ]` |
| AC-08 | Serial masking correct in response: first 2 + last 4 chars shown, middle masked (`TW***4567`) | Dev B | Dev A | API response inspection for various serial lengths | HARD | `[ ]` |
| AC-09 | SUSPECTED_COUNTERFEIT response: counterfeit report auto-generated in Strapi with `TWN-CF-{YEAR}-{SEQ}` reference | Dev B | Dev B | Trigger SUSPECTED_COUNTERFEIT response (configure test serial); verify Strapi record created | HARD | `[ ]` |
| AC-10 | Legal review of counterfeit response language complete — SUSPECTED_COUNTERFEIT wording approved | Legal | IT Lead | Legal sign-off document on file; response text matches approved wording | HARD | `[ ]` |
| AC-11 | Daily serial ingest cron (03:00 UTC) tested and functional | Dev B | Dev B | Add test serial via daily ingest mechanism; verify it appears in `valid_serials` by 03:30 UTC | HARD | `[ ]` |
| AC-12 | Counterfeit report email notification sent to `security@twinmos.com` on SUSPECTED_COUNTERFEIT | Dev B | IT Lead | Trigger test; verify email received within 5 minutes | HARD | `[ ]` |

---

## 6. Technical — RMA Workflow

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| RMA-01 | RMA submission form at `/support/rma/` is live and functional | Dev A | Dev A | Manual form submission; RMA record appears in Strapi | HARD | `[ ]` |
| RMA-02 | Full state machine journey tested in production: SUBMITTED → UNDER_REVIEW → APPROVED → SHIP_TO_TWINMOS → RECEIVED → TESTING → REPLACEMENT_SHIPPED → CLOSED | Dev B | IT Lead | Journey test log: all 8 states traversed; timestamps recorded | HARD | `[ ]` |
| RMA-03 | Email templates RMA-01 through RMA-09 sent at correct state transitions | Dev B | Dev A | Journey test: verify each email sent to test address; content correct | HARD | `[ ]` |
| RMA-04 | RMA reference format correct: `TWN-RMA-{YEAR}-{6-digit-zero-padded}` | Dev B | Dev B | 3 test submissions; verify refs are `TWN-RMA-2027-000001`, `000002`, `000003` | HARD | `[ ]` |
| RMA-05 | SLA monitoring cron runs daily at 08:00 UTC; breach escalation email triggered on SLA overrun | Dev B | Dev B | Simulate SLA breach by setting `submitted_at` > 24h ago in test record; verify escalation email | HARD | `[ ]` |
| RMA-06 | Customer-facing RMA status page (`/support/rma/{ref}/`) shows correct state for each journey stage | Dev A | Dev A | After each state transition: refresh status page; confirm state updates within 60 seconds | HARD | `[ ]` |
| RMA-07 | Slack `#twinmos-support-rma` notified on state transitions: APPROVED, REPLACEMENT_SHIPPED, CLOSED | Dev B | IT Lead | State transitions in test; verify Slack messages received | ADVISORY | `[ ]` |
| RMA-08 | REJECTED state: customer receives RMA-04 (rejection) email with reason | Dev B | Dev A | Reject a test RMA; verify RMA-04 email received with rejection reason | HARD | `[ ]` |
| RMA-09 | RMA form Turnstile active; submission without valid token returns 422 | Dev A | Dev A | Manual test: disable Turnstile token; confirm 422 response | HARD | `[ ]` |
| RMA-10 | Strapi RMA queue accessible by support team; daily digest email configured | IT Lead | Marketing | Log in as support team moderator; queue visible; digest email tested | HARD | `[ ]` |

---

## 7. Technical — Compatibility Finder and QVL

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| QVL-01 | QVL database expanded: ≥ 200 motherboard entries in Phase 2 (Phase 1 baseline was 100) | Dev B | Dev B | MeiliSearch `qvl_entries` document count; or Strapi collection count | ADVISORY | `[ ]` |
| QVL-02 | QVL ingest pipeline: bulk CSV import processed without errors for a sample 200-row file | Dev B | Dev B | Upload test CSV; verify ingest log; confirm records in Strapi | HARD | `[ ]` |
| QVL-03 | Compatibility Finder: `findByLaptop` search returns ranked results for top-10 laptop models | Dev A | Dev A | Manual test: search "HP EliteBook 840 G10" → results with QVL_RANK scoring | HARD | `[ ]` |
| QVL-04 | Compatibility Finder: `findByDesktop` returns results with correct scoring (QVL, speed, capacity, dual-channel) | Dev A | Dev A | Manual test: configure desktop specs → verify top result is QVL-Certified with score breakdown | HARD | `[ ]` |
| QVL-05 | Compatibility Finder: `findByMotherboard` returns QVL entries matching motherboard model | Dev A | Dev A | Manual test: "MSI MPG Z790 Carbon WiFi" → results include tested VOLTX SKUs | HARD | `[ ]` |
| QVL-06 | URL state persistence: Finder URL updates with each search parameter change | Dev A | Dev A | Browser URL check: `/products/finder?mode=laptop&brand=HP&model=EliteBook+840+G10` | HARD | `[ ]` |
| QVL-07 | MeiliSearch typeahead: <100ms response for autocomplete suggestions (Redis-cached per spec) | Dev A | Dev B | Performance test: 50 typeahead requests; p99 < 100ms in production | HARD | `[ ]` |
| QVL-08 | Vendor scrape targets confirmed: ASUS Z790/Z890, MSI Z790/Z890, Gigabyte Z790/Z890, ASRock Z790 boards | Dev B | Dev B | Scrape script dry-run: 0 errors; scraped data count > 0 per vendor | ADVISORY | `[ ]` |
| QVL-09 | Community submission moderation: Strapi queue shows community-submitted entries pending review | Dev B | Dev A | Submit a community entry via form; verify pending queue entry | ADVISORY | `[ ]` |

---

## 8. Technical — Watermarked PDF System

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| PDF-01 | Price list PDF generated with correct three-layer watermark: diagonal (15% opacity), header band (blue #00A3E0), footer | Dev B | Marketing | Download price list as Certified Distributor; visually inspect all pages | HARD | `[ ]` |
| PDF-02 | Watermark contains: Company Name, Partner ID, DD Month YYYY HH:MM UTC, session suffix (last 8 chars) | Dev B | Dev A | Inspect watermark text in generated PDF; verify format matches spec | HARD | `[ ]` |
| PDF-03 | 12-page price list generates in < 8 seconds | Dev B | Dev B | Time 5 consecutive generations; all < 8s | HARD | `[ ]` |
| PDF-04 | Signed URL expires after 60 minutes; expired URL returns 403 | Dev B | Dev A | Generate URL; wait 61 minutes (or manually set expiry); verify 403 | HARD | `[ ]` |
| PDF-05 | B2 temp bucket lifecycle rule deletes objects after 2 hours | Dev B | Dev B | Create test object; verify deletion after 2h (B2 console) | ADVISORY | `[ ]` |
| PDF-06 | No server-side PDF caching: two downloads by the same partner at different times produce different session suffix | Dev B | Dev A | Download twice 5 minutes apart; compare watermark session suffix strings | HARD | `[ ]` |
| PDF-07 | PDF service: max 5 concurrent generations enforced; 6th request queued, not dropped | Dev B | Dev B | Load test: 6 simultaneous PDF requests; 6th completes (not errored) | ADVISORY | `[ ]` |
| PDF-08 | PDF download event logged in Strapi with: partner ID, timestamp, IP (for audit trail) | Dev B | Dev A | Download price list; check Strapi download log entry | HARD | `[ ]` |

---

## 9. Technical — RGB Visualizer

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| RGB-01 | RGB Visualizer renders on `/gaming/rgb-showcase/` at `client:visible` with correct GLTF model | Dev A | Dev A | Page load: visualizer appears when scrolled into view; GLTF model loads within 3 seconds | HARD | `[ ]` |
| RGB-02 | All 10 lighting effects functional: Static, Breathing, Rainbow, Color Cycle, Strobe, Wave, Meteor, Stack, Flash-Dash, Custom | Dev A | Dev A | Manually cycle all 10 effects; each produces visually distinct animation | HARD | `[ ]` |
| RGB-03 | Color picker updates visualizer in real time | Dev A | Dev A | Change primary color; verify LED mesh updates within 100ms | HARD | `[ ]` |
| RGB-04 | Speed and brightness controls affect animation speed and LED intensity | Dev A | Dev A | Manual slider test; speed=1 vs speed=10 visually distinguishable | HARD | `[ ]` |
| RGB-05 | Mobile fallback: carousel displayed instead of WebGL on devices without WebGL2 support | Dev A | Dev A | Disable WebGL2 in browser flags (or test on old Android); verify carousel appears | HARD | `[ ]` |
| RGB-06 | Mobile fallback: carousel displayed on `deviceMemory < 4` or `viewport < 768px` | Dev A | Dev A | Test on physical device with < 4GB RAM or emulate viewport < 768px | ADVISORY | `[ ]` |
| RGB-07 | `prefers-reduced-motion`: all animations paused; static hero image shown instead of carousel | Dev A | Dev A | OS: enable reduced motion; reload page; verify animations stopped | HARD | `[ ]` |
| RGB-08 | Bundle size: Three.js + @react-three/fiber bundle ≤ 210KB gzipped | Dev A | Dev A | `next build --analyze` or Cloudflare Pages build log; verify chunk size | ADVISORY | `[ ]` |
| RGB-09 | Motherboard sync simulation: SVG overlay renders for ASUS, Gigabyte, MSI, ASRock platforms | Dev A | Dev A | Select each platform from dropdown; verify correct SVG board overlay appears | HARD | `[ ]` |
| RGB-10 | GLTF model meets spec: ≤ 15,000 triangles, PBR textures 1024×1024, separate LED mesh group named "LED_Group" | Dev A | Dev A | Inspect GLTF in Three.js editor or `glTF Validator`; verify triangle count and mesh structure | HARD | `[ ]` |

---

## 10. Technical — Build Gallery and Moderation

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| BLD-01 | Build submission form at `/gaming/build-submit/` functional: all 5 steps, photo upload, Turnstile | Dev A | Dev A | End-to-end test submission; verify BSM-01 confirmation email received | HARD | `[ ]` |
| BLD-02 | Moderation queue in Strapi: new submission appears within 30 seconds; BSM-02 email sent to moderation team | Dev B | Dev B | Submit test build; monitor Strapi queue and inbox | HARD | `[ ]` |
| BLD-03 | Approval workflow: approve a submission → MeiliSearch indexed → gallery page shows build within 5 minutes | Dev B | Dev A | Approve test submission; verify `/gaming/build-gallery/` shows new card | HARD | `[ ]` |
| BLD-04 | Approval workflow: BSM-04 email sent to submitter on approval with correct gallery URL | Dev B | Dev A | Approve test submission; verify email received with live gallery link | HARD | `[ ]` |
| BLD-05 | Rejection workflow: reject with reason → BSM-03 email to submitter with reason label and detail | Dev B | Dev A | Reject test submission; verify email received with rejection reason | HARD | `[ ]` |
| BLD-06 | Build detail page `/gaming/build-gallery/{slug}/` accessible; no PII in page | Dev A | Dev A | Load detail page; inspect page source — no email or full name present | HARD | `[ ]` |
| BLD-07 | Gallery filter by category works | Dev A | Dev A | Filter "RGB Showcase": only rgb-showcase builds shown | HARD | `[ ]` |
| BLD-08 | Gallery filter by country works | Dev A | Dev A | Filter "India": only India builds shown | HARD | `[ ]` |
| BLD-09 | Featured Build of the Month: hero section shows featured build on gallery index | Dev A | Dev A | Set `is_featured = true` on a test build; reload gallery index; hero appears | HARD | `[ ]` |
| BLD-10 | EXIF metadata stripped from uploaded photos | Dev B | Dev A | Download an approved build photo; open in EXIF viewer; confirm no GPS or device data | HARD | `[ ]` |
| BLD-11 | Rate limit: 3 submissions per IP per 24h enforced | Dev B | Dev A | Submit 4 times from same IP; 4th returns 429 | HARD | `[ ]` |
| BLD-12 | SLA monitoring cron: submission > 5 business days → `sla_breach = true`; escalation email sent | Dev B | Dev B | Simulate SLA breach; verify flag and email | HARD | `[ ]` |

---

## 11. Localization and Content

### 11.1 Arabic (AR) — RTL

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| L10N-01 | Arabic homepage published and reviewed by native Arabic speaker | Marketing | TwinMOS Native Reviewer | Native speaker sign-off document | HARD | `[ ]` |
| L10N-02 | Arabic top-20 product pages published and reviewed | Marketing | TwinMOS Native Reviewer | Native speaker sign-off document | HARD | `[ ]` |
| L10N-03 | Arabic support pages (contact, RMA, serial check) published and reviewed | Marketing | TwinMOS Native Reviewer | Native speaker sign-off document | HARD | `[ ]` |
| L10N-04 | RTL layout: no WCAG 2.1 AA failures on Arabic pages | Dev A | Dev A | axe-core automated + manual RTL layout review; 0 critical failures | HARD | `[ ]` |
| L10N-05 | RTL layout: text direction, icon mirroring, button alignment correct in Arabic | Dev A | Dev A | Visual inspection across 20 representative pages in Arabic locale | HARD | `[ ]` |
| L10N-06 | Arabic locale Lighthouse Performance ≥ 90 | Dev A | Dev A | Lighthouse CI report for Arabic key pages | ADVISORY | `[ ]` |
| L10N-07 | `hreflang` tags for AR locale correct on all Arabic pages | Dev A | Dev A | Screaming Frog crawl: `hreflang` map for AR matches canonical EN pages | HARD | `[ ]` |

### 11.2 Bengali (BN) and Hindi (HI)

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| L10N-08 | Bengali top-100 priority pages translated and published | Marketing | Marketing | Strapi content count: ≥ 100 BN pages with `status: published` | HARD | `[ ]` |
| L10N-09 | Hindi top-100 priority pages translated and published | Marketing | Marketing | Strapi content count: ≥ 100 HI pages with `status: published` | HARD | `[ ]` |
| L10N-10 | Bengali and Hindi translations reviewed (machine-assisted translation signed off by reviewer) | Marketing | TwinMOS BN/HI Reviewer | Reviewer sign-off acknowledgement email | HARD | `[ ]` |
| L10N-11 | `hreflang` tags for BN and HI locales correct | Dev A | Dev A | Screaming Frog crawl: hreflang map for BN and HI | HARD | `[ ]` |
| L10N-12 | Bengali and Hindi: no layout breakage from longer text strings in UI components | Dev A | Dev A | Visual inspection of 10 representative pages in BN and HI; no text overflow or button truncation | ADVISORY | `[ ]` |

### 11.3 All Locales

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| L10N-13 | Locale switcher functional: EN ↔ AR ↔ BN ↔ HI switch without page reload error | Dev A | Dev A | Manual switching test; verify content language changes correctly | HARD | `[ ]` |
| L10N-14 | All hreflang tags verified by Screaming Frog crawl: no missing or incorrect alternate tags | Dev A | Dev A | Screaming Frog report showing hreflang coverage across all 4 locales | HARD | `[ ]` |
| L10N-15 | No English placeholder text (`[TRANSLATE]` or `EN:` prefix) visible in AR/BN/HI locales | Dev A | Marketing | Grep source content for placeholder markers; 0 occurrences | HARD | `[ ]` |
| L10N-16 | Phase 3 locale URLs (RU/ZH-CN/FR) return 404 with correct fallback behaviour (not broken page) | Dev A | Dev A | Verify `/ru/`, `/zh-cn/`, `/fr/` return locale-appropriate 404 page | ADVISORY | `[ ]` |

---

## 12. Legal and Regulatory

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| LEG-01 | GDPR/DPA consent mechanisms verified for all 4 active locales (EN/AR/BN/HI) | Legal + Dev A | Legal | Legal sign-off; GDPR consent test in each locale | HARD | `[ ]` |
| LEG-02 | UAE PDPL privacy notice updated and published for AR locale | Legal | Legal | Privacy Policy page reviewed in `/ar/legal/privacy-policy/` | HARD | `[ ]` |
| LEG-03 | India DPDP Act 2023 privacy notice published for BN and HI locales | Legal | Legal | Privacy Policy page reviewed in `/bn/legal/` and `/hi/legal/` | HARD | `[ ]` |
| LEG-04 | KSA PDPL privacy notice in place for AR locale (covering KSA users) | Legal | Legal | Legal sign-off; privacy notice reviewed by Legal | HARD | `[ ]` |
| LEG-05 | Anti-counterfeit response language: SUSPECTED_COUNTERFEIT wording reviewed and approved by legal | Legal | IT Lead | Approved wording on file; production response text matches approved version | HARD | `[ ]` |
| LEG-06 | Partner Portal Terms of Service: updated ToS published at `/partner/terms/` | Legal | Legal | ToS page accessible; version dated 2027 or later | HARD | `[ ]` |
| LEG-07 | Build gallery: content licence terms at `/gaming/build-submit/` verified by legal (UGC licence grant) | Legal | Legal | Content consent wording reviewed; matches legal template | HARD | `[ ]` |
| LEG-08 | Better Auth session cookie compliance: `__Host-` cookie meets GDPR strict consent requirements | Dev A + Legal | Legal | Legal sign-off on cookie classification (strictly necessary = no banner consent needed) | ADVISORY | `[ ]` |
| LEG-09 | Data retention policy documented: build submission PII, RMA data, serial check logs — retention periods defined and implemented | Dev B + Legal | Legal | Data retention document on file; automated deletion crons configured | ADVISORY | `[ ]` |

---

## 13. Partner Operations

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| POP-01 | All existing distributors notified of Partner Portal launch via email campaign | Marketing | Marketing | Email campaign sent; list of notified distributor contacts on file | HARD | `[ ]` |
| POP-02 | Partner Portal credentials issued to ≥ 80% of existing registered distributors | IT Lead | Marketing | Better Auth: user accounts created for distributor list; credentials emailed | HARD | `[ ]` |
| POP-03 | Partner Portal quick-start guide created and distributed to all partners | Marketing | Marketing | Quick-start guide document sent; attached to credentials email | HARD | `[ ]` |
| POP-04 | Partner support email alias `partner-support@twinmos.com` active and monitored | IT Lead | IT Lead | Test email sent; reply received within 1 business hour | HARD | `[ ]` |
| POP-05 | Partner Portal first login tested with at least 2 real distributor accounts (UAT) | Marketing + IT Lead | Marketing Director | UAT sign-off from 2 live distributors confirming portal access and functionality | HARD | `[ ]` |
| POP-06 | MFA (TOTP) enrollment guide prepared for distributors unfamiliar with authenticator apps | Marketing | Marketing | Guide document available; linked in partner onboarding email | ADVISORY | `[ ]` |
| POP-07 | Partner assets (marketing collateral) uploaded to portal at `/partner/assets/` | Marketing | Dev A | Log in as Certified partner; verify at least 5 downloadable assets visible | ADVISORY | `[ ]` |
| POP-08 | Price list (Handlebars template) updated with current Phase 2 product pricing before launch | Marketing | IT Lead | PDF generated for all partner tiers; pricing reviewed and correct | HARD | `[ ]` |
| POP-09 | Partner-facing changelog (`/partner/updates/`) has at least one entry describing Phase 2 launch | Marketing | Marketing | Page accessible in portal; entry present | ADVISORY | `[ ]` |
| POP-10 | Partner escalation path documented for portal issues: email, phone, Chatwoot queue | IT Lead | Marketing | Escalation path document shared with all partners in onboarding email | HARD | `[ ]` |

---

## 14. Marketing and Communications

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| MKT-01 | Phase 2 launch announcement blog post written, reviewed, and staged | Marketing | Marketing Director | Blog post live in Strapi with `status: draft` and `publish_at: 2027-04-25` | ADVISORY | `[ ]` |
| MKT-02 | Social media posts (Instagram, Twitter/X, LinkedIn, Facebook) prepared for launch day | Marketing | Marketing Director | Social posts scheduled in social media scheduler for April 25, 2027 | ADVISORY | `[ ]` |
| MKT-03 | Partner launch email (separate from credentials email) drafted: highlighting new portal features | Marketing | Marketing Director | Email drafted in Resend/email client; reviewed and approved | ADVISORY | `[ ]` |
| MKT-04 | SEO: Phase 2 new pages submitted to Google Search Console sitemap | Dev A | Dev A | `sitemap.xml` updated with all new Phase 2 pages; submitted to Google Search Console | HARD | `[ ]` |
| MKT-05 | SEO: meta titles and meta descriptions complete for all Phase 2 pages in all 4 locales | Dev A | Marketing | Screaming Frog report: 0 missing meta tags on Phase 2 pages | HARD | `[ ]` |
| MKT-06 | Plausible analytics: all Phase 2 custom events registered and tested | Dev A | Dev A | Plausible dashboard: test events for form submissions, serial check, PDF download visible | HARD | `[ ]` |
| MKT-07 | Build gallery: at least 3 pre-seeded approved builds visible at launch (seed content) | Marketing | Marketing | 3 builds in APPROVED state in production gallery before launch | ADVISORY | `[ ]` |
| MKT-08 | RGB Visualizer: launch product asset (GLTF model of VOLTX DDR5 RGB) delivered by TwinMOS and deployed | Marketing + Dev A | Dev A | GLTF model loads in production visualizer; matches physical product appearance | HARD | `[ ]` |
| MKT-09 | #MyVOLTXBuild social campaign assets prepared (hashtag graphics, Instagram story templates) | Marketing | Marketing Director | Asset pack delivered to social team | ADVISORY | `[ ]` |
| MKT-10 | Chatwoot agents briefed on Phase 2 features: able to answer questions about portal, serial check, RMA | IT Lead | Marketing | Training session completed; agent knowledge base updated | HARD | `[ ]` |

---

## 15. Monitoring and Alerting

| # | Checklist Item | Owner | Verifier | Method | Blocker | Status |
|---|---------------|-------|----------|--------|---------|--------|
| MON-01 | Sentry configured for all Phase 2 Astro SSR routes and Strapi API | Dev A + Dev B | Dev A | Trigger a test error; verify it appears in Sentry within 60 seconds | HARD | `[ ]` |
| MON-02 | Sentry alerting: Slack `#twinmos-ops` notified on new Critical/High errors | Dev A | Dev A | Configure Sentry → Slack integration; trigger test error; verify Slack message | HARD | `[ ]` |
| MON-03 | Plausible dashboard: Phase 2 goals configured (portal logins, PDF downloads, serial checks, RMA submissions, build submissions) | Dev A | Dev A | Goals visible in Plausible; test trigger from browser; goal count increments | HARD | `[ ]` |
| MON-04 | Uptime monitoring: all Phase 2 routes added to uptime monitor (UptimeRobot or equivalent); alert to `#twinmos-ops` on downtime | Dev B | Dev B | Monitor configured; test alert by temporarily blocking a route | HARD | `[ ]` |
| MON-05 | ERP sync failure alerting: Slack `#twinmos-ops` alert within 5 minutes of sync error | Dev B | Dev B | Simulate ERP timeout; verify Slack alert | ADVISORY | `[ ]` |
| MON-06 | Anti-counterfeit API: Sentry performance monitoring tracking p99 latency; alert if p99 > 500ms | Dev B | Dev B | Sentry Performance dashboard: transaction `POST /api/v1/serial/check` visible with latency metrics | HARD | `[ ]` |
| MON-07 | PDF service: Sentry monitors PDF generation time; alert if > 12s | Dev B | Dev B | Sentry: transaction `POST /pdf-service/generate` visible; alert threshold set | ADVISORY | `[ ]` |
| MON-08 | RMA SLA cron: logs execution and emits metric to Sentry on each run | Dev B | Dev B | Check Sentry cron monitor after 08:00 UTC run; confirm "check-in" recorded | HARD | `[ ]` |
| MON-09 | Build submission SLA cron: logs execution and emits metric | Dev B | Dev B | Check Sentry cron monitor after 09:00 UTC run | HARD | `[ ]` |
| MON-10 | Redis: memory usage monitored; alert if > 80% of allocated memory | Dev B | Dev B | Redis `INFO memory`; Coolify or external monitor alert configured | ADVISORY | `[ ]` |
| MON-11 | Backblaze B2: storage alert configured if monthly egress > 10GB | Dev B | Dev B | B2 billing alert configured in Backblaze console | ADVISORY | `[ ]` |
| MON-12 | Phase 2 hypercare schedule documented: on-call roster for April 25 – May 9, 2027 | PM | IT Lead | On-call roster document distributed; escalation contacts confirmed | HARD | `[ ]` |

---

## 16. Final Sign-Off

### 16.1 Go/No-Go Summary

Complete this summary table at the April 22, 2027 Go/No-Go meeting before signing.

| Domain | Total Items | HARD Blockers | Passed | Blocked | ADVISORY Accepted |
|--------|------------|---------------|--------|---------|-------------------|
| 1. Infrastructure | 11 | 9 | | | |
| 2. Security | 13 | 10 | | | |
| 3. Core Platform | 15 | 11 | | | |
| 4. Partner Portal | 11 | 10 | | | |
| 5. Anti-Counterfeit | 12 | 12 | | | |
| 6. RMA Workflow | 10 | 9 | | | |
| 7. QVL / Finder | 9 | 6 | | | |
| 8. Watermarked PDF | 8 | 6 | | | |
| 9. RGB Visualizer | 10 | 8 | | | |
| 10. Build Gallery | 12 | 12 | | | |
| 11. Localization | 16 | 13 | | | |
| 12. Legal | 9 | 7 | | | |
| 13. Partner Operations | 10 | 7 | | | |
| 14. Marketing | 10 | 5 | | | |
| 15. Monitoring | 12 | 9 | | | |
| **TOTAL** | **168** | **134** | | | |

**Launch Decision:** 

```
[ ] GO — All HARD BLOCKER items passed; ADVISORY items accepted in writing below
[ ] NO-GO — One or more HARD BLOCKER items not resolved
[ ] CONDITIONAL GO — {specify items} deferred to hot-fix within 24h of launch
```

**ADVISORY Items Accepted at Risk (if any):**

| Item ID | Item Description | Risk Accepted By | Date |
|---------|-----------------|-----------------|------|
| | | | |
| | | | |

### 16.2 Approvals

All approvers must sign below before launch proceeds. This document must be signed no later than **April 23, 2027 17:00 UAE time** (24 hours before planned launch).

| Role | Name | Decision | Signature | Date & Time |
|------|------|----------|-----------|-------------|
| Marketing Director | (TBC) | GO / NO-GO | _______________ | _________ |
| IT / Technical Lead | (TBC) | GO / NO-GO | _______________ | _________ |
| Legal Counsel | (TBC) | GO / NO-GO | _______________ | _________ |
| Unisoft Team Lead | (TBC) | GO / NO-GO | _______________ | _________ |

### 16.3 Launch Execution

Upon GO decision:

| Step | Time | Owner | Action |
|------|------|-------|--------|
| 1 | T-2h | Dev B | Final database backup and snapshot |
| 2 | T-1h | Dev A | Final Cloudflare Pages production deployment |
| 3 | T-30m | Dev A + Dev B | Smoke test all HARD BLOCKER items in production one final time |
| 4 | T-0 | Dev A | Remove Phase 2 "Coming Soon" feature flags; enable all Phase 2 routes |
| 5 | T+15m | Dev A | Verify Plausible showing live traffic on new Phase 2 pages |
| 6 | T+15m | Dev B | Verify Sentry showing no new critical errors |
| 7 | T+30m | Marketing | Publish launch blog post; activate social media scheduler |
| 8 | T+1h | IT Lead | Send partner portal launch email to all distributors |
| 9 | T+1h | PM | Send internal launch announcement |
| 10 | T+2h | Dev A + Dev B | Post-launch monitoring check; update status page |
| 11 | T+24h | PM | Post-launch health summary distributed to all stakeholders |
| 12 | Ongoing | Dev A + Dev B | Hypercare on-call coverage: April 25 – May 9, 2027 |

### 16.4 Rollback Trigger Conditions

Launch must be rolled back immediately if any of the following are observed within 4 hours of launch:

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Sentry Critical error rate | > 5 errors/minute sustained for > 10 minutes | Rollback |
| Partner Portal: login failures | > 10% of login attempts failing | Rollback or hotfix in 2h |
| Anti-counterfeit API: downtime | > 5 minutes unavailable | Hotfix in 2h or rollback |
| Page load errors (Cloudflare 5xx) | > 1% of requests | Investigate immediately; rollback if unresolved in 1h |
| Strapi: database connection failures | Any sustained failure > 3 minutes | Rollback |
| RMA form: submission failures | > 20% failure rate | Hotfix in 2h |

---

## Annex A — UAT Sign-Off Template (Partner Portal)

**UAT Tester Name:** _______________  
**Company:** _______________  
**Partner Type:** [ ] Distributor [ ] Reseller [ ] OEM [ ] System Builder  
**Partner Tier:** [ ] Elite [ ] Certified [ ] Registered  
**Test Date:** _______________  
**Tester Email:** _______________  

| # | Test Scenario | Result | Notes |
|---|--------------|--------|-------|
| UAT-1 | Log in to Partner Portal at `twinmos.com/partner/login/` | PASS / FAIL | |
| UAT-2 | Complete TOTP MFA setup with authenticator app | PASS / FAIL | |
| UAT-3 | Dashboard loads with expected widgets | PASS / FAIL | |
| UAT-4 | Download price list PDF (if tier-eligible) | PASS / FAIL | |
| UAT-5 | View marketing asset library | PASS / FAIL | |
| UAT-6 | Submit a test RMA inquiry | PASS / FAIL | |
| UAT-7 | Log out and verify session cleared | PASS / FAIL | |
| UAT-8 | Overall impression: portal is intuitive and functional | PASS / FAIL | |

**Tester Sign-Off:**  
"I confirm the Partner Portal meets the functionality required for my business role."  

Signature: _______________ Date: _______________

---

## Annex B — Smoke Test Script (Post-Launch)

Execute within 30 minutes of launching. All items must pass before removing monitoring watch.

```
Smoke Test Reference: Phase 2 Launch Day — April 25, 2027

[ ] 1.  https://twinmos.com/ — loads, locale switcher shows EN/AR/BN/HI
[ ] 2.  https://twinmos.com/ar/ — Arabic homepage loads in RTL
[ ] 3.  https://twinmos.com/bn/ — Bengali homepage loads
[ ] 4.  https://twinmos.com/hi/ — Hindi homepage loads
[ ] 5.  https://twinmos.com/partner/login/ — login form visible
[ ] 6.  Partner login with test distributor credentials — dashboard loads
[ ] 7.  https://twinmos.com/support/serial-check/ — form loads, Turnstile visible
[ ] 8.  Submit test serial check — VERIFIED_GENUINE response shown
[ ] 9.  https://twinmos.com/support/rma/ — RMA form loads
[ ] 10. https://twinmos.com/gaming/rgb-showcase/ — RGB Visualizer loads (scroll to reveal)
[ ] 11. https://twinmos.com/gaming/build-gallery/ — gallery shows at least 3 builds
[ ] 12. https://twinmos.com/gaming/build-submit/ — submission form loads, all steps work
[ ] 13. https://twinmos.com/products/finder/ — Compatibility Finder loads, search works
[ ] 14. Plausible dashboard — live visitors visible on Phase 2 pages
[ ] 15. Sentry — no new Critical errors in last 30 minutes
[ ] 16. Slack #twinmos-ops — no unexpected alerts

Smoke test completed by: _______________
Completion time: _______________
Result: ALL PASS / FAILURES: [list any failures]
```

---

*Document Reference: TWN-P2-LAUNCH-READY-2027-001 | Version 1.0 | Unisoft Engineering for TwinMOS Technologies*  
*Go/No-Go Meeting: April 22, 2027 | Target Launch: April 25, 2027 | Hypercare: April 25 – May 9, 2027*
