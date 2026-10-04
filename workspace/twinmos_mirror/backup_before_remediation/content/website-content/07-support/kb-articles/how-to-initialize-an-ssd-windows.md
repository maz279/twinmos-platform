---
title: "How to Initialize an SSD in Windows"
slug: "how-to-initialize-an-ssd-windows"
url: "/support/kb/how-to-initialize-an-ssd-windows/"
template: "page"
description: "Learn how to initialize and format a new TwinMOS SSD in Windows using Disk Management."
keywords: ["initialize SSD", "format SSD", "Disk Management", "new drive setup"]
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
    analytics_id: "cta_how-to-initializ_contact"
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
  page_view: "support_kb_how-to-initialize-an-ssd-windows"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Initialize an SSD in Windows

A brand-new SSD will not appear in File Explorer until it is initialized and formatted. This guide shows you how to prepare your TwinMOS SSD for use in Windows.

## Before You Begin

### Prerequisites
- TwinMOS SSD installed and detected by BIOS
- Windows 10 or Windows 11
- Administrator privileges

## Step-by-Step Instructions

### Step 1: Open Disk Management
Press `Win + X` and select **Disk Management**. Alternatively, press `Win + R`, type `diskmgmt.msc`, and press Enter.

### Step 2: Locate the New SSD
Find the new drive listed as "Unknown" and "Not Initialized." It will typically be labeled "Disk 1" or higher. Be careful not to select your existing Windows drive.

### Step 3: Initialize the Disk
Right-click on the disk and select **Initialize Disk**.

### Step 4: Choose Partition Style
Select the partition style:
- **GPT (GUID Partition Table):** Recommended for modern systems and drives larger than 2TB.
- **MBR (Master Boot Record):** Use only for older systems or compatibility needs.

Click **OK**.

### Step 5: Create a New Simple Volume
Right-click on the unallocated space and select **New Simple Volume**.

### Step 6: Follow the Wizard
- **Volume Size:** Accept the default to use the entire drive, or specify a custom size.
- **Drive Letter:** Assign an available drive letter.
- **File System:** Select **NTFS** for Windows-only use, or **exFAT** for cross-platform compatibility.
- **Volume Label:** Enter a name (e.g., "TwinMOS SSD").
- Check **Perform a quick format**.

### Step 7: Complete the Format
Click **Finish**. The drive will be formatted and should appear in File Explorer within a few moments.

## Troubleshooting

**SSD not showing in Disk Management:**
- Verify the drive is detected in BIOS.
- Reseat the drive or try a different port/cable.
- Update motherboard chipset drivers.

**Initialization fails:**
- Ensure you are running Disk Management as an administrator.
- Try using the `diskpart` command-line tool for advanced initialization.

## Related Articles
- [How to Install an M.2 NVMe SSD](/support/kb/how-to-install-m2-nvme-ssd/)
- [How to Format a Portable SSD](/support/kb/how-to-format-portable-ssd/)
