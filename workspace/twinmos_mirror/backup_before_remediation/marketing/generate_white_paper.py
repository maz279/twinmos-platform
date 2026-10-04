#!/usr/bin/env python3
"""
TwinMOS Corporate Website — Comprehensive White Paper Generator
Generates a professionally formatted .docx white paper with
title page, TOC, elegant headers/footers, textboxes, and visual enhancements.
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

# ── Colors ──
NAVY = RGBColor(0x0B, 0x1D, 0x3A)
BLUE_DARK = RGBColor(0x0D, 0x2B, 0x4E)
BLUE_MID = RGBColor(0x1A, 0x56, 0x9A)
BLUE_LIGHT = RGBColor(0xE8, 0xF0, 0xF8)
GOLD = RGBColor(0xC8, 0x96, 0x2E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x1A, 0x1A, 0x1A)
GRAY_DARK = RGBColor(0x55, 0x55, 0x55)
GRAY_LIGHT = RGBColor(0xF5, 0xF5, 0xF5)
RED_ACCENT = RGBColor(0xC0, 0x39, 0x2B)


def add_hr(doc, color=GOLD, sz=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    pPr = p._p.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="4" w:color="{color}"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr)
    return p


def shade_cell(cell, color):
    shading_elm = parse_xml(
        f'<w:shd {nsdecls("w")} w:fill="{color}" w:val="clear"/>'
    )
    cell._tc.get_or_add_tcPr().append(shading_elm)


def body(doc, text, bold=False, size=9.5, color=None, align=None, after=6, before=0, italic=False):
    p = doc.add_paragraph()
    if align:
        p.alignment = align
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.line_spacing = Pt(16)
    run = p.add_run(text)
    run.font.size = Pt(size)
    run.font.name = 'Calibri'
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color if color else BLACK
    return p


def bullet(doc, text, level=0):
    p = doc.add_paragraph(style='List Bullet')
    p.clear()
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Inches(0.25 + level * 0.25)
    run = p.add_run(text)
    run.font.size = Pt(9.5)
    run.font.name = 'Calibri'
    return p


def insight_box(doc, title, content, icon="💡"):
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    shade_cell(table.cell(0, 0), GOLD)
    table.cell(0, 0).width = Inches(0.12)
    shade_cell(table.cell(0, 1), BLUE_LIGHT)
    table.cell(0, 1).width = Inches(6.08)
    p = table.cell(0, 1).paragraphs[0]
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(f"{icon} {title}")
    r.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = BLUE_DARK
    r.font.name = 'Calibri'
    p2 = table.cell(0, 1).add_paragraph()
    p2.paragraph_format.space_before = Pt(2)
    p2.paragraph_format.space_after = Pt(8)
    r2 = p2.add_run(content)
    r2.font.size = Pt(9)
    r2.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    r2.font.name = 'Calibri'
    r2.italic = True
    doc.add_paragraph()


def key_stat(doc, stat, desc):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    shade_cell(table.cell(0, 0), NAVY)
    p = table.cell(0, 0).paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(stat)
    r.bold = True
    r.font.size = Pt(22)
    r.font.color.rgb = GOLD
    r.font.name = 'Calibri'
    p2 = table.cell(0, 0).add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_after = Pt(8)
    r2 = p2.add_run(desc)
    r2.font.size = Pt(9)
    r2.font.color.rgb = WHITE
    r2.font.name = 'Calibri'
    doc.add_paragraph()


def section_header(doc, num, title):
    doc.add_page_break()
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(f"CHAPTER {num}")
    r.bold = True
    r.font.size = Pt(9.5)
    r.font.color.rgb = GOLD
    r.font.name = 'Calibri'
    p2 = doc.add_paragraph()
    p2.paragraph_format.space_before = Pt(2)
    p2.paragraph_format.space_after = Pt(6)
    r2 = p2.add_run(title)
    r2.bold = True
    r2.font.size = Pt(20)
    r2.font.color.rgb = NAVY
    r2.font.name = 'Calibri'
    add_hr(doc, GOLD, 4)
    doc.add_paragraph()


def styled_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        shade_cell(cell, NAVY)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = WHITE
        r.font.name = 'Calibri'
        if col_widths:
            cell.width = col_widths[i]
    for ri, row in enumerate(rows):
        bg = GRAY_LIGHT if ri % 2 == 0 else WHITE
        for ci, val in enumerate(row):
            cell = table.cell(ri + 1, ci)
            shade_cell(cell, bg)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            r = p.add_run(str(val))
            r.font.size = Pt(9)
            r.font.name = 'Calibri'
            if col_widths:
                cell.width = col_widths[ci]
    doc.add_paragraph()
    return table


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def generate_white_paper():
    doc = Document()

    for section in doc.sections:
        section.top_margin = Cm(2.2)
        section.bottom_margin = Cm(2.2)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)

    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(9.5)

    # Header
    header = doc.sections[0].header
    header.is_linked_to_previous = False
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = hp.add_run(
        "TwinMOS Corporate Website Development  |  White Paper  |  CONFIDENTIAL")
    r.font.size = Pt(7)
    r.font.color.rgb = GRAY_DARK
    r.font.name = 'Calibri'
    # Add subtle header line
    pPr = hp._p.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:bottom w:val="single" w:sz="4" w:space="4" w:color="BBBBBB"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr)

    # Footer
    footer = doc.sections[0].footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = fp.add_run(
        "TwinMOS Technologies Middle East FZE  |  C-9, DAFZA, Dubai, UAE  |  www.twinmos.com  |  Page ")
    r.font.size = Pt(7)
    r.font.color.rgb = GRAY_DARK
    r.font.name = 'Calibri'

    # ═══════════════════════════ TITLE PAGE ═══════════════════════════

    # Top bar
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    pPr = p._p.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:bottom w:val="single" w:sz="30" w:space="16" w:color="{GOLD}"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr)

    for _ in range(5):
        doc.add_paragraph()

    # Classification
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("CONFIDENTIAL WHITE PAPER")
    r.bold = True
    r.font.size = Pt(11)
    r.font.color.rgb = RED_ACCENT
    r.font.name = 'Calibri'

    for _ in range(2):
        doc.add_paragraph()

    # Main title
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Digital Transformation of")
    r.font.size = Pt(18)
    r.font.color.rgb = GRAY_DARK
    r.font.name = 'Calibri'

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_before = Pt(4)
    r2 = p2.add_run("TwinMOS Technologies")
    r2.bold = True
    r2.font.size = Pt(34)
    r2.font.color.rgb = NAVY
    r2.font.name = 'Calibri'

    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p3.paragraph_format.space_before = Pt(0)
    r3 = p3.add_run("Corporate Website Redevelopment Project")
    r3.bold = True
    r3.font.size = Pt(22)
    r3.font.color.rgb = BLUE_MID
    r3.font.name = 'Calibri'

    add_hr(doc, GOLD, 6)
    doc.add_paragraph()

    # Subtitle
    p4 = doc.add_paragraph()
    p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r4 = p4.add_run(
        "A Comprehensive Analysis of Strategy, Architecture, Implementation, and Business Impact")
    r4.italic = True
    r4.font.size = Pt(12)
    r4.font.color.rgb = GRAY_DARK
    r4.font.name = 'Calibri'

    for _ in range(5):
        doc.add_paragraph()

    # Author & date box
    info = doc.add_table(rows=7, cols=2)
    info.alignment = WD_TABLE_ALIGNMENT.CENTER
    items = [
        ("Document Reference:", "TWN-WP-2026-001"),
        ("Version:", "1.0"),
        ("Date:", datetime.now().strftime("%d %B %Y")),
        ("Prepared by:", "TwinMOS Digital Transformation Team"),
        ("Classification:", "CONFIDENTIAL — Internal Use Only"),
        ("Project Duration:", "18–24 Months (15 Phases)"),
        ("Technology Platform:", "Strapi v5 + Astro 5 + PostgreSQL 16"),
    ]
    for i, (k, v) in enumerate(items):
        info.cell(i, 0).width = Inches(1.8)
        info.cell(i, 1).width = Inches(2.7)
        rk = info.cell(i, 0).paragraphs[0].add_run(k)
        rk.bold = True
        rk.font.size = Pt(9)
        rk.font.name = 'Calibri'
        rk.font.color.rgb = GRAY_DARK
        rv = info.cell(i, 1).paragraphs[0].add_run(v)
        rv.font.size = Pt(9)
        rv.font.name = 'Calibri'

    for _ in range(3):
        doc.add_paragraph()

    # Bottom bar
    p5 = doc.add_paragraph()
    pPr = p5._p.get_or_add_pPr()
    pBdr2 = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="30" w:space="16" w:color="{GOLD}"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr2)

    # ═══════════════════════════ ABSTRACT ═══════════════════════════

    doc.add_page_break()
    body(doc, "ABSTRACT", bold=True, size=14, color=NAVY, after=8)
    add_hr(doc, GOLD, 4)
    doc.add_paragraph()

    body(doc,
         "This white paper presents a comprehensive analysis of the TwinMOS Technologies corporate "
         "website redevelopment project — a strategic digital transformation initiative designed to "
         "replace the company's functionally broken web presence with a world-class digital platform. "
         "Drawing from extensive forensic analysis of the current website, detailed business and user "
         "requirements documentation, and rigorous technology evaluation, this paper examines the "
         "project's strategy, architecture, implementation methodology, and projected business impact.",
         size=11, after=10)

    body(doc,
         "The TwinMOS website (twinmos.com) currently suffers from 74 documented critical and high-priority "
         "issues spanning technical infrastructure failure, broken user experience, factually incorrect "
         "content, and complete absence of 14 standard competitor features. This white paper demonstrates "
         "how the redevelopment project — executed over 18–24 months across 15 sequential phases by a "
         "solo full-stack developer — will transform the site from a brand liability into the company's "
         "most powerful competitive asset.",
         size=11, after=10)

    body(doc,
         "The analysis covers the full project lifecycle: from the initial forensic audit that revealed "
         "the depth of current failures, through the technology stack selection process (Strapi v5 + "
         "Astro 5 + PostgreSQL 16, chosen from six evaluated options), to the detailed 15-phase "
         "implementation roadmap with 689 individual tasks. Key findings include a projected 75–85% "
         "probability of full-scope, on-time, enterprise-quality delivery; an expected ROI exceeding "
         "400% over five years; and the strategic imperative that this project is not a luxury but a "
         "competitive necessity for TwinMOS's continued relevance in global memory and storage markets.",
         size=11, after=10)

    body(doc,
         "Keywords: digital transformation, corporate website, headless CMS, Astro, Strapi, web "
         "development, memory technology, brand repositioning, multi-language, e-commerce, WCAG 2.2, SEO",
         size=9, color=GRAY_DARK, italic=True, after=20)

    # ═══════════════════════════ CHAPTER 1: INTRODUCTION ═══════════════════════════

    section_header(doc, "1", "Introduction & Strategic Context")

    body(doc, "1.1 About TwinMOS Technologies",
         bold=True, size=13, color=BLUE_MID, after=6)

    body(doc,
         "TwinMOS Technologies, founded in 1998 in Taipei, Taiwan by William Chen, has established "
         "itself as a significant player in the global memory and storage industry. With an operational "
         "headquarters at the Dubai Airport Free Zone (DAFZA) in the United Arab Emirates, the company "
         "serves 93+ countries across five continents. TwinMOS designs and manufactures DRAM memory "
         "modules, solid-state drives (SSDs), portable storage solutions, and USB flash drives, "
         "competing in a market dominated by brands such as Kingston, Corsair, Crucial, Samsung, "
         "and ADATA.",
         size=10, after=8)

    body(doc,
         "Under the leadership of Chairman Mohd Mazharul Islam, TwinMOS has built particular strength "
         "in emerging markets — the Middle East, Africa, South Asia, and the Commonwealth of Independent "
         "States (CIS). The company maintains manufacturing operations in Taiwan, ensuring access to "
         "leading NAND flash and controller supply chains while keeping competitive price points. "
         "TwinMOS's product portfolio spans from entry-level DDR3 memory to cutting-edge PCIe Gen 5.0 "
         "NVMe SSDs and DDR5 DRAM modules under the VOLTX gaming brand.",
         size=10, after=8)

    insight_box(doc, "MARKET POSITIONING INSIGHT",
                "TwinMOS occupies a strategic 'performance-value' niche — offering 80–90% of flagship "
                "performance at 60–70% of the price. This positioning is particularly effective in "
                "price-sensitive emerging markets where consumers seek reliability without the premium "
                "brand markup. However, the company's digital presence has not kept pace with product "
                "innovation, creating a dangerous gap between product capability and brand perception.",
                "📊")

    body(doc, "1.2 The Digital Imperative",
         bold=True, size=13, color=BLUE_MID, after=6)

    body(doc,
         "In the modern technology industry, a corporate website serves as the primary interface "
         "between a brand and its global audience. For a B2B/B2C hybrid company like TwinMOS — which "
         "must simultaneously serve individual PC builders, enterprise IT procurement managers, "
         "distributor partners, OEM/ODM manufacturers, and media analysts — the website performs "
         "multiple critical functions:",
         size=10, after=8)

    functions = [
        "Product discovery and specification research for informed purchase decisions",
        "Brand credibility validation through professional design, certifications, and trust signals",
        "Distributor recruitment and partner onboarding at global scale",
        "Lead generation and sales inquiry management across 28 country markets",
        "Self-service support reducing manual burden on Dubai headquarters staff",
        "Competitive differentiation against tier-1 brands with established digital presences",
        "Compliance with regulatory frameworks including GDPR, UAE PDPL, KSA PDPL, and India DPDP",
    ]
    for f in functions:
        bullet(doc, f)

    body(doc, "1.3 Scope of This White Paper",
         bold=True, size=13, color=BLUE_MID, after=6)

    body(doc,
         "This white paper provides a comprehensive analysis of the TwinMOS corporate website "
         "redevelopment project, organized into eleven chapters. Chapter 2 examines the current "
         "state through forensic audit findings. Chapter 3 outlines the project vision and strategic "
         "alignment. Chapter 4 presents the technology architecture in detail. Chapter 5 describes "
         "the implementation strategy and 15-phase roadmap. Chapter 6 covers content and information "
         "architecture. Chapter 7 addresses user experience design. Chapter 8 examines quality "
         "assurance, security, and compliance frameworks. Chapter 9 analyzes ROI and business impact. "
         "Chapter 10 reviews risk management. Chapter 11 concludes with the future state vision.",
         size=10, after=8)

    body(doc,
         "The paper is intended for TwinMOS executive leadership, project stakeholders, and the "
         "implementing development team. It assumes a technical but not deeply engineering-specific "
         "audience, with architectural details provided at a level appropriate for informed "
         "decision-making without requiring programming expertise.",
         size=10, after=10)

    # ═══════════════════════════ CHAPTER 2: CURRENT STATE ═══════════════════════════

    section_header(
        doc, "2", "Current State Assessment: A Digital Presence in Crisis")

    body(doc,
         "A comprehensive forensic audit of twinmos.com was conducted in April 2026, employing "
         "automated crawling, manual page-by-page analysis, and competitive benchmarking against "
         "nine competitor websites. The findings paint a stark picture of digital neglect that "
         "has transformed what should be TwinMOS's most valuable marketing asset into an active "
         "liability. This chapter summarizes the audit's most significant findings.",
         size=10, after=8)

    body(doc, "2.1 Forensic Audit Methodology",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "The audit examined the live twinmos.com website across six dimensions: technical "
         "infrastructure, user experience and interface design, content quality and accuracy, "
         "search engine optimization, competitive feature parity, and strategic brand impact. "
         "Each finding was assigned a severity rating (Critical, High, Medium, Low) based on its "
         "impact on business objectives, user experience, and brand perception.",
         size=10, after=8)

    key_stat(doc, "74", "Total Issues Found\n51 Critical · 23 High-Priority")

    body(doc, "2.2 Summary of Findings", bold=True,
         size=12, color=BLUE_MID, after=6)

    styled_table(doc,
                 ["Domain", "Severity", "Count",
                     "Representative Finding", "Business Impact"],
                 [
                     ["Technical Infrastructure", "CRITICAL", "12",
                      "Core product pages return 404 errors; server errors on warranty, privacy, and support pages",
                      "Users cannot access products or legal information"],
                     ["User Experience", "CRITICAL", "10",
                      "No visible navigation menu; product brand page is completely empty; zero CTAs",
                      "Visitors cannot navigate or take any action on the site"],
                     ["Content Quality", "CRITICAL", "11",
                      "HQ location incorrectly stated as Taipei; empty awards section; broken product images throughout",
                      "Factual inaccuracies damage credibility with partners and customers"],
                     ["SEO & Discoverability", "HIGH", "9",
                      "Duplicate content; missing meta descriptions; no structured data (Schema.org); broken internal links",
                      "Near-zero organic search visibility for a global brand"],
                     ["Missing Features", "HIGH", "14",
                      "Zero of 14 standard competitor features present (compatibility finder, where-to-buy, warranty reg)",
                      "Brand appears technologically inferior to all competitors"],
                     ["Strategic Impact", "CRITICAL", "8",
                      "Active brand damage; zero lead generation; unprepared for India market entry",
                      "Lost revenue, missed partnerships, competitive disadvantage"],
                 ],
                 [Inches(1.4), Inches(0.8), Inches(
                     0.5), Inches(2.5), Inches(2.0)]
                 )

    body(doc, "2.3 The Most Damaging Findings (Detail)",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc, "2.3.1 Technical Infrastructure Failure",
         bold=True, size=11, color=NAVY, after=4)
    body(doc,
         "The website's underlying WordPress/WooCommerce installation appears to be in a state of "
         "critical decay. Core product category URLs return HTTP 404 errors, meaning potential "
         "customers who land on these pages through search engines or links are greeted with "
         "'Page Not Found.' Even more concerning, essential legal pages — including the Terms & "
         "Conditions and Privacy Policy — fail to load entirely, placing the company at risk of "
         "regulatory non-compliance across multiple jurisdictions (GDPR, UAE data protection law, "
         "and others). The product image rendering pipeline is fundamentally broken; category "
         "pages display only empty placeholder references instead of actual product photography, "
         "making it impossible for visitors to evaluate TwinMOS products visually.",
         size=10, after=8)

    body(doc, "2.3.2 Brand Credibility Erosion",
         bold=True, size=11, color=NAVY, after=4)
    body(doc,
         "Perhaps most damaging from a strategic perspective, the website contains factually "
         "incorrect information about the company itself. The current site lists Taipei as the "
         "headquarters location — when the actual operational headquarters has been in DAFZA, "
         "Dubai for over 20 years. For distributors, enterprise customers, and partners evaluating "
         "TwinMOS as a business partner, this fundamental inaccuracy undermines trust in all "
         "other company claims. Combined with an empty awards section, missing product specifications, "
         "and poor English grammar throughout, the website actively communicates that TwinMOS is "
         "not a serious, professional organization — the exact opposite of the brand's 27+ year "
         "heritage and genuine manufacturing capabilities.",
         size=10, after=8)

    body(doc, "2.3.3 Competitive Feature Gap",
         bold=True, size=11, color=NAVY, after=4)
    body(doc,
         "Competitive benchmarking against nine peer brands revealed that TwinMOS is the only "
         "brand in its category lacking ALL 14 standard website features. Competitor sites offer "
         "interactive product compatibility finders, memory configurators, where-to-buy dealer "
         "locators, warranty registration portals, downloadable firmware and drivers, product "
         "comparison tools, gaming brand microsites, and community features. TwinMOS currently "
         "offers none of these. This feature gap is not merely an inconvenience — in an industry "
         "where product compatibility is the primary purchase consideration for memory and storage "
         "products, the absence of a compatibility finder alone likely costs TwinMOS significant "
         "sales volume.",
         size=10, after=10)

    # ═══════════════════════════ CHAPTER 3: VISION ═══════════════════════════

    section_header(doc, "3", "Project Vision & Strategic Alignment")

    body(doc,
         "The TwinMOS corporate website redevelopment is not a cosmetic redesign. It is a "
         "strategic business initiative that directly enables the company's growth objectives "
         "across multiple dimensions. This chapter articulates the project vision and demonstrates "
         "how each project component aligns with specific TwinMOS business goals.",
         size=10, after=8)

    body(doc, "3.1 Vision Statement", bold=True,
         size=12, color=BLUE_MID, after=6)
    body(doc,
         '"Build a world-class digital platform that matches or exceeds the capabilities of '
         'tier-1 memory brand websites, enabling TwinMOS to compete effectively in global markets, '
         'recruit distribution partners at scale, generate qualified leads, and establish digital '
         'credibility commensurate with 27+ years of industry heritage."',
         size=11, italic=True, after=10, color=NAVY)

    body(doc, "3.2 Strategic Objectives Mapping",
         bold=True, size=12, color=BLUE_MID, after=6)

    styled_table(doc,
                 ["Business Objective", "Priority",
                     "Project Response", "Success Metric"],
                 [
                     ["Replace broken website with stable, professional platform", "P0",
                      "Complete rebuild on modern, reliable technology stack", "Zero 404 errors; 99.9% uptime"],
                     ["Achieve competitive parity with tier-1 memory brands", "P0",
                      "All 14 standard competitor features implemented", "14/14 features live at launch"],
                     ["Enable lead generation and distributor recruitment", "P0",
                      "15 inquiry form types; CRM integration; regional landing pages", "100+ qualified leads/month"],
                     ["Support India market entry via Supertron partnership", "P0",
                      "India-dedicated landing page; BIS certification display; distributor showcase", "India page in top 5 country visits"],
                     ["Improve brand credibility and trust signals", "P1",
                      "Professional design; certifications; testimonials; media kit", "Positive post-launch user sentiment"],
                     ["Drive organic search traffic growth", "P1",
                      "SEO architecture; structured data; 64 Learn Hub articles; sitemaps", "+200% organic sessions within 12 months"],
                     ["Enable self-service support", "P1",
                      "Knowledge base; FAQ; firmware downloads; RMA portal; warranty registration", "30% reduction in support emails"],
                     ["Support multi-language expansion", "P2",
                      "Strapi v5 core i18n; RTL support; 10 active locales by Phase 15", "3+ languages within 6 months"],
                 ],
                 [Inches(2.2), Inches(0.5), Inches(2.5), Inches(2.2)]
                 )

    insight_box(doc, "STRATEGIC ALIGNMENT INSIGHT",
                "Every Phase 1 feature maps to at least one P0 business objective. This deliberate alignment "
                "ensures that the project delivers maximum business value from the earliest milestone. "
                "Subsequent phases add capability depth and market breadth without compromising the core "
                "launch value proposition.",
                "🎯")

    body(doc, "3.3 Brand Architecture & Product Lines",
         bold=True, size=12, color=BLUE_MID, after=6)
    body(doc,
         "The website must present a coherent brand story across TwinMOS's 11 master brand lines "
         "spanning five product categories (Memory, SSD, Portable Storage, USB Flash, Accessories). "
         "A critical design challenge is balancing the VOLTX gaming sub-brand — which has its own "
         "visual identity, audience, and community features — with the broader TwinMOS corporate "
         "brand. The solution architecture separates these concerns through a dedicated Gaming Hub "
         "section while maintaining consistent navigation, design token, and component library "
         "inheritance from the parent design system.",
         size=10, after=10)

    # ═══════════════════════════ CHAPTER 4: TECHNOLOGY ARCHITECTURE ═══════════════════════════

    section_header(doc, "4", "Technology Architecture & Stack Selection")

    body(doc,
         "The technology stack selection process evaluated six candidate architectures across two "
         "categories — open-source-first stacks and full-custom-development approaches. The analysis "
         "considered 14 weighted criteria including total cost of ownership, developer productivity, "
         "performance characteristics, i18n capability, plugin ecosystem maturity, AI tooling "
         "compatibility, and alignment with the existing content corpus. This chapter presents the "
         "selected architecture and the rationale behind each component choice.",
         size=10, after=8)

    body(doc, "4.1 Headline Stack Decisions",
         bold=True, size=12, color=BLUE_MID, after=6)

    styled_table(doc,
                 ["Layer", "Selected Technology", "Version", "Decision Rationale"],
                 [
                     ["Frontend Framework", "Astro 5 + React 19 Islands", "Astro ≥ 5.6",
                      "Lighthouse 95+ default; Content Layer reads 454 existing markdown files directly"],
                     ["Headless CMS", "Strapi v5 (Community Edition)", "≥ 5.31",
                      "~500 plugins; core i18n (Unified Document System); MIT license; self-hostable"],
                     ["Database", "PostgreSQL 16", "16.x LTS",
                      "Relational integrity for SKU/catalog/compatibility/distributor entities"],
                     ["Search Engine", "MeiliSearch", "1.13.x",
                      "Native Arabic + CJK tokenization; MIT license; zero recurring cost"],
                     ["Image Pipeline", "Sharp + ImgProxy (self-hosted)", "Latest",
                      "On-demand WebP/AVIF transforms; no per-image API cost"],
                     ["Auth (Partner Portal)", "Better Auth", "^1.x",
                      "OAuth + MFA; Astro & Next.js support; 2026 de facto standard"],
                     ["E-Commerce (Phase 3)", "Medusa.js v2 + Stripe", "Medusa 2.x",
                      "OSS commerce engine; mature Strapi integration; PCI SAQ A scope"],
                     ["Live Chat (Phase 2)", "Chatwoot (self-hosted)", "3.x",
                      "Open source; agent routing; Strapi integration"],
                     ["Analytics", "Plausible → PostHog OSS (P3)", "Latest",
                      "GDPR-clean cookieless; PostHog adds session replay + A/B testing"],
                     ["Hosting", "TwinMOS VM + Cloudflare", "—",
                      "TwinMOS-owned Linux VM origin + Cloudflare DNS/WAF/CDN edge front"],
                 ],
                 [Inches(1.6), Inches(1.9), Inches(1.0), Inches(3.2)]
                 )

    body(doc, "4.2 Why Strapi v5 + Astro 5 Won the Evaluation",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "The Strapi v5 + Astro 5 combination was selected over five alternatives (Payload v3 + "
         "Next.js 15, Directus + Nuxt 3, and three full-custom stacks) based on five decisive factors:",
         size=10, after=6)

    decisive_factors = [
        ("Content Migration Advantage (4–8 weeks saved):",
         "Astro 5's Content Layer API reads the existing 454 markdown files in the content repository "
         "directly — with zero transformation required. This eliminates an entire content migration "
         "phase that would be necessary with Contentful, Sanity, or other headless CMS platforms. "
         "For a project operating on a tight solo-developer timeline, this time savings is decisive."),
        ("Performance by Default (Lighthouse 95–100):",
         "Astro ships zero JavaScript to the browser by default. Interactive components use React 19 "
         "islands loaded only when hydrated. This architectural choice means the BRD's performance "
         "targets (Lighthouse ≥ 90, LCP ≤ 1.8s) become routine outcomes of the framework rather "
         "than engineering challenges requiring optimization sprints."),
        ("Plugin Ecosystem Maturity (~500 plugins):",
         "Strapi v5 possesses the largest plugin ecosystem in the headless CMS space. Features that "
         "would require custom development in other stacks — audit logging, sitemap generation, SEO "
         "metadata management, media optimization — are available as installable plugins, converting "
         "weeks of development into hours of configuration."),
        ("Core Internationalization:",
         "Strapi v5's Unified Document System provides first-class i18n support as a core feature. "
         "Managing 10 locales (EN, AR-RTL, BN, HI, RU, ZH-CN, FR, ES, PT, DE) becomes configuration "
         "rather than custom code — a critical requirement given the project's multi-language scope."),
        ("Cost Efficiency (Zero License, Self-Hosted):",
         "Both Strapi and Astro are MIT-licensed with zero recurring SaaS fees. Combined with "
         "MeiliSearch (MIT), Chatwoot (MIT), and self-hosted ImgProxy, the total software licensing "
         "cost across all components is $0. Infrastructure costs are limited to the TwinMOS-owned "
         "Linux VM (~$30–60/mo) and Cloudflare Pro tier ($20/mo)."),
    ]

    for title, desc in decisive_factors:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(title + " ")
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.name = 'Calibri'
        r.font.color.rgb = NAVY
        r2 = p.add_run(desc)
        r2.font.size = Pt(9.5)
        r2.font.name = 'Calibri'

    doc.add_paragraph()

    body(doc, "4.3 Repository Architecture",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "The project follows a two-repository architecture separating frontend and backend concerns. "
         "This design choice reflects the fundamentally different development cadences, testing "
         "requirements, and deployment patterns of the content management layer versus the presentation "
         "layer. The frontend repository (twinmos-website-frontend) contains the Astro 5 project "
         "with React 19 island components, Tailwind CSS 4 design tokens, and Content Collection "
         "schemas. The backend repository (twinmos-website-backend) contains the Strapi v5 CMS "
         "instance with plugins, PostgreSQL schema migrations, and API endpoints.",
         size=10, after=8)

    body(doc,
         "While a two-repo architecture adds approximately 5–10% CI/CD operational overhead compared "
         "to a single-repo approach (such as Payload v3), this overhead is justified by: (a) the "
         "Astro Content Layer's unique ability to read markdown directly and build static pages "
         "independently of the Strapi backend, (b) cleaner separation of content authoring vs. "
         "presentation concerns for the solo developer, and (c) independent deployability — content "
         "changes in Strapi can trigger Astro rebuilds without coupling deployment pipelines.",
         size=10, after=10)

    insight_box(doc, "ARCHITECTURE DECISION RECORD",
                "All eight Architecture Decision Records (ADRs) are documented in the repository's /docs/adr/ "
                "folder, covering stack selection, repo structure, build pipeline, UI framework, CRM choice, "
                "cookie consent implementation, e-commerce platform, and Node.js LTS migration path. These "
                "ADRs serve as both justification documentation and onboarding material for any successor "
                "developer who may need to understand the codebase.",
                "📋")

    body(doc, "4.4 Hosting & Infrastructure Model",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "The hosting model follows a hybrid architecture: TwinMOS owns and operates a Linux Virtual "
         "Machine as the origin server (running Strapi, PostgreSQL, MeiliSearch, ImgProxy, and "
         "supporting services), while Cloudflare sits in front providing DNS, Web Application "
         "Firewall (WAF) with OWASP rule sets, CDN edge caching, DDoS protection, and TLS termination. "
         "This model combines the cost efficiency of self-hosting with the security and performance "
         "benefits of a global edge network.",
         size=10, after=8)

    body(doc,
         "The VM is sized at 4 vCPU / 16 GB RAM / 100 GB SSD for Phases 1–12, with a planned "
         "upgrade to 8 vCPU / 32 GB RAM / 500 GB SSD for Phase 13 when e-commerce and PostHog OSS "
         "workloads are added. Nightly encrypted backups are shipped to Backblaze B2 object storage, "
         "with quarterly disaster recovery drills ensuring the Recovery Time Objective of ≤ 4 hours "
         "and Recovery Point Objective of ≤ 15 minutes are met.",
         size=10, after=10)

    # ═══════════════════════════ CHAPTER 5: IMPLEMENTATION ═══════════════════════════

    section_header(doc, "5", "Implementation Strategy & 15-Phase Roadmap")

    body(doc,
         "The implementation follows a meticulously planned 15-phase sequential roadmap spanning "
         "18–24 months, executed by a single solo full-stack developer at 40 hours per week. "
         "With 150 milestones containing 689 individual tasks, the roadmap provides granular "
         "tracking of every deliverable from workstation setup through final knowledge transfer. "
         "This chapter presents the implementation methodology, phase structure, and key delivery "
         "milestones.",
         size=10, after=8)

    body(doc, "5.1 The Solo-Developer Operating Model",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "Per Sponsor Decision 1A, the project is delivered by a single solo full-stack developer "
         "rather than a vendor agency. This decision was driven by several factors: the scope is "
         "well-defined across 16 sections with 287 content entries, the technology stack is fully "
         "determined, the implementation roadmap provides exhaustive task-level detail, and the "
         "availability of AI-assisted development tools (GitHub Copilot, Claude) acts as a "
         "meaningful productivity multiplier.",
         size=10, after=8)

    styled_table(doc,
                 ["Attribute", "Detail"],
                 [
                     ["Engagement Model",
                      "Internal Statement of Work (SOW v4.0) — no external agency"],
                     ["Resource", "1 solo full-stack developer"],
                     ["Weekly Capacity", "40 hours"],
                     ["Total Capacity (Phases 1–14)",
                      "~3,200–3,800 person-hours (80–95 person-weeks)"],
                     ["Phase 15",
                      "Open-ended (ES/PT/DE launch, loyalty/referral, knowledge transfer)"],
                     ["Workstation",
                      "Linux desktop with all-local development (PostgreSQL + Strapi + Astro + Vite)"],
                     ["Deployments", "Local Vite build → Astro static output → Cloudflare CDN edge cache"],
                     ["Cadence", "Bi-weekly TwinMOS PM demos; 24h decision turnaround; daily commits"],
                 ],
                 [Inches(2.2), Inches(5.0)]
                 )

    body(doc, "5.2 15-Phase Execution Map",
         bold=True, size=12, color=BLUE_MID, after=6)

    styled_table(doc,
                 ["#", "Phase Name", "Weeks", "Target Dates",
                     "Key Deliverable", "BRD Phase"],
                 [
                     ["1", "Foundation & Environment Setup", "1–4", "Jul–Aug 2026",
                      "Repos, ADRs, local stack, SaaS accounts", "Phase 1"],
                     ["2", "Content Architecture & Design System", "5–8", "Aug–Sep 2026",
                      "Strapi models, Astro schemas, design tokens, Figma approved", "Phase 1"],
                     ["3", "Core Content Production — Part 1", "9–12", "Sep–Oct 2026",
                      "About, Gaming, Tech, Learn, Solutions, Marketing, Careers, Contact pages", "Phase 1"],
                     ["4", "Core Content Production — Part 2", "13–16", "Oct–Nov 2026",
                      "News, Regional, Brand, SKU detail, Legal, Compliance, Search", "Phase 1"],
                     ["5", "Application Surfaces — Product & Discovery", "17–20", "Nov–Dec 2026",
                      "Dual-axis catalog, PDP, comparison, where-to-buy locator", "Phase 1"],
                     ["6", "Application Surfaces — Forms & Support", "21–24", "Dec 2026–Jan 2027",
                      "15 form types, warranty reg, compatibility finder MVP, KB, FAQ", "Phase 1"],
                     ["7", "Quality Gates & Pre-Launch QA", "25–28", "Jan–Feb 2027",
                      "Performance, accessibility, security, UAT, content QA", "Phase 1"],
                     ["8", "🔴 Phase 1 Launch & Hypercare", "29–32", "Feb–Mar 2027",
                      "DNS cutover, public English-only launch, monitoring", "Phase 1"],
                     ["9", "Localization Foundation & Partner Portal", "33–36", "Mar–Apr 2027",
                      "AR/BN/HI i18n, RTL, Better Auth, partner dashboard", "Phase 2"],
                     ["10", "Partner Enablement & Anti-Counterfeit", "37–40", "Apr 2027",
                      "Asset library, price lists, SN-check, counterfeit reporting", "Phase 2"],
                     ["11", "Full Support Ecosystem & ERP Integration", "41–44", "Apr–May 2027",
                      "RMA 7-state, compatibility 500+ devices, firmware center", "Phase 2"],
                     ["12", "Interactive Features & Marketing Automation", "45–48", "May–Jun 2027",
                      "Chatwoot live chat, RGB visualizer, build gallery, HubSpot CRM", "Phase 2"],
                     ["13", "E-Commerce Foundation & Launch", "49–64", "Jun–Oct 2027",
                      "Medusa/Stripe, cart, checkout, PCI compliance, customer accounts", "Phase 3"],
                     ["14", "Advanced Analytics & RU/ZH/FR Localization", "65–79", "Oct 2027–Jan 2028",
                      "PostHog OSS, A/B testing, 7 locales live", "Phase 3"],
                     ["15", "Optimization, ES/PT/DE, Loyalty & Handover", "80+", "Jan 2028+",
                      "10 locales, loyalty/referral, MDF, knowledge transfer, retainer", "Phase 3+/4"],
                 ],
                 [Inches(0.3), Inches(2.2), Inches(0.6),
                     Inches(1.3), Inches(2.8), Inches(0.8)]
                 )

    body(doc, "5.3 Quality Gate Integration",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "Each of the 15 phases concludes with a Phase Gate Review — a formal checkpoint where "
         "stakeholders verify all milestones for that phase are complete and sign off before the "
         "next phase begins. Phase 7 (Quality Gates & Pre-Launch QA) is the most critical gate: "
         "it enforces all four Lighthouse score thresholds (Performance ≥ 90, Accessibility ≥ 95, "
         "Best Practices ≥ 95, SEO ≥ 95), WCAG 2.2 AA compliance validation, OWASP ZAP security "
         "scan with zero high/critical findings, cross-browser testing across Chrome/Firefox/Safari, "
         "and user acceptance testing against the URD use case catalog.",
         size=10, after=8)

    key_stat(doc, "689", "Individual Tasks\nAcross 150 Milestones in 15 Phases")

    insight_box(doc, "PROJECT MANAGEMENT INSIGHT",
                "The roadmap's 15-phase decomposition was deliberately chosen to create manageable, "
                "verifiable delivery units. Each phase spans 4 weeks (except Phase 13 at 16 weeks for "
                "e-commerce and Phase 14 at 15 weeks for analytics/localization), enabling bi-weekly "
                "stakeholder demos with 24-hour decision turnaround. This cadence prevents the 'big bang' "
                "integration risk that plagues monolithic website rebuilds.",
                "📅")

    # ═══════════════════════════ CHAPTER 6: CONTENT ═══════════════════════════

    section_header(doc, "6", "Content Architecture & Information Architecture")

    body(doc,
         "Content is the substance of a corporate website, and the TwinMOS project treats it as a "
         "first-class architectural concern. The content corpus consists of 454 markdown files "
         "organized into 16 top-level sections, catalogued as 287 distinct content entries in the "
         "authoritative Content Map (v1.1). This chapter examines the content strategy, information "
         "architecture, and content management approach.",
         size=10, after=8)

    body(doc, "6.1 Content Organization", bold=True,
         size=12, color=BLUE_MID, after=6)

    body(doc,
         "The 16-section information architecture reflects a deliberate user-centered organization. "
         "Primary navigation surfaces the most important user tasks — Product Discovery, Gaming, "
         "Support, and Where to Buy — while secondary navigation handles corporate information "
         "(About, News, Careers, Contact) and tertiary sections provide depth (Technology, Learn, "
         "Solutions). Legal and compliance pages are accessible from the footer on every page.",
         size=10, after=8)

    body(doc, "6.2 Content-Addressable Architecture",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "A distinctive architectural advantage of the chosen stack is Astro 5's Content Layer API, "
         "which reads the project's 454 markdown files directly from the filesystem. This creates a "
         "content-addressable architecture where each markdown file is both the authoring source and "
         "the build-time content input. Content editors can make changes to markdown files and see "
         "them reflected in the next Astro build — without requiring a CMS interface for every "
         "content change. This hybrid approach (Strapi for structured data like products and "
         "distributors; markdown files for informational pages) provides the best of both worlds: "
         "structured content management where needed, and lightweight file-based authoring for "
         "documentation-heavy sections like the 64-article Learn Hub.",
         size=10, after=10)

    insight_box(doc, "CONTENT STRATEGY INSIGHT",
                "The 64-article Learn Hub is the project's SEO engine. Targeting high-intent search queries "
                "like 'DDR4 vs DDR5 comparison,' 'how to choose an NVMe SSD,' and 'RAM compatibility guide,' "
                "this content layer captures users at every stage of the buyer journey — from awareness "
                "through consideration to purchase decision. Each article is structured with schema.org "
                "Article markup for rich snippet eligibility.",
                "📝")

    body(doc, "6.3 The 11 Brand Lines & SKU Architecture",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "The product catalog presents a significant content modeling challenge: 100+ SKUs spanning "
         "11 brand lines across 5 product categories, each with up to 30 technical specification "
         "fields. The Strapi content model uses a normalized entity approach — Products, SKUs, "
         "Brands, and Categories are separate collections with defined relationships — enabling "
         "efficient querying, consistent specification display, and maintainable data management. "
         "The canonical SKU reference (_master-sku-reference.md) serves as the single source of "
         "truth for all product data.",
         size=10, after=10)

    # ═══════════════════════════ CHAPTER 7: UX ═══════════════════════════

    section_header(doc, "7", "User Experience & Design Philosophy")

    body(doc,
         "With 11 distinct user personas — ranging from individual gamers and PC builders to "
         "enterprise IT managers, embedded engineers, government procurement officers, OEM/ODM "
         "partners, and media analysts — the website must serve dramatically different user needs "
         "through a cohesive, intuitive interface. This chapter outlines the UX design principles "
         "and persona-centered approach guiding the project.",
         size=10, after=8)

    body(doc, "7.1 Persona-Centered Design",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "The BRD defines 11 detailed user personas, each with specific goals, pain points, "
         "technical literacy levels, and preferred interaction patterns. The URD translates these "
         "personas into 50 use cases with full actor definitions, preconditions, main success "
         "scenarios, and extension flows. This persona-centered approach ensures that every page, "
         "component, and interaction is designed to serve a real user need rather than reflecting "
         "internal organizational assumptions.",
         size=10, after=8)

    body(doc, "7.2 Design System & Component Architecture",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "The design system is built on Tailwind CSS 4 with a token-based approach. Design tokens "
         "— colors, typography, spacing, shadows, border radii — are defined once and consumed "
         "consistently across all components. The component library includes site-wide elements "
         "(header with mega-menu navigation, multi-column footer, cookie consent banner, language "
         "selector, search bar, breadcrumbs, trust bar) and page-type-specific components (product "
         "cards, specification tables, comparison matrices, regional contact cards, news article "
         "cards, job listing cards).",
         size=10, after=8)

    body(doc, "7.3 Responsive & Accessibility-First Approach",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "With an expected 60%+ mobile traffic share from TwinMOS's emerging market user base, "
         "the website is designed mobile-first. All components are specified at four breakpoints "
         "(mobile 320px, tablet 768px, desktop 1024px, wide 1440px) with behavior defined per "
         "breakpoint in the URD's Responsive Behavior Matrix. Accessibility is not an afterthought "
         "but a design constraint: WCAG 2.2 AA compliance is enforced through automated axe-core "
         "checks in the CI pipeline on every pull request, supplemented by monthly manual testing "
         "with NVDA, JAWS, VoiceOver, and TalkBack screen readers across desktop and mobile platforms.",
         size=10, after=10)

    # ═══════════════════════════ CHAPTER 8: QA ═══════════════════════════

    section_header(doc, "8", "Quality Assurance, Security & Compliance")

    body(doc,
         "Enterprise quality is a foundational project requirement, not an aspirational target. "
         "The quality framework spans five dimensions: performance, accessibility, security, "
         "compliance, and user acceptance. Each dimension has defined quantitative targets, automated "
         "verification mechanisms, and manual validation procedures. This chapter presents the "
         "comprehensive quality assurance framework.",
         size=10, after=8)

    body(doc, "8.1 Performance Engineering",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "Performance targets are defined as absolute thresholds, not relative improvements: "
         "Lighthouse Performance score ≥ 90 on every page, Largest Contentful Paint (LCP) ≤ 1.8 "
         "seconds, Time to First Byte (TTFB) ≤ 150 milliseconds, Cumulative Layout Shift (CLS) "
         "≤ 0.1, and Interaction to Next Paint (INP) ≤ 200 milliseconds. These are validated "
         "through Lighthouse CI in the build pipeline (every pull request), WebPageTest synthetic "
         "monitoring from multiple geographic regions, and Chrome User Experience Report (CrUX) "
         "field data in production.",
         size=10, after=8)

    body(doc, "8.2 Security Architecture",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "Security is implemented as a defense-in-depth strategy with five layers: (1) Cloudflare "
         "WAF at the edge providing OWASP Top 10 protection, DDoS mitigation, and rate limiting; "
         "(2) TLS 1.3 with HSTS preload and Content Security Policy headers at the transport layer; "
         "(3) Strapi role-based access control with JWT authentication (1-hour access tokens + "
         "rotating refresh tokens) and multi-factor authentication for CMS users; (4) Better Auth "
         "with OAuth and MFA for partner portal authentication; and (5) application-level security "
         "including input validation, output encoding, CSRF protection, and Cloudflare Turnstile "
         "for bot protection on forms.",
         size=10, after=8)

    body(doc, "8.3 Compliance Framework", bold=True,
         size=12, color=BLUE_MID, after=6)

    body(doc,
         "The website must comply with four mandatory data protection regimes: GDPR (European Union), "
         "UAE PDPL (United Arab Emirates), KSA PDPL (Kingdom of Saudi Arabia), and India DPDP Act. "
         "Compliance is achieved through a custom-built Cookie Consent Manager providing granular "
         "consent controls, jurisdiction-aware policy text, Data Subject Access Request (DSAR) forms, "
         "and country-specific legal contacts (India Grievance Officer, UAE DPO). Additional "
         "regulatory frameworks (Nigeria NDPA, South Africa POPIA, UK DUAA 2025, CCPA/CPRA) "
         "are supported through the same GDPR-equivalent control set and can be activated when "
         "TwinMOS Legal opts in.",
         size=10, after=8)

    body(doc, "8.4 Testing Strategy", bold=True,
         size=12, color=BLUE_MID, after=6)

    styled_table(doc,
                 ["Test Type", "Tool/Framework", "Coverage Target", "Frequency"],
                 [
                     ["Unit Tests", "Vitest", "≥ 70% overall; 100% critical path",
                      "Every commit (pre-commit hook)"],
                     ["Integration Tests", "Vitest + Supertest",
                      "All API endpoints", "Every PR"],
                     ["E2E Tests", "Playwright",
                      "≥ 10 critical user journeys", "Every PR + nightly"],
                     ["Accessibility", "axe-core + manual NVDA/VA/TB",
                      "All pages; WCAG 2.2 AA", "CI every PR + monthly manual"],
                     ["Performance", "Lighthouse CI",
                      "Every page; scores ≥ 90/95/95/95", "CI every PR"],
                     ["Security (SAST)", "OWASP ZAP",
                      "Zero high/critical findings", "Weekly automated"],
                     ["Security (Pen-Test)", "Third-party vendor",
                      "Full application penetration test", "Pre-launch + annual"],
                     ["Load Testing", "k6", "5,000 concurrent users",
                      "Pre-launch + per major release"],
                     ["Visual Regression", "Percy / Chromatic",
                      "All component stories", "Every PR"],
                 ],
                 [Inches(1.3), Inches(1.8), Inches(2.2), Inches(2.2)]
                 )

    # ═══════════════════════════ CHAPTER 9: ROI ═══════════════════════════

    section_header(doc, "9", "Return on Investment & Business Impact Analysis")

    body(doc,
         "The website redevelopment is a strategic business investment requiring measurable returns. "
         "This chapter quantifies the projected costs, savings, revenue impact, and strategic "
         "benefits across a five-year horizon.",
         size=10, after=8)

    body(doc, "9.1 Investment Profile", bold=True,
         size=12, color=BLUE_MID, after=6)

    body(doc,
         "The project operates on a single-resource cost model rather than a vendor agency model, "
         "significantly reducing total investment. The primary cost is the solo developer's monthly "
         "compensation over 18–24 months. Infrastructure and SaaS costs are minimized through "
         "open-source software selection and self-hosting.",
         size=10, after=8)

    styled_table(doc,
                 ["Cost Category", "Monthly/Recurring", "Annual", "5-Year Total"],
                 [
                     ["Developer Compensation",
                         "Per employment contract", "TBD", "TBD"],
                     ["Cloud Server (VM)", "~$30–60/mo",
                      "~$360–720", "~$1,800–3,600"],
                     ["Cloudflare Pro", "$20/mo", "$240", "$1,200"],
                     ["SaaS (Resend, Plausible, Sentry, B2)",
                      "~$20–75/mo", "~$300–900", "~$1,500–4,500"],
                     ["Translation (AR, BN, HI, RU, ZH, FR, ES, PT, DE)",
                      "Variable/project", "Per-phase", "Per engagement"],
                     ["Penetration Test (Phase 7)", "Per engagement",
                      "~$5,000–15,000", "~$5,000–15,000"],
                 ],
                 [Inches(2.5), Inches(1.8), Inches(1.5), Inches(1.8)]
                 )

    body(doc, "9.2 Quantified Business Benefits",
         bold=True, size=12, color=BLUE_MID, after=6)

    styled_table(doc,
                 ["Benefit Area", "Expected Improvement",
                     "Financial Impact (Annual)", "Timeline"],
                 [
                     ["Organic Traffic Growth", "+200% YoY",
                      "SEO-driven qualified lead pipeline", "12 months"],
                     ["Lead Generation",
                      "100+ qualified leads/month (from zero)", "Pipeline value: $500K–$2M+", "6 months"],
                     ["Distributor Inquiries",
                      "20+/quarter (from zero)", "Channel expansion in growth markets", "6 months"],
                     ["Bad Debt/Overdue (if e-commerce)", "40–60% reduction via credit enforcement",
                      "Significant per-transaction", "Phase 3+"],
                     ["Support Burden", "30% reduction via self-service",
                      "1–2 FTE workload reduction at HQ", "6 months"],
                     ["Brand Value", "Competitive parity with tier-1 brands",
                      "Intangible but substantial", "Immediate"],
                 ],
                 [Inches(2.0), Inches(2.2), Inches(2.0), Inches(1.4)]
                 )

    insight_box(doc, "COST OF INACTION",
                "The current website costs TwinMOS an estimated 500+ lost leads per quarter, near-zero "
                "organic search visibility, active brand damage with every visitor session, and a "
                "fundamental inability to support India market entry — the company's most significant "
                "near-term growth opportunity. The cost of NOT rebuilding far exceeds the cost of "
                "rebuilding.",
                "⚠️")

    # ═══════════════════════════ CHAPTER 10: RISK ═══════════════════════════

    section_header(doc, "10", "Risk Management & Mitigation Strategy")

    body(doc,
         "Every project of this scope carries risk. The TwinMOS website redevelopment has been "
         "designed with risk management as a core discipline, not an afterthought. The consolidated "
         "risk register identifies 24 risks spanning technical, operational, schedule, and strategic "
         "categories, each with quantified probability, impact, and specific mitigation. This chapter "
         "presents the most significant risks and their mitigation strategies.",
         size=10, after=8)

    body(doc, "10.1 Top 5 Risks & Mitigations",
         bold=True, size=12, color=BLUE_MID, after=6)

    styled_table(doc,
                 ["Risk", "Prob.", "Impact", "Mitigation Strategy"],
                 [
                     ["Solo developer absence / departure", "Medium", "Very High",
                      "Daily commits ensure code continuity; 8 ADRs document all architectural decisions; "
                      "documented contingency plan with escalation contact; any successor can onboard from docs"],
                     ["Scope creep beyond 689-task baseline", "High", "High",
                      "Scope-trim list maintained; Phase Gate Reviews enforce scope discipline; "
                      "24-hour decision turnaround prevents analysis paralysis"],
                     ["Phase 1 launch delay past Mar 2027", "Medium", "Medium",
                      "Phase sequencing allows content de-scoping without architecture impact; "
                      "MVP definitions per phase; 4-week hypercare buffer built into Phase 8"],
                     ["Strapi v5 plugin compatibility issues", "Low", "Medium",
                      "All plugins evaluated before Phase 1 commit; custom development fallback for any "
                      "unsupported plugin; Strapi 5.31+ is stable and well-documented"],
                     ["Cloud server performance under e-commerce load", "Low", "Medium",
                      "Planned Phase 13 VM upgrade (4→8 vCPU, 16→32 GB RAM); k6 load testing at 5,000 "
                      "concurrent users before launch; Cloudflare CDN offloads static asset delivery"],
                 ],
                 [Inches(2.5), Inches(0.5), Inches(0.7), Inches(4.0)]
                 )

    body(doc, "10.2 Probability of Success Assessment",
         bold=True, size=12, color=BLUE_MID, after=6)

    body(doc,
         "The Implementation Strategy v4.0 provides a probabilistic assessment of project outcomes "
         "based on capacity analysis, scope complexity, and risk mitigation effectiveness:",
         size=10, after=6)

    styled_table(doc,
                 ["Outcome", "Probability"],
                 [
                     ["Phase 1 launch on schedule (Feb–Mar 2027) at full scope, enterprise quality", "80–88%"],
                     ["Phase 1+2 complete on schedule (Jun 2027) at full scope, enterprise quality", "78–85%"],
                     ["Phase 1+2+3 complete on schedule (Jan 2028) at full scope, enterprise quality", "80–90%"],
                     ["Phase 15 complete with all 10 locales and knowledge transfer (2028+)", "75–85%"],
                     ["Slip of 1–2 months on any single phase", "12–18%"],
                     ["Slip of 3+ months across multiple phases", "3–8%"],
                 ],
                 [Inches(4.5), Inches(1.5)]
                 )

    # ═══════════════════════════ CHAPTER 11: CONCLUSION ═══════════════════════════

    section_header(
        doc, "11", "Conclusion: A Defining Moment for TwinMOS Digital")

    body(doc,
         "The TwinMOS corporate website redevelopment project stands at a critical inflection "
         "point. The forensic audit has documented — with painful clarity — that the current "
         "digital presence is not merely inadequate but actively damaging to the brand. The "
         "strategic analysis has demonstrated that a rebuild is not a luxury but a competitive "
         "necessity. The technology evaluation has identified a proven, cost-efficient stack "
         "that makes enterprise-quality delivery achievable within the project's constraints. "
         "The 15-phase implementation roadmap has decomposed the entire scope into 689 "
         "manageable, verifiable tasks with clear milestones and quality gates.",
         size=11, after=10)

    body(doc,
         "The convergence of several strategic factors — India market entry, DDR5/PCIe Gen 5.0 "
         "product cycles, emerging market digital growth, and the competitive imperative to match "
         "tier-1 brand websites — makes the timing of this project particularly urgent. Every "
         "quarter of delay represents continued brand damage, continued lead loss, and continued "
         "competitive disadvantage.",
         size=11, after=10)

    body(doc, "11.1 Key Takeaways", bold=True, size=12, color=BLUE_MID, after=6)

    takeaways = [
        "The current TwinMOS website has 74 documented critical and high-priority issues "
        "spanning technical failure, broken UX, factual inaccuracies, and complete absence of "
        "14 standard competitive features. It is functionally broken and strategically counterproductive.",
        "The Strapi v5 + Astro 5 technology stack was selected from six evaluated options based "
        "on five decisive factors: content migration advantage (4–8 weeks saved), Lighthouse 95+ "
        "by default, 500-plugin ecosystem, core i18n for 10 locales, and $0 software licensing cost.",
        "The 15-phase implementation roadmap with 689 tasks provides granular, trackable execution "
        "planning. The public Phase 1 launch (English-only) is targeted for Feb–Mar 2027, followed "
        "by multi-language, partner portal, e-commerce, and advanced analytics capabilities through "
        "2028.",
        "The solo-developer model with AI-assisted development achieves a 75–85% probability of "
        "full-scope, on-time delivery. Daily commits, detailed ADRs, and a documented contingency "
        "plan mitigate the key risk of developer unavailability.",
        "The project's business impact extends beyond website metrics to fundamental strategic "
        "outcomes: India market readiness, distributor recruitment at scale, competitive parity "
        "with tier-1 brands, and measurable ROI through lead generation and brand value uplift.",
        "The cost of inaction — 500+ lost leads per quarter, zero organic search visibility, "
        "active brand damage, and inability to support key growth initiatives — far exceeds "
        "the cost of rebuilding.",
    ]

    for i, t in enumerate(takeaways, 1):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(f"{i}. ")
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.name = 'Calibri'
        r.font.color.rgb = NAVY
        r2 = p.add_run(t)
        r2.font.size = Pt(9.5)
        r2.font.name = 'Calibri'

    doc.add_paragraph()
    add_hr(doc, GOLD, 8)
    doc.add_paragraph()

    body(doc, "11.2 Final Recommendation", bold=True, size=14,
         color=NAVY, after=8, align=WD_ALIGN_PARAGRAPH.CENTER)

    body(doc,
         "Proceed to Phase 1 execution on 24 July 2026. All prerequisites are met: documentation "
         "is complete, the technology stack is decided, the implementation roadmap is detailed, "
         "the engagement model is defined, and the business case is compelling. The TwinMOS "
         "corporate website redevelopment project is ready.",
         size=12, align=WD_ALIGN_PARAGRAPH.CENTER, after=16, color=BLUE_MID)

    # ═══════════════════════════ APPENDIX A ═══════════════════════════

    doc.add_page_break()
    body(doc, "APPENDIX A: Key Reference Documents",
         bold=True, size=14, color=NAVY, after=8)
    add_hr(doc, GOLD, 4)
    doc.add_paragraph()

    styled_table(doc,
                 ["Document", "Version", "Purpose", "Lines"],
                 [
                     ["TwinMOS Website BRD", "3.0",
                      "Business requirements; epics; user stories; data models", "2,387"],
                     ["TwinMOS Website URD", "3.1",
                      "User requirements; personas; use cases; UI specs", "5,526"],
                     ["TwinMOS Website RFP", "3.0",
                      "Procurement specification (superseded by SOW v4.0)", "1,280"],
                     ["TwinMOS Website SOW", "4.0",
                      "Statement of Work; solo-dev engagement model; cost model", "239"],
                     ["TwinMOS Tech Stack", "1.2",
                      "Technology architecture; component selection; ADRs", "2,451"],
                     ["TwinMOS Implementation Strategy", "4.0",
                      "Capacity analysis; stack evaluation; recommendations", "1,242"],
                     ["TwinMOS 15-Phase Roadmap", "3.0",
                      "689 tasks across 150 milestones; phase scheduling", "1,514"],
                     ["TwinMOS Content Map", "1.1",
                      "287 content entries across 16 IA sections", "1,126"],
                     ["TwinMOS Company Profile", "2.0",
                      "Authoritative source-of-truth for company facts", "355"],
                     ["TwinMOS Forensic Audit", "1.0",
                      "Current website issue catalog (74 findings)", "357"],
                     ["TwinMOS Forensic Alignment Audit", "3.0",
                      "Cross-document consistency audit (56 findings)", "—"],
                     ["_master-sku-reference.md", "1.0",
                      "Canonical SKU registry (100+ products)", "—"],
                 ],
                 [Inches(2.3), Inches(0.7), Inches(3.2), Inches(0.8)]
                 )

    doc.add_paragraph()
    body(doc, "APPENDIX B: Glossary of Key Terms",
         bold=True, size=14, color=NAVY, after=8)
    add_hr(doc, GOLD, 4)
    doc.add_paragraph()

    styled_table(doc,
                 ["Term", "Definition"],
                 [
                     ["ADR", "Architecture Decision Record — formal documentation of a technology decision with rationale"],
                     ["Astro", "Modern frontend framework shipping zero JS by default; islands architecture for interactivity"],
                     ["Better Auth", "Open-source authentication framework supporting OAuth, MFA, and multiple frontend frameworks"],
                     ["BRD", "Business Requirements Document — defines what the business needs the system to do"],
                     ["Chatwoot", "Open-source customer engagement platform with live chat, agent routing, and ticket management"],
                     ["CLS", "Cumulative Layout Shift — measures visual stability; target ≤ 0.1"],
                     ["Cloudflare", "Global edge network providing DNS, CDN, WAF, and DDoS protection services"],
                     ["Content Layer",
                      "Astro 5 API that reads local files (markdown, MDX) as typed content collections"],
                     ["DAFZA", "Dubai Airport Free Zone — location of TwinMOS operational headquarters"],
                     ["GDPR", "General Data Protection Regulation — EU data privacy law"],
                     ["i18n", "Internationalization — preparing software for multiple languages and regional conventions"],
                     ["INP", "Interaction to Next Paint — Google Core Web Vital measuring responsiveness"],
                     ["LCP", "Largest Contentful Paint — measures loading performance; target ≤ 1.8s"],
                     ["Lighthouse", "Google's automated tool for auditing web page quality across performance, accessibility, SEO"],
                     ["Medusa.js", "Open-source headless commerce engine for building e-commerce experiences"],
                     ["MeiliSearch", "Open-source, typo-tolerant search engine with native multilingual tokenization"],
                     ["OWASP ZAP", "Open-source web application security scanner for automated vulnerability detection"],
                     ["PostHog", "Open-source product analytics platform with session replay, feature flags, and A/B testing"],
                     ["RTL", "Right-to-Left — text direction used by Arabic script; requires special CSS handling"],
                     ["Strapi", "Open-source headless CMS providing RESTful and GraphQL APIs for content management"],
                     ["TTFB", "Time to First Byte — measures server responsiveness; target ≤ 150ms"],
                     ["URD", "User Requirements Document — defines what users need to do, see, and experience"],
                     ["WCAG 2.2 AA", "Web Content Accessibility Guidelines — international standard for accessible web content"],
                 ],
                 [Inches(1.8), Inches(5.2)]
                 )

    # ── Final decorative element ──
    doc.add_paragraph()
    add_hr(doc, GOLD, 8)
    p_end = doc.add_paragraph()
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_end.paragraph_format.space_before = Pt(12)
    r_end = p_end.add_run("— End of White Paper —")
    r_end.italic = True
    r_end.font.size = Pt(9.5)
    r_end.font.color.rgb = GRAY_DARK
    r_end.font.name = 'Calibri'

    # ── Save ──
    output_dir = r"C:\software_project\TwinMOS\ERP system for TwinMOS\Corporate website development for TwinMOS\marketing"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(
        output_dir, "TwinMOS_Corporate_Website_White_Paper.docx")
    doc.save(output_path)
    print(f"✅ White Paper saved to: {output_path}")


if __name__ == "__main__":
    generate_white_paper()
