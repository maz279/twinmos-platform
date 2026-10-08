// TwinMOS Platform Production Audit Report generator (documents:docx skill).
// Cover: recipe R1 (Pure Paragraph Left) + Dawn Mist Tech palette.
// Sections: cover (no page#) -> front matter (Roman) -> body (Arabic from 1).
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableLayoutType, TableOfContents,
} = require("docx");
const fs = require("fs");

const SHOTS = "F:/software_project/Software_Project_14/TwinMOS_Corporate_Website/audit/Audit_report/screenshots";
const OUT = "F:/software_project/Software_Project_14/TwinMOS_Corporate_Website/audit/Audit_report/TwinMOS_Production_Audit_Report_2026-10-08.docx";

// ---- palette: Dawn Mist Tech (design-system.md) ----
const P = {
  primary: "0A1628", body: "1A2B40", secondary: "6878A0", accent: "5B8DB8",
  surface: "F4F8FC",
  cover: { bg: "0A1628", titleColor: "FFFFFF", subtitleColor: "C9D6E8", metaColor: "B9C8DD", accent: "5B8DB8", footerColor: "8FA3C0" },
};

// ---- shared helpers ----
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([..."，。、；：！？", ..."的与和及之在于为", ..."-_/", " ", "\t"]);
  const lines = []; let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) { if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; } }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) { const last = lines.pop(); lines[lines.length - 1] += last; }
  return lines;
}
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt, lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) { lines = splitTitleLines(title, charsPerLine(minPt)); titlePt = minPt; }
  return { titlePt, titleLines: lines };
}
function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, hasEnglishLabel = false,
    metaLineCount = 0, fixedHeight = 800, pageHeight = 16838, marginTop = 0, marginBottom = 0 } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight + metaHeight + fixedHeight + implicitParaHeight;
  const safeRemaining = Math.max(usableHeight - contentHeight, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45), rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  return { topSpacing, midSpacing: Math.max(safeRemaining - topSpacing - bottomSpacing, 0), bottomSpacing };
}

// ---- cover recipe R1 ----
function buildCoverR1(config) {
  const C = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: C.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "), size: 18, color: C.accent, font: { ascii: "Calibri", eastAsia: "SimHei" }, characterSpacing: 40 })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true, color: C.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: C.subtitleColor, font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: C.metaColor, font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: C.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: C.footerColor, font: { ascii: "Arial" } }),
    ],
  }));
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({ shading: { type: ShadingType.CLEAR, fill: C.bg }, borders: noBorders, children })],
    })],
  })];
}

// ---- body builders (English business report) ----
const F = { ascii: "Calibri", eastAsia: "Microsoft YaHei" };
const FH = { ascii: "Calibri", eastAsia: "SimHei" };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, keepNext: true, spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: P.primary, font: FH })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, color: P.primary, font: FH })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED, spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: P.body, font: F, ...opts })],
  });
}
function bodyRuns(runs) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED, spacing: { line: 312, after: 120 },
    children: runs.map((r) => new TextRun({ size: 24, color: P.body, font: F, ...r })),
  });
}
function bullet(text, bold0) {
  const runs = [];
  if (bold0) runs.push(new TextRun({ text: bold0, bold: true, size: 24, color: P.body, font: F }));
  runs.push(new TextRun({ text, size: 24, color: P.body, font: F }));
  return new Paragraph({ bullet: { level: 0 }, spacing: { line: 312, after: 60 }, children: runs });
}
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 80, after: 240, line: 312 },
    children: [new TextRun({ text, size: 21, color: P.secondary, font: F, italics: true })],
  });
}
function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function figure(file, cap) {
  const { w, h } = pngSize(`${SHOTS}/${file}`);
  const dw = 580, dh = Math.round(dw * h / w);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 160 }, keepNext: true,
      children: [new ImageRun({ data: fs.readFileSync(`${SHOTS}/${file}`), transformation: { width: dw, height: dh }, type: "png" })],
    }),
    caption(cap),
  ];
}
function cell(text, opts = {}) {
  return new TableCell({
    children: [new Paragraph({ spacing: { line: 276 }, children: [new TextRun({ text: String(text), size: 20, bold: !!opts.bold, color: opts.color || P.body, font: F })] })],
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    width: opts.w ? { size: opts.w, type: WidthType.PERCENTAGE } : undefined,
  });
}
function table(headers, rows, widths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "9AA6B2" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "9AA6B2" },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
      insideVertical: NB,
    },
    rows: [
      new TableRow({
        tableHeader: true, cantSplit: true,
        children: headers.map((t, i) => cell(t, { bold: true, fill: "EAF1F8", w: widths ? widths[i] : undefined, color: P.primary })),
      }),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((t, i) => cell(t, { w: widths ? widths[i] : undefined })) })),
    ],
  });
}
function tableTitle(text) {
  return new Paragraph({
    keepNext: true, spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 21, color: P.secondary, font: F })],
  });
}

const pageFooter = (fmt) => new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: F })],
  })],
});
const pageHeader = new Header({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "TwinMOS Platform Production Audit Report", size: 18, color: "808080", font: F })],
  })],
});

// ---- content ----
const execSummary = [
  h1("Executive Summary"),
  bodyRuns([
    { text: "This report presents a comprehensive production-build and wiring audit of the TwinMOS corporate website platform, performed on 2026-10-07 and 2026-10-08 against the running production-shape stack: the built public website served at http://localhost:4321 (same-origin /api/v1 behind a reverse proxy mirroring the nginx deployment configuration), the built admin/CMS console served at http://localhost:4173, and the API service at http://localhost:8787 running the production entrypoint used by the deploy/systemd unit. The audit covered build provenance, frontend-to-backend connectivity, router behaviour, CMS/admin-to-frontend wiring, cache policy, and the full automated test estate." },
  ]),
  bodyRuns([
    { text: "Verdict. ", bold: true },
    { text: "Within the audited scope, the platform is 100 percent production-built and the admin/CMS console is fully wired to the public website: the content bridge was proven live in both directions (an article created, published and exported in the admin console rendered on the public learn pages and its own article page, and was removed from every public surface after deletion and re-export). All suites pass: 269/269 vitest integration tests, 49/49 Playwright end-to-end tests, and the GitHub Actions quality gate is green on every recent merge." },
  ]),
  bodyRuns([
    { text: "The audit was not vacuous: it surfaced six genuine defects (findings D13 through D18), all of which were fixed and verified during the audit window, including a served-bundle regression, a vacuous regression test, a cache policy that would have hidden CMS updates from returning visitors in production, and an off-by-one path bug that silently disabled the bridge dual-write shipped on 2026-10-08. Residual gaps that remain outside the audited scope (real hosting deployment, activation of eight non-English locales, and two deferred internal refactors) are enumerated in chapter 7 with owners and suggested sequencing." },
  ]),
];

const ch1 = [
  h1("1. Audit Scope, Environment and Method"),
  h2("1.1 Questions Under Audit"),
  bullet(" whether every surface is 100 percent production-built (frontend, admin/CMS console, backend API, router);", "Q1 -"),
  bullet(" whether the frontend, backend API and router are 100 percent connected;", "Q2 -"),
  bullet(" whether the CMS and admin panel are connected and wired 100 percent with the frontend;", "Q3 -"),
  bullet(" whether any gaps, discrepancies or missing items exist anywhere in that chain.", "Q4 -"),
  h2("1.2 Environment Under Test"),
  body("The platform is a monorepo (apps/web Astro static site, apps/admin React single-page console, apps/api Hono API, packages/db Drizzle schema, packages/shared Zod contracts). The audit ran against the production-shape stack assembled for this purpose: apps/web was built with PUBLIC_API_URL unset so the bundle calls same-origin /api/v1 exactly as behind the nginx reverse proxy (deploy/nginx/twinmos.conf), served by tooling/prod-preview.mjs on port 4321, which mirrors the nginx rules (static dist with try_files semantics, branded 404, /api forwarding to the API). The admin console was built with Vite and served from its hashed bundle on port 4173. The API ran on port 8787 via the same start command the systemd unit executes (node src/index.ts)."),
  h2("1.3 Method"),
  body("Evidence was gathered by direct live exercise rather than by inspection alone: authenticated admin API sessions created, published, exported and deleted real content; the exported bridge artifact was traced byte-for-byte from the API route into the web dist tree and the live HTTP response; public pages were rendered in fresh browser contexts and their DOM state asserted; HTTP cache headers were captured with curl; automated suites (vitest, Playwright) and the GitHub Actions pipeline were executed fresh on the audited code; and screenshots were captured at 1440x900 for the visual evidence appendix. Every claim in this report cites evidence that was produced during the audit window."),
];

const ch2 = [
  h1("2. Production Build Status (Q1)"),
  bodyRuns([
    { text: "Verdict: PASS - all three surfaces are production-built. ", bold: true },
    { text: "The public website's dist tree contains 36 generated HTML pages (28 public routes plus 8 locale landings plus the branded 404), and the built layout embeds an empty TWINMOS_API value, which is the same-origin production API base; the cross-origin development value is absent. The admin console is served from hashed, minified Vite chunks (for example content-EagLYn7f.js, index-CbRD9GIs.js) with no development markers. The API runs the exact production entrypoint (ExecStart=/usr/bin/node /opt/twinmos/api/src/index.ts in deploy/systemd/twinmos-api.service); the local instance was started with the same script." },
  ]),
  tableTitle("Table 1: Build provenance evidence"),
  table(
    ["Surface", "Evidence", "Result"],
    [
      ["Public web (apps/web/dist)", "36 HTML pages; apiUrl = \"\" baked into dist/index.html; wtyText guard present in dist app.js (5 occurrences)", "Production build"],
      ["Admin console (apps/admin/dist)", "Hashed Vite chunks; 0 inline scripts (CSP step 1 compliant)", "Production build"],
      ["API (apps/api)", "Same entrypoint as systemd unit; truthful /health with real SELECT 1", "Production runtime"],
      ["Asset sync", "prototype/, public/ and dist/ app.js byte-identical (md5 d450df8... x3)", "In parity"],
      ["Serving shape", "Same-origin /api via reverse proxy mirroring nginx conf; branded 404 page", "Production shape"],
    ],
    [24, 56, 20],
  ),
  body("Two build-integrity defects were found during the audit and fixed (D13 and D18, chapter 6). After the fixes, the source of truth (the version-controlled prototype snapshot), the vendored copy and the served build are byte-identical, and a live bridge export now updates the dist tree without a rebuild."),
];

const ch3 = [
  h1("3. Frontend, Backend API and Router Connectivity (Q2)"),
  bodyRuns([
    { text: "Verdict: PASS - fully connected within the audited scope. ", bold: true },
    { text: "Routing is deliberate and two-tiered by design: the public site uses file-based static routes (every page emitted as /page.html, preserving the prototype URL scheme including query contracts such as shop.html?cat=... and product.html?id=...), while the admin console uses a hash router (/#/m/<module>). The API is a Hono router with approximately 205 registered routes; middleware and literal routes register before parametric routes (a class of bug the test suite actively guards after an earlier incident)." },
  ]),
  tableTitle("Table 2: Live contract sweep (2026-10-08, through the same-origin proxy on port 4321 unless noted)"),
  table(
    ["Surface", "Probe", "Result"],
    [
      ["Health", "GET /api/v1/health", "200, {status:ok, db:connected} (real ping)"],
      ["Locales", "GET /api/v1/i18n/en and /ar", "200 / 200"],
      ["RMA tracker", "GET /api/v1/rma/TM-RMA-2026-256708 (real case)", "200"],
      ["RMA negative", "GET /api/v1/rma/TM-RMA-9999-000001 (bogus)", "404 truthful"],
      ["Serial verifier", "POST /api/v1/sn-check {serial:TMLIVE002}", "200 valid + SKU + mfg date"],
      ["Media bridge", "GET /api/v1/media/34/file", "200"],
      ["Admin auth-gating", "GET /api/v1/admin/{products,content/article,users,analytics,audit} without session", "401 on all five"],
    ],
    [22, 50, 28],
  ),
  body("The structural contract (frontend call-sites versus backend routes) was mechanically diffed in the earlier audit round with zero broken call-sites; this round re-exercised the live surfaces above. Admin routes are role-gated and return 401 unauthenticated; Better Auth sign-in through the admin origin is allow-listed via trusted origins. The web forms, RMA tracker, serial verifier, i18n and media widgets all communicate through the same-origin API base in the built bundle."),
];

const ch4 = [
  h1("4. CMS and Admin Panel Wiring to the Frontend (Q3)"),
  h2("4.1 Bridge Architecture"),
  body("Admin and CMS edits live in the database; the public site renders from a committed build artifact, cms-content.js, regenerated by POST /api/v1/admin/content/export (the API's own database handle, safe while live) and merged at page load by apps/web/public/assets/js/cms-merge.js, which adds only slugs not already present in the prototype corpus so imports can never duplicate static content. Since PR #14 the export dual-writes the artifact into the web dist tree, so a live export reaches the served build without a rebuild."),
  h2("4.2 Live Loop Evidence (both directions)"),
  body("During this audit an article titled \"Audit Evidence: CMS-to-Public Bridge Verification\" (slug audit-evidence-muz2r3it, id 495) was created through the authenticated admin API, transitioned to published, and exported. The export returned counts {articles:2, news:1, faqs:9, products:41, compatRules:36, distributors:37, jobs:1}; the bridge artifact contained the slug in apps/web/public/, in apps/web/dist/ (dual-write) and in the live HTTP response from port 4321, and the article rendered on learn-explained.html (correct category routing) and on its own article.html page in a fresh browser context. The article was then deleted and the export re-run: the slug was purged from the dist tree and absent from every public surface. Screenshots of the rendered CMS content were captured before cleanup and appear in Appendix A."),
  tableTitle("Table 3: Admin/CMS module to public surface wiring matrix"),
  table(
    ["Admin/CMS module", "Public surface", "Evidence"],
    [
      ["Content - articles", "learn-blog / learn-explained / learn-guides / article.html", "Live loop, both directions (4.2)"],
      ["Content - news", "news.html + home news strip", "Bridge counts + E2E gates"],
      ["Content - FAQs", "support.html Help-center updates tab", "Bridge + vitest suite"],
      ["Products", "shop grid, PDP, mega-menu live count (40)", "Fresh-context rendering + E2E"],
      ["Jobs", "careers.html openings", "Bridge + E2E"],
      ["Partners - directory", "where-to-buy locator + marketplaces", "Bridge artifact (37 distributors)"],
      ["Compatibility rules", "compatibility finder", "Bridge + tests (36 rules)"],
      ["Media", "Product imagery via public media route", "200 in Table 2"],
      ["RMA / Serials", "Public RMA tracker + SN verifier", "Live 200s in Table 2"],
      ["Submissions / Users / Audit / Settings / Translations", "Internal operations (by design, no public surface)", "Auth-gated 401 sweep"],
    ],
    [30, 40, 30],
  ),
  h2("4.3 Cache and Delivery Correctness"),
  body("The audit found that all /assets/ files were served with a one-year immutable cache policy, including the four non-hashed, mutable runtime files (app.js, data.js, cms-content.js, cms-merge.js). In production this would make every bridge or runtime update invisible to returning visitors for up to a year; the defect was reproduced live in the browser during the audit. Exact-match no-cache locations were added to both the nginx configuration and the production preview server, and verified: the four runtime files now respond with cache-control: no-cache while other assets retain immutable caching. The public site also registers a service worker (sw.js) which caches assets; stale-asset debugging requires unregistering it and clearing its caches, which was done for the in-app browser verification."),
];

const ch5 = [
  h1("5. Test and CI Results"),
  tableTitle("Table 4: Automated gates executed fresh on the audited code (2026-10-08)"),
  table(
    ["Gate", "Result", "Notes"],
    [
      ["TypeScript", "tsc clean x2 (api + admin)", "No errors"],
      ["ESLint (admin rules-of-hooks)", "0 violations", "U-1 regression protection"],
      ["vitest integration suite", "269/269 passed (30 files)", "Includes new dual-write regression test"],
      ["Playwright E2E", "49/49 passed", "28-page public matrix, params, PDP, admin row-open, 12-module sweep, RBAC negative"],
      ["GitHub Actions gate", "Green on PR #12, #13, #14 and post-merge main runs", "7 stages incl. npm audit and OWASP-equivalent scan"],
    ],
    [30, 30, 40],
  ),
  body("The Playwright estate includes polarity-proven regression gates: the Products row-open gate fails when the historical Rules-of-Hooks defect is reintroduced while tsc still passes, and the PDP warranty gate fails against the stale bundle and passes against the fixed one (both polarities exercised during this audit). Branch protection requires the gates check on every pull request with administrator enforcement enabled."),
];

const ch6 = [
  h1("6. Findings and Discrepancies (Q4)"),
  body("The audit deliberately hunted for gaps and found six real defects. All six were fixed and verified during the audit window; none remain open. They are recorded here with root cause and evidence because they define the boundaries of what \"100 percent\" was proven to mean."),
  tableTitle("Table 5: Findings register (all fixed during the audit window)"),
  table(
    ["ID", "Finding", "Root cause", "Fix + evidence"],
    [
      ["D13", "Served public bundle ran stale code: the committed warranty-display fix was silently reverted on every local build", "Asset sync preferred an outdated external prototype copy over the version-controlled snapshot", "Sync priority flipped to in-repo snapshot; md5 parity across prototype/, public/ and dist/ restored"],
      ["D14", "The warranty regression test passed under both buggy and fixed code (vacuous)", "Assertion ran on a product whose warranty value cannot produce the duplication", "Retargeted to microSDXC PDP (value contains the word); polarity-proven fail-then-pass"],
      ["D15", "Admin save E2E test left \"E2E warranty probe\" in the long-lived dev catalog", "Test mutated state without restore", "Test restores the original value; dev row verified restored"],
      ["D16", "Year-immutable cache on non-hashed mutable runtime files", "Blanket /assets/ immutable policy", "Exact-match no-cache (nginx + prod-preview); headers verified with curl"],
      ["D17", "Bridge articles with non-guide categories mis-routed to learn-guides", "Hardcoded tag 'Guide' overrode the real category", "Merge maps real category; Explainers article renders on learn-explained"],
      ["D18", "Bridge dual-write to the dist tree silently never wrote (shipped 2026-10-08 morning)", "Off-by-one path resolve (two hops instead of three) checked a directory that never exists", "Three-hop resolve + regression test; live export verified updating dist and served bytes"],
    ],
    [10, 28, 29, 33],
  ),
  body("Two process lessons are recorded for the team: regression assertions must be polarity-tested against the actual defective build, not only the fixed one (D14), and silent guards (existsSync/try-catch) around filesystem writes deserve a test that proves the write happens (D18)."),
];

const ch7 = [
  h1("7. Remaining Gaps and Risks"),
  body("No wiring or build gaps remain inside the audited scope. The following items are genuinely outside it and constitute the honest boundary of the \"100 percent\" verdict:"),
  bullet(" - provision a host, TLS certificates and Postgres, run migrations, seed with a real administrator credential, configure production secrets (BETTER_AUTH_SECRET, RESEND_API_KEY, Turnstile keys with API_ALLOW_NO_TURNSTILE off), and enable the backup cron and WAL archiving defined in deploy/.", "Real hosting deployment"),
  bullet(" - eight of nine locales (ar, hi, ru, zh-cn, fr, es, pt, de) are seeded but inactive pending translated content; routing and the translations module are ready.", "Locale activation"),
  bullet(" - apps/api/src/routes/admin.ts remains a 1,428-line file; the split is a deferred internal refactor gated on route-parity 205 = 205.", "admin.ts split (plan item 4.4)"),
  bullet(" - the admin origin still needs style-src unsafe-inline for inline style attributes; removing it requires refactoring styled components.", "CSP hardening step 2"),
  bullet(" - sign-in may land on a TOTP enrollment prompt (dismissible via \"Not now\"); decide whether enrollment becomes mandatory before rollout.", "MFA enrollment UX"),
  bullet(" - the legacy external prototype copy on this workstation is outdated but inert (never used while the in-repo snapshot exists); it should be reconciled or deleted to prevent future confusion.", "Stale external prototype"),
  bullet(" - the local security commit gate blocks on 372 previously adjudicated false positives (app.request in test files); adjudicating them in the Mimosa console would stop the recurring friction.", "Tooling hygiene"),
];

const ch8 = [
  h1("8. Conclusions"),
  tableTitle("Table 6: Verdicts against the audit questions"),
  table(
    ["Question", "Verdict", "Basis"],
    [
      ["Q1 Production-built 100%?", "PASS", "36-page dist with same-origin API base; hashed admin bundle; API on the production entrypoint; asset parity (Table 1)"],
      ["Q2 Frontend / API / router connected 100%?", "PASS", "Live contract sweep green; auth-gating correct; routing deliberate and tested (Table 2)"],
      ["Q3 CMS/admin wired to frontend 100%?", "PASS", "Bridge proven live both directions; dual-write verified; 10-module wiring matrix (chapter 4)"],
      ["Q4 Gaps, discrepancies, missing?", "6 found, 6 fixed (D13-D18); residual scope listed in chapter 7", "Findings register (Table 5)"],
    ],
    [34, 16, 50],
  ),
  body("The platform is production-built and fully wired within the audited scope, and the claim rests on live, repeatable evidence rather than inspection alone: the bridge loop, the contract sweep and the full test estate can be re-executed at any time against the same stack. The recommended next actions, in order, are: complete the real hosting deployment (it exercises nginx, TLS, Postgres and secrets that only production can prove), then activate locales as translated content becomes available, and schedule the admin.ts split and CSP step 2 as internal-quality increments."),
];

const appendixA = [
  h1("Appendix A: Visual Evidence (screenshots captured 2026-10-08)"),
  body("All screenshots were captured from the running production-shape stack at 1440x900: the public site from the built same-origin bundle on port 4321, the admin console from the built bundle on port 4173. Figures 4 and 5 show the audit-evidence article rendered from the CMS bridge before its post-audit cleanup."),
  ...figure("01-public-home.png", "Figure 1: Public home page (production build) - mega menu, live catalog count patched to 40 via the same-origin API"),
  ...figure("02-public-shop-grid.png", "Figure 2: Shop grid - client-rendered product cards from the merged catalog"),
  ...figure("03-public-pdp-warranty.png", "Figure 3: Product detail page - single-occurrence \"Lifetime warranty\" after the display-guard fix (finding D13/D14)"),
  ...figure("04-public-learn-explained-cms.png", "Figure 4: Learn - Explained page rendering the audit-evidence article created in the admin CMS minutes earlier"),
  ...figure("05-public-article-cms.png", "Figure 5: Full CMS article page (article.html?id=audit-evidence-muz2r3it) rendered from the bridge"),
  ...figure("06-public-where-to-buy.png", "Figure 6: Where-to-buy - distributor locator and offices synced from the bridge"),
  ...figure("07-public-rma-live.png", "Figure 7: RMA tracker returning live status for real case TM-RMA-2026-256708"),
  ...figure("08-admin-signin.png", "Figure 8: Admin console sign-in (production bundle on port 4173)"),
  ...figure("09-admin-products.png", "Figure 9: Admin Products module - 45 rows loaded from the API through the bundle proxy"),
  ...figure("10-admin-product-editor.png", "Figure 10: Product editor opened by row click - the U-1 regression surface"),
  ...figure("11-admin-content-cms.png", "Figure 11: Admin Content (CMS) module listing the audit-evidence article before cleanup"),
];

const appendixB = [
  h1("Appendix B: Evidence Log"),
  bullet(" - GitHub Actions gates green on PR #12 (run 37598613526 area), PR #13 (37725095294, 4m51s), PR #14 and post-merge main runs (37725558329, 4m35s).", "CI"),
  bullet(" - apps/web/dist: 36 HTML pages; apiUrl = \"\" in dist/index.html; wtyText x5 in dist/assets/js/app.js.", "Build"),
  bullet(" - md5 parity for app.js across prototype/, apps/web/public/assets/js/ and apps/web/dist/assets/js/: d450df8bd4ada34750bccdb1892674bc (x3).", "Sync"),
  bullet(" - cache-control: no-cache on /assets/js/{app,data,cms-content,cms-merge}.js; public, max-age=31536000, immutable retained on hashed assets; no-cache on HTML.", "Cache"),
  bullet(" - Bridge export counts at audit time: articles 2, news 1, faqs 9, products 41, compatRules 36, distributors 37, jobs 1; dual-write verified dist == served bytes.", "Bridge"),
  bullet(" - vitest 269/269 (30 files, includes the new dual-write regression test); Playwright 49/49; tsc clean x2; eslint 0.", "Suites"),
  bullet(" - Admin auth-gating: 401 without session on /api/v1/admin/products, content/article, users, analytics, audit.", "Security"),
  bullet(" - Live loop artifact slug audit-evidence-muz2r3it: present in public/, dist/ and the served HTTP response after export; absent everywhere after delete + export.", "Wiring"),
];

// ---- assemble ----
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: F, size: 24, color: P.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: { run: { font: FH, size: 32, bold: true, color: P.primary }, paragraph: { spacing: { before: 360, after: 160, line: 312 } } },
      heading2: { run: { font: FH, size: 28, bold: true, color: P.primary }, paragraph: { spacing: { before: 240, after: 120, line: 312 } } },
    },
  },
  sections: [
    { // cover
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCoverR1({
        title: "TwinMOS Platform Production Audit Report",
        subtitle: "Production build, API connectivity and CMS-to-frontend wiring verification",
        englishLabel: "PRODUCTION AUDIT",
        metaLines: [
          "Prepared for: TwinMOS Technologies Ltd.",
          "Repository: maz279/twinmos-platform (private), main at merge of PR #14",
          "Audit window: 2026-10-07 to 2026-10-08",
          "Stack audited: web :4321 (built), admin :4173 (built), API :8787",
        ],
        footerLeft: "TM-AUD-2026-10-08-PROD",
        footerRight: "Confidential - internal use",
        palette: P.cover,
      }),
    },
    { // front matter: TOC (Roman)
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 }, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } } },
      headers: { default: pageHeader },
      footers: { default: pageFooter("roman") },
      children: [
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, color: P.primary, font: FH })] }),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({ text: "Note: page numbers refresh in Word via right-click on the table, then \"Update Field\".", italics: true, size: 18, color: "8FA3C0", font: F })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    { // body (Arabic from 1)
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 }, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } },
      headers: { default: pageHeader },
      footers: { default: pageFooter("arabic") },
      children: [
        ...execSummary,
        ...ch1, ...ch2, ...ch3, ...ch4, ...ch5, ...ch6, ...ch7, ...ch8,
        ...appendixA, ...appendixB,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("WROTE", OUT, buf.length, "bytes");
});
