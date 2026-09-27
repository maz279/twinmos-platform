# 04 — Admin Dashboard & CMS Control Panel (`apps/admin`)

React 19 SPA · TanStack Router (file routes, code-split per module) · TanStack Query (server state) · Tailwind 4 with TwinMOS tokens · one design language with the public site, dark chrome.

## Modules
| Module | Screens | Notes |
|---|---|---|
| **Dashboard** | KPI cards (submissions today/7d, open RMAs by state, published content, low-stock/featured SKUs), activity feed (audit tail), quick actions | `/` |
| **Content** | Articles, News, Events, Pages, FAQ | Markdown editor + frontmatter form; blocks builder for Pages; status chips; scheduled publishing |
| **Catalog** | Products (list/filter/import), Product editor (specs jsonb schema-driven form, gallery, datasheets, badges, variants), Brands, Categories (tree) | SKU lock after publish requires Admin |
| **Support** | Leads & quotes board (P6: type/status/priority/SLA filters, enforced 5-state workflow + spam, internal notes, CSV export, assignee emails), RMA board (7-state kanban with legal transitions + notes), KB (articles flagged cat=KB) | All transitions audited |
| **Channel** | Distributors (region/country/status), Marketplace listings (verify + quarterly re-verify queue) | Feeds where-to-buy locator |
| **Careers** | Job postings editor + applications inbox | Applications carry privacy metadata |
| **Media** | Library (upload, alt-text compliance column, usage refs), folders | Sharp-derived variants; B2/S3 driver |
| **Users & Roles** | User list, invite, role assign, MFA enforcement, sessions revoke | Better Auth admin plugin |
| **Audit Log** | Filterable read-only (actor, entity, action, date, requestId) | 12-month retention |
| **Settings** | Locales, Menus, Redirects, Feature flags, Integrations (Resend/Turnstile keys — secret write-only) | super_admin only |

## Publishing workflow
draft → in_review → scheduled(publishAt) → published → archived. Author creates/reviews nothing; Editor reviews + publishes own-locale; Admin publishes any; scheduled jobs promote at publishAt (cron worker in api). Revisions: every publish snapshots prior version (jsonb) for one-click rollback; preview URLs render draft via api-render endpoint on staging.

## RBAC matrix (deny by default)
| Capability | super_admin | admin | editor | author | viewer |
|---|---|---|---|---|---|
| Content create/edit own | ✓ | ✓ | ✓ | ✓ | — |
| Content publish | ✓ | ✓ | ✓(own locale) | — | — |
| Content delete | ✓ | ✓ | — | — | — |
| Catalog edit | ✓ | ✓ | ✓ | — | — |
| Support inbox/RMA | ✓ | ✓ | ✓ | — | read |
| Users/roles | ✓ | — | — | — | — |
| Settings/integrations | ✓ | — | — | — | — |
| Audit log | ✓ | ✓ | read | — | — |

## UX standards
Tables: cursor pagination, saved column prefs, bulk actions with undo window. Forms: optimistic locking (conflict toast), dirty-state guard, Zod inline errors from the shared contracts (same schemas the API uses — impossible to drift). Keyboard-first (⌘K command palette Phase 3). WCAG 2.2 AA applies here too (axe in admin E2E).
