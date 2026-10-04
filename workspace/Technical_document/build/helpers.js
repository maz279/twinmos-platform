// helpers.js — shared builders for the TwinMOS Technical Documentation generator
const {
  Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, HeadingLevel, ShadingType, TableLayoutType, ImageRun, VerticalAlign,
} = require("docx");
const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size").imageSize || require("image-size");

// ---- Palette: Dawn Mist Tech (tech report) ----
const PAL = {
  primary: "0A1628", body: "1A2B40", secondary: "6878A0",
  accent: "1DBF9F", accentDeep: "0E9F7E", surface: "F4F8FC",
  gold: "E8A33D", warn: "B45309", danger: "C2453C",
};

const FONTS = { ascii: "Calibri", eastAsia: "Microsoft YaHei" };
const HFONT = { ascii: "Calibri", eastAsia: "SimHei" };

const allNoBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

// ---- Title layout (adapted from design-system) ----
function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([..."，。、；：！？", ..."的与和及之在于为", ..."-_—–·/", ..." \t"]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 11;
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
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  return { topSpacing, midSpacing: Math.max(safeRemaining - topSpacing - bottomSpacing, 0), bottomSpacing };
}

// ---- Cover Recipe R1 (Pure Paragraph Left) ----
function buildCoverR1(config) {
  const P = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "), size: 18, color: P.accent, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true, color: P.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor, font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: P.metaColor, font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
    ],
  }));
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({ shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders, children })],
    })],
  })];
}

// ---- Body building blocks ----
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 160 },
    children: [new TextRun({ text, bold: true, size: 34, color: PAL.primary, font: HFONT })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: PAL.primary, font: HFONT })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: PAL.body, font: HFONT })] });
}
function p(text, opts = {}) {
  const runs = Array.isArray(text) ? text : [new TextRun({ text, size: 22, color: PAL.body, font: FONTS })];
  return new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: 312, after: opts.after != null ? opts.after : 120 }, children: runs });
}
function bold(t) { return new TextRun({ text: t, bold: true, size: 22, color: PAL.primary, font: FONTS }); }
function mono(t) { return new TextRun({ text: t, size: 19, color: PAL.accentDeep, font: { ascii: "Courier New", eastAsia: "Microsoft YaHei" } }); }
function plain(t) { return new TextRun({ text: t, size: 22, color: PAL.body, font: FONTS }); }

let bulletSeq = 0;
function bullets(items) {
  const ref = "blt" + (++bulletSeq);
  return items.map((it) => new Paragraph({
    numbering: { reference: ref, level: 0 }, spacing: { line: 312, after: 60 },
    children: Array.isArray(it) ? it : [plain(it)],
  }));
}
let numSeq = 0;
function steps(items) {
  const ref = "stp" + (++numSeq);
  return items.map((it) => new Paragraph({
    numbering: { reference: ref, level: 0 }, spacing: { line: 312, after: 60 },
    children: Array.isArray(it) ? it : [plain(it)],
  }));
}
function numberingConfigs() {
  const configs = [];
  for (let i = 1; i <= bulletSeq; i++) configs.push({
    reference: "blt" + i,
    levels: [{ level: 0, format: "bullet", text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 260 } } } }],
  });
  for (let i = 1; i <= numSeq; i++) configs.push({
    reference: "stp" + i,
    levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 300 } }, run: { bold: true, color: PAL.accentDeep } } }],
  });
  return configs;
}

function codeBlock(lines) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "DCE3EB" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "DCE3EB" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "DCE3EB" }, right: { style: BorderStyle.SINGLE, size: 4, color: "DCE3EB" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: "F4F7FA" },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: lines.map((l) => new Paragraph({
          spacing: { line: 264 },
          children: [new TextRun({ text: l === "" ? " " : l, size: 18, color: "24344A", font: { ascii: "Courier New", eastAsia: "Microsoft YaHei" } })],
        })),
      })],
    })],
  });
}

function dataTable(headers, rows, opts = {}) {
  const widths = opts.widths || headers.map(() => Math.floor(9000 / headers.length));
  const headerRow = new TableRow({
    tableHeader: true, cantSplit: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: PAL.primary },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 19, color: "FFFFFF", font: FONTS })] })],
    })),
  });
  const bodyRows = rows.map((r, ri) => new TableRow({
    cantSplit: true,
    children: r.map((cell, ci) => new TableCell({
      width: { size: widths[ci], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? "FFFFFF" : PAL.surface },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: Array.isArray(cell) ? cell : [new TextRun({ text: String(cell), size: 19, color: PAL.body, font: FONTS })] })],
    })),
  }));
  return new Table({
    width: { size: 9200, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "D5DDE7" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "D5DDE7" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "D5DDE7" }, right: { style: BorderStyle.SINGLE, size: 4, color: "D5DDE7" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E6EBF1" }, insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E6EBF1" },
    },
    rows: [headerRow, ...bodyRows],
  });
}

// Fixed screenshots root (user-designated deliverable folder). Every figure
// name is reduced to a plain basename and the resolved target is verified to
// remain inside this exact directory before reading.
const SHOTS_DIR = path.resolve("F:/software_project/Software_Project_14/TwinMOS_Corporate_Website/Technical_document/screenshots");
let figSeq = 0;
function figure(file, caption, opts = {}) {
  const safeBase = path.basename(String(file));
  const target = path.resolve(SHOTS_DIR, safeBase);
  if (target !== path.resolve(SHOTS_DIR, safeBase) || !target.startsWith(SHOTS_DIR + path.sep)) {
    return new Paragraph({ children: [new TextRun({ text: "[rejected screenshot path]", italics: true, color: PAL.danger })] });
  }
  if (!fs.existsSync(target)) return new Paragraph({ children: [new TextRun({ text: "[missing screenshot: " + safeBase + "]", italics: true, color: PAL.danger })] });
  const data = fs.readFileSync(target);
  const dim = sizeOf(new Uint8Array(data));
  // Page usable width: 11906 - 1701 - 1417 = 8788 twips = ~439 pt. Keep a margin.
  const maxW = opts.width || 430;
  const w = Math.min(maxW, dim.width);
  const h = Math.round(dim.height * (w / dim.width));
  figSeq++;
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 }, keepNext: true,
      children: [new ImageRun({ type: "png", data: fs.readFileSync(target), transformation: { width: Math.round(w * 1.333), height: Math.round(h * 1.333) } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 200 },
      border: { top: { style: BorderStyle.SINGLE, size: 2, color: "D5DDE7", space: 4 } },
      children: [new TextRun({ text: "Exhibit " + figSeq + ". " + caption, size: 18, italics: true, color: PAL.secondary, font: FONTS })],
    }),
  ];
}

function callout(kind, text) {
  const color = kind === "warn" ? PAL.warn : kind === "danger" ? PAL.danger : PAL.accentDeep;
  const fill = kind === "warn" ? "FDF6EC" : kind === "danger" ? "FDF0EF" : "EDFAF6";
  const label = kind === "warn" ? "IMPORTANT" : kind === "danger" ? "WARNING" : "NOTE";
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: { ...noBorders, left: { style: BorderStyle.SINGLE, size: 16, color } },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill },
        margins: { top: 100, bottom: 100, left: 200, right: 160 },
        children: [new Paragraph({
          spacing: { line: 300 },
          children: [
            new TextRun({ text: label + " — ", bold: true, size: 20, color, font: FONTS }),
            new TextRun({ text, size: 20, color: PAL.body, font: FONTS }),
          ],
        })],
      })],
    })],
  });
}

function spacer(after = 120) { return new Paragraph({ spacing: { after }, children: [] }); }

module.exports = {
  PAL, FONTS, HFONT, allNoBorders, noBorders,
  buildCoverR1, calcTitleLayout, calcCoverSpacing,
  h1, h2, h3, p, bold, mono, plain, bullets, steps, numberingConfigs,
  codeBlock, dataTable, figure, callout, spacer,
};
