---
title: "How to Enable XMP in BIOS"
slug: "how-to-enable-xmp-bios"
url: "/support/kb/how-to-enable-xmp-bios/"
template: "page"
description: "Enable Intel XMP 3.0 in your motherboard BIOS to run TwinMOS VOLTX DDR5 memory at its rated speed."
keywords: ["enable XMP", "XMP 3.0", "BIOS memory", "DDR5 speed", "Intel overclocking"]
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
    analytics_id: "cta_how-to-enable-xmp_contact"
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
  page_view: "support_kb_how-to-enable-xmp-bios"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Enable XMP in BIOS

By default, all DDR5 memory runs at the JEDEC base speed of 4800MHz. To achieve the advertised speed of your TwinMOS VOLTX DDR5 modules (e.g., 6000MHz, 6400MHz), you must enable the Intel Extreme Memory Profile (XMP) 3.0 in your motherboard BIOS.

## Before You Begin

### Prerequisites
- Intel-based system with DDR5 support (12th Gen Core or newer)
- TwinMOS VOLTX DDR5 memory installed
- Access to the motherboard BIOS/UEFI

## Step-by-Step Instructions

### Step 1: Enter BIOS
Restart your PC and press the BIOS entry key during boot. Common keys include:
- **Delete** (most common)
- **F2**
- **F10**

Check your motherboard manual if unsure.

### Step 2: Locate the XMP Setting
Navigate to the overclocking, advanced, or memory settings section. The exact location varies by motherboard manufacturer:

- **ASUS:** Extreme Tweaker / Ai Tweaker → AI Overclock Tuner → XMP
- **MSI:** Overclocking → Advanced DRAM Configuration → XMP Profile
- **Gigabyte:** M.I.T. → Advanced Memory Settings → XMP
- **ASRock:** OC Tweaker → DRAM Configuration → Load XMP Setting

### Step 3: Enable the Profile
Select the XMP profile (usually Profile 1). Some DDR5 modules offer multiple profiles. Choose the one that matches your memory's advertised speed and timings.

### Step 4: Save and Exit
Press **F10** to save changes and exit. The system will reboot.

### Step 5: Verify the Speed
After booting into Windows, open Task Manager (Performance tab → Memory) or use CPU-Z to confirm the memory is running at the rated frequency.

## Troubleshooting

**System won't boot after enabling XMP:**
- Clear CMOS to reset BIOS settings.
- Try a lower XMP profile if available.
- Update your motherboard BIOS for improved DDR5 compatibility.
- Ensure your CPU's memory controller supports the target speed.

**Memory still shows 4800MHz:**
- Verify you saved the BIOS changes.
- Some motherboards have separate XMP settings per memory channel.

## Related Articles
- [How to Enable AMD EXPO in BIOS](/support/kb/how-to-enable-amd-expo-bios/)
- [Why Is My RAM Running at 2133MHz?](/support/kb/why-is-my-ram-running-at-2133mhz/)
- [How to Check RAM Speed in Windows](/support/kb/how-to-check-ram-speed-windows/)
