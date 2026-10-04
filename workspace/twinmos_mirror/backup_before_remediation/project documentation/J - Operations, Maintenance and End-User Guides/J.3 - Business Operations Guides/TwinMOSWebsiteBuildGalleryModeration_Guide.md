# TwinMOS Website — Build Gallery Moderation Guide

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-035 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS Community Management / Marketing |
| **Audience** | Community Moderators, Marketing Team, Content Reviewers, Customer Support |
| **Classification** | Internal Use |
| **Related Documents** | TWN-BRD-2025-001 (BRD §6.3), TWN-URD-2025-002 (URD §4.7) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This guide defines the operational procedures for moderating user-submitted content in the TwinMOS Build Gallery — a community showcase where customers share their PC builds featuring TwinMOS products. It covers:

- Content submission and review workflows
- Moderation criteria and standards
- Approval, rejection, and escalation procedures
- Community engagement and response
- Content management and curation
- Reporting and analytics

**Scope:** All user-generated content (UGC) submitted to the Build Gallery, including images, build descriptions, component lists, and comments.

---

## 2. Build Gallery Overview

### 2.1 Platform Features

| Feature | Description |
|:---|:---|
| Build Submission | Users upload photos and describe their build |
| Component Tagging | Tag TwinMOS products used in the build |
| Public Gallery | Approved builds displayed publicly |
| Voting / Likes | Community engagement metric |
| Comments | Community discussion on builds |
| Featured Builds | Curated highlights on homepage or product pages |
| User Profiles | Build history and reputation |

### 2.2 Content Types

| Type | Description | Moderation Level |
|:---|:---|:---|
| Build submission (new) | Full build post with images and description | Full review required |
| Build edit | User updates existing build | Spot-check review |
| Comment | Text comment on a build | Automated + sampled review |
| Profile update | User profile changes | Automated filter only |
| Reported content | Community-flagged item | Priority review |

---

## 3. Moderation Criteria

### 3.1 Approval Criteria

Build submissions must meet ALL of the following to be approved:

| Criterion | Standard |
|:---|:---|
| **Relevance** | Build must include at least one TwinMOS product (clearly visible or tagged) |
| **Image quality** | Photos must be clear, in focus, and adequately lit |
| **Appropriate content** | No nudity, violence, hate speech, or illegal content |
| **Accuracy** | Component list must be accurate and not misleading |
| **Original work** | Must be user's own build; not stolen or reposted |
| **Completeness** | Minimum 2 images, build description (50+ characters), component list |
| **Language** | Description in supported language or with sufficient context |

### 3.2 Automatic Rejection Criteria

Submissions with any of the following are automatically rejected:

- No TwinMOS product visible or tagged
- Offensive, obscene, or illegal content
- Spam, advertisements, or promotional content (non-TwinMOS)
- Copyright-infringed images
- Personal information exposed (addresses, phone numbers)
- Malicious links or code

### 3.3 Manual Review Triggers

Submissions flagged for moderator review:

- Low image quality (blurry, dark, unclear)
- Potential but unclear TwinMOS product presence
- Borderline appropriate content
- Duplicate or very similar to existing submission
- User with previous rejections
- Reported by community member
- Contains external links
- Unusual voting patterns (suspected manipulation)

---

## 4. Moderation Workflow

### 4.1 Submission Flow

```
User submits build → Automated pre-check → Queue for review →
Moderator review → Decision: Approve / Reject / Request Changes →
Notification to user → If approved: Published to gallery
```

### 4.2 Automated Pre-Check

| Check | Tool / Method | Action on Fail |
|:---|:---|:---|
| Image file type | File extension validation | Reject |
| Image dimensions | Min 800x600 pixels | Flag for review |
| File size | Max 10MB per image | Reject |
| Number of images | Min 2, max 10 | Reject if outside range |
| Text length | Description min 50 chars | Flag for review |
| Profanity filter | Keyword list | Reject or flag |
| Duplicate image detection | Perceptual hash | Flag for review |
| Spam patterns | Heuristic detection | Reject |

### 4.3 Moderator Review Process

**Step 1: Queue Assignment**
- Submissions assigned to moderators in round-robin fashion
- Priority queue: Reported content, featured build candidates
- Standard queue: New submissions (FIFO)

**Step 2: Review Checklist**

Moderator reviews each submission against:

- [ ] TwinMOS product clearly visible or correctly tagged
- [ ] Images are appropriate and high enough quality
- [ ] Description is coherent and relevant
- [ ] Component list appears accurate
- [ ] No personal information exposed
- [ ] No promotional content for competing brands
- [ ] Not a duplicate of existing submission
- [ ] User account in good standing

**Step 3: Decision**

| Decision | Criteria | User Notification |
|:---|:---|:---|
| **Approve** | Meets all criteria | "Your build has been published!" with gallery link |
| **Approve with edits** | Minor issues fixed by moderator | "Published with minor edits" + summary |
| **Request changes** | Fixable issues (better photos, more description) | Specific feedback + resubmit instructions |
| **Reject** | Fails criteria, not fixable | Clear reason + community guidelines link |
| **Escalate** | Uncertain, potential policy issue | Hold notification, under review |

### 4.4 Response Times

| Queue Type | Target Review Time | Maximum |
|:---|:---|:---|
| Reported content | 4 hours | 24 hours |
| Featured build candidate | 24 hours | 48 hours |
| Standard new submission | 48 hours | 72 hours |
| Build edit | 72 hours | 5 days |
| Comment (sampled) | Weekly batch | Weekly |

---

## 5. Community Engagement

### 5.1 Responding to Comments

Moderators should:
- Monitor comments on featured builds daily
- Remove off-topic, offensive, or spam comments
- Respond to questions about TwinMOS products when accurate
- Encourage positive community interaction
- Pin helpful comments when appropriate

### 5.2 Featured Build Curation

| Curation Criteria | Weight |
|:---|:---|
| Image quality and aesthetics | High |
| Creative or unique build | High |
| Popular community response (likes, comments) | Medium |
| Showcases new or flagship TwinMOS product | Medium |
| Build complexity / enthusiast appeal | Medium |
| Diversity (different product lines, regions) | Low |

**Featured Build Placement:**
- Homepage hero carousel (top 3 builds, rotated weekly)
- Product page "Community Builds" section
- Social media repost (with permission)
- Newsletter feature (monthly)

### 5.3 User Recognition

| Recognition | Criteria |
|:---|:---|
| "Build of the Month" | Highest community engagement + moderator selection |
| "Featured Builder" badge | 3+ approved builds, high average engagement |
| "Top Contributor" | Most builds approved in trailing 12 months |

---

## 6. Handling Reports and Violations

### 6.1 Report Types

| Report Reason | Action |
|:---|:---|
| Inappropriate content | Priority review by moderator |
| Not original work | Request proof of ownership, reverse image search |
| Incorrect information | Request correction or add moderator note |
| Spam / advertising | Review and likely reject/remove |
| Copyright violation | Remove immediately, notify user |
| Personal information | Remove immediately, notify user |

### 6.2 Violation Tiers

| Tier | Behavior | Consequence |
|:---|:---|:---|
| **1 — Warning** | Minor guideline violation (low-quality images, incomplete description) | Feedback + guidance; submission returned |
| **2 — Restricted** | Repeated minor violations or single moderate violation (misleading info, borderline content) | 30-day submission restriction; warning logged |
| **3 — Suspended** | Serious violation (spam, stolen content, offensive material) | Account suspended from gallery; review required |
| **4 — Banned** | Severe or repeated serious violations, illegal content | Permanent ban; content removed |

### 6.3 Appeal Process

1. User submits appeal via support ticket or designated form
2. Senior moderator or community manager reviews case
3. Decision communicated within 5 business days
4. Final decision; no further appeal

---

## 7. Content Management

### 7.1 Strapi Content Types

| Collection | Purpose |
|:---|:---|
| `build-submission` | User build posts |
| `build-image` | Individual images with metadata |
| `build-comment` | Comments on builds |
| `user-profile` | Extended user profile for gallery |
| `moderation-log` | Audit trail of all moderation actions |

### 7.2 Bulk Operations

| Operation | Use Case | Tool |
|:---|:---|:---|
| Bulk approve | Pre-screened submissions from trusted users | Strapi bulk action |
| Bulk reject | Spam wave or policy violation pattern | Strapi bulk action + filter |
| Bulk feature/unfeature | Seasonal curation changes | Strapi bulk action |
| Export submissions | Reporting or backup | Strapi export |

---

## 8. Performance Metrics

| Metric | Target | Measurement |
|:---|:---|:---|
| Review queue depth | < 50 pending | Real-time |
| Average review time | < 48 hours | From submission to decision |
| Approval rate | 70–85% | Approved / Total reviewed |
| User appeal rate | < 5% | Appeals / Total rejections |
| Community reports | < 2% of submissions | Reported / Total published |
| Featured build engagement | > 2x average | Likes + comments vs. gallery average |
| Moderator consistency score | > 90% agreement | Inter-moderator agreement sampling |

---

## 9. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| Community Manager | | | |
| Marketing Lead | | | |
| Legal / Compliance | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteBuildGalleryModeration_Guide.md`
