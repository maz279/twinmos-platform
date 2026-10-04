// generate.js — assembles the TwinMOS Technical Documentation .docx
const {
  Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber,
  AlignmentType, HeadingLevel, SectionType, NumberFormat, TableOfContents, PageBreak,
} = require("docx");
const fs = require("fs");
const path = require("path");
const H = require("./helpers.js");
const { PAL, FONTS, HFONT, buildCoverR1, numberingConfigs } = H;

const part1 = require("./content_part1.js");
const part2 = require("./content_part2.js");
const part3 = require("./content_part3.js");

const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

// running header (front matter + body)
function runningHeader() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: "single", size: 2, color: "D5DDE7", space: 4 } },
      children: [new TextRun({ text: "TwinMOS Platform — Technical Documentation & Administrator Guide", size: 16, color: PAL.secondary, font: FONTS })],
    })],
  });
}
function pageNumFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: PAL.secondary, font: FONTS })],
    })],
  });
}

// ---- Cover ----
const coverChildren = buildCoverR1({
  title: "TwinMOS Corporate Website Platform",
  subtitle: "Technical Documentation, CMS Administration & Cloud Deployment Guide",
  englishLabel: "TECHNICAL DOCUMENTATION",
  metaLines: [
    "Version 1.0 \u00B7 October 2026",
    "Audience: Webmasters & Software Engineers",
    "System version: API 0.3.0 \u00B7 28 public pages \u00B7 15 admin modules",
    "Verified: 253 automated tests \u00B7 0 security-scan findings",
  ],
  footerLeft: "TwinMOS Technologies \u00B7 Internal",
  footerRight: "CONFIDENTIAL",
  palette: {
    bg: "0A1628", titleColor: "FFFFFF", subtitleColor: "C9D6E8",
    metaColor: "9FB4CC", accent: "1DBF9F", footerColor: "7A90A8",
  },
});

// ---- Front matter: TOC ----
const frontMatter = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 360 },
    children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, color: PAL.primary, font: HFONT })],
  }),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({
    spacing: { before: 200 },
    children: [new TextRun({
      text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \u201CUpdate Field.\u201D",
      italics: true, size: 18, color: "888888", font: FONTS,
    })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---- Assemble ----
const doc = new Document({
  creator: "TwinMOS Engineering",
  title: "TwinMOS Platform — Technical Documentation & Administrator Guide",
  description: "Comprehensive user guide for webmasters and software engineers: system overview, technology stack, admin/CMS module workflows, and cloud deployment runbook.",
  styles: {
    default: {
      document: {
        run: { font: FONTS, size: 22, color: PAL.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: { run: { font: HFONT, size: 34, bold: true, color: PAL.primary } },
      heading2: { run: { font: HFONT, size: 28, bold: true, color: PAL.primary } },
      heading3: { run: { font: HFONT, size: 24, bold: true, color: PAL.body } },
    },
  },
  numbering: { config: numberingConfigs() },
  sections: [
    // Section 1: Cover (no page numbers, no header/footer)
    {
      properties: { page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: coverChildren,
    },
    // Section 2: Front matter (TOC) — Roman numerals
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } },
      },
      headers: { default: runningHeader() },
      footers: { default: pageNumFooter() },
      children: frontMatter,
    },
    // Section 3: Body — Arabic numerals from 1
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      headers: { default: runningHeader() },
      footers: { default: pageNumFooter() },
      children: [...part1, ...part2, ...part3],
    },
  ],
});

const OUT = path.resolve("F:/software_project/Software_Project_14/TwinMOS_Corporate_Website/Technical_document/TwinMOS_Platform_Technical_Documentation.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("WROTE", OUT, (buf.length / 1024).toFixed(0) + " KB");
});
