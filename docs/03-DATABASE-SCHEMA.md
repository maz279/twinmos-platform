# 03 — Database Schema (Postgres dialect, Drizzle)

**Hard rule:** application code never builds SQL strings — Drizzle query builder and `sql` template only (both parameter-bind). Enforced in review checklist + custom lint.

## Enums
`role` (super_admin, admin, editor, author, viewer) · `content_status` (draft, in_review, scheduled, published, archived) · `rma_status` (submitted, under_review, approved, in_repair, shipped, delivered, closed) · `submission_status` (new, assigned, resolved, spam)

## Tables (22)
Auth (Better Auth managed): **user, session, account, verification** (+ role column on user).
Platform: **audit_log** (actorId, action, entity, entityId, diff jsonb, requestId, ip, at — 12-month retention job) · **media_asset** (key, kind, width/height, alt, uploadedBy, meta jsonb) · **setting** (key, value jsonb) · **redirect** (from, to, code) · **locale** (code, name, dir, active)
Content: **article** (slug, title, deck, body md, category, tags[], status, publishAt, authorId, locale, heroMediaId, seo jsonb, revisionOf) · **page** (slug, title, blocks jsonb, status, locale) · **news_post**, **event** (article-shaped + event fields) · **faq** (group, q, a, sort, locale, status)
Catalog: **brand** · **category** (parentId self-FK) · **product** (sku, slug, name, brandId, categoryId, status, specs jsonb, heroMediaId, gallery mediaId[], datasheets jsonb, badges[], releasedAt) · **compatibility_rule** (deviceBrand, deviceModel, memoryGen, formFactor, maxGB, notes) · **product_variant** (productId, attrs jsonb)
Channel: **distributor** (name, country, region, status, cities[], contact jsonb, note) · **marketplace_listing** (platform, url, verifiedAt)
Support: **form_submission** (type, payload jsonb, status `new/assigned/in_progress/resolved/closed/spam`, priority, dueAt SLA, assigneeId, refCode, ip, ua, email) · **form_note** (submissionId, authorId, body, createdAt — P6 internal lead notes) · **rma_request** (number unique, productSku, serial, issue, status, customer jsonb, warrantyTier) · **rma_event** (rmaId, fromStatus, toStatus, actorId, note, at) · **serial_registry** (serial unique, sku, manufacturedAt, verifiedCount)
Careers: **job_posting** (title, dept, location, type, level, status, body md, applyBy) · **job_application** (postingId, payload jsonb, status, refCode)

## Migrations & environments
drizzle-kit generate produces packages/db/migrations; apply with `npm run db:migrate`. Dev = PGlite file (./data/dev.pgdata); staging/prod = Postgres 16 via DATABASE_URL — the API refuses to boot on PGlite when NODE_ENV=production. Seed: `npm run db:seed` imports the corpus + products.json + the first admin user.

## Security mandate
Application code never assembles SQL from strings. The Drizzle query builder and its sql tagged template are the only allowed SQL paths — both parameter-bind values. No exceptions; enforced in code review and a repo lint check.
