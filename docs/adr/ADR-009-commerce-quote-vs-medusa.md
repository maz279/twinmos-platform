# ADR-009 — P6 Commerce: harden the quote/lead flow; defer Medusa/Stripe

**Status:** Accepted · **Date:** 2026-09-27 · **Phase:** P6 (master plan §3) · **Supersedes:** none
**Decision owner:** TwinMOS build engagement · **Revisit:** at any trigger listed below

## Context

The master plan makes P6 a decision, not a fixed build: *"Quote/lead flow hardened **or** Medusa.js/Stripe integration — decided by then-business case (ADR at phase start)."* The Features Catalog frames the same choice as Category 21 (E-Commerce, old-roadmap Phase 3, 16 weeks: Medusa v2 or Stripe Checkout, cart, 4-step checkout, shipping/tax engine, order management, commerce accounts) versus Category 7 (Lead Generation: the Bulk/Enterprise Quote Request as *"the Phase 1–2 substitute for e-commerce cart — constraint C-02: lead-gen focus"*).

Facts that constrain the decision today:

1. **The audited prototype is the non-negotiable UI/UX contract and contains no cart, checkout, pricing, or payment surface.** Any storefront would be new UI outside the contract — a different engagement shape, not a phase of this one.
2. **TwinMOS sells through an authorized channel** (BR-3.1; Where-to-Buy routes buyers to distributors). Direct-to-consumer retail creates channel-conflict, consumer-protection, tax-registration (VAT/GST per market), fulfillment, and returns obligations that the catalog itself parks on a dedicated old-roadmap phase with a *"market scope must be reconfirmed with TwinMOS"* caveat (F21.5 note).
3. **The current architecture** (static Astro web + one Hono API + one Postgres) is deliberately small; Medusa is a second platform (admin + storefront + workers + Redis) with its own operational surface.
4. **What the business needs now is already in the catalog as P0**: qualified B2B leads — quote requests with SLA-tracked handling, assignment, priorities, and ticketed auto-replies (F7.1/F7.2, BR-4.1–4.4). The P2 form platform captures submissions but stops short of the lead-handling workflow.

## Decision

**Harden the quote/lead flow now (Category 7); do not integrate Medusa.js or Stripe in this build.** P6 delivers:

- Type-aware ticket references (`QT-…`, `DS-…`, …; `FRM-…` fallback), priority auto-routing (quote/distributor/OEM → high), and SLA due-dates per type (BR-4.2/4.3/4.4) set at intake.
- Ticketed auto-reply to the submitter for every form type (BR-4.1), not only RMA.
- The full lead-handling state machine — `new → assigned → in_progress → resolved → closed` (+ `spam`), server-enforced transitions, assignment auto-advances `new → assigned`.
- Internal notes per lead (collaboration trail, audited), and filtered CSV export for ops/CRM import.

All of it lands behind the existing surfaces (public form posts unchanged in shape; admin Submissions board upgraded) with **zero pixel changes** to the prototype pages.

## Consequences

- TwinMOS gets a working B2B revenue funnel on the current architecture, immediately deployable.
- No new platform to operate; P7 hardening proceeds on the same single-service topology.
- RFQ document upload (F7.2) stays deferred: the prototype quote form has no file field, and adding one would violate the parity contract; it arrives with the next form-library evolution (or a dedicated request-basked surface) if the business confirms the need.
- Real-time inventory/price sync (ERP, F21.7) remains out of scope — it belongs to the commerce phase.

## Revisit triggers (any one reopens the commerce ADR)

1. TwinMOS confirms a direct-retail market (e.g. UAE/KSA soft launch) with named owners for fulfillment, consumer returns, and market tax registration.
2. Channel-conflict policy is agreed with distribution partners in writing.
3. Cart/checkout UI is commissioned and prototyped (making it part of the design contract).
4. Terms of Sale + transactional-currency set are approved for specific markets.

When triggered, the choice narrows to **Stripe Checkout-only** (smallest PCI scope, SAQ A, one integration surface — recommended first step) versus **Medusa v2** (full commerce engine; justified only with catalog-scale SKUs, promotions, multi-currency inventory).
