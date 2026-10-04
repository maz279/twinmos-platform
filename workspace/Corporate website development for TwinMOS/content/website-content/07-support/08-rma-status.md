---
title: "RMA Status Tracker"
slug: "rma-status"
url: "/support/rma/status/"
template: "page"
description: "Track the status of your TwinMOS RMA request using your ticket number or email address."
keywords: ["RMA status", "track RMA", "RMA tracker", "return status"]
persona: ["home-user", "gamer", "enterprise"]
phase: P1
priority: P0
owner: "support"
status: draft
last_reviewed: "2026-04-30"
locale: en
schema: "Article"
ctas:
  - label: "Submit New RMA"
    url: "/support/rma/submit/"
    icon: "file-plus"
    analytics_id: "cta_rma_status_submit"
  - label: "RMA Policy"
    url: "/support/rma-policy/"
    icon: "file-text"
    analytics_id: "cta_rma_status_policy"
cross_links:
  - url: "/support/contact/"
    title: "Contact Support"
    description: "Get help with your RMA questions."
  - url: "/support/sla/"
    title: "Support SLA"
    description: "Expected response and resolution times."
sources: ["CP"]
design_specs:
  layout: "lookup-page"
  status_tracker:
    style: "vertical-stepper"
    steps: ["Submitted", "Under Review", "Approved", "Awaiting Receipt", "Received", "In Inspection", "Approved for Replacement", "Shipped", "Closed"]
    show_dates: true
    show_estimates: true
  notification_preferences:
    style: "toggle-switches"
    options: ["Email", "SMS"]
accessibility_notes:
  - Status stepper must use aria-labels for current/completed/pending states
  - Status colors must be paired with text labels
  - Notification toggles must have proper aria-pressed states
analytics_tracking:
  page_view: "page_rma_status"
  search_success: "rma_status_search_success"
  search_failure: "rma_status_search_failure"
---

# RMA Status Tracker

Enter your RMA ticket number or the email address used during submission to check the current status of your return.

> **Don't have your ticket number?** Check your email inbox (and spam/junk folder) for the RMA confirmation email, or search by the email address used during submission.

## Lookup Form

```
[Tabbed Search Form Placeholder]

Tab 1: Search by Ticket Number
- RMA Ticket Number * (format: RMA-XXXX-XXXX)
- [Check Status Button]

Tab 2: Search by Email
- Email Address *
- [Check Status Button]
```

## Status Stage Tracker

```
[Vertical Stepper Component]
Stages with typical durations:
1. Submitted — Your request received (immediate)
2. Under Review — Evaluating documentation (1–2 business days)
3. Approved — Shipping instructions sent (immediate upon approval)
4. Awaiting Receipt — Waiting for your product (depends on shipping)
5. Received — Product arrived at service center (immediate)
6. In Inspection — Testing and validation (3–5 business days)
7. Approved for Replacement — Preparing your replacement (1–2 business days)
8. Shipped — Replacement dispatched (immediate)
9. Closed — Process complete (immediate)
```

| Status | Meaning | Typical Duration |
|---|---|---|
| **Submitted** | Your RMA request has been received and is awaiting review. | Immediate |
| **Under Review** | Our support team is evaluating your request and documentation. | 1–2 business days |
| **Approved** | Your RMA has been approved. Shipping instructions sent via email. | Immediate |
| **Awaiting Receipt** | We are waiting for the defective product to arrive at our service center. | Varies by shipping |
| **Received** | The product has been received and is awaiting inspection. | Immediate |
| **In Inspection** | The product is being tested and validated for the reported defect. | 3–5 business days |
| **Approved for Replacement** | The defect has been confirmed and a replacement is being prepared. | 1–2 business days |
| **Shipped** | Your replacement unit has been shipped. Tracking details sent via email. | Immediate |
| **Closed** | The RMA process is complete. | Immediate |
| **Rejected** | The RMA was denied. Reason and next steps provided via email. | Immediate |

## Sample Status Display

```
[Status Result Card Placeholder]
RMA Ticket: RMA-2026-123456
Product: VOLTX DDR5 32GB 6000MHz
Submitted: 2026-04-15
Current Status: In Inspection
Estimated Completion: 2026-04-25

Status History:
- 2026-04-15 09:30 — Submitted
- 2026-04-15 14:20 — Under Review
- 2026-04-16 10:00 — Approved
- 2026-04-20 08:45 — Awaiting Receipt
- 2026-04-22 11:30 — Received
- 2026-04-23 09:00 — In Inspection

[Notification Preferences]
- [x] Email notifications
- [ ] SMS notifications
```

## Notification Preferences

Stay updated on your RMA status without checking manually:

```
[Toggle Switches Placeholder]
- Email notifications: ON/OFF (default: ON)
- SMS notifications: ON/OFF (where available)
- Status change alerts: ON/OFF
- Shipping confirmation: ON/OFF
```

## Common Questions

**I don't have my ticket number.**
Check your email inbox (and spam/junk folder) for the RMA confirmation email. You can also search by the email address used during submission. If you still cannot find it, contact support@twinmos.com with your product serial number and approximate submission date.

**My status hasn't changed in several days.**
Shipping and inspection times vary by region and courier. Typical timeframes:
- Under Review: 1–2 business days
- In Inspection: 3–5 business days
If your status has not updated beyond the typical timeframe, contact support@twinmos.com with your ticket number.

**My status shows "Awaiting Receipt" but I already shipped.**
Tracking updates may take 24–48 hours to reflect in our system. If it has been more than 3 business days since delivery confirmation, contact support@twinmos.com with your tracking number.

**My RMA was rejected. What now?**
Review the rejection reason sent via email. Common reasons include:
- Out-of-warranty status
- Physical or liquid damage
- Insufficient documentation
- Counterfeit or unauthorized product
- Issue could not be reproduced during inspection

You may appeal the decision with additional documentation or explore [paid repair options](/support/out-of-warranty/).

## Contact Support

For issues with the status tracker or questions about your RMA:
- **Email:** support@twinmos.com (include your ticket number)
- **Phone:** +971-4-2996421 / +971-4-2996422
- **Have ready:** Ticket number, serial number, and a description of your concern
