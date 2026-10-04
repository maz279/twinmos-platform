---
title: "How to Pair RGB with ASUS Aura Sync"
slug: "how-to-pair-rgb-with-aura-sync"
url: "/support/kb/how-to-pair-rgb-with-aura-sync/"
template: "page"
description: "Synchronize your TwinMOS VOLTX DDR5 RGB lighting with ASUS Aura Sync software."
keywords: ["Aura Sync", "ASUS RGB", "VOLTX RGB", "memory RGB", "ASUS motherboard"]
persona: ["home-user", "gamer"]
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
    analytics_id: "cta_how-to-pair-rgb-a_contact"
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
  page_view: "support_kb_how-to-pair-rgb-with-aura-sync"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Pair RGB with ASUS Aura Sync

TwinMOS VOLTX DDR5 modules feature addressable RGB lighting that can be synchronized with ASUS Aura Sync. This guide walks you through the setup process.

## Before You Begin

### Prerequisites
- ASUS motherboard with Aura Sync support
- TwinMOS VOLTX DDR5 RGB module(s) installed
- Armoury Crate installed (includes Aura Sync)

## Step-by-Step Instructions

### Step 1: Install Armoury Crate
Download and install Armoury Crate from the ASUS support page if it is not already installed. During installation, ensure the **Aura Sync** and **Device Component** options are selected.

### Step 2: Verify Module Detection
Open Armoury Crate and navigate to the **Aura Sync** tab. Your TwinMOS VOLTX DDR5 modules should appear under the "DRAM" category. If they do not appear:
- Ensure the modules are fully seated.
- Update Armoury Crate to the latest version.
- Update your motherboard BIOS.

### Step 3: Apply an Effect
Select your preferred lighting effect:
- **Static:** Single color
- **Breathing:** Fade in/out
- **Rainbow:** Color cycle
- **Music:** Reactive to audio
- **Sync with other devices:** Match all Aura Sync components

### Step 4: Customize Colors
Click the color selector to choose custom colors for supported effects.

### Step 5: Save the Profile
Save your settings to an Armoury Crate profile so they persist after reboot.

## Troubleshooting

**Modules not detected:**
- Reseat the memory modules.
- Update Armoury Crate and motherboard BIOS.
- Some older ASUS boards may require a specific BIOS version for DDR5 RGB support.

**Lighting freezes or lags:**
- Close conflicting RGB software from other manufacturers.
- Reduce the number of active Aura Sync devices.

## Related Articles
- [How to Pair RGB with MSI Mystic Light](/support/kb/how-to-pair-rgb-with-mystic-light/)
- [RGB / VOLTX FAQ](/support/faq/rgb/)
