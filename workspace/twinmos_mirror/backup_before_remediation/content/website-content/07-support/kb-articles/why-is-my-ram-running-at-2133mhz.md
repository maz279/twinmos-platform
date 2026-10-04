---
title: "Why Is My RAM Running at 2133MHz or 4800MHz?"
slug: "why-is-my-ram-running-at-2133mhz"
url: "/support/kb/why-is-my-ram-running-at-2133mhz/"
template: "page"
description: "Understand why your TwinMOS memory defaults to 2133MHz (DDR4) or 4800MHz (DDR5) and how to enable the rated speed."
keywords: ["RAM speed", "2133MHz", "4800MHz", "default speed", "JEDEC", "XMP"]
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
    analytics_id: "cta_why-is-my-ram-run_contact"
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
  page_view: "support_kb_why-is-my-ram-running-at-2133mhz"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# Why Is My RAM Running at 2133MHz or 4800MHz?

If you check your memory speed and see 2133MHz (DDR4) or 4800MHz (DDR5) instead of the higher number advertised on the box, your system is running at the JEDEC default speed. This is normal and expected — but you can unlock the full speed with a simple BIOS setting.

## What Is JEDEC?

JEDEC is the industry standards body that defines default memory speeds to ensure compatibility across all systems. For compatibility reasons, motherboards boot memory at the JEDEC default:
- **DDR4:** 2133MHz or 2400MHz
- **DDR5:** 4800MHz

## What Are XMP and EXPO?

Memory manufacturers validate their modules at higher speeds using Intel XMP (Extreme Memory Profile) or AMD EXPO (Extended Profiles for Overclocking). These profiles store pre-configured speed, timing, and voltage settings on the memory module itself.

## How to Enable the Rated Speed

### For Intel Systems (XMP)
1. Enter BIOS by pressing Delete or F2 during boot.
2. Navigate to the overclocking or memory settings section.
3. Enable **XMP Profile 1** (or the profile matching your memory's rating).
4. Save and exit.

### For AMD Systems (EXPO)
1. Enter BIOS by pressing Delete or F2 during boot.
2. Navigate to the overclocking or memory settings section.
3. Enable **EXPO**.
4. Save and exit.

## What If the Speed Doesn't Change?

- Ensure you saved the BIOS settings (usually F10).
- Update your motherboard BIOS to the latest version.
- Verify your CPU's memory controller supports the target speed.
- Try a different memory slot (consult your motherboard manual for the recommended primary slot).

## Is Running at Default Speed Bad?

No. Your system will function normally at JEDEC speeds. However, you will not receive the performance benefits you paid for, especially in games and memory-intensive applications.

## Related Articles
- [How to Enable XMP in BIOS](/support/kb/how-to-enable-xmp-bios/)
- [How to Enable AMD EXPO in BIOS](/support/kb/how-to-enable-amd-expo-bios/)
- [How to Check RAM Speed in Windows](/support/kb/how-to-check-ram-speed-windows/)
