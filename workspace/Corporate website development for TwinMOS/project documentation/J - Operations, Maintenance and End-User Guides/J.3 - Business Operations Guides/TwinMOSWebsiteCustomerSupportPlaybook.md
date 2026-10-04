# TwinMOS Website — Customer Support Playbook

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-041 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS Customer Support / Operations |
| **Audience** | All Customer Support Agents, Team Leads, Supervisors, Trainers |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §7), TWN-URD-2025-002 (URD §5), TWN-OPS-2026-030 (RMA Operations Guide), TWN-OPS-2026-036 (Live Chat Agent Guide) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This playbook serves as the comprehensive reference for all customer-facing support activities on the TwinMOS website. It provides:

- Standardized responses and procedures
- Decision trees for common scenarios
- Escalation paths and criteria
- Tool and system references
- Quality standards and expectations

**Scope:** All customer support interactions across live chat, email, phone, and social media channels.

---

## 2. Support Channels and Coverage

| Channel | Hours | Response Target | Primary Tool |
|:---|:---|:---|:---|
| Live Chat | 09:00–18:00 GMT+6 | < 60 seconds first response | Chatwoot |
| Email | Mon–Fri, 09:00–18:00 | < 24 hours | Chatwoot shared inbox |
| Phone | 09:00–18:00 GMT+6 | Immediate | PBX + CRM |
| Social Media | Mon–Fri, 09:00–18:00 | < 4 hours | Social management tool |
| Self-Service | 24/7 | N/A | Knowledge base / FAQ |

---

## 3. Support Tiers

### 3.1 Tier 1 — Frontline Support

**Handles:** General inquiries, account issues, basic troubleshooting, order status, warranty checks, RMA initiation

**Skills Required:**
- Product knowledge (basic)
- System navigation (Chatwoot, Strapi, Medusa)
- Communication and empathy
- Decision-making within policy

**Escalation Triggers:**
- Technical issue beyond basic troubleshooting
- RMA value > $500
- Legal or compliance matter
- Angry or escalated customer
- System bug or error
- Counterfeit concern

### 3.2 Tier 2 — Technical & Specialized

**Handles:** Complex technical issues, advanced troubleshooting, product compatibility, partner inquiries, fraud review

**Skills Required:**
- Deep product and technical knowledge
- Advanced system access
- Cross-functional coordination

**Escalation Triggers:**
- Engineering bug requiring development
- Legal action threatened
- Media or PR risk
- Executive escalation

### 3.3 Tier 3 — Management & Escalation

**Handles:** Executive complaints, legal matters, policy exceptions, serious service failures, vendor escalations

---

## 4. Decision Trees

### 4.1 Initial Contact Routing

```
Customer contacts support
    |
    ├── Product question? → Product knowledge base / catalog lookup
    ├── Technical issue? → Technical troubleshooting flow
    ├── Order question? → Order management system
    ├── Warranty/RMA? → Warranty validation → RMA flow
    ├── Counterfeit concern? → Anti-counterfeit flow
    ├── Partner inquiry? → Partner management queue
    ├── Complaint? → Acknowledge → Investigate → Resolve
    └── General inquiry? → Direct assistance
```

### 4.2 Technical Troubleshooting Flow

```
Customer reports technical issue
    |
    ├── Memory not detected?
    |   ├── Reseat module → Test → Resolved?
    |   ├── Try different slot → Test → Resolved?
    |   ├── Check BIOS settings → Test → Resolved?
    |   └── Still not working? → Escalate to Tier 2
    |
    ├── SSD not recognized?
    |   ├── Check connections → Test → Resolved?
    |   ├── Try different cable/port → Test → Resolved?
    |   ├── Check Disk Management (Windows) → Test → Resolved?
    |   └── Still not working? → Escalate to Tier 2
    |
    ├── Performance slower than expected?
    |   ├── Verify specs match system capability → Check
    |   ├── Check BIOS XMP/DOCP profile enabled → Test → Resolved?
    |   ├── Run benchmark vs. spec → Compare
    |   └── Significant discrepancy? → Escalate to Tier 2
    |
    └── Other issue? → Gather details → Escalate to Tier 2
```

### 4.3 Complaint Handling Flow

```
Customer expresses dissatisfaction
    |
    ├── Acknowledge and apologize sincerely
    ├── Listen fully without interrupting
    ├── Express empathy and understanding
    ├── Clarify the specific issue
    ├── Offer solution within policy
    |   ├── If acceptable → Implement → Follow up
    |   └── If not acceptable → Explore alternatives → Escalate if needed
    └── Document thoroughly
```

---

## 5. Standard Responses

### 5.1 Acknowledgments

**Email Acknowledgment:**
> "Thank you for contacting TwinMOS Support. We have received your inquiry and are working on a response. You can expect to hear from us within [timeframe]. Your ticket number is [#]."

**Chat Acknowledgment:**
> "I understand you're experiencing [issue]. Let me look into this for you right away."

### 5.2 Hold Messages

**Researching:**
> "I'm checking that for you now — just a moment please."

**Escalating:**
> "I want to make sure you get the best help possible. I'm going to connect you with [Name/Team] who specializes in this. They'll be with you shortly."

### 5.3 Closing Messages

**Resolved:**
> "I'm glad we could resolve this for you, [Name]. Is there anything else I can help with today?"

**Ticket Created:**
> "I've created ticket [#] for you and our team will follow up within [timeframe]. You'll receive updates at [email]. Is there anything else?"

### 5.4 Difficult Situations

**Angry Customer:**
> "I completely understand your frustration, and I'm sorry this has been your experience. Let me see what I can do to make this right."

**Policy Limitation:**
> "I wish I could do more in this situation. What I am able to offer is [alternative]. I understand this may not be the answer you were hoping for."

**Unknown Answer:**
> "That's a great question, and I want to make sure I give you accurate information. Let me verify this with our team and get back to you within [timeframe]."

---

## 6. Knowledge Base Quick Reference

### 6.1 Key URLs

| Resource | URL | Purpose |
|:---|:---|:---|
| Knowledge Base | `/support/kb` | Self-service articles |
| Warranty Registration | `/support/warranty-registration` | Product registration |
| RMA Portal | `/support/rma` | Return initiation |
| Product Verification | `/support/verify-product` | Authenticity check |
| Partner Portal | `/partners/portal` | Partner access |
| Order Tracking | `/account/orders` | Customer order lookup |
| Contact Form | `/contact` | General inquiries |

### 6.2 Internal Tools

| Tool | Access | Purpose |
|:---|:---|:---|
| Chatwoot | All agents | Chat, email, ticket management |
| Strapi Admin | Agent+ | Content, warranty, product lookup |
| Medusa Admin | Agent+ | Order, customer, inventory lookup |
| Plausible | Supervisor+ | Analytics and traffic |
| Internal Wiki | All agents | Procedures, updates, announcements |

---

## 7. Quality Standards

### 7.1 Interaction Standards

| Standard | Expectation |
|:---|:---|
| Greeting | Within target response time, personalized |
| Understanding | Accurate issue identification, no assumptions |
| Resolution | Correct, complete, within policy |
| Communication | Clear, professional, empathetic |
| Documentation | Accurate labels, notes, ticket updates |
| Follow-up | Proactive updates if resolution delayed |

### 7.2 Prohibited Actions

- Never share customer data with unauthorized parties
- Never promise outcomes outside of policy without approval
- Never ignore or dismiss customer concerns
- Never use unprofessional language or tone
- Never close a ticket without customer confirmation (when possible)
- Never blame the customer for issues
- Never make guarantees about delivery dates

---

## 8. Escalation Matrix

| Scenario | Escalate To | Timeframe | Method |
|:---|:---|:---|:---|
| Customer requests supervisor | Supervisor | Immediate | Chat transfer / callback |
| Technical beyond capability | Tier 2 Technical | 5 minutes | Ticket assignment |
| RMA > $500 or complex | RMA Supervisor | 10 minutes | Ticket assignment |
| Legal threat | Legal + Operations Manager | Immediate | Phone + email |
| Safety concern | Operations Manager + Product Safety | Immediate | Phone |
| Counterfeit confirmed | Brand Protection Lead | Immediate | Ticket + phone |
| Media/PR risk | Marketing + Operations Manager | Immediate | Phone |
| System outage | IT On-call | Immediate | Incident channel |
| Data breach | Security + Legal + DPO | Immediate | Emergency protocol |

---

## 9. Performance Metrics

| Metric | Target | Frequency |
|:---|:---|:---|
| First Response Time | < 60 seconds (chat), < 24 hours (email) | Daily |
| First Contact Resolution | > 70% | Weekly |
| Customer Satisfaction (CSAT) | > 4.3 / 5.0 | Per interaction |
| Average Handle Time | < 12 minutes (chat) | Weekly |
| Ticket Backlog | < 10% of weekly volume | Daily |
| Escalation Rate | < 15% | Weekly |
| Quality Score | > 90% | Monthly (sampled) |

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
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteCustomerSupportPlaybook.md`
