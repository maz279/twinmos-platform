#!/usr/bin/env python3
"""
TwinMOS Corporate Website — Marketing Catalogue Generator
Generates a professionally formatted .docx marketing catalogue with
title page, elegant headers/footers, textboxes, and visual enhancements.
"""

import os
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
from datetime import datetime

# ── Colors (TwinMOS brand-inspired) ──
BLUE_DARK = RGBColor(0x0D, 0x2B, 0x4E)    # Deep navy
BLUE_MID = RGBColor(0x1A, 0x56, 0x9A)     # Mid blue
BLUE_LIGHT = RGBColor(0xE8, 0xF0, 0xF8)   # Light blue bg
GOLD = RGBColor(0xC8, 0x96, 0x2E)         # Accent gold
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x1A, 0x1A, 0x1A)
GRAY_DARK = RGBColor(0x55, 0x55, 0x55)
GRAY_LIGHT = RGBColor(0xF2, 0xF2, 0xF2)
RED_ACCENT = RGBColor(0xC0, 0x39, 0x2B)
GREEN_ACCENT = RGBColor(0x27, 0xAE, 0x60)
ORANGE_ACCENT = RGBColor(0xE6, 0x7E, 0x22)


def add_horizontal_rule(doc, color=GOLD, width=Inches(6), height=Pt(2)):
    """Add a decorative horizontal rule."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    pPr = p._p.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:bottom w:val="single" w:sz="6" w:space="4" w:color="{color}"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr)
    return p


def set_cell_shading(cell, color):
    """Set background shading on a table cell."""
    shading_elm = parse_xml(
        f'<w:shd {nsdecls("w")} w:fill="{color}" w:val="clear"/>'
    )
    cell._tc.get_or_add_tcPr().append(shading_elm)


def set_cell_border(cell, **kwargs):
    """Set borders on a table cell."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}></w:tcBorders>')
    for edge in ('start', 'top', 'end', 'bottom', 'insideH', 'insideV'):
        if edge in kwargs:
            element = parse_xml(
                f'<w:{edge} {nsdecls("w")} w:val="single" w:sz="{kwargs[edge].get("sz", 4)}" '
                f'w:space="0" w:color="{kwargs[edge].get("color", "CCCCCC")}"/>'
            )
            tcBorders.append(element)
    tcPr.append(tcBorders)


def add_insight_box(doc, title, content):
    """Add a styled 'Insight' callout box (table-based)."""
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True

    # Left accent bar cell
    accent_cell = table.cell(0, 0)
    accent_cell.width = Inches(0.12)
    set_cell_shading(accent_cell, GOLD)

    # Content cell
    content_cell = table.cell(0, 1)
    content_cell.width = Inches(6.08)
    set_cell_shading(content_cell, BLUE_LIGHT)

    # Set borders
    set_cell_border(accent_cell, top={'sz': 0}, bottom={
                    'sz': 0}, start={'sz': 0}, end={'sz': 0})
    set_cell_border(content_cell, top={'sz': 0}, bottom={
                    'sz': 0}, start={'sz': 0}, end={'sz': 0})

    p = content_cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)

    run = p.add_run(f"💡 {title}")
    run.bold = True
    run.font.size = Pt(9)
    run.font.color.rgb = BLUE_DARK
    run.font.name = 'Calibri'

    p2 = content_cell.add_paragraph()
    p2.paragraph_format.space_before = Pt(2)
    p2.paragraph_format.space_after = Pt(8)
    run2 = p2.add_run(content)
    run2.font.size = Pt(9)
    run2.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    run2.font.name = 'Calibri'
    run2.italic = True

    doc.add_paragraph()  # spacer


def add_did_you_know_box(doc, content):
    """Add a styled 'Did You Know?' callout box."""
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True

    accent_cell = table.cell(0, 0)
    accent_cell.width = Inches(0.12)
    set_cell_shading(accent_cell, BLUE_MID)

    content_cell = table.cell(0, 1)
    content_cell.width = Inches(6.08)
    set_cell_shading(content_cell, RGBColor(0xEB, 0xF5, 0xFB))

    set_cell_border(accent_cell, top={'sz': 0}, bottom={
                    'sz': 0}, start={'sz': 0}, end={'sz': 0})
    set_cell_border(content_cell, top={'sz': 0}, bottom={
                    'sz': 0}, start={'sz': 0}, end={'sz': 0})

    p = content_cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(8)

    run = p.add_run("📌 DID YOU KNOW?  ")
    run.bold = True
    run.font.size = Pt(9)
    run.font.color.rgb = BLUE_MID
    run.font.name = 'Calibri'

    run2 = p.add_run(content)
    run2.font.size = Pt(9)
    run2.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    run2.font.name = 'Calibri'
    run2.italic = True

    doc.add_paragraph()


def add_key_stat_box(doc, stat, description):
    """Add a key statistic highlight box."""
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_cell_shading(table.cell(0, 0), BLUE_DARK)

    p = table.cell(0, 0).paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)

    run = p.add_run(stat)
    run.bold = True
    run.font.size = Pt(20)
    run.font.color.rgb = GOLD
    run.font.name = 'Calibri'

    p2 = table.cell(0, 0).add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_before = Pt(0)
    p2.paragraph_format.space_after = Pt(8)
    run2 = p2.add_run(description)
    run2.font.size = Pt(9)
    run2.font.color.rgb = WHITE
    run2.font.name = 'Calibri'

    doc.add_paragraph()


def add_section_header(doc, number, title):
    """Add a styled section header."""
    doc.add_page_break()

    # Section number badge
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run(f"SECTION {number}")
    run.bold = True
    run.font.size = Pt(11)
    run.font.color.rgb = GOLD
    run.font.name = 'Calibri'

    # Section title
    p2 = doc.add_paragraph()
    p2.paragraph_format.space_before = Pt(2)
    p2.paragraph_format.space_after = Pt(6)
    run2 = p2.add_run(title)
    run2.bold = True
    run2.font.size = Pt(22)
    run2.font.color.rgb = BLUE_DARK
    run2.font.name = 'Calibri'

    add_horizontal_rule(doc, GOLD)
    doc.add_paragraph()


def add_body_text(doc, text, bold=False, size=9.5, color=None, alignment=None, spacing_after=6):
    """Add a body paragraph with formatting."""
    p = doc.add_paragraph()
    if alignment:
        p.alignment = alignment
    p.paragraph_format.space_after = Pt(spacing_after)
    p.paragraph_format.line_spacing = Pt(16)
    run = p.add_run(text)
    run.font.size = Pt(size)
    run.font.name = 'Calibri'
    run.bold = bold
    if color:
        run.font.color.rgb = color
    else:
        run.font.color.rgb = BLACK
    return p


def add_bullet(doc, text, level=0, color=None):
    """Add a bullet point."""
    p = doc.add_paragraph(style='List Bullet')
    p.clear()
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Inches(0.25 + level * 0.25)
    run = p.add_run(text)
    run.font.size = Pt(9.5)
    run.font.name = 'Calibri'
    if color:
        run.font.color.rgb = color
    return p


def add_styled_table(doc, headers, rows, col_widths=None):
    """Add a professionally styled table."""
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True

    # Header row
    for i, header in enumerate(headers):
        cell = table.cell(0, i)
        set_cell_shading(cell, BLUE_DARK)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(header)
        run.bold = True
        run.font.size = Pt(9)
        run.font.color.rgb = WHITE
        run.font.name = 'Calibri'
        if col_widths:
            cell.width = col_widths[i]

    # Data rows
    for row_idx, row in enumerate(rows):
        bg = GRAY_LIGHT if row_idx % 2 == 0 else WHITE
        for col_idx, val in enumerate(row):
            cell = table.cell(row_idx + 1, col_idx)
            set_cell_shading(cell, bg)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(str(val))
            run.font.size = Pt(9)
            run.font.name = 'Calibri'
            if col_widths:
                cell.width = col_widths[col_idx]

    # Add table borders
    tbl = table._tbl
    tblPr = tbl.tblPr if tbl.tblPr is not None else parse_xml(
        f'<w:tblPr {nsdecls("w")}></w:tblPr>')
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="BBBBBB"/>'
        f'<w:left w:val="single" w:sz="4" w:space="0" w:color="BBBBBB"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="BBBBBB"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="BBBBBB"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="BBBBBB"/>'
        f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="BBBBBB"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

    doc.add_paragraph()
    return table


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN DOCUMENT GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

def generate_marketing_catalogue():
    doc = Document()

    # ── Page Setup ──
    for section in doc.sections:
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)

    # ── Set default font ──
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(9.5)

    # ── Add header ──
    header = doc.sections[0].header
    header.is_linked_to_previous = False
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = hp.add_run(
        "TwinMOS Technologies  |  Corporate Website Development  |  CONFIDENTIAL")
    run.font.size = Pt(7)
    run.font.color.rgb = GRAY_DARK
    run.font.name = 'Calibri'

    # ── Add footer ──
    footer = doc.sections[0].footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = fp.add_run(
        "© 2026 TwinMOS Technologies Middle East FZE  |  All Rights Reserved  |  Page ")
    run.font.size = Pt(7)
    run.font.color.rgb = GRAY_DARK
    run.font.name = 'Calibri'

    # ═══════════════════════════ TITLE PAGE ═══════════════════════════

    # Top decorative bar
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    pPr = p._p.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:bottom w:val="single" w:sz="24" w:space="12" w:color="{GOLD}"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr)

    # Spacer
    for _ in range(6):
        doc.add_paragraph()

    # Main title
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("TWINMOS")
    run.bold = True
    run.font.size = Pt(42)
    run.font.color.rgb = BLUE_DARK
    run.font.name = 'Calibri'

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_before = Pt(0)
    run2 = p2.add_run("CORPORATE WEBSITE DEVELOPMENT")
    run2.bold = True
    run2.font.size = Pt(26)
    run2.font.color.rgb = BLUE_MID
    run2.font.name = 'Calibri'

    # Subtitle
    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p3.paragraph_format.space_before = Pt(16)
    run3 = p3.add_run("Digital Transformation Marketing Catalogue")
    run3.font.size = Pt(16)
    run3.font.color.rgb = GOLD
    run3.font.name = 'Calibri'

    # Decorative line
    add_horizontal_rule(doc, GOLD, Inches(3.5), Pt(3))

    # Project tagline
    p4 = doc.add_paragraph()
    p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p4.paragraph_format.space_before = Pt(24)
    run4 = p4.add_run(
        '"Building a World-Class Digital Platform for a 27+ Year Legendary Memory Brand"')
    run4.italic = True
    run4.font.size = Pt(12)
    run4.font.color.rgb = GRAY_DARK
    run4.font.name = 'Calibri'

    # Document info box
    for _ in range(6):
        doc.add_paragraph()

    info_table = doc.add_table(rows=6, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_items = [
        ("Document Version:", "1.0"),
        ("Date:", datetime.now().strftime("%d %B %Y")),
        ("Classification:", "CONFIDENTIAL — Internal Use"),
        ("Prepared by:", "TwinMOS Digital Transformation Team"),
        ("Project Duration:", "18–24 Months (15 Phases)"),
        ("Technology Platform:", "Strapi v5 + Astro 5 + PostgreSQL 16"),
    ]
    for i, (label, value) in enumerate(info_items):
        cell_l = info_table.cell(i, 0)
        cell_r = info_table.cell(i, 1)
        cell_l.width = Inches(1.8)
        cell_r.width = Inches(2.7)
        p_l = cell_l.paragraphs[0]
        r_l = p_l.add_run(label)
        r_l.bold = True
        r_l.font.size = Pt(9)
        r_l.font.name = 'Calibri'
        r_l.font.color.rgb = GRAY_DARK
        p_r = cell_r.paragraphs[0]
        r_r = p_r.add_run(value)
        r_r.font.size = Pt(9)
        r_r.font.name = 'Calibri'
        r_r.font.color.rgb = BLACK

    # Bottom decorative bar
    doc.add_paragraph()
    p5 = doc.add_paragraph()
    p5.paragraph_format.space_before = Pt(24)
    pPr = p5._p.get_or_add_pPr()
    pBdr2 = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="24" w:space="12" w:color="{GOLD}"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr2)

    # ═══════════════════════════ SECTION 1: PROJECT OVERVIEW ═══════════════════════════

    add_section_header(doc, "01", "Project at a Glance")

    add_body_text(doc,
                  "TwinMOS Technologies — with 27+ years of heritage in memory and storage solutions, "
                  "serving 93+ countries across 5 continents — is undertaking a comprehensive digital "
                  "transformation of its corporate website (twinmos.com). This marketing catalogue presents "
                  "the full scope, capabilities, and strategic value of the redevelopment project.",
                  size=11)

    # Key stats row
    stats_table = doc.add_table(rows=1, cols=4)
    stats_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    stat_data = [
        ("287+", "Content\nEntries"),
        ("100+", "SKU Detail\nPages"),
        ("10", "Active\nLocales"),
        ("28", "Regional\nLandings"),
    ]
    for i, (num, label) in enumerate(stat_data):
        cell = stats_table.cell(0, i)
        set_cell_shading(cell, BLUE_DARK)
        cell.width = Inches(1.55)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(8)
        run = p.add_run(num)
        run.bold = True
        run.font.size = Pt(18)
        run.font.color.rgb = GOLD
        run.font.name = 'Calibri'
        p2 = cell.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_after = Pt(6)
        run2 = p2.add_run(label)
        run2.font.size = Pt(8)
        run2.font.color.rgb = WHITE
        run2.font.name = 'Calibri'

    doc.add_paragraph()

    add_insight_box(doc, "STRATEGIC INSIGHT",
                    "The current TwinMOS website has 51 critical issues and 23 high-priority issues — "
                    "making it functionally broken. This redevelopment transforms a brand liability into the "
                    "company's most powerful competitive asset.")

    # ═══════════════════════════ SECTION 2: THE CHALLENGE ═══════════════════════════

    add_section_header(
        doc, "02", "The Challenge: A Digital Presence in Crisis")

    add_body_text(doc,
                  "A comprehensive forensic audit conducted in April 2026 revealed that the existing "
                  "TwinMOS website is critically broken across all dimensions. The following table "
                  "summarizes the severity of findings:", size=10)

    add_styled_table(doc,
                     ["Domain", "Severity", "Issues", "Most Critical Finding"],
                     [
                         ["Technical Infrastructure", "🔴 CRITICAL", "12",
                          "Multiple 404 errors; server errors on core product and legal pages"],
                         ["User Experience", "🔴 CRITICAL", "10",
                          "No visible navigation; empty brand pages; zero CTAs"],
                         ["Content Quality", "🔴 CRITICAL", "11",
                          "Incorrect HQ location; empty product categories; broken images"],
                         ["SEO & Discoverability", "🟠 HIGH", "9",
                          "Duplicate content; missing meta; no structured data"],
                         ["Missing Features", "🟠 HIGH", "14",
                          "Zero of 14 standard competitor features present"],
                         ["Strategic Impact", "🔴 CRITICAL", "8",
                          "Active brand damage; zero lead generation; India market unreadiness"],
                     ],
                     [Inches(1.8), Inches(1.0), Inches(0.7), Inches(3.0)]
                     )

    add_did_you_know_box(doc,
                         "The current website generates ZERO qualified leads. Every single visitor session — "
                         "from potential distributors, enterprise buyers, and gamers — is wasted due to broken "
                         "pages and missing functionality.")

    # ═══════════════════════════ SECTION 3: THE SOLUTION ═══════════════════════════

    add_section_header(doc, "03", "The Solution: A Tier-1 Digital Platform")

    add_body_text(doc,
                  "The redevelopment project delivers a complete, enterprise-grade corporate website "
                  "built on a modern technology stack. The platform will match or exceed the capabilities "
                  "of competitors such as Kingston, Corsair, G.Skill, and ADATA.", size=10)

    add_body_text(doc, "Core Value Propositions",
                  bold=True, size=13, color=BLUE_DARK)
    add_horizontal_rule(doc, BLUE_MID)

    value_props = [
        "Full product catalog with 100+ SKU detail pages, specifications, and comparison tools",
        "Advanced system compatibility finder covering 500+ devices (motherboards, laptops, desktops)",
        "Interactive gaming hub (VOLTX brand) with RGB visualizer, build gallery, and community features",
        "Multi-language support: 10 active locales by Phase 15 (EN, AR, BN, HI, RU, ZH-CN, FR, ES, PT, DE)",
        "28 regional landing pages with localized content, distributor locators, and contact information",
        "Partner/Distributor Portal with authenticated access, asset library, price lists, and MDF programs",
        "RMA (Return Merchandise Authorization) full 7-state workflow with status tracking",
        "Anti-counterfeit serial number verification to protect brand integrity",
        "E-commerce capabilities (Phase 3) with Medusa.js v2 / Stripe integration",
        "Self-service support center with knowledge base, FAQs, firmware downloads, and warranty registration",
    ]
    for prop in value_props:
        add_bullet(doc, prop)

    # ═══════════════════════════ SECTION 4: TECHNOLOGY STACK ═══════════════════════════

    add_section_header(
        doc, "04", "Technology Stack: Built for Performance & Scale")

    add_body_text(doc,
                  "The platform is engineered on a modern, open-source-first technology stack designed "
                  "for performance, security, and developer productivity. Every component was selected "
                  "through rigorous evaluation across cost, scalability, and compatibility.", size=10)

    add_styled_table(doc,
                     ["Layer", "Technology", "Version", "Key Advantage"],
                     [
                         ["Frontend Framework", "Astro 5 + React 19", "Astro ≥ 5.6",
                          "Lighthouse 95+ default; Content Layer reads 454 markdown files directly"],
                         ["Headless CMS", "Strapi v5 (CE)", "Strapi ≥ 5.31",
                          "Largest plugin ecosystem (~500); core i18n for 10 locales"],
                         ["Database", "PostgreSQL 16", "16.x LTS",
                          "Relational integrity for catalog/SKU/distributor entities"],
                         ["Search Engine", "MeiliSearch", "1.13.x",
                          "Native Arabic + CJK tokenization; MIT-licensed"],
                         ["Image Pipeline", "Sharp + ImgProxy", "Latest",
                          "WebP/AVIF on-the-fly transforms; build-time + runtime"],
                         ["Auth (Partner)", "Better Auth", "^1.x",
                          "OAuth + MFA; Astro & Next.js support"],
                         ["E-Commerce (P3)", "Medusa.js v2 + Stripe", "2.x",
                          "OSS commerce engine; mature Strapi integration"],
                         ["Live Chat (P2)", "Chatwoot (self-hosted)", "3.x",
                          "OSS; agent routing; Strapi integration"],
                         ["Analytics", "Plausible → PostHog OSS", "Latest",
                          "GDPR-clean cookieless; session replay + A/B testing"],
                         ["Hosting", "TwinMOS VM + Cloudflare", "—",
                          "Own server origin + Cloudflare DNS/WAF/CDN edge"],
                     ],
                     [Inches(1.7), Inches(1.8), Inches(1.1), Inches(2.6)]
                     )

    add_insight_box(doc, "ARCHITECTURE INSIGHT",
                    "The two-repository architecture (Astro frontend + Strapi backend) enables clean separation of concerns. "
                    "Astro's static-first approach delivers sub-second page loads, while Strapi v5's Unified Document "
                    "System powers a seamless 10-locale content management experience — configurable, not custom-coded.")

    # ═══════════════════════════ SECTION 5: FEATURE HIGHLIGHTS ═══════════════════════════

    add_section_header(doc, "05", "Feature Showcase by Phase")

    add_body_text(doc,
                  "The project is executed across 15 sequential phases, grouped into four strategic delivery stages. "
                  "Each phase adds business-critical capabilities to the platform.", size=10)

    # Phase 1
    add_body_text(doc, "PHASE 1 — Core Website (Phases 1–8, Weeks 1–32)",
                  bold=True, size=12, color=BLUE_MID)
    add_styled_table(doc,
                     ["Category", "Deliverables"],
                     [
                         ["Content Foundation",
                          "287 content entries across 16 sections; 100+ SKU detail pages; 34 legal & trust pages"],
                         ["Product Catalog",
                          "Dual-axis browsing (Category × Brand); advanced filtering & sorting; product comparison"],
                         ["Discovery Tools",
                          "Compatibility finder MVP (100+ devices); Where-to-Buy locator with Leaflet maps"],
                         ["Forms & Support",
                          "15 form types (inquiry, sales, support, warranty, RMA, etc.); knowledge base; FAQ"],
                         ["Regional Presence",
                             "28 regional landing pages; EN locale fully populated"],
                         ["Quality Gates", "Lighthouse ≥90 Performance / ≥95 Accessibility/BP/SEO; WCAG 2.2 AA; OWASP ZAP clean"],
                     ],
                     [Inches(1.8), Inches(5.2)]
                     )

    doc.add_paragraph()

    # Phase 2
    add_body_text(doc, "PHASE 2 — Localization & Partner Enablement (Phases 9–12, Weeks 33–48)",
                  bold=True, size=12, color=BLUE_MID)
    add_styled_table(doc,
                     ["Category", "Deliverables"],
                     [
                         ["Multi-Language Launch",
                          "Arabic (RTL), Hindi locales live — full content parity"],
                         ["Partner Portal", "Better Auth authenticated portal; distributor dashboard; asset library; price lists"],
                         ["Anti-Counterfeit",
                          "Serial number verification lookup; counterfeit reporting system"],
                         ["RMA Workflow",
                          "Full 7-state RMA tracker (Submitted → Under Review → Approved → In Repair → Shipped → Delivered → Closed)"],
                         ["Support Ecosystem",
                          "Firmware download center with serial validation; ERP integration for order sync"],
                         ["Gaming Hub Interactive",
                          "RGB visualizer; build gallery with moderation; community features"],
                         ["Live Engagement", "Chatwoot self-hosted live chat with agent routing; HubSpot CRM integration"],
                     ],
                     [Inches(1.8), Inches(5.2)]
                     )

    doc.add_paragraph()

    # Phase 3
    add_body_text(doc, "PHASE 3 — Commerce & Advanced Analytics (Phases 13–14, Weeks 49–79)",
                  bold=True, size=12, color=BLUE_MID)
    add_styled_table(doc,
                     ["Category", "Deliverables"],
                     [
                         ["E-Commerce", "Medusa.js v2 / Stripe Checkout; cart, checkout, customer accounts; PCI compliance"],
                         ["Additional Languages",
                          "Russian, Chinese-Simplified, French locales live (7 active total)"],
                         ["Advanced Analytics",
                          "PostHog OSS self-hosted; session replay; A/B testing; feature flags; user cohorts"],
                         ["Technology Migration",
                             "Node.js 24 LTS migration completed"],
                         ["Hardening",
                          "k6 load testing (5,000 concurrent users); full pen-test; DR drill validation"],
                     ],
                     [Inches(1.8), Inches(5.2)]
                     )

    doc.add_paragraph()

    # Phase 15
    add_body_text(doc, "PHASE 15 — Optimization, Loyalty & Handover (Weeks 80+)",
                  bold=True, size=12, color=BLUE_MID)
    add_styled_table(doc,
                     ["Category", "Deliverables"],
                     [
                         ["Loyalty & Referral",
                          "Customer loyalty program; referral engine; MDF program full activation"],
                         ["Final Localization",
                          "Spanish, Portuguese, German locales — 10 active locales total"],
                         ["Knowledge Transfer",
                          "Full documentation handover; repository ownership transfer; Phase 4 retainer signed"],
                     ],
                     [Inches(1.8), Inches(5.2)]
                     )

    add_did_you_know_box(doc,
                         "The public launch (Phase 1) is targeted for Feb–Mar 2027. The platform will be English-only at launch, "
                         "with Arabic and Hindi following 4 months later in Phase 2 — a deliberate strategy to ensure "
                         "quality before scale.")

    # ═══════════════════════════ SECTION 6: APPLICATION SURFACES ═══════════════════════════

    add_section_header(doc, "06", "Key Application Surfaces")

    add_body_text(doc,
                  "Beyond static content pages, the website features multiple rich interactive application "
                  "surfaces — each designed to serve specific user needs and drive measurable business outcomes.", size=10)

    apps = [
        ("🔍 Compatibility Finder",
         "A sophisticated lookup tool that helps users discover which TwinMOS memory and SSD products are compatible with their specific motherboard, laptop, or desktop model. Starts as MVP with 100 devices; scales to 500+ in Phase 2. Search by manufacturer, model, chipset, form factor, and speed requirements."),
        ("🌍 Where-to-Buy Locator",
         "Interactive map-based dealer and distributor locator across 28 countries. Uses Leaflet/MapLibre with OpenStreetMap. Shows authorized distributors, retail partners, and online sellers. Includes contact details, website links, and directions."),
        ("🎮 Gaming Hub (VOLTX)",
         "Dedicated brand experience for TwinMOS's gaming brand VOLTX. Features product showcases, RGB visualizer for memory module lighting previews, community build gallery with moderation, performance benchmarks, and gaming lifestyle content."),
        ("🤝 Partner Portal",
         "Authenticated portal for distributors, OEM/ODM partners, system builders, and resellers. Provides access to asset libraries, price lists, marketing materials, MDF pre-claim submission, sales tools, and order tracking (Phase 2 ERP integration)."),
        ("🔧 RMA Center",
         "End-to-end return merchandise authorization workflow. Customers submit RMA requests with product details and issue description. Track status across 7 states. Receive notifications at each stage. Integrated with ERP for processing."),
        ("🛡️ Anti-Counterfeit Verification",
         "Serial number lookup tool enabling customers and partners to verify product authenticity. Linked to manufacturing database. Reports counterfeit findings directly to TwinMOS legal and brand protection teams."),
        ("🛒 E-Commerce (Phase 3)",
         "Full online store powered by Medusa.js v2 or Stripe Checkout. Product browsing, cart management, secure checkout, order history, customer accounts. Supports multi-currency pricing across regions. PCI DSS compliant."),
    ]
    for title, desc in apps:
        add_body_text(doc, title, bold=True, size=11,
                      color=BLUE_DARK, spacing_after=2)
        add_body_text(doc, desc, size=10, spacing_after=10)

    add_insight_box(doc, "USER EXPERIENCE INSIGHT",
                    "The platform is designed for 11 distinct user personas — from gamers and PC builders to enterprise IT "
                    "managers, embedded engineers, government procurement officers, and media analysts. Each persona has "
                    "tailored journeys, content, and conversion paths.")

    # ═══════════════════════════ SECTION 7: GLOBAL REACH ═══════════════════════════

    add_section_header(doc, "07", "Global Reach & Regional Localization")

    add_body_text(doc,
                  "TwinMOS operates across the Middle East, Africa, South Asia, CIS, Europe, Southeast Asia, "
                  "and North America. The new website reflects this global footprint with dedicated regional "
                  "experiences for 28 countries and territories.", size=10)

    # Locale rollout table
    add_body_text(doc, "Locale Rollout Schedule",
                  bold=True, size=11, color=BLUE_DARK)

    add_styled_table(doc,
                     ["Phase", "Timeline", "Locales Added",
                         "Active Total", "Key Markets"],
                     [
                         ["Phase 1 (Launch)", "Feb–Mar 2027", "English (EN)",
                          "1", "Global baseline; all 28 regional pages"],
                         ["Phase 2", "Mar–Jun 2027",
                          "Arabic (AR), Hindi (HI)", "4", "UAE, KSA, Egypt, India"],
                         ["Phase 3", "Jun 2027–Jan 2028",
                          "Russian (RU), Chinese-Simplified (ZH-CN), French (FR)", "7", "CIS, China, North/West Africa, Europe"],
                         ["Phase 15", "Jan 2028+",
                          "Spanish (ES), Portuguese (PT), German (DE)", "10", "Latin America, Brazil, Europe"],
                     ],
                     [Inches(1.2), Inches(1.5), Inches(
                         2.2), Inches(0.9), Inches(2.2)]
                     )

    add_did_you_know_box(doc,
                         "Arabic presents unique challenges as a right-to-left (RTL) language. The platform's design system "
                         "includes full RTL CSS support, mirrored navigation, and culturally appropriate imagery for "
                         "Middle Eastern markets — all managed through Strapi v5's core i18n engine.")

    # ═══════════════════════════ SECTION 8: QUALITY ═══════════════════════════

    add_section_header(doc, "08", "Quality & Performance Standards")

    add_body_text(doc,
                  "Enterprise quality is a non-negotiable foundation of this project. Every deliverable must "
                  "pass rigorous quality gates before launch.", size=10)

    add_styled_table(doc,
                     ["Standard", "Target", "Validation Method"],
                     [
                         ["Lighthouse Performance",
                          "≥ 90 (every page)", "Lighthouse CI in build pipeline; every PR"],
                         ["Lighthouse Accessibility", "≥ 95",
                          "axe-core automated + monthly manual NVDA/VoiceOver/TalkBack"],
                         ["Lighthouse Best Practices", "≥ 95", "Automated CI gate"],
                         ["Lighthouse SEO", "≥ 95",
                             "Automated structured data + meta validation"],
                         ["WCAG Compliance", "2.2 AA",
                          "Automated + manual audit (EN 301 549 reference)"],
                         ["LCP (Largest Contentful Paint)", "≤ 1.8 s (target)",
                          "WebPageTest + Lighthouse CI"],
                         ["TTFB (Time to First Byte)", "≤ 150 ms",
                          "Cloudflare edge cache + static-first Astro"],
                         ["CLS (Cumulative Layout Shift)", "≤ 0.1",
                          "Lighthouse CI automated"],
                         ["Security", "OWASP ZAP zero high/critical",
                          "Weekly ZAP scan + quarterly pen-test"],
                         ["Load Capacity", "5,000 concurrent users",
                          "k6 load testing pre-launch"],
                         ["Uptime SLA", "99.9%",
                             "UptimeRobot multi-region 5-min checks"],
                         ["DR Readiness", "RTO ≤ 4h / RPO ≤ 15 min",
                          "Quarterly DR drill + daily Backblaze B2 backups"],
                     ],
                     [Inches(2.2), Inches(2.2), Inches(2.8)]
                     )

    # ═══════════════════════════ SECTION 9: CONTENT ═══════════════════════════

    add_section_header(doc, "09", "Content Architecture")

    add_body_text(doc,
                  "The website's content is organized into 16 top-level categories, each serving distinct "
                  "business objectives. All 287 content entries are mapped in the authoritative Content Map document, "
                  "and 454 markdown files provide the raw content foundation for Astro's Content Layer.", size=10)

    # Content sections overview
    add_styled_table(doc,
                     ["#", "Section", "Pages", "Key Content"],
                     [
                         ["00", "Site-Wide", "15",
                          "Header, footer, cookie banner, search, breadcrumbs, 404/500, trust bar"],
                         ["01", "Homepage", "9",
                          "Hero slides, trust band, featured products, category grid, testimonials"],
                         ["02", "About", "17", "Overview, history, leadership, manufacturing, QA, certifications, awards, global presence"],
                         ["03", "Products", "30+",
                          "100+ SKU pages across Memory, SSD, Portable, USB Flash, Accessories categories"],
                         ["04", "Solutions", "11",
                          "Gaming, Content Creation, Enterprise, Education, Embedded/Industrial verticals"],
                         ["05", "Gaming (VOLTX)", "14",
                          "Gaming hub, product showcase, RGB visualizer, build gallery, community"],
                         ["06", "Technology", "14",
                          "DDR5, PCIe Gen5, 3D NAND, thermal management, reliability engineering"],
                         ["07", "Support", "39",
                          "Knowledge base, FAQs, firmware downloads, RMA, warranty, compatibility center"],
                         ["08", "Learn", "64",
                          "Tech guides, buying guides, tutorials, benchmarking, industry insights"],
                         ["09", "Partners", "21",
                          "Distributor portal, OEM/ODM, system builder, reseller, MDF programs"],
                         ["09B", "Where to Buy", "5",
                          "Regional dealer locators, distributor contacts, online retailers"],
                         ["10", "News & Events", "20",
                          "Press releases, event coverage (COMPUTEX), product launches, media kit"],
                         ["11", "Regional", "29",
                          "28 country/territory landing pages + regional overview"],
                         ["12", "Careers", "10",
                             "Job listings, culture, benefits, application portal"],
                         ["13", "Contact", "16",
                          "Global office contacts, inquiry forms, HQ information, regional offices"],
                         ["14", "Legal", "34",
                          "Privacy, cookies, terms, warranty, compliance hub (GDPR, UAE PDPL, KSA PDPL, India DPDP)"],
                         ["15", "Marketing", "12",
                          "Campaign landing pages, promotions, whitepaper gating, newsletter"],
                     ],
                     [Inches(0.4), Inches(1.1), Inches(0.7), Inches(5.0)]
                     )

    add_insight_box(doc, "CONTENT STRATEGY INSIGHT",
                    "64 Learn Hub articles establish TwinMOS as a thought leader in memory and storage technology. "
                    "This SEO-rich content layer targets high-intent search queries — from 'DDR4 vs DDR5 comparison' to "
                    "'how to choose an NVMe SSD' — capturing users at every stage of the buyer journey.")

    # ═══════════════════════════ SECTION 10: TIMELINE ═══════════════════════════

    add_section_header(doc, "10", "Project Timeline & Milestones")

    add_body_text(doc,
                  "The project spans 18–24 months delivered by a solo full-stack developer (40h/week), "
                  "with 15 sequential phases, 150 milestones, and 689 individual tasks. The timeline is "
                  "designed for quality over speed — ensuring each phase is thoroughly tested before "
                  "advancing to the next.", size=10)

    add_styled_table(doc,
                     ["Phase", "Weeks", "Timeline", "Core Focus", "Key Milestone"],
                     [
                         ["Phases 1–2", "1–8", "Jul–Sep 2026", "Foundation, content architecture, design system",
                          "Repo setup, ADRs signed, Strapi modeling complete"],
                         ["Phases 3–4", "9–16", "Sep–Nov 2026",
                          "Core content production (all 16 sections)", "All 287 pages built in Astro; SKU PDP templates"],
                         ["Phases 5–6", "17–24", "Nov 2026–Jan 2027", "Application surfaces & form systems",
                          "Catalog, compatibility finder MVP, 15 form types"],
                         ["Phase 7", "25–28", "Jan–Feb 2027", "Quality gates & pre-launch QA",
                          "All Lighthouse/WCAG/security gates passed"],
                         ["Phase 8", "29–32", "Feb–Mar 2027", "🔴 PHASE 1 LAUNCH & hypercare",
                          "Public English-only launch; DNS cutover"],
                         ["Phases 9–10", "33–40", "Mar–Apr 2027", "Localization + partner portal foundation",
                          "AR/HI locales; Better Auth portal deployed"],
                         ["Phases 11–12", "41–48", "Apr–Jun 2027", "Support ecosystem + interactive features",
                          "Full RMA 7-state; anti-counterfeit; Chatwoot live chat"],
                         ["Phase 13", "49–64", "Jun–Oct 2027", "E-commerce foundation & launch",
                          "Medusa/Stripe live; PCI compliance verified"],
                         ["Phase 14", "65–79", "Oct 2027–Jan 2028",
                          "Advanced analytics & RU/ZH/FR launch", "PostHog OSS; 7 locales live"],
                         ["Phase 15", "80+", "Jan 2028+", "Optimization, ES/PT/DE, Loyalty, handover",
                          "10 locales live; knowledge transfer; retainer signed"],
                     ],
                     [Inches(1.0), Inches(0.7), Inches(
                         1.4), Inches(2.3), Inches(2.4)]
                     )

    # ═══════════════════════════ SECTION 11: ENGAGEMENT ═══════════════════════════

    add_section_header(doc, "11", "Engagement Model & Team")

    add_body_text(doc,
                  "The project is executed under an internal Statement of Work (SOW v4.0) with a solo full-stack "
                  "developer engaged for 18–24 months. This model prioritizes continuity, code quality, and deep "
                  "domain knowledge accumulation over distributed team overhead.", size=10)

    add_styled_table(doc,
                     ["Attribute", "Detail"],
                     [
                         ["Engagement Type",
                             "Internal SOW (no external agency)"],
                         ["Resource",
                             "1 solo full-stack developer (40 h/week)"],
                         ["Total Capacity",
                             "~3,200–3,800 person-hours (Phases 1–14)"],
                         ["Workstation", "Linux desktop; all-local development stack"],
                         ["Project Kickoff", "24 July 2026"],
                         ["Repository Architecture",
                          "2 repos: twinmos-website-frontend + twinmos-website-backend"],
                         ["Hosting Model",
                          "TwinMOS-owned Linux VM (origin) + Cloudflare DNS/WAF/CDN (edge)"],
                         ["Cadence", "Bi-weekly stakeholder demos; 24h decision turnaround; daily commits"],
                         ["AI Assistance",
                             "GitHub Copilot / Claude AI as productivity multiplier"],
                         ["Risk Mitigation",
                             "Daily commits; detailed ADRs; documented contingency plan"],
                     ],
                     [Inches(2.5), Inches(4.5)]
                     )

    add_insight_box(doc, "OPERATIONS INSIGHT",
                    "The solo-developer model with AI-assisted development achieves ~75–85% probability of full-scope, "
                    "on-time, enterprise-quality delivery. Daily commits, detailed Architecture Decision Records (ADRs), "
                    "and a documented contingency plan ensure any successor can pick up the codebase if needed.")

    # ═══════════════════════════ SECTION 12: BUSINESS IMPACT ═══════════════════════════

    add_section_header(doc, "12", "Expected Business Impact & ROI")

    add_body_text(doc,
                  "The website redevelopment is not a cosmetic upgrade — it is a strategic business investment "
                  "with measurable returns across brand credibility, lead generation, partner recruitment, and "
                  "operational efficiency.", size=10)

    add_styled_table(doc,
                     ["KPI", "Current State", "Target (12 Months)", "Impact"],
                     [
                         ["Organic Traffic", "Near-zero visibility",
                          "+200% YoY growth", "SEO-driven inbound lead flow"],
                         ["Qualified Leads/Month", "Zero", "100+",
                          "Distributor + enterprise pipeline"],
                         ["Distributor Inquiries", "Zero", "20+/quarter",
                          "Channel expansion in target markets"],
                         ["Bounce Rate", "~80%+ (estimated)", "< 40%",
                          "Engaged visitors exploring multiple pages"],
                         ["Support Tickets", "100% manual email",
                          "−30% via self-service", "Reduced HQ support burden"],
                         ["Brand Perception", "Actively damaging", "Competitive parity with Kingston/Corsair",
                          "Distributor confidence; partner recruitment"],
                         ["Mobile Experience", "Non-functional", "≥ 60% mobile sessions",
                          "Emerging market mobile-first users served"],
                         ["Page Load Speed", "Unknown/unreliable", "LCP ≤ 1.8 s",
                          "Conversion rate improvement; SEO ranking boost"],
                     ],
                     [Inches(2.0), Inches(1.8), Inches(1.6), Inches(2.6)]
                     )

    add_did_you_know_box(doc,
                         "A 100ms improvement in page load speed can increase conversion rates by 7%. With Astro 5's default "
                         "Lighthouse score of 95–100, the TwinMOS platform will deliver sub-second page loads — a significant "
                         "competitive advantage in emerging markets where mobile connections are slower.")

    # ═══════════════════════════ SECTION 13: WHY NOW ═══════════════════════════

    add_section_header(doc, "13", "Why TwinMOS — Why Now")

    add_body_text(doc,
                  "Several strategic factors converge to make this the optimal moment for TwinMOS's digital transformation:", size=10)

    reasons = [
        ("Priority Market Expansion",
         "Growing demand across South Asia and other priority markets creates immediate need for a world-class digital presence that supports distributor recruitment, product discovery, and regional credibility."),
        ("DDR5 & PCIe Gen 5.0 Product Cycle",
         "TwinMOS's latest VOLTX DDR5 and CoreX Pro PCIe Gen 5.0 products represent the company's most technologically advanced lineup. These flagship products demand a flagship digital showcase."),
        ("Competitive Pressure",
         "Every major competitor (Kingston, Corsair, ADATA, G.Skill) operates a modern, feature-rich website. The current TwinMOS site places the brand at an insurmountable digital disadvantage."),
        ("Emerging Market Digital Growth",
         "TwinMOS's core markets — Middle East, Africa, South Asia — are experiencing rapid internet penetration growth. A mobile-first, multi-language platform captures this expanding audience."),
        ("Brand Protection Imperative",
         "Counterfeit products in unregulated markets damage brand integrity and revenue. The anti-counterfeit serial verification system directly addresses this business risk."),
        ("Operational Efficiency",
         "Automating support workflows (RMA, warranty registration, knowledge base) reduces manual burden on Dubai HQ staff, enabling them to focus on strategic growth initiatives."),
    ]
    for title, desc in reasons:
        add_body_text(doc, title, bold=True, size=11,
                      color=BLUE_DARK, spacing_after=2)
        add_body_text(doc, desc, size=10, spacing_after=8)

    # ═══════════════════════════ SECTION 14: NEXT STEPS ═══════════════════════════

    add_section_header(doc, "14", "Call to Action & Next Steps")

    add_body_text(doc,
                  "The TwinMOS corporate website redevelopment project represents a defining moment for the brand's "
                  "digital future. With comprehensive documentation, a proven technology stack, a detailed 15-phase "
                  "execution roadmap, and an experienced solo developer engagement model — the project is ready to "
                  "move from planning to execution.", size=11, spacing_after=12)

    # Next steps timeline
    add_body_text(doc, "Immediate Next Steps",
                  bold=True, size=12, color=BLUE_DARK)
    add_horizontal_rule(doc, BLUE_MID)

    steps = [
        ("Project Kickoff", "24 July 2026",
         "Developer workstation setup; repositories created; local dev stack operational"),
        ("Phase 1 Complete", "Weeks 1–4 (Jul–Aug 2026)",
         "All ADRs signed; build pipeline running; SaaS accounts provisioned"),
        ("Content Architecture", "Weeks 5–8 (Aug–Sep 2026)",
         "Strapi content models; Astro schemas; design system approved"),
        ("Content Production", "Weeks 9–16 (Sep–Nov 2026)",
         "All 287 pages built; 100+ SKU PDPs completed"),
        ("Application Surfaces", "Weeks 17–24 (Nov 2026–Jan 2027)",
         "Catalog, compatibility finder, forms, where-to-buy live"),
        ("Public Launch 🚀", "Feb–Mar 2027",
         "Phase 1 English-only live; DNS cutover; hypercare begins"),
    ]
    for step, date, desc in steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.left_indent = Inches(0.25)
        run = p.add_run(f"▸ {step}  ")
        run.bold = True
        run.font.size = Pt(9.5)
        run.font.name = 'Calibri'
        run.font.color.rgb = BLUE_DARK
        run2 = p.add_run(f" — {date}")
        run2.font.size = Pt(9)
        run2.font.name = 'Calibri'
        run2.font.color.rgb = GRAY_DARK
        run2.italic = True
        p2 = doc.add_paragraph()
        p2.paragraph_format.space_after = Pt(8)
        p2.paragraph_format.left_indent = Inches(0.5)
        run3 = p2.add_run(desc)
        run3.font.size = Pt(9)
        run3.font.name = 'Calibri'
        run3.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

    doc.add_paragraph()

    # Contact box
    contact_table = doc.add_table(rows=1, cols=2)
    contact_table.alignment = WD_TABLE_ALIGNMENT.CENTER

    set_cell_shading(contact_table.cell(0, 0), BLUE_DARK)
    p = contact_table.cell(0, 0).paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run("For More Information")
    run.bold = True
    run.font.size = Pt(12)
    run.font.color.rgb = WHITE
    run.font.name = 'Calibri'
    p2 = contact_table.cell(0, 0).add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_after = Pt(12)
    run2 = p2.add_run("Contact the TwinMOS Digital Transformation Team")
    run2.font.size = Pt(9)
    run2.font.color.rgb = RGBColor(0xBB, 0xBB, 0xBB)
    run2.font.name = 'Calibri'

    set_cell_shading(contact_table.cell(0, 1), GOLD)
    p3 = contact_table.cell(0, 1).paragraphs[0]
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p3.paragraph_format.space_before = Pt(12)
    p3.paragraph_format.space_after = Pt(4)
    run3 = p3.add_run("www.twinmos.com")
    run3.bold = True
    run3.font.size = Pt(13)
    run3.font.color.rgb = WHITE
    run3.font.name = 'Calibri'
    p4 = contact_table.cell(0, 1).add_paragraph()
    p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p4.paragraph_format.space_after = Pt(12)
    run4 = p4.add_run("C-9, DAFZA, Dubai, UAE  |  +971-4-2996421")
    run4.font.size = Pt(9)
    run4.font.color.rgb = WHITE
    run4.font.name = 'Calibri'

    # ── Final decorative element ──
    doc.add_paragraph()
    add_horizontal_rule(doc, GOLD, Inches(6.2), Pt(4))
    p_end = doc.add_paragraph()
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_end.paragraph_format.space_before = Pt(8)
    run_end = p_end.add_run("— End of Marketing Catalogue —")
    run_end.italic = True
    run_end.font.size = Pt(9)
    run_end.font.color.rgb = GRAY_DARK
    run_end.font.name = 'Calibri'

    # ── Save ──
    output_dir = r"C:\software_project\TwinMOS\ERP system for TwinMOS\Corporate website development for TwinMOS\marketing"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(
        output_dir, "TwinMOS_Corporate_Website_Marketing_Catalogue.docx")
    doc.save(output_path)
    print(f"✅ Marketing Catalogue saved to: {output_path}")


if __name__ == "__main__":
    generate_marketing_catalogue()
