---
title: "Live Chat Widget Copy"
slug: "live-chat-widget"
url: "/support/live-chat/"
template: "page"
description: "Copy and configuration for the TwinMOS live chat support widget."
keywords: ["live chat", "chat support", "widget", "customer chat"]
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
    analytics_id: "cta_37-live-_contact"
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
  layout: "widget-copy-page"
  components:
    - "chat-widget-preview"
    - "message-bubble-examples"
    - "quick-reply-button-grid"
    - "offline-form-template"
    - "language-selector-dropdown"
accessibility_notes:
  - "Chat widget must be fully keyboard accessible"
  - "Message bubbles must have proper ARIA live regions"
  - "Quick reply buttons must have sufficient touch targets"
  - "Color contrast must meet WCAG AA for all text"
analytics_tracking:
  page_view: "support_live_chat_widget"
  events:
    - name: "chat_open"
      trigger: "widget_launch"
      category: "support"
    - name: "chat_category_select"
      trigger: "quick_reply_click"
      category: "support"
---

# Live Chat Widget Copy

This page contains the approved copy and behavior for the TwinMOS live chat widget.

## Widget Greeting

**Initial Greeting:**
> "Welcome to TwinMOS Support. How can we help you today?"

**After Hours Greeting:**
> "Welcome to TwinMOS Support. Our team is currently offline. Leave a message and we'll respond as soon as possible."

## Quick Reply Options

Present these options when the widget opens:

1. **Product Support** — Installation, troubleshooting, compatibility
2. **Warranty & RMA** — Claims, status, returns
3. **Order & Sales** — Availability, pricing, bulk orders
4. **Speak to an Agent** — Connect with a support representative

## Automated Responses

**Product Support Selected:**
> "Please tell us which product you need help with (e.g., VOLTX DDR5, CoreX Pro Gen5, ELITE Drive Pro) and describe the issue."

**Warranty & RMA Selected:**
> "To assist with your warranty or RMA inquiry, please provide your product serial number and a brief description of the issue."

**Order & Sales Selected:**
> "For sales inquiries, please provide your country, the product you're interested in, and the approximate quantity."

**Speak to an Agent Selected:**
> "Connecting you to the next available agent. Please wait..."

## Agent Handoff

When a human agent joins:
> "You are now chatting with [Agent Name]. How may I assist you today?"

## Closing Message

At the end of the conversation:
> "Thank you for contacting TwinMOS Support. If you need further assistance, feel free to reach out again. Have a great day!"

## Offline Form

When live chat is unavailable, display a simple contact form:
- Name *
- Email *
- Subject *
- Message *
- [Send Message]

Submitted messages are forwarded to support@twinmos.com.

## Chat Widget Behavior

### Opening Triggers
- User clicks the floating chat button
- User spends 60 seconds on a support page
- User attempts to leave the page (exit-intent on desktop)

### State Management
| State | Behavior |
|---|---|
| Online | Immediate connection to available agent |
| Busy | Queue position displayed, estimated wait time |
| Offline | Contact form replaces chat interface |
| After Hours | Offline greeting with email form |

### Agent Capabilities
- View current page context for faster assistance
- Access customer history (if previously identified)
- Create support tickets directly from chat
- Transfer to specialized agents (technical, warranty, sales)
- Share links to KB articles and guides

### Privacy & Data
- Chat transcripts are stored for 90 days
- Personal data is handled per the [Privacy Policy](/privacy/)
- Users can request transcript deletion
- No payment information is collected via chat

## Multilingual Support

The live chat widget supports the following languages based on regional availability:
- English (all regions)
- Arabic (MEA region)
- Additional languages coming soon

## Notes

- Response times depend on regional support team availability.
- For complex technical issues, agents may create a support ticket for follow-up.
- Chat transcripts are sent to the customer's email upon request.
