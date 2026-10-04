// deck_part1.js — slides 1-8: cover, agenda, exec summary, platform, public site, commerce, brand protection, support
const H = require("./deck_helpers.js");
const { C, FONT, W, M, shot, darkHeader, lightHeader, stat, featureRow, bu } = H;

function build(pres) {
  // ============ SLIDE 1 — COVER ============
  let s = pres.addSlide();
  s.background = { color: C.BG };
  // teal glow accent (large circle shape, subtle)
  s.addShape(pres.shapes.OVAL, { x: 9.2, y: -2.2, w: 7, h: 7,
    fill: { color: C.ACCENT, transparency: 92 }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: -2.5, y: 4.8, w: 6, h: 6,
    fill: { color: C.PRIMARY, transparency: 85 }, line: { type: "none" } });
  s.addText("UNISOFT SYSTEM LTD  \u00B7  PRESENTS", { x: M, y: 1.7, w: W - 2 * M, h: 0.4,
    fontSize: 15, fontFace: FONT, color: C.ACCENT, bold: true, charSpacing: 4, margin: 0 });
  s.addText("TwinMOS Digital Platform", { x: M, y: 2.3, w: W - 2 * M, h: 1.0,
    fontSize: 54, fontFace: FONT, color: C.WHITE, bold: true, margin: 0 });
  s.addText("A complete digital transformation: website, content management,\ncustomer engagement and brand protection \u2014 in one platform", {
    x: M, y: 3.5, w: 9.5, h: 0.9, fontSize: 18, fontFace: FONT, color: C.TEXT_INV, margin: 0 });
  s.addText([
    { text: "Prepared for TwinMOS Management", options: { breakLine: true } },
    { text: "October 2026", options: {} },
  ], { x: M, y: 6.2, w: 6, h: 0.7, fontSize: 14, fontFace: FONT, color: C.MUTED_INV, margin: 0 });
  s.addText("253 automated tests passed  \u00B7  0 security findings  \u00B7  production-ready", {
    x: 7.2, y: 6.45, w: 5.5, h: 0.4, fontSize: 12, fontFace: FONT, color: C.ACCENT, margin: 0, align: "right" });

  // ============ SLIDE 2 — AGENDA ============
  s = pres.addSlide();
  lightHeader(s, pres, "Agenda", "What we will cover in the next 30 minutes");
  const agenda = [
    ["01", "Executive Summary", "The platform at a glance and what it delivers"],
    ["02", "Platform Tour", "Public website, admin console and the technology"],
    ["03", "Reaching Customers", "Marketing, lead conversion and channel enablement"],
    ["04", "Customer Service", "Support, RMA and the anti-counterfeit advantage"],
    ["05", "Competitive Analysis", "How this platform compares to market alternatives"],
    ["06", "Technical Superiority", "Architecture, security and quality gates"],
    ["07", "Roadmap & Next Steps", "Deployment plan and what happens after launch"],
  ];
  agenda.forEach(([num, title, desc], i) => {
    const col = i < 4 ? 0 : 1;
    const y = 1.75 + (i % 4) * 1.25;
    const x = col === 0 ? M : 7.0;
    s.addText(num, { x, y, w: 0.7, h: 0.9, fontSize: 30, fontFace: FONT, color: C.ACCENT, bold: true, margin: 0 });
    s.addText([
      { text: title, options: { bold: true, fontSize: 17, color: C.PRIMARY, breakLine: true } },
      { text: desc, options: { fontSize: 12.5, color: C.MUTED } },
    ], { x: x + 0.85, y: y + 0.05, w: 5.2, h: 1.0, fontFace: FONT, margin: 0, valign: "top" });
  });

  // ============ SLIDE 3 — EXECUTIVE SUMMARY (stats) ============
  s = pres.addSlide();
  darkHeader(s, pres, "Executive Summary", "One platform replaces four disconnected systems");
  const stats = [
    ["28", "public website pages\nreplacing the legacy site"],
    ["15", "admin modules covering\ncontent, sales & support"],
    ["15", "customer-facing form types\nwith SLA-tracked workflows"],
    ["253", "automated tests\nall passing"],
  ];
  stats.forEach(([v, l], i) => {
    stat(s, pres, M + i * 3.1, 2.0, 2.9, v, l, { size: 52, color: C.ACCENT, labelColor: C.TEXT_INV });
  });
  // pain → solution rows
  featureRow(s, pres, M, 4.2, 5.9, "Before: four disconnected systems",
    "Static website + separate forms inbox + spreadsheet inventory + email-based support \u2014 no audit trail, no SLA, no single source of truth.",
    { leadColor: C.GOLD, descColor: C.MUTED_INV, h: 1.1 });
  featureRow(s, pres, 7.0, 4.2, 5.7, "After: one integrated platform",
    "Every product, page, lead, RMA case, serial and partner managed in one console with full audit trail, role-based access and 2FA.",
    { leadColor: C.ACCENT, descColor: C.TEXT_INV, h: 1.1 });
  s.addText("Built by Unisoft System Ltd \u00B7 delivered production-ready with verified test evidence", {
    x: M, y: 6.9, w: W - 2 * M, h: 0.3, fontSize: 11, fontFace: FONT, color: C.MUTED_INV, margin: 0 });

  // ============ SLIDE 4 — PLATFORM OVERVIEW (3 surfaces diagram) ============
  s = pres.addSlide();
  lightHeader(s, pres, "One Platform, Three Surfaces", "Website + Admin Console + API sharing a single database");
  // three cards
  const cards = [
    ["Public Website", "www.twinmos.com", [
      "28 pages: shop, product details, compatibility finder",
      "Anti-counterfeit serial verification",
      "RMA tracker, careers, where-to-buy locator",
      "CDN-fast \u2014 no server to patch",
    ], C.ACCENT_D],
    ["Admin Console", "Staff-only CMS", [
      "15 modules \u00B7 5 roles \u00B7 two-factor auth",
      "Content, products, leads, RMA, partners, media",
      "Every change audit-trailed for 12 months",
      "World-class editing: visual builders + previews",
    ], C.PRIMARY],
    ["REST API", "The integration backbone", [
      "190+ endpoints powering web + admin + partners",
      "Partner portal with gated price files",
      "Bank-grade security: rate limits, validation",
      "Deploy-ready for ERP / CRM integrations",
    ], C.GOLD],
  ];
  cards.forEach(([title, sub, items, accent], i) => {
    const x = M + i * 4.1, y = 1.75, w = 3.85;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 4.4, rectRadius: 0.09,
      fill: { color: C.WHITE }, line: { color: "DCE5EE", width: 1 },
      shadow: { type: "outer", color: "0A1628", blur: 8, offset: 3, angle: 90, opacity: 0.10 } });
    s.addText(title, { x: x + 0.25, y: y + 0.25, w: w - 0.5, h: 0.4,
      fontSize: 19, fontFace: FONT, color: accent, bold: true, margin: 0 });
    s.addText(sub, { x: x + 0.25, y: y + 0.65, w: w - 0.5, h: 0.3,
      fontSize: 11, fontFace: FONT, color: C.MUTED, italic: true, margin: 0 });
    s.addText(items.map((t, j) => ({ text: t, options: { bullet: bu(), breakLine: j < items.length - 1, color: C.TEXT } })),
      { x: x + 0.25, y: y + 1.1, w: w - 0.45, h: 3.1, fontSize: 12.5, fontFace: FONT,
        paraSpaceAfter: 7, margin: 0, valign: "top" });
  });
  s.addText("One PostgreSQL database \u00B7 changes in the admin console appear on the website through an automated content bridge", {
    x: M, y: 6.5, w: W - 2 * M, h: 0.4, fontSize: 13, fontFace: FONT, color: C.MUTED, align: "center", margin: 0 });

  // ============ SLIDE 5 — PUBLIC WEBSITE (screenshot showcase) ============
  s = pres.addSlide();
  darkHeader(s, pres, "Platform Tour", "A world-class public website");
  shot(s, pres, "site_home.png", { x: M, y: 1.9, w: 7.6 });
  const feats = [
    ["Pixel-perfect design", "28 pages faithfully implementing the approved brand"],
    ["Sub-second page loads", "Static-first architecture, CDN-cached worldwide"],
    ["SEO built-in", "Structured data, sitemap, hreflang for 9 languages"],
    ["Accessible by design", "Alt-text compliance tracked across the media library; built to WCAG 2.2 AA"],
  ];
  feats.forEach(([l, d], i) => featureRow(s, pres, 8.6, 2.0 + i * 1.1, 4.2, l, d,
    { leadColor: C.ACCENT, descColor: C.TEXT_INV, h: 1.0 }));

  // ============ SLIDE 6 — SHOP + PRODUCT PAGES ============
  s = pres.addSlide();
  lightHeader(s, pres, "Reaching Customers", "A shop that converts");
  shot(s, pres, "site_shop.png", { x: M, y: 1.8, w: 7.4 });
  shot(s, pres, "site_product.png", { x: 8.3, y: 1.8, w: 4.4, h: 2.48 });
  const prodFeats = [
    ["Faceted search", "Filter by category, generation, capacity, interface"],
    ["Rich product pages", "Specs, warranty, galleries, datasheets, variants"],
    ["Compare tool", "Side-by-side product comparison"],
    ["Always current", "Product edits in the CMS appear on the site instantly"],
  ];
  prodFeats.forEach(([l, d], i) => featureRow(s, pres, 8.3, 4.55 + i * 0.62, 4.4, l, d, { h: 0.55, fontSize: 11.5 }));

  // ============ SLIDE 7 — ANTI-COUNTERFEIT (the differentiator) ============
  s = pres.addSlide();
  darkHeader(s, pres, "Competitive Advantage", "Anti-counterfeit serial verification \u2014 a first in the industry");
  shot(s, pres, "site_sncheck.png", { x: M, y: 1.95, w: 7.2 });
  const acFeats = [
    ["Customer-facing verification", "Buyers check any TwinMOS serial before purchase \u2014 instant genuine / unverified verdict"],
    ["Factory registry", "Every production serial registered; verification history logged with IP and country"],
    ["Counterfeit detection", "Anomaly scan flags serials verified from >5 distinct IP addresses in 24 hours"],
    ["Warranty protection", "RMA cases verify authenticity before any warranty service is approved"],
  ];
  acFeats.forEach(([l, d], i) => featureRow(s, pres, 8.2, 1.95 + i * 1.15, 4.6, l, d,
    { leadColor: C.ACCENT, descColor: C.TEXT_INV, h: 1.05 }));
  s.addText("Neither Kingston nor Corsair offers a public serial-number lookup: Kingston's verification page is a label-inspection guide only, and Corsair requires a support ticket. An instant registry check is a first among major memory brands \u2014 a differentiator TwinMOS can market.", {
    x: M, y: 6.45, w: W - 2 * M, h: 0.75, fontSize: 12.5, fontFace: FONT, color: C.GOLD, italic: true, margin: 0, valign: "top" });

  // ============ SLIDE 8 — SUPPORT & RMA ============
  s = pres.addSlide();
  lightHeader(s, pres, "Customer Service Excellence", "Support that retains customers");
  shot(s, pres, "site_support.png", { x: M, y: 1.8, w: 7.0 });
  const supStats = [
    ["7-state", "RMA pipeline with\nfull case history"],
    ["<1 min", "to file a support ticket\nfrom any page"],
    ["24/7", "self-service\nRMA status tracking"],
  ];
  supStats.forEach(([v, l], i) => stat(s, pres, 8.0 + (i % 3) * 1.65, 2.1, 1.55, v, l, { size: 30 }));
  const supRows = [
    ["Knowledge base", "Searchable support articles and FAQ"],
    ["Live RMA tracker", "Customers follow their case through repair"],
    ["Instant routing", "Every form routed to the right team with SLA"],
    ["Reply from the case", "One-click email reply; speed-to-lead tracked"],
  ];
  supRows.forEach(([l, d], i) => featureRow(s, pres, 8.0, 4.0 + i * 0.68, 4.7, l, d, { h: 0.6, fontSize: 12 }));

  return 8;
}

module.exports = { build };
