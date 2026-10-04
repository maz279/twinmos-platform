// deck_helpers.js — shared builders for the TwinMOS management deck
const SHOTS = "F:/software_project/Software_Project_14/TwinMOS_Corporate_Website/Technical_document/screenshots";

// Palette: TwinMOS brand — deep navy dominant, teal accent (matches the admin console)
const C = {
  BG: "0A1628",        // deep navy background (dark sandwich)
  BG2: "0F1F35",       // slightly lighter navy for panels
  LIGHT: "F6F9FC",     // off-white content background
  PRIMARY: "14304F",    // structural blue
  ACCENT: "1DBF9F",     // TwinMOS teal
  ACCENT_D: "0E9F7E",   // darker teal
  GOLD: "E8A33D",       // warning/highlight
  TEXT: "1A2B40",       // body on light
  TEXT_INV: "EAF2F8",   // body on dark
  MUTED: "6878A0",      // secondary
  MUTED_INV: "8FA5BD",  // secondary on dark
  WHITE: "FFFFFF",
};
const FONT = "Calibri";
const W = 13.33, H = 7.5, M = 0.6;

// screenshot placement — images are ~1280x720 or similar 16:9 browser shots
function shot(slide, pres, file, opts = {}) {
  const x = opts.x ?? 0.6, y = opts.y ?? 1.5;
  const w = opts.w ?? 7.5;
  const h = opts.h ?? (w * 0.5625); // 16:9
  slide.addImage({ path: SHOTS + "/" + file, x, y, w, h,
    ...(opts.sizing ? { sizing: opts.sizing } : {}) });
  // subtle frame line
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h,
    fill: { color: "FFFFFF", transparency: 100 },
    line: { color: "D5DDE7", width: 1 } });
  if (opts.caption) {
    slide.addText(opts.caption, { x, y: y + h + 0.06, w, h: 0.3,
      fontSize: 11, fontFace: FONT, color: C.MUTED, italic: true, margin: 0 });
  }
  return { x, y, w, h };
}

// dark title slide header (reused on section slides)
function darkHeader(slide, pres, kicker, title) {
  slide.background = { color: C.BG };
  slide.slideNumber = { x: W - 0.85, y: H - 0.42, w: 0.6, h: 0.3, fontSize: 10, fontFace: FONT, color: C.MUTED_INV };
  slide.addText(kicker.toUpperCase(), { x: M, y: 0.55, w: W - 2 * M, h: 0.35,
    fontSize: 14, fontFace: FONT, color: C.ACCENT, bold: true, charSpacing: 3, margin: 0 });
  slide.addText(title, { x: M, y: 0.95, w: W - 2 * M, h: 0.7,
    fontSize: 32, fontFace: FONT, color: C.WHITE, bold: true, margin: 0 });
}

// light content slide header
function lightHeader(slide, pres, title, subtitle) {
  slide.background = { color: C.LIGHT };
  slide.slideNumber = { x: W - 0.85, y: H - 0.42, w: 0.6, h: 0.3, fontSize: 10, fontFace: FONT, color: C.MUTED };
  slide.addText(title, { x: M, y: 0.45, w: W - 2 * M, h: 0.65,
    fontSize: 30, fontFace: FONT, color: C.PRIMARY, bold: true, margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: M, y: 1.08, w: W - 2 * M, h: 0.4,
      fontSize: 15, fontFace: FONT, color: C.MUTED, margin: 0 });
  }
}

// big stat callout (used in a row)
function stat(slide, pres, x, y, w, value, label, opts = {}) {
  slide.addText(value, { x, y, w, h: 0.85, fontSize: opts.size || 44,
    fontFace: FONT, color: opts.color || C.ACCENT_D, bold: true, align: "center", margin: 0 });
  slide.addText(label, { x, y: y + 0.85, w, h: 0.55, fontSize: 12.5,
    fontFace: FONT, color: opts.labelColor || C.MUTED, align: "center", margin: 0, valign: "top" });
}

// icon-free feature row (bold lead-in + description)
function featureRow(slide, pres, x, y, w, lead, desc, opts = {}) {
  slide.addText([
    { text: lead, options: { bold: true, color: opts.leadColor || C.PRIMARY, breakLine: true } },
    { text: desc, options: { color: opts.descColor || C.TEXT } },
  ], { x, y, w, h: opts.h || 0.9, fontSize: opts.fontSize || 13, fontFace: FONT, margin: 0, valign: "top",
       paraSpaceAfter: 3, lineSpacingMultiple: 1.1 });
}

// bullet factory (styled per skill guidance)
const bu = () => ({ code: "2022", indent: 12 });

module.exports = { C, FONT, W, H, M, shot, darkHeader, lightHeader, stat, featureRow, bu, SHOTS };
