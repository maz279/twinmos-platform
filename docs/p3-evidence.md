# P3 Evidence — CMS Completion

**Date:** 2026-09-27 · **Scope (master plan §3 P3):** articles/news/events/FAQ/pages editors (markdown + blocks), media library, publishing workflow (draft → review → scheduled → published), revisions + preview URLs, redirects manager, menus, settings.
**Exit criterion:** *non-developer editor can create → publish → see live* — **proven end-to-end** (§3).

---

## 1. What shipped

| Layer | Deliverable |
|---|---|
| Schema | `content_revision` table (migration 0002 + drizzle journal) — immutable snapshot per publish, powers rollback |
| Contracts (`packages/shared`) | `CONTENT_TRANSITIONS` matrix; create/update Zod schemas for article/news/page/faq (slug auto-derives from title); redirect/setting schemas; `slugify()` |
| API `routes/content.ts` | CRUD ×4 entities (list/detail/patch/soft-delete) · **workflow transitions** (server-enforced matrix; `scheduled` requires `publishAt`) · **revisions** (snapshot on publish; revert snapshots current first — rollback is itself reversible) · **preview URLs** (TTL token → public `/api/v1/preview/:token` renders markdown via `marked` with a DRAFT banner) · **scheduled promoter** (boot + interval in index.ts, manual `POST /admin/cron/publish-due` for prod cron) |
| API `routes/media.ts` | multipart upload → `MEDIA_DIR` (content-hash filename); magic-byte sniffing; extension allow-list; **SVG active-content rejection**; alt-text mandatory (a11y); kind/image meta; author+ upload/patch-alt, admin delete |
| API `routes/settings.ts` | settings upsert (secret-shaped keys never echo values, audits redacted) · redirects CRUD (duplicate → 409) · locales (activation super_admin) — menus live under the `menus` settings key |
| Admin SPA | **Content** module (entity tabs, markdown editor + live preview + revisions tab + rollback + role-aware workflow buttons + preview link) · **Media** (upload w/ alt, compliance column, alt edit, admin delete) · **Settings** (Redirects/Menus/Locales tabs) — nav role-gated; audit log covers every mutation |
| Corpus pipeline | `tooling/import-corpus.ts` — 437 markdown files → **395 articles + 26 news + 9 FAQs + 7 dupes skipped** (learn-hub → published-capable Guide articles; other sections import as drafts — page copy); `tooling/export-content.mjs` — DB → `cms-content.js` (published-and-due only, **build-time slug-diff vs prototype data.js** so nothing duplicates); `export-fallback.mjs` guarantees the file exists |
| Web integration | `cms-merge.js` port-only layer: adapts CMS items to the prototype article shape ({h,p} blocks from markdown paragraphs) and merges **only slugs absent from data.js** — added to `TM.articles`, so the **article reader, search page, and newsroom search** surface CMS content after a rebuild; boot order: data.js → cms-content.js → cms-merge.js → app.js |

## 2. Test evidence

### Integration/unit — Vitest `apps/api/test/p3-cms.e2e.test.ts` (18 tests; suite total **47/47** with P2's 29)

- **Lifecycle ×3 entities** (article/news/faq via `it.each`): create (draft, slug derived) → author submits for review → **author publish attempt 403** (RBAC) → editor publishes (revision snapshot + audit) → edit + **rollback restores** the pre-publish snapshot → archived → terminal 422. Audit rows asserted for create/update/transition/revert.
- Workflow guards: illegal transition 422 with legal-list detail · `scheduled` without `publishAt` 422 · duplicate slug 409 · **authors edit only their own items** · viewer read-only · soft delete admin-only (editor 403) and hides from list.
- **Scheduled promoter:** due `scheduled` → published + snapshot; cron endpoint admin-only.
- **Preview URLs:** markdown rendered server-side (`<h1>`, `<strong>`, DRAFT banner); junk token 404.
- **Media:** upload → sniffed `image/png`, alt stored, file on disk, audited, listed; **missing-alt / bad-extension / fake-extension / SVG-with-script all 422**; viewer upload 403, author delete 403, admin delete 200.
- **Settings/redirects/locales:** redirect CRUD + 409 dup; settings upsert with secret redaction; viewer write 403; locale activation editor 403 / super_admin 200.

### Browser E2E — `tooling/audit-harness/cms-e2e.html` (drives the real SPA)

`CMS_E2E_OK signin=200 | nav=Dashboard,Content,Media,Settings,Submissions,RMA board,Applications,Products,Audit log | created | reviewed | publish-badge=yes | rows=26` — a non-developer editor creates an article, submits it, publishes it, and sees it in the live list, entirely through the UI.

### The exit-criterion loop (editor → publish → live site)

1. Browser E2E published *Browser E2E CMS Article \<ts\>* through the admin UI.
2. `tooling/export-content.mjs` → `cms-content.js` contains it (570 B).
3. `astro build` + preview → **`article.html?id=browser-e2e-cms-article-…` renders the markdown** ("E2E Heading" h1 + title) and **`search.html?q=E2E` finds it**.

### Regression guards

- Parity spot @390 after the merge layer: news 96.47 / learn 96.87 (the documented AA-recolor deltas unchanged — merge layer adds zero pixels when the export is empty), index 99.24.
- P2 suite still 29/29; 4-project typecheck clean (one debug probe script removed).
- Day-one export is a **270-byte placeholder** — corpus imports land as drafts, so nothing goes live until an editor publishes (parity-safe by construction).

## 3. Running it

```bash
npm run db:migrate -w @twinmos/api          # applies 0002_content_revisions
npm run import:corpus -w @twinmos/web        # 437 md → CMS (drafts except learn-hub articles)
npm run export:content -w @twinmos/web       # DB → cms-content.js (slug-diff vs data.js)
npm run build -w @twinmos/web                # prebuild chains sync → export → fallback
npm run test -w @twinmos/api                 # 47/47
```
