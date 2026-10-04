# TwinMOS Website — Live Chat Agent Guide

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-036 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS Customer Support / Operations |
| **Audience** | Live Chat Agents, Support Supervisors, Training Team |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §7.1), TWN-URD-2025-002 (URD §5.1), TWN-OPS-2026-029 (Customer Support Playbook), TWN-OPS-2026-030 (RMA Operations Guide) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This guide provides live chat agents with the procedures, standards, and tools needed to deliver exceptional customer support through the TwinMOS website's live chat system (Chatwoot). It covers:

- Chat system setup and navigation
- Conversation handling workflows
- Response standards and tone guidelines
- Common inquiry types and resolution paths
- Escalation procedures
- Quality assurance and performance metrics

**Scope:** All live chat interactions on the TwinMOS corporate website across supported languages and time zones.

---

## 2. System Overview

### 2.1 Chatwoot Configuration

| Setting | Value | Notes |
|:---|:---|:---|
| Platform | Chatwoot v3.x (self-hosted) | Integrated with Strapi and website |
| Widget placement | Bottom-right on all pages | Except checkout (Phase 3) |
| Operating hours | 09:00–18:00 GMT+6 (Dhaka) | Phase 1; 24/7 planned Phase 3 |
| Supported languages | English, Bengali, Mandarin, Arabic | Auto-detect by browser locale |
| Auto-response | Enabled | "Agent will be with you shortly" |
| Chat history | 12 months retention | For quality and training |

### 2.2 Agent Dashboard

| Section | Purpose |
|:---|:---|
| Inbox | Active conversations assigned to agent |
| Unassigned | New conversations awaiting assignment |
| Resolved | Closed conversations (searchable) |
| Contacts | Customer profiles and history |
| Reports | Personal and team performance metrics |
| Settings | Agent profile, notifications, shortcuts |

---

## 3. Pre-Shift Preparation

### 3.1 Daily Checklist

- [ ] Log into Chatwoot admin panel
- [ ] Set status to "Online"
- [ ] Check for any system alerts or maintenance notices
- [ ] Review queued conversations from previous shift
- [ ] Check product updates / announcements (new launches, known issues)
- [ ] Verify access to knowledge base and reference materials
- [ ] Test chat widget functionality

### 3.2 Status Management

| Status | Meaning | When to Use |
|:---|:---|:---|
| **Online** | Available for new chats | Standard working state |
| **Busy** | Handling chat, temporarily unavailable | When at max concurrent chats |
| **Away** | Not at desk | Breaks, meetings |
| **Offline** | End of shift | Logout |

---

## 4. Conversation Handling

### 4.1 Chat Lifecycle

| Phase | Actions | Target Time |
|:---|:---|:---|
| **1. Greeting** | Welcome customer, introduce yourself | Within 30 seconds of chat start |
| **2. Understanding** | Identify issue, ask clarifying questions | 1–2 minutes |
| **3. Resolution** | Provide solution, guide customer | Varies by issue |
| **4. Confirmation** | Verify issue resolved, customer satisfied | Before closing |
| **5. Closing** | Thank customer, close professionally | Final 30 seconds |

### 4.2 Greeting Templates

**Standard Greeting:**
> "Hello! Welcome to TwinMOS Support. I'm [Name]. How can I help you today?"

**Returning Customer:**
> "Welcome back, [Name]! I'm [Name]. I see you contacted us about [previous issue]. How can I help today?"

**After-Hours (if applicable):**
> "Hello! You've reached TwinMOS Support. Our live agents are currently offline. Please leave your message and we'll respond during business hours. Or check our Help Center at [URL]."

### 4.3 Response Time Standards

| Metric | Target | Maximum |
|:---|:---|:---|
| First response | < 30 seconds | 60 seconds |
| Between responses | < 2 minutes | 5 minutes |
| Total resolution | < 10 minutes (simple) | 20 minutes |
| Escalation handoff | < 3 minutes | 5 minutes |

### 4.4 Concurrent Chat Limit

| Agent Experience | Max Concurrent Chats |
|:---|:---|
| New agent (0–3 months) | 2 |
| Experienced agent (3–12 months) | 3 |
| Senior agent (12+ months) | 4 |
| Supervisor / peak times | 5 (exceptional) |

---

## 5. Tone and Language Guidelines

### 5.1 Voice and Tone

| Principle | Application |
|:---|:---|
| **Professional** | Use proper grammar, avoid slang, maintain courtesy |
| **Friendly** | Warm greetings, express empathy, use customer's name |
| **Efficient** | Get to the point, avoid unnecessary pleasantries |
| **Helpful** | Proactive suggestions, anticipate next questions |
| **Confident** | Clear answers, avoid "I think" or "maybe" |

### 5.2 Do's and Don'ts

| Do | Don't |
|:---|:---|
| Use customer's name when known | Use generic "Dear customer" repeatedly |
| Acknowledge frustration | Dismiss or minimize concerns |
| Provide step-by-step instructions | Assume customer knowledge level |
| Confirm understanding | Rush to close without verification |
| Use positive language | Use negative phrases ("can't," "won't") |
| Offer alternatives | Leave customer without options |
| Summarize actions taken | End chat abruptly |

### 5.3 Positive Language Examples

| Instead of... | Say... |
|:---|:---|
| "I can't do that" | "What I can do is..." |
| "That's not my department" | "Let me connect you with the right team" |
| "You'll have to wait" | "I'll have an update for you within [timeframe]" |
| "I don't know" | "Let me find that out for you" |
| "That's wrong" | "I see the issue — here's the correct information" |

---

## 6. Common Inquiry Types

### 6.1 Product Information

**Typical Questions:**
- Specifications and compatibility
- Pricing and availability
- Product comparisons
- Where to buy

**Resolution:**
- Reference product catalog in Strapi
- Share relevant product page links
- Use QVL data for compatibility questions
- Direct to authorized retailer list

### 6.2 Technical Support

**Typical Questions:**
- Installation guidance
- Troubleshooting (not detected, performance issues)
- BIOS/UEFI settings
- Driver or firmware updates

**Resolution:**
- Guide through basic troubleshooting steps
- Share knowledge base articles
- Escalate to technical team if advanced diagnosis needed
- Create ticket for follow-up if not resolvable in chat

### 6.3 Warranty & RMA

**Typical Questions:**
- Warranty status check
- How to start RMA
- RMA status inquiry
- Warranty registration help

**Resolution:**
- Look up warranty in Strapi
- Guide to warranty registration form
- Create RMA ticket or escalate to RMA team
- Provide RMA status updates

### 6.4 Order & Shipping (Phase 3)

**Typical Questions:**
- Order status
- Shipping tracking
- Delivery issues
- Order modifications

**Resolution:**
- Look up order in Medusa.js admin
- Provide tracking information
- Escalate to fulfillment team for complex issues

### 6.5 Counterfeit Reporting

**Typical Questions:**
- How to verify authenticity
- Suspected counterfeit product
- Where to buy genuine products

**Resolution:**
- Guide to serial verification tool
- Escalate to Brand Protection if counterfeit suspected
- Provide authorized retailer information
- Create counterfeit incident if appropriate

### 6.6 Partner Inquiries

**Typical Questions:**
- How to become a partner
- Partner portal access issues
- Deal registration questions

**Resolution:**
- Direct to partner application form
- Escalate to Partner Management team
- Reset portal credentials if needed

---

## 7. Escalation Procedures

### 7.1 When to Escalate

Escalate immediately when:
- Customer requests supervisor
- Legal or compliance issue mentioned
- Safety concern (product overheating, electrical hazard)
- Data breach or security concern
- Threats or abusive language (after warning)
- Technical issue beyond agent capability
- RMA value > $500 or complex case
- Counterfeit confirmed or strongly suspected
- Language barrier (unsupported language)

### 7.2 Escalation Path

| Level | Contact | Response Time |
|:---|:---|:---|
| **Tier 1** | Support Supervisor | Immediate (chat transfer) |
| **Tier 2** | Department Lead (RMA, Technical, Partner) | 5 minutes |
| **Tier 3** | Operations Manager | 15 minutes |
| **Emergency** | On-call manager + legal | Immediate |

### 7.3 Escalation Handoff

1. Inform customer: "I'm going to connect you with [Name/Title] who can better assist with this."
2. Add internal note summarizing issue and actions taken
3. Transfer chat or create ticket with full context
4. Set appropriate priority label
5. If supervisor unavailable, create ticket and provide ticket number to customer

---

## 8. Tools and Resources

### 8.1 Chatwoot Features

| Feature | Use |
|:---|:---|
| Canned Responses | Quick replies for common questions |
| Labels | Categorize chats (Product, RMA, Technical, etc.) |
| Private Notes | Internal notes visible to team only |
| File Sharing | Send/receive images, documents |
| Conversation Assignment | Route to appropriate agent or team |
| Contact Merge | Link multiple chats from same customer |

### 8.2 Agent Shortcuts

| Shortcut | Action |
|:---|:---|
| `/greet` | Insert standard greeting |
| `/close` | Insert closing message |
| `/rma` | Insert RMA process explanation |
| `/warranty` | Insert warranty check link |
| `/verify` | Insert product verification link |
| `/escalate` | Insert escalation message |

---

## 9. Quality Assurance

### 9.1 Monitoring

| Method | Frequency | Owner |
|:---|:---|:---|
| Real-time supervision | Continuous | Supervisor |
| Chat review (random sample) | 5% weekly | QA Team |
| Customer satisfaction (CSAT) | Every chat | System |
| Response time monitoring | Real-time | System |

### 9.2 QA Scorecard

| Category | Weight | Criteria |
|:---|:---|:---|
| Greeting | 10% | Timely, professional, personalized |
| Understanding | 20% | Accurate issue identification |
| Resolution | 30% | Correct, complete solution |
| Communication | 20% | Clear, positive, appropriate tone |
| Closing | 10% | Confirmed resolution, professional |
| Documentation | 10% | Proper labels, notes, follow-up |

### 9.3 Performance Metrics

| Metric | Target |
|:---|:---|
| Average response time | < 60 seconds |
| First contact resolution rate | > 70% |
| Customer satisfaction (CSAT) | > 4.3 / 5.0 |
| Average handle time | < 12 minutes |
| Escalation rate | < 15% |
| Concurrent chat efficiency | > 85% |

---

## 10. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| Customer Support Lead | | | |
| Training Manager | | | |
| Operations Manager | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteLiveChatAgent_Guide.md`
