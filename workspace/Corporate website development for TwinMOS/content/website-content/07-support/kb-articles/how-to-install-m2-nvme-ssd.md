---
title: "How to Install an M.2 NVMe SSD"
slug: "how-to-install-m2-nvme-ssd"
url: "/support/kb/how-to-install-m2-nvme-ssd/"
template: "page"
description: "Step-by-step guide to installing a TwinMOS M.2 NVMe SSD, including CoreX Pro Gen5, Xtreme Gen4, and Alpha Pro Gen3."
keywords: ["M.2 SSD installation", "NVMe install", "install SSD", "M.2 slot"]
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
    analytics_id: "cta_how-to-install-m2_contact"
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
  page_view: "support_kb_how-to-install-m2-nvme-ssd"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Install an M.2 NVMe SSD

Installing an M.2 NVMe SSD is a straightforward upgrade that can dramatically improve system boot times, application loading, and file transfer speeds. This guide covers the installation of TwinMOS NVMe SSDs such as the CoreX Pro Gen5, Xtreme Gen4, and Alpha Pro Gen3.

## Before You Begin

### Prerequisites
- Compatible motherboard with an M.2 slot supporting NVMe
- TwinMOS M.2 NVMe SSD
- Phillips-head screwdriver (often a smaller precision driver)
- Motherboard M.2 standoff and screw (usually included with the motherboard)
- M.2 heatsink (optional but recommended for Gen4/Gen5 drives)

### Safety Notes
- Power off the PC and disconnect the power cable.
- Ground yourself using an anti-static wrist strap or by touching an unpainted metal surface.
- Handle the SSD by its edges. Avoid touching the gold connectors or controller chips.

## Step-by-Step Installation

### Step 1: Open the Case
Remove the side panel of your PC case to access the motherboard.

### Step 2: Locate the M.2 Slot
Find the M.2 slot on your motherboard. It is a narrow slot roughly 22mm wide, usually labeled "M.2" with the supported PCIe generation (e.g., M.2_1, M.2_2). Consult your motherboard manual to identify the fastest slot, as some boards have multiple slots with different bandwidth.

### Step 3: Prepare the Standoff
Most motherboards have a pre-installed standoff at the 2280 position (80mm length), which fits standard consumer SSDs. If your SSD is a different length (e.g., 2242, 2260), move the standoff to the corresponding hole.

### Step 4: Insert the SSD
Hold the SSD at a 30-degree angle and gently insert the M.2 connector into the slot. The gold contacts should slide in smoothly. Do not force the connection.

### Step 5: Secure the SSD
Press the opposite end of the SSD down until it is parallel with the motherboard. Secure it with the M.2 screw. Do not overtighten.

### Step 6: Install a Heatsink (Optional)
If your motherboard includes an M.2 heatsink or you have an aftermarket one, remove the protective film from the thermal pad, place it over the SSD, and secure the heatsink according to the manufacturer's instructions.

### Step 7: Close the Case and Power On
Replace the side panel, reconnect power, and boot the system.

### Step 8: Initialize the Drive
In Windows, open Disk Management, locate the new SSD, initialize it (GPT is recommended for modern systems), and create a new simple volume.

## Troubleshooting

**SSD not detected in BIOS:**
- Reseat the SSD.
- Ensure the M.2 slot supports NVMe (some slots are SATA-only).
- Check BIOS settings to confirm the M.2 slot is enabled.
- Update motherboard BIOS if necessary.

**SSD detected but not in Windows:**
- The drive likely needs to be initialized in Disk Management.

## M.2 Form Factor Reference

| Form Factor | Dimensions | Common Use |
|---|---|---|
| 2230 | 22mm x 30mm | Compact devices, tablets |
| 2242 | 22mm x 42mm | Laptops, small form factor PCs |
| 2260 | 22mm x 60mm | Niche applications |
| 2280 | 22mm x 80mm | Standard desktop and laptop |
| 22110 | 22mm x 110mm | Enterprise/workstation |

TwinMOS consumer NVMe SSDs use the 2280 form factor.

## PCIe Generation Compatibility

| SSD Generation | Required Slot | Backward Compatible? |
|---|---|---|
| CoreX Pro Gen5 (PCIe 5.0) | PCIe 5.0 M.2 slot | Yes, runs at lower speed |
| Xtreme Gen4 (PCIe 4.0) | PCIe 4.0 or 5.0 M.2 slot | Yes, runs at Gen3 speed in Gen3 slot |
| Alpha Pro Gen3 (PCIe 3.0) | PCIe 3.0 or higher M.2 slot | — |

## Related Articles
- [How to Initialize an SSD in Windows](/support/kb/how-to-initialize-an-ssd-windows/)
- [How to Clone Windows to a New SSD](/support/kb/how-to-clone-windows-to-new-ssd/)
- [How to Update SSD Firmware Safely](/support/kb/how-to-update-ssd-firmware-safely/)
- [SSD Not Recognized](/support/kb/what-to-do-if-ssd-is-not-recognized/)
