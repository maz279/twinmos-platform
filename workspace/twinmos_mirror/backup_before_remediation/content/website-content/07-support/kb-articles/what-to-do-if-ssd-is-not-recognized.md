---
title: "What to Do If an SSD Is Not Recognized"
slug: "what-to-do-if-ssd-is-not-recognized"
url: "/support/kb/what-to-do-if-ssd-is-not-recognized/"
template: "page"
description: "Troubleshoot a TwinMOS SSD that is not detected in BIOS or Windows."
keywords: ["SSD not recognized", "SSD not detected", "drive missing", "troubleshoot SSD"]
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
    analytics_id: "cta_what-to-do-if-ssd_contact"
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
  page_view: "support_kb_what-to-do-if-ssd-is-not-recognized"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# What to Do If an SSD Is Not Recognized

If your TwinMOS SSD is not showing up in BIOS or Windows, follow this troubleshooting guide to identify and resolve the issue.

## Step 1: Check BIOS Detection

Restart your PC and enter the BIOS/UEFI. Navigate to the storage or boot section and check if the SSD is listed.

- **If detected in BIOS but not Windows:** The drive likely needs to be initialized and formatted. See [How to Initialize an SSD in Windows](/support/kb/how-to-initialize-an-ssd-windows/).
- **If not detected in BIOS:** Proceed to the hardware checks below.

## Step 2: Verify Physical Connections

### For M.2 NVMe SSDs:
- Power off and unplug the PC.
- Remove and reinsert the SSD, ensuring it is fully seated in the M.2 slot.
- Confirm the retaining screw is secure.
- Try a different M.2 slot if available.

### For 2.5-inch SATA SSDs:
- Ensure both the SATA data cable and SATA power cable are firmly connected.
- Try a different SATA port on the motherboard.
- Try a different SATA data cable.
- Test with a different SATA power connector from the PSU.

## Step 3: Check BIOS Settings

- Ensure the M.2 or SATA port is enabled in BIOS.
- For NVMe, confirm the slot supports NVMe (some M.2 slots are SATA-only).
- Disable CSM (Compatibility Support Module) if you are running a UEFI system, or ensure it is configured correctly.

## Step 4: Update BIOS and Drivers

An outdated BIOS may lack support for newer SSDs. Update to the latest BIOS version from your motherboard manufacturer's website. Also update chipset and storage controller drivers in Windows.

## Step 5: Test on Another System

If possible, install the SSD in another PC or use an external USB enclosure. If it is still not detected, the drive may be defective.

## Step 6: Contact Support

If the SSD is not detected on any system and all connections are secure, contact support@twinmos.com to initiate a warranty claim.

## Related Articles
- [How to Install an M.2 NVMe SSD](/support/kb/how-to-install-m2-nvme-ssd/)
- [How to Install a 2.5-inch SATA SSD](/support/kb/how-to-install-2.5-sata-ssd/)
- [How to Initialize an SSD in Windows](/support/kb/how-to-initialize-an-ssd-windows/)
