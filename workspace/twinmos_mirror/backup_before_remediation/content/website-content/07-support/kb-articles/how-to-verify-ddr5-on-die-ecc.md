---
title: "How to Verify DDR5 On-Die ECC"
slug: "how-to-verify-ddr5-on-die-ecc"
url: "/support/kb/how-to-verify-ddr5-on-die-ecc/"
template: "page"
description: "Confirm that on-die ECC is active on your TwinMOS DDR5 memory module for improved data integrity."
keywords: ["DDR5 ECC", "on-die ECC", "error correction", "data integrity", "DDR5 features"]
persona: ["home-user", "gamer", "enterprise"]
phase: P1
priority: P0
owner: "support"
status: draft
last_reviewed: "2026-04-30"
locale: en
schema: "Article"
ctas:
  - label: "Contact Support"
    url: "/support/contact/"
    icon: "message-circle"
    analytics_id: "cta_how-to-verify-ddr_contact"
cross_links:
  - url: "/support/kb/"
    title: "Knowledge Base"
    description: "Browse support articles and guides."
  - url: "/support/faq/memory/"
    title: "FAQs"
    description: "Quick answers to common questions."
  - url: "/support/contact/"
    title: "Contact Support"
    description: "Reach our support team for help."
design_specs:
  layout: "kb-article"
  components:
    - "article-header"
    - "step-instruction-block"
    - "troubleshooting-accordion"
    - "related-articles-sidebar"
    - "feedback-buttons"
accessibility_notes:
  - "Step instructions must have clear heading hierarchy"
  - "Images must have descriptive alt text"
  - "Feedback buttons must announce state changes"
analytics_tracking:
  page_view: "support_kb_how-to-verify-ddr5-on-die-ecc"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Verify DDR5 On-Die ECC

DDR5 introduces on-die Error Correction Code (ECC), which corrects single-bit errors within the memory chip itself. This improves data integrity compared to DDR4, though it is not the same as system-level ECC used in servers.

## What Is On-Die ECC?

On-die ECC uses extra storage cells within each DRAM chip to detect and correct bit errors at the chip level. Unlike traditional ECC, it does not report errors to the system or correct errors on the memory bus. Its primary benefit is improved reliability and yield for high-density DDR5 chips.

## How to Verify On-Die ECC

On-die ECC is a hardware feature of all DDR5 modules and operates transparently. There is no user-configurable setting to enable or disable it. However, you can verify DDR5 operation and related features using the following methods.

### Method 1: Check Module Specifications
All genuine DDR5 modules, including TwinMOS VOLTX DDR5, implement on-die ECC as part of the DDR5 standard. Confirm your module is DDR5 by:
- Reading the product label
- Checking CPU-Z SPD tab
- Verifying the notch position (DDR5 has a different key than DDR4)

### Method 2: Use CPU-Z
1. Download and run CPU-Z.
2. Navigate to the **SPD** tab.
3. Select a memory module.
4. Under **Timings Table**, review the module details. While CPU-Z does not display an explicit "ECC" flag for consumer DDR5, the presence of DDR5 technology confirms on-die ECC capability.

### Method 3: Check BIOS Information
Some motherboard BIOS screens display memory details under the memory or SPD information section. Look for DDR5 identification.

## On-Die ECC vs. System ECC

| Feature | On-Die ECC (DDR5) | System ECC (Server) |
|---|---|---|
| Corrects single-bit errors | Yes | Yes |
| Corrects multi-bit errors | No | Yes (with Chipkill) |
| Reports errors to OS | No | Yes |
| Requires special CPU/motherboard | No | Yes |
| Common use case | Consumer desktops/laptops | Servers, workstations |

## Important Notes

- On-die ECC does not replace system-level ECC for mission-critical applications.
- There is no performance penalty for on-die ECC; it is inherent to DDR5 operation.
- You cannot "disable" on-die ECC, nor do you need to enable it.

## Related Articles
- [Memory FAQ](/support/faq/memory/)
