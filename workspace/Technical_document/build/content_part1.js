// content_part1.js — Sections 1-4: Introduction, System Overview, Tech Stack, Architecture
const H = require("./helpers.js");
const { h1, h2, h3, p, bold, mono, plain, bullets, steps, codeBlock, dataTable, figure, callout, spacer } = H;

const part1 = [];

// ================= 1. INTRODUCTION =================
part1.push(h1("1. Introduction"));
part1.push(h2("1.1 Purpose and Audience"));
part1.push(p([plain("This manual is the complete operating guide for the "), bold("TwinMOS Corporate Website Platform"), plain(" — the production content-management and e-commerce support system powering www.twinmos.com. It is written for two roles: the "), bold("Webmaster"), plain(", who manages day-to-day content, products, leads and support through the admin console, and the "), bold("Software Engineer"), plain(", who deploys, operates, monitors and troubleshoots the system end to end.")]));
part1.push(p("The document covers every administrative module with step-by-step workflows, explains the technology stack and data flows, documents the public website features, and provides a complete cloud-deployment runbook that has been verified against the actual deploy artifacts shipped in the repository (nginx configuration, systemd unit, backup and restore scripts, and production environment templates)."));
part1.push(h2("1.2 System at a Glance"));
part1.push(dataTable(
  ["Attribute", "Value"],
  [
    ["Product name", "TwinMOS Platform (monorepo: twinmos-platform)"],
    ["Version", "0.3.0 (API reported at /api/v1/health)"],
    ["Public pages", "28 routes (~380 EN routes incl. localized)"],
    ["Admin modules", "15 modules across 9 groups"],
    ["Database tables", "36 tables, 4 enums"],
    ["Automated tests", "253 end-to-end + unit tests (26 suites)"],
    ["Security gates", "OWASP-equivalent local scan: 14 check classes, 0 findings"],
    ["Deployment topology", "Cloudflare TLS/WAF → nginx → static web + admin + Node API → PostgreSQL 16"],
  ],
  { widths: [2600, 6600] }
));
part1.push(spacer());
part1.push(h2("1.3 Document Conventions"));
part1.push(...bullets([
  [mono("monospace") , plain(" — file paths, commands, URLs and configuration keys.")],
  [bold("Bold"), plain(" — UI labels, buttons and first-use terms.")],
  [plain("Callout boxes marked "), bold("NOTE / IMPORTANT / WARNING"), plain(" — operational guardrails; the WARNING boxes describe actions that can cause data loss or outage.")],
  [plain("Exhibits are numbered screenshots captured from the live system.")],
]));
part1.push(h2("1.4 Related Repository Documents"));
part1.push(p("The repository ships an internal documentation set under twinmso_codebase/docs/ that this manual complements: the Master Build Plan (00), Architecture (01), API Specification (02), Database Schema (03), Admin/CMS Specification (04), Prototype Migration Guide (05), Admin Console Plan (08), seven phase-evidence files, and operational runbooks (DEPLOY.md, DR.md, HYPERCARE.md) under docs/runbooks/. Where this manual summarizes a procedure, the runbook remains the authoritative source of record."));

// ================= 2. SYSTEM OVERVIEW =================
part1.push(h1("2. System Overview"));
part1.push(h2("2.1 What the Platform Does"));
part1.push(p("The platform is a single integrated system with three deployable surfaces sharing one database:"));
part1.push(...bullets([
  [bold("Public website"), plain(" (apps/web) — 28 pages: product catalog with faceted shop, product detail pages with warranty and specifications, compatibility finder, anti-counterfeit serial verification, RMA center with public case tracker, newsroom, learn hub, careers with live openings, where-to-buy distributor locator, contact and volume-quote forms. Served as a fully static build — no server-side rendering required.")],
  [bold("Admin console / CMS"), plain(" (apps/admin) — a React single-page application behind authentication with role-based access control (5 roles), two-factor authentication, and 15 modules covering content, catalog, leads, RMA, partners, careers, media, localization, users, audit and settings. Every mutation writes an audit-trail row.")],
  [bold("REST API"), plain(" (apps/api) — a Hono service on Node 24 exposing /api/v1: authentication (Better Auth), 15 public form types, RMA lifecycle, anti-counterfeit SN-check, i18n bundles, partner portal, and the full admin CRUD surface with Zod-validated contracts and RFC 9457 problem-detail error envelopes.")],
]));
part1.push(p([plain("A deliberate architecture decision (ADR-006): "), bold("no external CMS"), plain(" — the custom admin panel is the CMS, backed by the same schema. Content leaves the database through a build-time export bridge (cms-content.js) that the static site merges at runtime, so published changes appear on the website without a server-side render step.")]));
part1.push(h2("2.2 The Public Website"));
part1.push(...figure("site_home.png", "Public website home page (dev environment, http://localhost:4321/)"));
part1.push(p("The home page presents the brand story, featured product families and entry points to the shop, support center and compatibility finder. Navigation uses a mega-menu organized by product memory (Gaming / Desktop / Notebook DRAM), internal storage (NVMe / SATA SSD) and portable storage, mirroring the catalog taxonomy used throughout the admin console."));
part1.push(h2("2.3 Key Public Features"));
part1.push(h3("Product Catalog and Shop"));
part1.push(...figure("site_shop.png", "Shop page — faceted product grid (40 live products)"));
part1.push(p("The shop renders every published product with category, generation, capacity, interface and form-factor facets inherited from the prototype's filter design. Products managed in the admin console (names, specifications, badges, warranty terms, imagery) flow to this grid through the CMS export bridge — a change made in the admin Products module appears on the site after the next content export (automatic in production builds; see §7 for the export pipeline)."));
part1.push(h3("Product Detail with Warranty and Specifications"));
part1.push(...figure("site_product.png", "Product detail page — CMS-managed warranty chip, short spec line and hero image"));
part1.push(p("Each product page shows the marketing description, the specification table, the warranty term (for example, \u201CLifetime\u201D), responsive image gallery and variant chips. All of these fields are managed in the admin Products editor; the warranty chip and short-specification line render from CMS data, and the hero image can be served from the API's public media route."));
part1.push(h3("Anti-Counterfeit Serial Verification (Warranty Check)"));
part1.push(...figure("site_sncheck.png", "Serial-number verification on the Support page — genuine verdict with SKU and manufacture date"));
part1.push(p("On the Support page, customers expand the \u201CVerify a product serial number\u201D card and enter the serial printed on their module. The site calls POST /api/v1/sn-check, which looks the serial up in the factory registry, returns a genuine / not-verified verdict with SKU and manufacture date when found, and logs the check (IP, country) for the counterfeit anomaly scan the admin team runs. This is the customer-facing half of the brand-protection workflow described in §5.8."));
part1.push(h3("Compatibility Finder"));
part1.push(...figure("site_compat_result.png", "Compatibility finder after selecting Laptop → Lenovo → IdeaPad Slim 3 (DDR4)"));
part1.push(p("The compatibility finder walks the customer through device type (Laptop / Desktop PC / Motherboard DIY / Mini PC), brand and model, then renders validated memory guidance — maximum capacity, slot count, supported speed, recommended product categories and the SSD upgrade path. The underlying rules are the QVL matrix maintained in the admin Compatibility module."));
part1.push(h3("Support, RMA and Forms"));
part1.push(...figure("site_support.png", "Support Center — knowledge base, RMA tracker and the serial-verification card"));
part1.push(p("The RMA Center lets customers submit a return request (which creates a tracked case with an RMA-2026-xxxxxx reference) and follow its status through the seven-state pipeline. Fifteen public form types (contact, quote, RMA, distributor application, job application, counterfeit report, and others) post to the API with mandatory privacy consent and Cloudflare Turnstile anti-spam protection in production."));
part1.push(h3("Careers and Where to Buy"));
part1.push(...figure("site_careers.png", "Careers page — openings table including a CMS-published role with apply-by date"));
part1.push(...figure("site_where_to_buy.png", "Where to Buy — country distributor locator with region filter chips"));
part1.push(p("The careers page lists published job postings (title, location, apply-by deadline, one-line summary and an apply link) — rows managed in the admin Careers module. The Where-to-Buy page is a country-by-country distributor locator with search, region chips and channel-status filters, fed by the directory the admin Partners module maintains; verified online marketplaces are listed in a parallel section."));

// ================= 3. TECHNOLOGY STACK =================
part1.push(h1("3. Technology Stack"));
part1.push(h2("3.1 Stack Summary"));
part1.push(dataTable(
  ["Layer", "Technology", "Version", "Notes"],
  [
    ["Web framework", "Astro (static output)", "7.3.5", "MPA matching the audited prototype 1:1"],
    ["Admin framework", "React SPA (Vite + TanStack Query)", "React 19.3 / Vite 8.3", "Code-split per module; tabbed workspace shell"],
    ["API", "Hono on Node 24", "Hono 4.13", "TypeScript executed natively via --experimental-strip-types"],
    ["ORM / DB access", "Drizzle ORM", "0.45.3", "Parameter-bound query builders only; SQL via tagged templates"],
    ["Dev database", "PGlite (embedded Postgres)", "0.5.8", "Dev/test only — the API refuses it under NODE_ENV=production"],
    ["Production DB", "PostgreSQL 16", "—", "Same schema, zero rewrite"],
    ["Authentication", "Better Auth", "1.7.6", "Sessions, TOTP MFA, roles, admin plugin"],
    ["Validation", "Zod shared contracts", "4.6.5", "One schema validates API input and admin forms"],
    ["Site search", "Pagefind", "1.5.2", "Build-time fuzzy index in the static bundle"],
    ["Email", "Resend", "6.30.0", "Transactional; dev driver writes JSON to an outbox"],
    ["Image processing", "Sharp", "0.35.5", "Responsive WebP/AVIF derivatives per upload"],
    ["Web styling", "Prototype main.css design tokens", "—", "No CSS framework on the public site — the audited CSS is the contract"],
    ["Testing", "Vitest + Playwright + axe-core + Lighthouse CI", "—", "253 automated tests; parity and accessibility gates"],
  ],
  { widths: [1900, 2700, 1500, 3100] }
));
part1.push(spacer());
part1.push(h2("3.2 Why These Choices"));
part1.push(...bullets([
  [bold("Astro static output"), plain(" — the public site ships as pure static files behind a CDN: fastest possible page loads, zero server surface to patch, and pixel parity with the approved prototype is enforced by screenshot-diff gates.")],
  [bold("Embedded PGlite in dev, real Postgres in production"), plain(" — a single developer command boots the full stack with a real Postgres dialect in-process, while production connects over the wire with no code changes. The API hard-refuses PGlite when NODE_ENV=production.")],
  [bold("Better Auth with TOTP MFA"), plain(" — production-grade session management, hardware-independent two-factor enrollment with QR code and backup codes, and an admin plugin providing user ban/session-revocation primitives.")],
  [bold("Zod contracts shared across all three apps"), plain(" — one schema definition validates the API route, the admin form and the public payload, eliminating the classic three-apps-three-validations drift.")],
  [bold("No external CMS (ADR-006)"), plain(" — the admin panel is the CMS. This keeps content, catalog and support workflows in one audit-trailed system instead of syncing to a third-party service.")],
]));
part1.push(h2("3.3 Runtime Topology"));
part1.push(dataTable(
  ["Surface", "Dev URL", "Production URL", "Served by"],
  [
    ["Public website", "http://localhost:4321/", "https://www.twinmos.com/", "nginx static files (CDN-cached)"],
    ["Admin console", "http://localhost:5173/", "https://www.twinmos.com/admin/", "nginx static SPA shell"],
    ["API", "http://127.0.0.1:8787/api/v1/", "https://www.twinmos.com/api/v1/", "Node systemd service behind nginx /api/ proxy"],
    ["Database", "./apps/api/data/dev.pgdata (PGlite)", "PostgreSQL 16 (same VM or dedicated)", "—"],
  ],
  { widths: [1900, 2600, 2700, 2000] }
));
part1.push(spacer());
part1.push(callout("note", "In development the three surfaces run on separate ports and the site talks to the API cross-origin (PUBLIC_API_URL + ALLOWED_ORIGIN in apps/web/.env and the root .env). In production everything is same-origin behind one nginx server block, which is why the production templates leave those cross-origin settings unset."));

// ================= 4. ARCHITECTURE =================
part1.push(h1("4. System Architecture"));
part1.push(h2("4.1 Monorepo Layout"));
part1.push(codeBlock([
  "twinmso_codebase/",
  "\u251C\u2500 apps/",
  "\u2502   \u251C\u2500 web/      \u2014 Astro public site (28 pages)",
  "\u2502   \u251C\u2500 admin/    \u2014 React 19 admin SPA (15 modules)",
  "\u2502   \u2514\u2500 api/      \u2014 Hono REST API + scripts (migrate/seed/reset)",
  "\u251C\u2500 packages/",
  "\u2502   \u251C\u2500 db/       \u2014 Drizzle schema (36 tables), migrations, PGlite client",
  "\u2502   \u2514\u2500 shared/   \u2014 Zod contracts, enums, RBAC matrix",
  "\u251C\u2500 tooling/          \u2014 importers/exporters, DR drill, OWASP-equivalent scan",
  "\u251C\u2500 deploy/           \u2014 nginx.conf, systemd unit, backup/restore scripts",
  "\u2514\u2500 docs/             \u2014 master plan, specs, ADRs, phase evidence, runbooks",
]));
part1.push(spacer());
part1.push(h2("4.2 The Content Pipeline (How Admin Changes Reach the Website)"));
part1.push(p("Because the public site is static, published content moves through an explicit export-and-merge bridge rather than server-side rendering:"));
part1.push(...steps([
  [plain("An editor publishes content in the admin console (product, article, job posting, compatibility rule, distributor entry). The API writes the row and an audit-trail entry.")],
  [plain("The build-time exporter ("), mono("tooling/export-content.mjs"), plain(") queries the database for published-and-due records and regenerates "), mono("apps/web/public/assets/js/cms-content.js"), plain(" — a small static data file shipped with the site.")],
  [plain("At page load, "), mono("cms-merge.js"), plain(" merges that file into the page data before rendering: CMS products override matching prototype entries field-by-field, new SKUs append to the shop grid, job rows join the careers openings table, compatibility rules merge into the finder hierarchy, and distributor cards join the Where-to-Buy grid — always deduplicated so nothing renders twice.")],
  [plain("In production this export runs automatically in the web build's prebuild step; in development the operator re-runs the exporter after catalog edits (the exact command is in §7.6).")],
]));
part1.push(callout("note", "The bridge is field-aware: an empty CMS field never overwrites prototype data, so day-one rendering is pixel-identical to the approved design. The master plan's long-term direction is for the static prototype data to retire entirely once every entity is CMS-managed."));
part1.push(h2("4.3 Data Model Overview"));
part1.push(p("The schema (packages/db/src/schema.ts, 36 tables) groups into eight domains:"));
part1.push(dataTable(
  ["Domain", "Tables", "Purpose"],
  [
    ["Identity & audit", "user, session, account, two_factor, verification, audit_log", "Better Auth tables plus MFA and the 12-month audit trail"],
    ["Content", "article, news_post, page, faq, content_revision, content_comment", "CMS entities with 5-state workflow, revision snapshots and review comments"],
    ["Catalog", "brand, category, product, product_variant, compatibility_rule", "Products with pricing, warranty, facets; QVL matrix"],
    ["Channel", "distributor, marketplace_listing, partner_org, partner_member, partner_asset", "Where-to-Buy directory + gated partner portal"],
    ["Support", "form_submission, form_note, rma_request, rma_event", "15 lead types with SLA; 7-state RMA pipeline with event log"],
    ["Brand protection", "serial_registry, sn_check", "Factory serials + public verification log for anomaly scans"],
    ["Careers & i18n", "job_posting, job_application, locale, translation", "Openings/applications; 9-locale string workflow"],
    ["Media & settings", "media_asset, media_folder, setting, redirect", "DAM with responsive variants; site settings and redirects"],
  ],
  { widths: [1900, 4200, 3000] }
));
part1.push(spacer());
part1.push(h2("4.4 Security Model"));
part1.push(...bullets([
  [bold("Authentication"), plain(" — Better Auth email/password with server-enforced 10-character minimum (dev seed may use shorter throwaway passwords via the offline setter script). TOTP two-factor with QR enrollment, 10 backup codes, and lockout-aware verification. Sessions are 8 hours, refreshed every 30 minutes.")],
  [bold("Authorization"), plain(" — five roles (super_admin, admin, editor, author, viewer) enforced server-side on every route; the admin sidebar filters modules by role. Governance invariants (at least one active super_admin) are protected against concurrent demotion/ban races.")],
  [bold("Audit trail"), plain(" — every mutation writes an audit_log row (actor, action, entity, diff, request id, IP) with 12-month retention; the Audit Log module provides filterable review.")],
  [bold("Input validation"), plain(" — Zod schemas on every write; RFC 9457 problem+json error envelopes; upload allow-lists with magic-byte sniffing and SVG active-content rejection.")],
  [bold("Rate limiting & anti-spam"), plain(" — per-IP buckets on public endpoints (10 SN-checks/minute), Turnstile on public forms (bypass flag exists for dev only and is hard-refused in production), and TRUST_PROXY handling for Cloudflare client IPs.")],
  [bold("Transport & headers"), plain(" — TLS via Cloudflare (full-strict), CSP allowing only challenges.cloudflare.com externally, HSTS, X-Frame-Options DENY, nosniff, referrer and permissions policies set at nginx.")],
]));

module.exports = part1;
