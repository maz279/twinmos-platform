// deck_part3.js — slides 17-21: after-sales, careers, global reach, roadmap, closing
const H = require("./deck_helpers.js");
const { C, FONT, W, M, shot, darkHeader, lightHeader, stat, featureRow, bu } = H;

function build(pres) {
  // ============ SLIDE 17 — AFTER-SALES AT SCALE ============
  let s = pres.addSlide();
  darkHeader(s, pres, "Customer Service", "After-sales operations that scale without headcount");
  shot(s, pres, "admin_rma.png", { x: M, y: 1.95, w: 7.6 });
  const rma = [
    ["Structured RMA pipeline", "7 states from intake to resolution \u2014 nothing lives in an inbox"],
    ["Serial-linked cases", "Every case verifies the serial against the factory registry before warranty service"],
    ["SLA-driven queue", "Overdue cases surface first; assignees, priorities and full case history"],
    ["Customer self-service", "The public tracker answers \u201Cwhere is my case?\u201D without a phone call"],
  ];
  rma.forEach(([l, d], i) => featureRow(s, pres, 8.6, 2.0 + i * 1.15, 4.2, l, d,
    { leadColor: C.ACCENT, descColor: C.TEXT_INV, h: 1.05, fontSize: 12 }));

  // ============ SLIDE 18 — CAREERS & TALENT ============
  s = pres.addSlide();
  lightHeader(s, pres, "Talent Acquisition", "A careers page that recruits while you sleep");
  shot(s, pres, "site_careers.png", { x: M, y: 1.8, w: 7.4 });
  shot(s, pres, "admin_jobs.png", { x: 8.3, y: 1.8, w: 4.4, h: 2.48 });
  const car = [
    ["Structured listings", "Department, location, type and salary band \u2014 managed in the console, live instantly"],
    ["Application pipeline", "Applications arrive as leads with r\u00E9sum\u00E9 attachments and route through the same SLA workflow"],
    ["Employer brand", "Culture, benefits and open roles presented with polished, agency-grade design"],
  ];
  car.forEach(([l, d], i) => featureRow(s, pres, 8.3, 4.55 + i * 0.78, 4.4, l, d, { h: 0.7, fontSize: 11.5 }));

  // ============ SLIDE 19 — GLOBAL REACH / LOCALIZATION ============
  s = pres.addSlide();
  darkHeader(s, pres, "Market Reach", "One platform, nine languages, every customer");
  // locale chips
  const locales = ["English", "\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (RTL)", "\u0939\u093F\u0928\u094D\u0926\u0940", "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", "\u7B80\u4F53\u4E2D\u6587", "Fran\u00E7ais", "Espa\u00F1ol", "Portugu\u00EAs", "Deutsch"];
  locales.forEach((name, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = M + col * 2.48, y = 1.95 + row * 0.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.28, h: 0.75, rectRadius: 0.35,
      fill: { color: C.BG2 }, line: { color: "24405E", width: 1 } });
    s.addText(name, { x, y, w: 2.28, h: 0.75, fontSize: 13.5, fontFace: FONT,
      color: C.TEXT_INV, align: "center", valign: "middle", margin: 0 });
  });
  const glob = [
    ["Locale framework built-in", "Every page emits hreflang alternates \u2014 search engines serve the right language automatically"],
    ["RTL verified", "Arabic renders right-to-left correctly, including navigation and forms"],
    ["Regional channel pages", "Where-to-buy and partner directories localised per market from one console"],
    ["Ready to expand", "Adding a tenth language is configuration, not a rebuild"],
  ];
  glob.forEach(([l, d], i) => featureRow(s, pres, M, 4.15 + i * 0.72, 12.1, l, d,
    { leadColor: C.ACCENT, descColor: C.TEXT_INV, h: 0.65, fontSize: 12.5 }));

  // ============ SLIDE 20 — ROADMAP ============
  s = pres.addSlide();
  lightHeader(s, pres, "Roadmap & Next Steps", "From delivery to market leadership");
  const phases = [
    ["1", "Cloud go-live", "Deploy to production using the verified runbook \u2014 DNS cutover to the new platform. Effort: days, not weeks.", "Ready now"],
    ["2", "Measure & optimise", "Enable analytics and search-console instrumentation; baseline conversion on the 15 form types.", "Week 1\u20132"],
    ["3", "Amplify marketing", "Launch the anti-counterfeit verifier as a campaign; syndicate product data to marketplaces and search.", "Week 2\u20136"],
    ["4", "Deepen integrations", "Connect the API to ERP / CRM; expand the partner portal with pricing and MDF workflows.", "Quarter 2"],
  ];
  phases.forEach(([num, title, desc, when], i) => {
    const x = M + i * 3.15, y = 1.9, w = 2.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 3.9, rectRadius: 0.09,
      fill: { color: C.WHITE }, line: { color: "DCE5EE", width: 1 },
      shadow: { type: "outer", color: "0A1628", blur: 8, offset: 3, angle: 90, opacity: 0.10 } });
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.62, h: 0.62,
      fill: { color: C.ACCENT_D }, line: { type: "none" } });
    s.addText(num, { x: x + 0.25, y: y + 0.25, w: 0.62, h: 0.62, fontSize: 22, fontFace: FONT,
      color: C.WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(title, { x: x + 0.25, y: y + 1.05, w: w - 0.5, h: 0.6,
      fontSize: 16.5, fontFace: FONT, color: C.PRIMARY, bold: true, margin: 0 });
    s.addText(desc, { x: x + 0.25, y: y + 1.7, w: w - 0.5, h: 1.6,
      fontSize: 11.5, fontFace: FONT, color: C.TEXT, margin: 0, valign: "top" });
    s.addText(when, { x: x + 0.25, y: y + 3.4, w: w - 0.5, h: 0.3,
      fontSize: 11, fontFace: FONT, color: C.ACCENT_D, bold: true, italic: true, margin: 0 });
  });
  s.addText("Decision requested today: approve phase 1 \u2014 the deployment runbook, secrets checklist and 10-chapter technical manual are already delivered.", {
    x: M, y: 6.35, w: W - 2 * M, h: 0.5, fontSize: 13, fontFace: FONT, color: C.MUTED, align: "center", margin: 0 });

  // ============ SLIDE 21 — CLOSING ============
  s = pres.addSlide();
  s.background = { color: C.BG };
  s.slideNumber = { x: W - 0.85, y: H - 0.42, w: 0.6, h: 0.3, fontSize: 10, fontFace: FONT, color: C.MUTED_INV };
  s.addShape(pres.shapes.OVAL, { x: -2.2, y: -2.6, w: 7, h: 7,
    fill: { color: C.ACCENT, transparency: 92 }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: 9.4, y: 3.9, w: 6.5, h: 6.5,
    fill: { color: C.PRIMARY, transparency: 85 }, line: { type: "none" } });
  s.addText("Thank You", { x: M, y: 2.0, w: W - 2 * M, h: 1.1,
    fontSize: 54, fontFace: FONT, color: C.WHITE, bold: true, align: "center", margin: 0 });
  s.addText("Let\u2019s take TwinMOS to every customer \u2014 on every channel, in every language,\nprotected by technology no competitor offers today.", {
    x: 1.8, y: 3.25, w: 9.7, h: 0.9, fontSize: 17, fontFace: FONT, color: C.TEXT_INV, align: "center", margin: 0 });
  // recap stat strip
  const recap = [["28", "pages"], ["15", "modules"], ["9", "languages"], ["253", "tests"], ["0", "findings"]];
  recap.forEach(([v, l], i) => {
    stat(s, pres, 1.35 + i * 2.15, 4.5, 2.0, v, l, { size: 34, color: C.ACCENT, labelColor: C.MUTED_INV });
  });
  s.addText("UNISOFT SYSTEM LTD", { x: M, y: 6.35, w: W - 2 * M, h: 0.4,
    fontSize: 15, fontFace: FONT, color: C.WHITE, bold: true, charSpacing: 4, align: "center", margin: 0 });
  s.addText("Prepared for TwinMOS Management \u00B7 October 2026", { x: M, y: 6.75, w: W - 2 * M, h: 0.35,
    fontSize: 12, fontFace: FONT, color: C.MUTED_INV, align: "center", margin: 0 });

  return 5;
}

module.exports = { build };
