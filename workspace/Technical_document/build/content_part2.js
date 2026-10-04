// content_part2.js — Section 5: The Admin Console — module-by-module guide
const H = require("./helpers.js");
const { h1, h2, h3, p, bold, mono, plain, bullets, steps, codeBlock, dataTable, figure, callout, spacer } = H;

const part2 = [];

part2.push(h1("5. Admin Console — CMS Management Guide"));
part2.push(p("This section walks every module of the admin console. The console is reached at /admin on the production domain (http://localhost:5173/ in development) and requires a staff account. Sign-in offers optional TOTP two-factor; staff without MFA receive a skippable enrollment prompt. The workspace uses a grouped sidebar, a mega-menu (Modules button), multi-tab editing and a Ctrl/Cmd+K global search palette that queries leads, products, content, RMA and media at once."));
part2.push(...figure("admin_login.png", "Admin console sign-in (split-screen brand rail, TOTP-aware)"));
part2.push(callout("note", "Roles gate everything: viewers read; authors write content drafts; editors publish and manage channel data; admins manage orgs; super_admins manage users, locales and governance. Buttons for actions your role lacks are hidden or disabled server-side as well as in the UI."));

// ---- 5.1 Dashboard ----
part2.push(h2("5.1 Dashboard"));
part2.push(...figure("admin_dashboard.png", "Dashboard — KPI strip, 14-day trends, SLA risk queue and activity feed"));
part2.push(p("The dashboard is the morning cockpit: live counts of new leads, overdue SLA, open RMAs, published content, catalog size and applications; a 14-day leads-and-RMA chart; lead status mix and by-type split; an SLA risk queue (oldest due first — click any row to open the lead); media alt-text compliance; and the latest audited mutations. Four quick actions jump straight into common tasks (New article, Add product, Review leads, Media library)."));

// ---- 5.2 Content Studio ----
part2.push(h2("5.2 Content Studio (Articles, News, Pages, FAQ)"));
part2.push(...figure("admin_content.png", "Content Studio — library with entity tabs, status filter, bulk publish and pagination"));
part2.push(h3("What it manages"));
part2.push(...bullets([
  [bold("Articles"), plain(" — knowledge-base and learn-hub pieces (markdown body with a formatting toolbar and direct media-library image insertion).")],
  [bold("News & Events"), plain(" — newsroom posts with tag and optional event date.")],
  [bold("Pages"), plain(" — composed visually from 13 registered block types via the page builder (drag-reorder, live desktop/tablet/mobile preview, JSON escape hatch).")],
  [bold("FAQ"), plain(" — question/answer entries grouped by area (support-facing).")],
]));
part2.push(h3("Step-by-step: publish an article"));
part2.push(...steps([
  [plain("Open "), bold("Content Studio"), plain(" and press "), bold("+ New article"), plain(".")],
  [plain("Enter the title (slug auto-derives), a deck/summary, and write the body in markdown. A live word count and reading-time estimate appear under the editor.")],
  [plain("Press "), bold("Create draft"), plain(". The editor remounts on the saved row and workflow buttons appear.")],
  [plain("Choose "), bold("Submit for review"), plain(" (author) or "), bold("Publish"), plain(" (editor+). Optionally set a future date with Publish at to schedule — the scheduled publisher promotes it automatically.")],
  [plain("Published articles appear on the website's news/learn surfaces after the content export (automatic in production builds). The Review Queue tab shows items awaiting an editor: open one to see a visual diff against the published revision, leave comments, then publish or send back.")],
]));
part2.push(h3("Revisions, rollback and conflicts"));
part2.push(p("Every publish snapshots the prior version. The Revisions tab lists snapshots with actor and time, shows a diff against your current draft, and offers one-click Rollback (editor+). Saves carry optimistic locking: if a colleague saved while you were editing, the API refuses yours with a conflict banner — reload fresh and re-apply, nothing is silently overwritten."));

// ---- 5.3 Products ----
part2.push(h2("5.3 Products (Catalog)"));
part2.push(...figure("admin_products.png", "Products — searchable catalog with pricing, status, facets and taxonomy filter"));
part2.push(h3("Step-by-step: create a product"));
part2.push(...steps([
  [plain("Open "), bold("Products"), plain(" and press "), bold("+ New product"), plain(".")],
  [plain("Fill "), bold("Identity"), plain(": name, SKU (A-Z 0-9 dashes), slug, status, brand, category.")],
  [plain("Complete "), bold("Storefront card"), plain(": the catalog card line (one-liner under the product name), marketing description and badges. A live preview mirrors the public shop card as you type — including a live-on-next-export / draft indicator.")],
  [plain("Set "), bold("Shop facets"), plain(": generation, capacity, interface and form factor. These drive the public shop filters; suggestions are built-in.")],
  [plain("Complete "), bold("Pricing & warranty"), plain(" (list price + authorized currency, warranty term shown on the product page), "), bold("Specifications"), plain(" (key/value rows), "), bold("Datasheets"), plain(" and "), bold("Images"), plain(" (hero + gallery via the media picker).")],
  [plain("Press "), bold("Create product"), plain(", then "), bold("Publish"), plain(" when ready. Published products flow to the public shop/product pages on the next content export.")],
]));
part2.push(...figure("admin_product_editor.png", "Product editor — storefront preview, facets, pricing & warranty"));
part2.push(h3("Variants, import and export"));
part2.push(p("The Variants & SKUs tab manages hardware variants (capacity/speed/finish/lighting with per-variant price and stock) inside the product's designed extension point. The Import / Export dialog downloads a CSV template and uploads batch catalogs with dry-run validation; a full-catalog export is one click. Product deletions are soft (recoverable) and blocked while media assets reference the product."));

// ---- 5.4 Compatibility ----
part2.push(h2("5.4 Compatibility Matrix (QVL)"));
part2.push(p("The Compatibility module maintains the validated-device rules behind the public finder: device type tab, brand, model, memory generation, form factor, maximum RAM, slot count, validated speed, recommended product categories and the SSD upgrade note. Search, type/generation filters and coverage counters sit above the list; batch CSV import (dry-run first, upsert by type+brand+model+gen+form) handles factory QVL manifests. Every rule change is editor-guarded and audited."));

// ---- 5.5 Leads & Quotes ----
part2.push(h2("5.5 Leads & Quotes"));
part2.push(...figure("admin_submissions.png", "Leads & quotes — SLA-tracked inbox with ownership routing and speed-to-lead column"));
part2.push(h3("The lead workflow"));
part2.push(...steps([
  [plain("A public form (quote, contact, support ticket, distributor application\u2026) posts to the API; the submission lands in the inbox with status "), bold("new"), plain(", a reference code (QT-/TS-/RMA-2026-\u2026), priority and a first-response SLA deadline derived from its type.")],
  [plain("Filter the inbox by type/status/priority/SLA, ownership (Anyone / Unassigned queue / Mine / a specific owner) or free text across email, reference and payload.")],
  [plain("Open a lead to see the full payload, SLA state and the pipeline strip (new \u2192 assigned \u2192 in progress \u2192 resolved / closed / spam). Reassign via the owner dropdown or take it yourself.")],
  [plain("Use "), bold("Reply to customer"), plain(" to email the enquirer directly from the case — the mailer sends, first-response time is stamped, the lead is claimed if unowned, and the reply is logged as an internal note. Speed-to-lead metrics (average first reply, share answered within an hour, currently-waiting count) appear in the analytics strip and as a per-row Reply column.")],
  [plain("Add internal notes for collaboration (audited), then advance the status. Everything on the lead is audit-trailed.")],
]));
part2.push(h3("Reading the analytics"));
part2.push(p("The collapsible strip above the inbox shows the cumulative funnel, SLA gauges (overdue / due soon / healthy), arrivals by type and the reply-rate gauge. The dashboard's SLA risk queue mirrors the most urgent rows."));

// ---- 5.6 RMA Board ----
part2.push(h2("5.6 RMA Board (Returns)"));
part2.push(...figure("admin_rma.png", "RMA board — 7-column Kanban with optimistic transitions and assignee chips"));
part2.push(h3("Working a case"));
part2.push(...steps([
  [plain("Cases arrive from the public RMA form as "), bold("submitted"), plain(". The board defaults to a Kanban view — one column per state, oldest first, with card chips for age, SKU, serial and technician.")],
  [plain("Move a case with the arrow buttons on its card (optimistic — the card jumps instantly and rolls back on server refusal). The detail panel offers the same transitions with a note and an "), bold("Email customer"), plain(" checkbox that sends a status update through the mailer.")],
  [plain("Open a case to see the customer, issue, warranty tier, the "), bold("serial authenticity check"), plain(" card (verdict verified / not-in-registry / suspicious with registry SKU match and 24-hour distinct-source activity — the verify-before-service gate), the timeline of every transition, the assignment dropdown and a free-form "), bold("Reply to customer"), plain(" composer.")],
  [plain("Assign a technician; the chip follows the case across board and detail views.")],
]));
part2.push(callout("note", "The serial-authenticity card is the operational half of brand protection: it joins the RMA's serial to the factory registry and the last 24 hours of public SN-checks using the same >5-distinct-sources rule as the anomaly scan, so warranty service is never approved on a leaked or counterfeit serial without the team seeing it."));

// ---- 5.7 Careers ----
part2.push(h2("5.7 Careers (Postings & Applications)"));
part2.push(p("The Careers module manages job postings (department, location, type, seniority, apply-by deadline with red/amber closing warnings, salary band where legally required, equal-opportunity statement, markdown description whose first paragraph ships to the public careers page as the summary) and the applications inbox (pipeline new \u2192 in review \u2192 resolved, per-role filter, candidate drill-down with the full payload and a one-click reply that emails the candidate and moves new applications into review). Analytics strip: live postings, new applications, top roles by applicant count, 14-day arrivals."));

// ---- 5.8 SN-check & Serials ----
part2.push(h2("5.8 SN-check & Serials (Anti-Counterfeit)"));
part2.push(...figure("admin_serials.png", "SN-check & serials — registry analytics, quick verify, drill-down and import"));
part2.push(h3("The brand-protection loop"));
part2.push(...steps([
  [plain("Import factory serials: "), bold("CSV import"), plain(" accepts production-run manifests (header serial,sku,manufacturedAt,batch) with a mandatory dry-run row report; rows upsert by serial. File upload or paste both work.")],
  [plain("Monitor the registry: the analytics strip tracks registry size, checks in 24h/7d, valid rate, top SKUs and countries by verification volume. "), bold("Quick verify"), plain(" runs the real public check on any serial without leaving the console.")],
  [plain("Investigate a serial: click any row (or Drill down from quick verify) for the registry data, 24-hour distinct-source activity and the full verification log with verdict (verified / unknown / suspicious).")],
  [plain("Run the "), bold("Anomaly scan"), plain(" for serials verified from more than N distinct IPs or countries in 24 hours — the distribution signature of leaked or counterfeit serials — and email the ops alert when the list is non-empty.")],
  [plain("Registry lifecycle: delete a serial (editor+) when it must stop verifying; the verification history is preserved for investigation.")],
]));

// ---- 5.9 Partners & Channel ----
part2.push(h2("5.9 Partners & Channel"));
part2.push(...figure("admin_partners.png", "Partners & channel — portal organizations and the where-to-buy directory"));
part2.push(h3("Portal organizations"));
part2.push(p("The first tab manages channel organizations (distributor / OEM / SI): create with country and contact email, activate or suspend, and open the detail drawer to add member accounts (staff sign-in emails), upload gated assets (price files, MDF documents, resources with per-type visibility) and delete when empty. Partners authenticate on the public site and see exactly the assets their organization is entitled to."));
part2.push(h3("Where-to-Buy directory"));
part2.push(p("The second tab is the public locator's source of truth: distributor entries with card title, distributor name, region (matching the site's filter chips), channel status (hub / authorized / expanding / seeking), cities, contact and card note — plus verified online marketplace listings. Search and region/status filters narrow the list; batch CSV import (dry-run + upsert by name+country) handles channel manifests. Published entries flow to the Where-to-Buy page through the content export."));

// ---- 5.10 Media Library ----
part2.push(h2("5.10 Media Library (DAM)"));
part2.push(...figure("admin_media.png", "Media library — folder tree, analytics strip, search/kind filters and asset cards"));
part2.push(...steps([
  [plain("Upload: pick a folder (the tree creates/renames/deletes; deleting never orphans assets), choose a file, provide the required "), bold("alt text"), plain(" (accessibility), press Upload. Raster images automatically derive responsive variants (thumb/card/hero/full WebP + hero AVIF)."), plain(" "), bold("Bulk upload"), plain(" accepts many files at once with alt text derived from filenames for later review.")],
  [plain("Find: search across key and alt text; filter by kind or missing-alt. The analytics strip reports totals by kind, alt compliance, variant coverage and storage footprint.")],
  [plain("Use: copy the admin URL (authenticated) or the public URL (site-usable) from any card, or open the "), bold("usage drawer"), plain(" (the \u24C8 button) to see exactly which products, articles and news posts reference the asset before deleting.")],
  [plain("Govern: low-resolution masters (<1200px) are flagged per the brand guideline; deletes are admin-only and blocked while an asset is referenced.")],
]));

// ---- 5.11 Translations ----
part2.push(h2("5.11 Translation Studio"));
part2.push(p("Nine locales are managed as string keys grouped by namespace with import/export for CAT-tool round-trips. The coverage heatmap (also shown in Content Studio's analytics) highlights key-exact coverage versus English so localization gaps are visible at a glance. Locale activation (which locales receive hreflang alternates) is a super_admin setting in Settings."));

// ---- 5.12 Users & Roles ----
part2.push(h2("5.12 Users & Roles"));
part2.push(...figure("admin_users.png", "Users & Roles — directory with security analytics strip and per-user profile drawer"));
part2.push(p("The super_admin-only module lists staff with search, role filter and pagination; invites new staff by email (role preset, optional initial password); changes roles (with a governance invariant preserving at least one active super_admin, race-safe under concurrent changes); revokes sessions (immediate logout); and suspends accounts with reason and optional expiry. The security analytics strip reports role distribution, MFA coverage, active session count and suspended accounts. Click any row for the per-user security profile: MFA state, live sessions and that account's last twenty audited actions."));

// ---- 5.13 Audit Log ----
part2.push(h2("5.13 Audit Log"));
part2.push(p("Every mutation in every module lands here: actor, action, entity, entity id, request id, IP and timestamp, filterable by all of them. Retention is 12 months by default (configurable via environment). Use it to answer \u201Cwho changed this price\u201D or \u201Cwhat did this operator do\u201D questions; the per-user view in Users & Roles is the same data scoped to one account."));

// ---- 5.14 Settings ----
part2.push(h2("5.14 Settings"));
part2.push(...figure("admin_settings.png", "Settings — redirects manager, visual menu builder and locales"));
part2.push(...bullets([
  [bold("Redirects"), plain(" — add from/to paths with 301/302/308 semantics; client-side validation (leading slash, http(s) targets, source \u2260 destination), search, count and a live test link that opens the source path to watch it redirect.")],
  [bold("Menus"), plain(" — a visual builder editing the site menus document: per-group label/URL rows with add/remove/reorder, new-group creation and a JSON escape hatch for power users; changes save atomically with dirty-state tracking.")],
  [bold("Locales"), plain(" — the nine-locale registry with search and activation toggles (super_admin); active locales receive hreflang alternates in the site build.")],
]));

module.exports = part2;
