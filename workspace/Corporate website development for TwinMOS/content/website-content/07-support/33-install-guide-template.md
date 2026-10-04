---
title: "Install Guide Template"
slug: "install-guide-template"
url: "/support/install-guides/template/"
template: "page"
description: "Template for creating new TwinMOS installation guides with video and text components."
keywords: ["install guide template", "video template", "tutorial template"]
persona: ["support-team"]
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
    analytics_id: "cta_33-insta_contact"
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
sources: ["CP"]
design_specs:
  layout: "template-page"
  components:
    - "template-structure-blocks"
    - "video-embed-placeholder"
    - "step-checklist"
    - "troubleshooting-accordion"
    - "production-checklist"
accessibility_notes:
  - "Template blocks must have clear heading hierarchy"
  - "Video embed must include transcript link"
  - "Checklists must be keyboard-navigable"
analytics_tracking:
  page_view: "support_install_guide_template"
  events:
    - name: "template_copy"
      trigger: "copy_button_click"
      category: "support"
---

# Install Guide Template

Use this template when creating new video + text installation guides for the TwinMOS Support Center.

## Frontmatter

```yaml
---
title: "How to [Action] — [Product]"
slug: "how-to-action-product"
url: "/support/install-guides/how-to-action-product/"
template: "page"
description: "Learn how to [action] for the [Product] with this step-by-step video and text guide."
keywords: ["install", "setup", "product name", "how to"]
persona: ["home-user", "gamer", "enterprise"]
phase: P1
priority: P0
owner: "support"
status: draft
last_reviewed: "YYYY-MM-DD"
locale: en
schema: "Article"
ctas:
  - label: "Contact Support"
    url: "/support/contact/"
    icon: "message-circle"
    analytics_id: "cta_33-insta_contact"
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
sources: ["CP"]
---
```

## Page Structure

### 1. Video Embed
Include the video player at the top of the page.

```
[Video Player Placeholder]
Title: How to [Action] — [Product]
Duration: [MM:SS]
```

### 2. Overview
Brief summary of what the guide covers and the expected outcome.

### 3. Tools & Materials Needed
- Tool or material 1
- Tool or material 2
- Required software or drivers

### 4. Written Steps
Provide a detailed text version of the video content for accessibility and reference.

1. **Step Title**
   Description of the step. Include any warnings or tips.

2. **Step Title**
   Description of the step.

### 5. Troubleshooting
Common problems encountered during this procedure and how to resolve them.

### 6. Next Steps
Link to related guides or actions the user should take after completing this one.

### 7. Feedback
Invite users to report errors or suggest improvements.

## Video Production Standards

### Pre-Production
- [ ] Script reviewed for technical accuracy by engineering team
- [ ] Shot list prepared with close-up requirements
- [ ] Test environment set up with proper lighting
- [ ] Required tools and products verified

### Production
- [ ] Clear, well-lit footage (minimum 1080p, preferred 4K)
- [ ] Close-ups of critical steps (slot insertion, screw tightening)
- [ ] On-screen text for important warnings and safety notes
- [ ] Consistent branding (intro/outro with TwinMOS logo)
- [ ] Audio narration or clear text overlays
- [ ] Multiple camera angles where helpful

### Post-Production
- [ ] Closed captions uploaded (required for accessibility)
- [ ] Chapter markers added for easy navigation
- [ ] Thumbnail created with clear title and branding
- [ ] Transcript generated and proofread
- [ ] SEO metadata added (title, description, tags)
- [ ] Reviewed by support team before publishing

## Template Usage Instructions

1. Copy this template for each new installation guide
2. Replace bracketed placeholders with actual content
3. Ensure all linked KB articles exist and are published
4. Submit for technical review before publishing
5. Update the revision history with each significant change
