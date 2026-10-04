---
title: "How to Find My Motherboard QVL"
slug: "how-to-find-my-motherboard-qvl"
url: "/support/kb/how-to-find-my-motherboard-qvl/"
template: "page"
description: "Learn how to locate and read your motherboard's Qualified Vendor List (QVL) to verify TwinMOS memory compatibility."
keywords: ["QVL", "Qualified Vendor List", "motherboard compatibility", "memory support list"]
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
    analytics_id: "cta_how-to-find-my-m_contact"
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
  page_view: "support_kb_how-to-find-my-motherboard-qvl"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Find My Motherboard QVL

A Qualified Vendor List (QVL) is a document published by motherboard manufacturers that lists memory modules tested and verified to work with a specific motherboard model. Checking the QVL before purchasing TwinMOS memory helps ensure compatibility and stability.

## What Is a QVL?

The QVL includes:
- Tested memory part numbers
- Supported capacities per module and total
- Verified speeds and timings
- Slot configurations (single, dual, quad channel)

## How to Find the QVL

### Step 1: Identify Your Motherboard Model
You can find your motherboard model using:
- CPU-Z (Mainboard tab)
- System Information (`msinfo32` → BaseBoard Product)
- Physical inspection of the motherboard PCB or box

### Step 2: Visit the Manufacturer's Website
Go to the support page for your motherboard model. Common manufacturers:
- ASUS
- MSI
- Gigabyte
- ASRock

### Step 3: Locate the QVL
Look for a link labeled:
- "Memory QVL"
- "Qualified Vendors List"
- "Memory Support"
- "Tested Memory"

The QVL is usually a PDF or web table.

### Step 4: Search for Your Memory
Use the PDF search function (Ctrl+F) to look for:
- The memory manufacturer's name (e.g., TwinMOS)
- The specific part number or model (e.g., VOLTX DDR5)
- The speed you intend to run (e.g., 6000MHz)

## What If My Memory Is Not on the QVL?

A module not listed on the QVL does not mean it will not work. It simply means the motherboard manufacturer did not test that specific SKU. Many users run non-QVL memory without issues. However, if you encounter stability problems, the motherboard manufacturer may limit support for non-QVL modules.

## Tips for Using the QVL

- Check the **BIOS version** listed on the QVL. Some modules require a newer BIOS to function correctly.
- Pay attention to the **DIMM socket support** column, which indicates whether the module was tested in single, dual, or quad channel configurations.
- QVLs are updated periodically. Download the latest version.

## Related Articles
- [How to Troubleshoot RAM Not Detected](/support/kb/how-to-troubleshoot-ram-not-detected/)
- [How to Enable XMP in BIOS](/support/kb/how-to-enable-xmp-bios/)
