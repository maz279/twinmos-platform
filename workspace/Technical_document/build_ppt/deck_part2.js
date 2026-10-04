// deck_part2.js — slides 9-16: admin tour, marketing/leads, channel, careers, compat finder, competitive, technical, security
const H = require("./deck_helpers.js");
const { C, FONT, W, M, shot, darkHeader, lightHeader, stat, featureRow, bu } = H;

function build(pres) {
  // ============ SLIDE 9 — ADMIN CONSOLE TOUR ============
  let s = pres.addSlide();
  darkHeader(s, pres, "Platform Tour", "The admin console \u2014 your team's daily cockpit");
  shot(s, pres, "admin_dashboard.png", { x: M, y: 1.95, w: 7.6 });
  const mod9 = [
    ["15 modules", "Content, products, leads, RMA, partners, careers, media, translations, users, audit, settings"],
    ["Role-based access", "5 roles from viewer to super-admin; every action logged"],
    ["Two-factor auth", "TOTP with backup codes; session revocation"],
    ["Global search", "Ctrl+K searches everything \u2014 leads, products, content, RMA"],
  ];
  mod9.forEach(([l, d], i) => featureRow(s, pres, 8.6, 2.0 + i * 1.1, 4.2, l, d,
    { leadColor: C.ACCENT, descColor: C.TEXT_INV, h: 1.0 }));

  // ============ SLIDE 10 — CONTENT STUDIO ============
  s = pres.addSlide();
  lightHeader(s, pres, "Content Management", "Publish in minutes, not days");
  shot(s, pres, "admin_content.png", { x: M, y: 1.8, w: 7.6 });
  const cs = [
    ["Visual page builder", "13 drag-and-drop block types with live responsive preview"],
    ["Two-person review", "Authors draft; editors approve with visual diff"],
    ["Full revision history", "Every publish snapshots the prior version; one-click rollback"],
    ["Scheduled publishing", "Set a future date; the promoter publishes automatically"],
    ["Markdown + media", "Formatting toolbar with direct media-library image insertion"],
  ];
  cs.forEach(([l, d], i) => featureRow(s, pres, 8.6, 1.9 + i * 0.95, 4.2, l, d, { h: 0.85, fontSize: 12 }));

  // ============ SLIDE 10B — OPERATIONS MODULES GRID ============
  s = pres.addSlide();
  darkHeader(s, pres, "Platform Tour", "Catalogue, serials, media and access \u2014 managed in-house");
  const mods = [
    ["admin_products.png", "Product Catalogue", ["40 products with specs, imagery, variants and SEO fields", "The public shop and facets stay in sync automatically"]],
    ["admin_serials.png", "Serial Registry", ["Factory serials imported, verified and tracked", "Anomaly scan flags suspected gray-market units"]],
    ["admin_media.png", "Media Library", ["Central assets with folders and usage tracking", "Alt-text compliance audited per image"]],
    ["admin_users.png", "Users & Roles", ["5 roles, two-factor auth, session revocation", "Every staff action written to the audit trail"]],
  ];
  mods.forEach(([img, title, pts], i) => {
    const x = M + i * 3.1, w = 2.95;
    shot(s, pres, img, { x, y: 1.95, w, h: 1.66 });
    s.addText(title, { x, y: 3.75, w, h: 0.35, fontSize: 15, fontFace: FONT,
      color: C.ACCENT, bold: true, margin: 0 });
    s.addText(pts.map((t, j) => ({ text: t, options: { bullet: bu(), breakLine: j < pts.length - 1 } })),
      { x, y: 4.15, w, h: 2.5, fontSize: 11.5, fontFace: FONT, color: C.TEXT_INV,
        paraSpaceAfter: 6, margin: 0, valign: "top" });
  });

  // ============ SLIDE 11 — LEADS & QUOTES (speed-to-lead) ============
  s = pres.addSlide();
  darkHeader(s, pres, "Marketing & Sales", "Every lead answered before it goes cold");
  shot(s, pres, "admin_submissions.png", { x: M, y: 1.95, w: 7.6 });
  const leads = [
    ["Speed-to-lead measured", "First-response time tracked on every lead \u2014 contacted within 5 minutes, a lead is 21\u00D7 more likely to qualify than after 30 minutes"],
    ["SLA enforcement", "Per-type response deadlines; overdue leads surface on the dashboard's risk queue"],
    ["One-click reply", "Email the customer directly from the case; the reply is logged and timestamps the first response"],
    ["Ownership routing", "Unassigned queue, per-staff assignment, priority and status filters"],
  ];
  leads.forEach(([l, d], i) => featureRow(s, pres, 8.6, 2.0 + i * 1.15, 4.2, l, d,
    { leadColor: C.ACCENT, descColor: C.TEXT_INV, h: 1.05, fontSize: 12 }));
  s.addText("Source: Lead Response Management study (Oldroyd \u00B7 MIT \u00B7 InsideSales.com)", {
    x: M, y: 6.9, w: 6, h: 0.3, fontSize: 10, fontFace: FONT, color: C.MUTED_INV, margin: 0 });

  // ============ SLIDE 12 — CHANNEL / WHERE TO BUY ============
  s = pres.addSlide();
  lightHeader(s, pres, "Channel Enablement", "The where-to-buy locator \u2014 managed from the console");
  shot(s, pres, "site_where_to_buy.png", { x: M, y: 1.8, w: 7.4 });
  shot(s, pres, "admin_partners.png", { x: 8.3, y: 1.8, w: 4.4, h: 2.48 });
  const ch = [
    ["Distributor directory", "Country cards with region, status, cities, contacts \u2014 instantly live"],
    ["Partner portal", "Gated price files, MDF documents for authorized partners"],
    ["Verified marketplaces", "Official storefronts listed alongside physical channels"],
    ["CSV import", "Batch-update the directory from channel manifests"],
  ];
  ch.forEach(([l, d], i) => featureRow(s, pres, 8.3, 4.55 + i * 0.62, 4.4, l, d, { h: 0.55, fontSize: 11.5 }));

  // ============ SLIDE 13 — COMPATIBILITY FINDER ============
  s = pres.addSlide();
  darkHeader(s, pres, "Pre-Sales Confidence", "The compatibility finder removes purchase hesitation");
  shot(s, pres, "site_compat_result.png", { x: M, y: 1.95, w: 7.4 });
  const cf = [
    ["Guided device lookup", "Type \u2192 brand \u2192 model: validated memory guidance in 3 clicks"],
    ["QVL matrix managed in-house", "Max capacity, slot count, speed and SSD upgrade path per device"],
    ["Recommendations inline", "The finder suggests the right product categories per device"],
    ["Reduces returns", "Customers buy the correct module the first time"],
  ];
  cf.forEach(([l, d], i) => featureRow(s, pres, 8.4, 2.0 + i * 1.1, 4.4, l, d,
    { leadColor: C.ACCENT, descColor: C.TEXT_INV, h: 1.0 }));

  // ============ SLIDE 14 — COMPETITIVE ANALYSIS ============
  s = pres.addSlide();
  lightHeader(s, pres, "Competitive Analysis", "How the TwinMOS platform compares");
  // comparison table (native)
  const rows = [
    [{ text: "Capability", options: { bold: true, color: C.WHITE, fill: { color: C.PRIMARY }, fontSize: 13 } },
     { text: "TwinMOS Platform", options: { bold: true, color: C.WHITE, fill: { color: C.ACCENT_D }, fontSize: 13 } },
     { text: "Kingston / Corsair", options: { bold: true, color: C.WHITE, fill: { color: C.PRIMARY }, fontSize: 13 } },
     { text: "Typical agency site", options: { bold: true, color: C.WHITE, fill: { color: C.PRIMARY }, fontSize: 13 } }],
    ["Public serial verification", { text: "\u2713 Instant registry lookup", options: { color: C.ACCENT_D, bold: true } }, "Guide page only \u2014 no SN lookup", "\u2717 Not offered"],
    ["Compatibility finder", { text: "\u2713 Full QVL, CMS-managed", options: { color: C.ACCENT_D, bold: true } }, "\u2713 Device configurators", "\u2717 Static page"],
    ["RMA tracking", { text: "\u2713 Public 7-state tracker", options: { color: C.ACCENT_D, bold: true } }, "\u2713 Via support portals", "\u2717 Email only"],
    ["CMS + shop integration", { text: "\u2713 One system", options: { color: C.ACCENT_D, bold: true } }, "\u2713 Separate systems", "\u2717 Developer-needed"],
    ["Multi-language", { text: "\u2713 9 locales, RTL ready", options: { color: C.ACCENT_D, bold: true } }, "\u2713 16+ languages (Kingston)", "\u2717 Typically not"],
    ["Partner portal", { text: "\u2713 Gated assets, roles", options: { color: C.ACCENT_D, bold: true } }, "\u2713 Login portals", "\u2717 Not offered"],
    ["Audit trail & roles", { text: "\u2713 Every change logged", options: { color: C.ACCENT_D, bold: true } }, "Not public", "\u2717 None"],
  ];
  s.addTable(rows, { x: M, y: 1.75, w: W - 2 * M, colW: [3.2, 3.3, 2.8, 2.8],
    fontSize: 12, fontFace: FONT, color: C.TEXT, border: { pt: 0.5, color: "D5DDE7" },
    fill: { color: C.WHITE }, rowH: 0.55, valign: "middle", margin: 0.08 });
  s.addText("Sources: kingston.com product-verification, configurator and support pages; corsair.com warranty and support pages \u2014 reviewed October 2026. Agency-site column reflects common market practice.", {
    x: M, y: 6.85, w: W - 2 * M, h: 0.3, fontSize: 10, fontFace: FONT, color: C.MUTED, margin: 0 });

  // ============ SLIDE 15 — TECHNICAL SUPERIORITY ============
  s = pres.addSlide();
  darkHeader(s, pres, "Technical Superiority", "An architecture built for scale, speed and security");
  const techCards = [
    ["Sub-second pages", "Static-first + CDN: the public site needs no server compute; pages are served from the edge worldwide.", "Edge-served HTML \u00B7 zero server compute per page"],
    ["Zero-downtime deploys", "Static bundles swap atomically; the API restarts in seconds with systemd auto-recovery.", "No maintenance windows for content updates"],
    ["Bank-grade security", "OWASP-equivalent scan: 14 check classes, 0 findings. Rate limiting, 2FA, audit trail, parameter-bound queries only.", "Verified October 2026"],
    ["Single source of truth", "One PostgreSQL database behind all three surfaces; no syncing, no drift.", "Changes flow: console \u2192 database \u2192 website"],
  ];
  techCards.forEach(([title, desc, metric], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * 6.2, y = 1.95 + row * 2.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.95, h: 2.05, rectRadius: 0.08,
      fill: { color: C.BG2 }, line: { color: "24405E", width: 1 } });
    s.addText(title, { x: x + 0.3, y: y + 0.2, w: 5.3, h: 0.4,
      fontSize: 17, fontFace: FONT, color: C.ACCENT, bold: true, margin: 0 });
    s.addText(desc, { x: x + 0.3, y: y + 0.65, w: 5.3, h: 1.0,
      fontSize: 12, fontFace: FONT, color: C.TEXT_INV, margin: 0, valign: "top" });
    s.addText(metric, { x: x + 0.3, y: y + 1.65, w: 5.3, h: 0.3,
      fontSize: 10.5, fontFace: FONT, color: C.GOLD, italic: true, margin: 0 });
  });

  // ============ SLIDE 16 — QUALITY EVIDENCE ============
  s = pres.addSlide();
  lightHeader(s, pres, "Quality Evidence", "Not claims \u2014 measured, verified, documented");
  const qe = [
    ["253", "automated end-to-end tests", "26 suites covering auth, MFA, RBAC races, CMS workflow, catalog, leads, RMA, serials, media, security headers"],
    ["0", "security scan findings", "14 OWASP-equivalent check classes \u00B7 35 requests \u00B7 headers, CORS, authz, injection, XSS, rate limits"],
    ["100%", "link & asset integrity", "28 pages crawled \u00B7 35 unique link targets \u00B7 0 broken links \u00B7 0 missing assets \u00B7 0 error pages"],
    ["9", "languages ready", "Locale framework with hreflang alternates and RTL (Arabic) verified"],
  ];
  qe.forEach(([v, l, d], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * 6.2, y = 1.8 + row * 2.4;
    s.addText(v, { x, y, w: 1.6, h: 1.0, fontSize: 48, fontFace: FONT, color: C.ACCENT_D, bold: true, margin: 0 });
    s.addText(l, { x: x + 1.75, y: y + 0.1, w: 4.2, h: 0.5, fontSize: 16, fontFace: FONT, color: C.PRIMARY, bold: true, margin: 0 });
    s.addText(d, { x: x + 1.75, y: y + 0.6, w: 4.2, h: 1.3, fontSize: 11.5, fontFace: FONT, color: C.MUTED, margin: 0, valign: "top" });
  });
  s.addText("Full evidence trail: phase-evidence documents P1\u2013P7 + forensic audit (Oct 2026), reproducible from the repository.", {
    x: M, y: 6.7, w: W - 2 * M, h: 0.35, fontSize: 11, fontFace: FONT, color: C.MUTED, margin: 0 });

  return 9;
}

module.exports = { build };
