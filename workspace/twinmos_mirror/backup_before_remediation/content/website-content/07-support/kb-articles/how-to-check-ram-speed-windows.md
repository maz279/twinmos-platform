---
title: "How to Check RAM Speed in Windows"
slug: "how-to-check-ram-speed-windows"
url: "/support/kb/how-to-check-ram-speed-windows/"
template: "page"
description: "Verify your TwinMOS memory frequency in Windows using built-in tools and third-party utilities."
keywords: ["check RAM speed", "memory frequency", "DDR5 speed", "Task Manager memory"]
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
    analytics_id: "cta_how-to-check-ram_contact"
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
  page_view: "support_kb_how-to-check-ram-speed-windows"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Check RAM Speed in Windows

After installing TwinMOS memory and enabling XMP or EXPO, you should verify that your system is actually running the memory at the advertised speed. This guide covers multiple methods to check RAM frequency in Windows.

## Method 1: Task Manager

1. Press **Ctrl + Shift + Esc** to open Task Manager.
2. Click the **Performance** tab.
3. Select **Memory** from the left sidebar.
4. Look at the **Speed** field. This shows the current memory frequency in MHz.

**Note:** The displayed speed is the effective data rate (e.g., 6000MHz). The I/O bus clock is half of this for DDR (e.g., 3000MHz).

## Method 2: CPU-Z

CPU-Z provides detailed memory timing and frequency information.

1. Download and install CPU-Z from the official website.
2. Open CPU-Z and click the **Memory** tab.
3. The **DRAM Frequency** field shows the I/O bus clock. Double this value to get the effective DDR speed.
4. The **SPD** tab shows the profiles stored on the module, including XMP and EXPO ratings.

## Method 3: Command Prompt

You can query memory speed via WMI:
```cmd
wmic memorychip get speed
```
This returns the speed in MHz for each installed module.

## Method 4: PowerShell

```powershell
Get-WmiObject -Class Win32_PhysicalMemory | Select-Object DeviceLocator, Speed
```

## Interpreting the Results

| Advertised Speed | Expected Task Manager Value | Expected CPU-Z DRAM Frequency |
|---|---|---|
| DDR5-4800 | 4800 MHz | 2400 MHz |
| DDR5-5600 | 5600 MHz | 2800 MHz |
| DDR5-6000 | 6000 MHz | 3000 MHz |
| DDR5-6400 | 6400 MHz | 3200 MHz |

## If the Speed Is Incorrect

If your memory is running at 4800MHz (the JEDEC default) instead of the advertised speed:
- Enter BIOS and enable the XMP 3.0 or EXPO profile.
- Ensure you saved the BIOS settings.
- Update your motherboard BIOS if the profile does not apply correctly.

## Related Articles
- [How to Enable XMP in BIOS](/support/kb/how-to-enable-xmp-bios/)
- [How to Enable AMD EXPO in BIOS](/support/kb/how-to-enable-amd-expo-bios/)
- [Why Is My RAM Running at 2133MHz?](/support/kb/why-is-my-ram-running-at-2133mhz/)
