---
title: "How to Enable AMD EXPO in BIOS"
slug: "how-to-enable-amd-expo-bios"
url: "/support/kb/how-to-enable-amd-expo-bios/"
template: "page"
description: "Enable AMD EXPO in your motherboard BIOS to run TwinMOS VOLTX DDR5 memory at its rated speed on AMD platforms."
keywords: ["enable EXPO", "AMD EXPO", "BIOS memory", "DDR5 speed", "AMD overclocking"]
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
    analytics_id: "cta_how-to-enable-amd_contact"
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
  page_view: "support_kb_how-to-enable-amd-expo-bios"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Enable AMD EXPO in BIOS

AMD Ryzen 7000 series and newer processors support DDR5 memory with AMD EXtended Profiles for Overclocking (EXPO). Enabling EXPO allows your TwinMOS VOLTX DDR5 modules to run at their full advertised speed on AMD AM5 platforms.

## Before You Begin

### Prerequisites
- AMD AM5 system (Ryzen 7000 series or newer)
- TwinMOS VOLTX DDR5 memory with EXPO support
- Access to the motherboard BIOS/UEFI

## Step-by-Step Instructions

### Step 1: Enter BIOS
Restart your PC and press the BIOS entry key during boot:
- **Delete**
- **F2**

Consult your motherboard manual for the correct key.

### Step 2: Find the EXPO Setting
Navigate to the overclocking or memory configuration section:

- **ASUS:** Extreme Tweaker → AI Overclock Tuner → EXPO
- **MSI:** Overclocking → Advanced DRAM Configuration → EXPO Profile
- **Gigabyte:** M.I.T. → Advanced Memory Settings → EXPO
- **ASRock:** OC Tweaker → DRAM Configuration → Load EXPO Setting

### Step 3: Enable the Profile
Select the EXPO profile that matches your memory's rated speed and timings.

### Step 4: Save and Exit
Press **F10** to save and reboot.

### Step 5: Verify
In Windows, use Task Manager or CPU-Z to confirm the memory frequency matches the EXPO rating.

## Troubleshooting

**System fails to POST:**
- Clear CMOS to reset BIOS.
- Try a lower EXPO profile or manually set a lower frequency.
- Update motherboard BIOS for better DDR5 support.

**Memory frequency incorrect:**
- Ensure you selected EXPO, not XMP (some boards offer both).
- Verify the memory modules support EXPO.

## Related Articles
- [How to Enable XMP in BIOS](/support/kb/how-to-enable-xmp-bios/)
- [Why Is My RAM Running at 2133MHz?](/support/kb/why-is-my-ram-running-at-2133mhz/)
