---
title: "How to Troubleshoot BSOD After RAM Upgrade"
slug: "how-to-troubleshoot-bsod-after-ram-upgrade"
url: "/support/kb/how-to-troubleshoot-bsod-after-ram-upgrade/"
template: "page"
description: "Experiencing blue screens after installing new TwinMOS memory? This guide helps you diagnose and fix BSOD issues."
keywords: ["BSOD", "blue screen", "RAM upgrade crash", "memory error", "troubleshoot BSOD"]
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
    analytics_id: "cta_how-to-troublesho_contact"
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
  page_view: "support_kb_how-to-troubleshoot-bsod-after-ram-upgrade"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Troubleshoot BSOD After RAM Upgrade

A Blue Screen of Death (BSOD) after installing new memory usually indicates instability caused by incorrect settings, incompatible profiles, or a faulty module. Follow this guide to diagnose and resolve the issue.

## Common BSOD Codes Related to Memory

- **MEMORY_MANAGEMENT** — Indicates memory corruption or bad sectors.
- **IRQL_NOT_LESS_OR_EQUAL** — Often caused by faulty RAM or driver conflicts.
- **PAGE_FAULT_IN_NONPAGED_AREA** — May indicate defective memory or bad virtual memory settings.
- **SYSTEM_SERVICE_EXCEPTION** — Can be triggered by unstable memory overclocking.

## Step-by-Step Troubleshooting

### Step 1: Check BIOS Settings
Enter BIOS and verify that the correct XMP (Intel) or EXPO (AMD) profile is selected. If the system is unstable, try disabling XMP/EXPO temporarily to run at JEDEC default speeds (4800MHz for DDR5). If the BSODs stop, the issue is likely profile compatibility.

### Step 2: Update BIOS
Motherboard BIOS updates frequently improve memory compatibility and stability. Download the latest BIOS from your motherboard manufacturer's website.

### Step 3: Test Each Module Individually
Remove all but one module and run the system. If stable, add modules one at a time to identify a potentially defective stick.

### Step 4: Run Memory Diagnostics
Use Windows Memory Diagnostic or MemTest86 to scan for memory errors. A single error is sufficient to indicate a faulty module.

- **Windows Memory Diagnostic:** Press `Win + R`, type `mdsched.exe`, and restart to test.
- **MemTest86:** Boot from a USB drive for a more thorough test.

### Step 5: Check for Driver Updates
Ensure all chipset, BIOS, and device drivers are up to date. Outdated drivers can cause BSODs that appear memory-related.

### Step 6: Adjust Voltage or Timings (Advanced)
If you are comfortable with manual tuning, slightly increasing DRAM voltage (within safe limits) or loosening timings may improve stability. This is done at your own risk.

## If the Issue Persists

If BSODs continue even at default speeds with a single module, the memory may be defective. Contact support@twinmos.com with your diagnostic results to start a warranty claim.

## Related Articles
- [How to Troubleshoot RAM Not Detected](/support/kb/how-to-troubleshoot-ram-not-detected/)
- [How to Troubleshoot PC Won't POST](/support/kb/how-to-troubleshoot-pc-wont-post/)
