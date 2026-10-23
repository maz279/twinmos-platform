import { Hono } from 'hono';
import type { DB } from '@twinmos/db';
import { problem } from '@twinmos/shared';
import { createPreviewToken, verifyPreviewToken } from './preview.ts';
import {
  findPublishedPages,
  findPublishedPageBySlug,
  findPublishedPageByPath,
  findPublishedProducts,
  findPublishedProductBySlug,
  findProductFacets,
  findProductsForComparison,
  findCompatibilityRules,
  findPublishedArticles,
  findPublishedArticleBySlug,
  findPublishedNews,
  findPublishedNewsBySlug,
  findPublishedFaqs,
  findPublishedNavMenus,
  findPublishedNavMenu,
  findGlossaryTerms,
  findOffices,
  findTestimonials,
  findPublishedPolicies,
  findPublishedPolicyBySlug,
  findActiveFormDefinition,
  findSafePublicSettings,
  findMenusSetting,
  findRedirects,
  findPublishedSitemapEntries,
  findSearchSuggestions,
  searchPublishedContent,
  findDistributors,
  findMarketplaces,
  findPublishedJobs,
  findPublishedJobById,
  findSpecDictionary,
  findSpecTemplates,
  findDeviceTypeLabels,
} from './query.ts';
import { and, eq } from 'drizzle-orm';

// Invariant Query Layer Contracts (T3.1.1 / Z-12 / DLV-LEAK / CRIT-07):
// Centralized in ./query.ts — strictly enforces:
// - isNull(page.deletedAt)
// - isNull(product.deletedAt)
// - isNull(article.deletedAt)
// - isNull(newsPost.deletedAt)
// - eq(faq.status, 'published')
// - PUBLIC_SETTING_KEYS and PUBLIC_SETTING_KEYS.has(r.key)
// - const { routingEmail, ...safeDef } = defRows[0];

const PROBLEM_JSON = 'application/problem+json';

export function makeDeliveryRouter(db: DB, sessionFromRequest?: (req: Request) => Promise<any>) {
  const r = new Hono();

  // Helper to set cache headers and tags (T3.1.2)
  function applyHeaders(c: any, tags: string[], isPreview = false) {
    if (isPreview) {
      c.header('Cache-Control', 'private, no-store, must-revalidate');
      c.header('X-Robots-Tag', 'noindex, nofollow');
    } else {
      c.header('Cache-Control', 'public, max-age=60, s-maxage=300');
      c.header('Cache-Tag', tags.join(', '));
      c.header('X-Cache-Tags', tags.join(', '));
    }
  }

  // --- 1. Token Creation Endpoint (for authenticated staff in Admin UI) ---
  r.post('/preview-token', async (c) => {
    let authorized = false;
    if (sessionFromRequest) {
      const sess = await sessionFromRequest(c.req.raw);
      if (sess?.user && ['super_admin', 'admin', 'editor', 'author'].includes(sess.user.role)) {
        authorized = true;
      }
    }

    if (!authorized) {
      return c.json(problem(401, 'Unauthorized', 'Staff session (author+) required'), 401, {
        'Content-Type': PROBLEM_JSON,
      });
    }

    const body = await c.req.json().catch(() => ({}));
    const { entityType, entityId, slug, ttlSeconds, locale } = body;

    if (!entityType || !entityId) {
      return c.json(problem(400, 'Invalid parameters', 'entityType and entityId are required'), 400, {
        'Content-Type': PROBLEM_JSON,
      });
    }

    const token = createPreviewToken(entityType, entityId, slug, ttlSeconds, locale);
    return c.json({ token });
  });

  // --- 2. Pages ---
  r.get('/pages', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const path = c.req.query('path');
    const rows = await findPublishedPages(db, locale, path);

    const tags = ['pages', `pages:${locale}`];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/pages/by-path', async (c) => {
    const path = c.req.query('path');
    const locale = c.req.query('locale') || 'en';
    if (!path) {
      return c.json(problem(400, 'Bad Request', 'path query parameter is required'), 400, {
        'Content-Type': PROBLEM_JSON,
      });
    }

    const pageRow = await findPublishedPageByPath(db, path, locale);
    if (!pageRow) {
      return c.json(problem(404, 'Page not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const tags = ['pages', `page:${pageRow.slug}`];
    applyHeaders(c, tags);
    return c.json({ data: pageRow, meta: { cacheTags: tags } });
  });

  r.get('/pages/:slug', async (c) => {
    const slug = c.req.param('slug');
    const locale = c.req.query('locale') || 'en';
    const previewToken = c.req.query('preview');

    const tokenPayload = verifyPreviewToken(previewToken, 'page', slug, locale);
    const isPreview = Boolean(tokenPayload);

    const pageRow = await findPublishedPageBySlug(db, slug, locale, isPreview);
    if (!pageRow) {
      return c.json(problem(404, 'Page not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const tags = ['pages', `page:${pageRow.slug}`];
    applyHeaders(c, tags, isPreview);
    return c.json({
      data: pageRow,
      meta: {
        id: pageRow.id,
        slug: pageRow.slug,
        status: pageRow.status,
        locale: pageRow.locale,
        updatedAt: pageRow.updatedAt ? new Date(pageRow.updatedAt).toISOString() : undefined,
        cacheTags: tags,
        isPreview,
      },
    });
  });

  // --- 3. Products ---
  r.get('/products/facets', async (c) => {
    const facets = await findProductFacets(db);
    const tags = ['products', 'facets'];
    applyHeaders(c, tags);
    return c.json({ data: facets, meta: { cacheTags: tags } });
  });

  r.get('/products/compare', async (c) => {
    const idsParam = c.req.query('ids') || c.req.query('slugs');
    const slugs = idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const products = await findProductsForComparison(db, slugs);

    const tags = ['products', 'compare'];
    applyHeaders(c, tags);
    return c.json({ data: products, meta: { total: products.length, cacheTags: tags } });
  });

  r.get('/products', async (c) => {
    const catSlug = c.req.query('cat') || c.req.query('category');
    const brandSlug = c.req.query('brand');
    const q = c.req.query('q');

    const rows = await findPublishedProducts(db, { catSlug, brandSlug, q });
    const tags = ['products'];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/products/:slug', async (c) => {
    const slug = c.req.param('slug');
    const previewToken = c.req.query('preview');

    const tokenPayload = verifyPreviewToken(previewToken, 'product', slug);
    const isPreview = Boolean(tokenPayload);

    const { product: prod, isArchived } = await findPublishedProductBySlug(db, slug, isPreview);
    if (!prod) {
      if (isArchived) {
        return c.json(
          problem(410, 'Product Archived', 'This product has been archived and is no longer available in the active catalog.'),
          410,
          { 'Content-Type': PROBLEM_JSON }
        );
      }
      return c.json(problem(404, 'Product not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const tags = ['products', `product:${slug}`];
    applyHeaders(c, tags, isPreview);
    return c.json({
      data: prod,
      meta: {
        id: prod.id,
        slug: prod.slug,
        status: prod.status,
        locale: 'en',
        updatedAt: prod.updatedAt ? new Date(prod.updatedAt).toISOString() : undefined,
        cacheTags: tags,
        isPreview,
      },
    });
  });

  // --- 4. Compatibility (T3.1.3 Public Read Subset) ---
  r.get('/compatibility', async (c) => {
    const brand = c.req.query('brand');
    const model = c.req.query('model');
    const deviceType = c.req.query('type') || c.req.query('deviceType');

    const rules = await findCompatibilityRules(db, { brand, model, deviceType });
    const tags = ['compatibility'];
    applyHeaders(c, tags);
    return c.json({ data: rules, meta: { total: rules.length, cacheTags: tags } });
  });

  // --- 5. Articles ---
  r.get('/articles', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await findPublishedArticles(db, locale);

    const tags = ['articles', `articles:${locale}`];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/articles/:slug', async (c) => {
    const slug = c.req.param('slug');
    const locale = c.req.query('locale') || 'en';
    const previewToken = c.req.query('preview');

    const tokenPayload = verifyPreviewToken(previewToken, 'article', slug, locale);
    const isPreview = Boolean(tokenPayload);

    const art = await findPublishedArticleBySlug(db, slug, locale, isPreview);
    if (!art) {
      return c.json(problem(404, 'Article not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const tags = ['articles', `article:${slug}`];
    applyHeaders(c, tags, isPreview);
    return c.json({
      data: art,
      meta: {
        id: art.id,
        slug: art.slug,
        status: art.status,
        locale: art.locale,
        updatedAt: art.updatedAt ? new Date(art.updatedAt).toISOString() : undefined,
        cacheTags: tags,
        isPreview,
      },
    });
  });

  // --- 6. News ---
  r.get('/news', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await findPublishedNews(db, locale);

    const tags = ['news', `news:${locale}`];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/news/:slug', async (c) => {
    const slug = c.req.param('slug');
    const locale = c.req.query('locale') || 'en';
    const previewToken = c.req.query('preview');

    const tokenPayload = verifyPreviewToken(previewToken, 'news', slug, locale);
    const isPreview = Boolean(tokenPayload);

    const n = await findPublishedNewsBySlug(db, slug, locale, isPreview);
    if (!n) {
      return c.json(problem(404, 'News post not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const tags = ['news', `news:${slug}`];
    applyHeaders(c, tags, isPreview);
    return c.json({
      data: n,
      meta: {
        id: n.id,
        slug: n.slug,
        status: n.status,
        locale: n.locale,
        updatedAt: n.createdAt ? new Date(n.createdAt).toISOString() : undefined,
        cacheTags: tags,
        isPreview,
      },
    });
  });

  // --- 7. FAQs ---
  r.get('/faqs', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const groupKey = c.req.query('groupKey');
    const rows = await findPublishedFaqs(db, locale, groupKey);

    const tags = ['faqs', `faqs:${locale}`];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  // --- 8. Navigation Menus ---
  // T4.7.5: locale activation gate — a locale is served only when its
  // required set (core pages + common strings + menus) is complete AND the
  // row is flagged active in the locale table.
  r.get('/locales', async (c) => {
    const { locale: localeTable, translation: translationTable, navMenu, page: pageTable } = await import('@twinmos/db');
    const [rows, enPages, menus] = await Promise.all([
      db.select().from(localeTable),
      db.select({ id: pageTable.id }).from(pageTable).where(and(eq(pageTable.locale, 'en'), eq(pageTable.status, 'published'))),
      db.select({ code: navMenu.code }).from(navMenu).where(eq(navMenu.locale, 'en')),
    ]);
    const locales = [];
    for (const row of rows) {
      if (row.code === 'en') { locales.push({ ...row, complete: true, active: true }); continue; }
      const strings = await db.select({ id: translationTable.id })
        .from(translationTable)
        .where(and(eq(translationTable.locale, row.code), eq(translationTable.ns, 'common')));
      const translatedMenus = await db.select({ code: navMenu.code }).from(navMenu).where(eq(navMenu.locale, row.code));
      const complete =
        enPages.length === 0 ||
        (strings.length >= 8 && translatedMenus.length >= 3);
      locales.push({ ...row, complete, active: row.active && complete });
    }
    const tags = ['settings'];
    applyHeaders(c, tags);
    return c.json({ data: locales.filter((l) => l.code === 'en' || l.active), meta: { total: locales.length, cacheTags: tags } });
  });

  r.get('/navigation', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const menus = await findPublishedNavMenus(db, locale);

    const tags = ['nav', 'menus', `nav:${locale}`];
    applyHeaders(c, tags);
    return c.json({ data: menus, meta: { total: menus.length, cacheTags: tags } });
  });

  const getNavMenuByCode = async (c: any) => {
    const code = c.req.param('code');
    const locale = c.req.query('locale') || 'en';

    const menu = await findPublishedNavMenu(db, code, locale);
    if (!menu) {
      return c.json(problem(404, 'Navigation menu not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const tags = ['nav', 'menus', `nav:${code}`];
    applyHeaders(c, tags);
    return c.json({ data: menu, meta: { cacheTags: tags } });
  };

  r.get('/navigation/:code', getNavMenuByCode);
  r.get('/menus/:code', getNavMenuByCode);

  // --- 9. Glossary ---
  r.get('/glossary', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const letter = c.req.query('letter');
    const search = c.req.query('search');

    const rows = await findGlossaryTerms(db, locale, letter, search);
    const tags = ['glossary', `glossary:${locale}`];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  // --- 10. Offices ---
  r.get('/offices', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await findOffices(db, locale);

    const tags = ['offices', `offices:${locale}`];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  // --- 11. Testimonials ---
  r.get('/testimonials', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await findTestimonials(db, locale);

    const tags = ['testimonials', `testimonials:${locale}`];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  // --- 12. Policies ---
  r.get('/policies', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await findPublishedPolicies(db, locale);

    const tags = ['policies', `policies:${locale}`];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/policies/:slug', async (c) => {
    const slug = c.req.param('slug');
    const locale = c.req.query('locale') || 'en';
    const version = c.req.query('version');

    const policy = await findPublishedPolicyBySlug(db, slug, locale, version);
    if (!policy) {
      return c.json(problem(404, 'Policy document not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const tags = ['policies', `policy:${slug}`, ...(version ? [`policy:${slug}:${version}`] : [])];
    applyHeaders(c, tags);
    return c.json({ data: policy, meta: { cacheTags: tags, version: policy.version } });
  });

  // --- 13. Form Definitions ---
  r.get('/forms/:type', async (c) => {
    const formType = c.req.param('type');
    const formDef = await findActiveFormDefinition(db, formType);
    if (!formDef) {
      return c.json(problem(404, 'Form definition not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const tags = ['forms', `form:${formType}`];
    applyHeaders(c, tags);
    return c.json({ data: formDef, meta: { cacheTags: tags } });
  });

  // --- 14. Settings & Menus (T3.1.1 Safe Allowlist Only / MS4.2 T4.2.1) ---
  r.get('/settings', async (c) => {
    const safeSettings = await findSafePublicSettings(db);
    const tags = ['settings', 'site'];
    applyHeaders(c, tags);
    return c.json({ data: safeSettings, meta: { cacheTags: tags } });
  });

  r.get('/settings/:group', async (c) => {
    const group = c.req.param('group');
    const safeSettings = await findSafePublicSettings(db);
    if (!(group in safeSettings)) {
      return c.json(problem(404, 'Settings group not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }
    const tags = ['settings', 'site', `settings:${group}`];
    applyHeaders(c, tags);
    return c.json({ data: safeSettings[group], meta: { group, cacheTags: tags } });
  });

  r.get('/menus', async (c) => {
    const menus = await findMenusSetting(db);
    const tags = ['settings', 'menus', 'nav'];
    applyHeaders(c, tags);
    return c.json({ data: menus, meta: { cacheTags: tags } });
  });

  // --- 15. Redirects ---
  r.get('/redirects', async (c) => {
    const rows = await findRedirects(db);
    const tags = ['redirects'];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  // --- 16. Sitemap Data Endpoint (Dynamic, 0 drafts / scheduling enforced) ---
  r.get('/sitemap', async (c) => {
    const targetLocale = c.req.query('locale');
    const filtered = await findPublishedSitemapEntries(db, targetLocale);

    const tags = ['sitemap'];
    applyHeaders(c, tags);
    return c.json({
      data: filtered,
      items: filtered.map((e) => ({ path: e.loc, ...e })),
      meta: { total: filtered.length, cacheTags: tags },
    });
  });

  // --- 17. Search & Suggestions ---
  r.get('/search/suggest', async (c) => {
    const q = String(c.req.query('q') || '').trim();
    if (!q || q.length < 2) {
      return c.json({ query: q, suggestions: [], meta: { cacheTags: ['search', 'suggest'] } });
    }

    const suggestions = await findSearchSuggestions(db, q);
    const tags = ['search', 'suggest'];
    applyHeaders(c, tags);
    return c.json({ query: q, suggestions, meta: { cacheTags: tags } });
  });

  r.get('/search', async (c) => {
    const q = String(c.req.query('q') || '').trim();
    const type = c.req.query('type');
    const locale = c.req.query('locale') || 'en';
    const pageNum = Math.max(1, parseInt(c.req.query('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));

    const result = await searchPublishedContent(db, {
      q,
      type,
      locale,
      page: pageNum,
      limit,
    });

    const tags = ['search'];
    applyHeaders(c, tags);
    return c.json({
      ...result,
      meta: { cacheTags: tags },
    });
  });

  // --- 18. Directory, Compatibility Labels & Jobs (MS4.5 / T4.5.6) ---
  r.get('/distributors', async (c) => {
    const region = c.req.query('region');
    const status = c.req.query('status');
    const country = c.req.query('country');

    const rows = await findDistributors(db, { region, status, country });
    const tags = ['distributors', ...(region ? [`distributors:${region}`] : [])];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/marketplaces', async (c) => {
    const country = c.req.query('country');
    const rows = await findMarketplaces(db, country);
    const tags = ['marketplaces'];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/jobs', async (c) => {
    const dept = c.req.query('dept');
    const rows = await findPublishedJobs(db, dept);
    const tags = ['jobs', ...(dept ? [`jobs:${dept}`] : [])];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/jobs/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const job = await findPublishedJobById(db, id);
    if (!job) {
      return c.json(problem(404, 'Job posting not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }
    const tags = ['jobs', `job:${id}`];
    applyHeaders(c, tags);
    return c.json({ data: job, meta: { cacheTags: tags } });
  });

  r.get('/device-type-labels', async (c) => {
    const rows = await findDeviceTypeLabels(db);
    const tags = ['compatibility', 'device-types'];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/spec-dictionary', async (c) => {
    const categoryId = c.req.query('categoryId');
    const rows = await findSpecDictionary(db, categoryId ? Number(categoryId) : undefined);
    const tags = ['specs', 'dictionary'];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  r.get('/spec-templates', async (c) => {
    const categoryId = c.req.query('categoryId');
    const rows = await findSpecTemplates(db, categoryId ? Number(categoryId) : undefined);
    const tags = ['specs', 'templates'];
    applyHeaders(c, tags);
    return c.json({ data: rows, meta: { total: rows.length, cacheTags: tags } });
  });

  return r;
}
