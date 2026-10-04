---
title: "How to Find My Laptop RAM Spec"
slug: "how-to-find-my-laptop-ram-spec"
url: "/support/kb/how-to-find-my-laptop-ram-spec/"
template: "page"
description: "Determine the correct memory type, speed, and capacity for your laptop before purchasing a TwinMOS RAM upgrade."
keywords: ["laptop RAM spec", "notebook memory", "RAM upgrade", "compatible memory"]
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
    analytics_id: "cta_how-to-find-my-l_contact"
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
  page_view: "support_kb_how-to-find-my-laptop-ram-spec"
  events:
    - name: "kb_article_view"
      trigger: "page_load"
      category: "support"
sources: ["CP"]
---

# How to Find My Laptop RAM Spec

Before upgrading your laptop memory, you need to know what type of RAM it supports. Installing incompatible memory can prevent booting or cause instability. This guide shows you how to find your laptop's RAM specifications.

## Method 1: Check the Manufacturer's Website

The most reliable source is your laptop manufacturer's support page.

1. Find your laptop's exact model number (usually on a sticker on the bottom or under the battery).
2. Visit the manufacturer's support website.
3. Search for your model and locate the "Specifications" or "Memory" section.
4. Note the supported memory type (DDR4/DDR5), maximum capacity, and number of slots.

## Method 2: Use CPU-Z

CPU-Z is a free tool that reads your current memory configuration.

1. Download and install CPU-Z.
2. Open the **Memory** tab to see the type (DDR4/DDR5) and frequency.
3. Open the **SPD** tab to see details of installed modules, including maximum bandwidth and module size.
4. Open the **Mainboard** tab to see your chipset, which can help determine DDR4 vs. DDR5 support.

## Method 3: Use Windows System Information

1. Press `Win + R`, type `msinfo32`, and press Enter.
2. Look for **Installed Physical Memory (RAM)** to see total capacity.
3. This tool does not show memory type or speed, so use it alongside other methods.

## Method 4: Check the Service Manual

Most laptop manufacturers publish service manuals with detailed upgrade instructions and supported memory specs. Search for "[Your Model] service manual" on the manufacturer's website.

## What to Look For

| Specification | Why It Matters |
|---|---|
| **Memory Type** | DDR4 and DDR5 are not interchangeable. |
| **Form Factor** | Laptops use SODIMM modules, not desktop DIMMs. |
| **Speed** | Match or exceed the supported speed. Faster memory will downclock. |
| **Maximum Capacity** | Do not exceed the total supported RAM per the manufacturer. |
| **Number of Slots** | Determines whether you need one or two modules for dual-channel. |

## Example

A laptop spec sheet might state:
> "2 x SODIMM slots, DDR4-3200, up to 64GB"

This means you can install two DDR4 SODIMM modules up to 3200MHz, with a combined maximum of 64GB.

## Related Articles
- [DDR5 Laptop Installation](/support/kb/ddr5-installation-laptop/)
- [DDR4 Laptop Installation](/support/kb/ddr4-installation-laptop/)
