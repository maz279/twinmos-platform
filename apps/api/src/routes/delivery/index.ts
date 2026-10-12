import { Hono } from 'hono';
import { eq, and, or, lte, desc, asc, ilike } from 'drizzle-orm';
import type { DB } from '@twinmos/db';
import {
  page,
  product,
  article,
  newsPost,
  faq,
  setting,
  redirect,
  locale as localeTable,
  navMenu,
  navItem,
  glossaryTerm,
  office,
  testimonial,
  policyDocument,
  formDefinition,
  formField,
} from '@twinmos/db';
import { problem } from '@twinmos/shared';
import { createPreviewToken, verifyPreviewToken } from './preview.ts';

const PROBLEM_JSON = 'application/problem+json';

export function makeDeliveryRouter(db: DB, sessionFromRequest?: (req: Request) => Promise<any>) {
  const r = new Hono();

  // Helper to set cache headers
  function applyHeaders(c: any, tags: string[], isPreview = false) {
    if (isPreview) {
      c.header('Cache-Control', 'private, no-store, must-revalidate');
      c.header('X-Robots-Tag', 'noindex, nofollow');
    } else {
      c.header('Cache-Control', 'public, max-age=60, s-maxage=300');
      c.header('Cache-Tag', tags.join(', '));
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
    // Also allow internal secret if called server-to-server
    const secretHdr = c.req.header('x-revalidate-secret');
    if (secretHdr && secretHdr === (process.env.REVALIDATE_SECRET || 'dev-revalidate-secret')) {
      authorized = true;
    }

    if (!authorized) {
      return c.json(problem(401, 'Unauthorized', 'Valid staff session or secret required'), 401, {
        'Content-Type': PROBLEM_JSON,
      });
    }

    const body = await c.req.json().catch(() => ({}));
    const { entityType, entityId, slug, ttlSeconds } = body;

    if (!entityType || !entityId) {
      return c.json(problem(400, 'Invalid parameters', 'entityType and entityId are required'), 400, {
        'Content-Type': PROBLEM_JSON,
      });
    }

    const token = createPreviewToken(entityType, entityId, slug, ttlSeconds);
    return c.json({ token });
  });

  // --- 2. Pages ---
  r.get('/pages', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const path = c.req.query('path');
    const condition = path
      ? and(eq(page.locale, locale), eq(page.status, 'published'), eq(page.path, path))
      : and(eq(page.locale, locale), eq(page.status, 'published'));

    const rows = await db
      .select()
      .from(page)
      .where(condition)
      .orderBy(asc(page.slug));

    applyHeaders(c, ['pages', `pages:${locale}`]);
    return c.json({ data: rows });
  });

  r.get('/pages/by-path', async (c) => {
    const path = c.req.query('path');
    const locale = c.req.query('locale') || 'en';
    if (!path) {
      return c.json(problem(400, 'Bad Request', 'path query parameter is required'), 400, { 'Content-Type': PROBLEM_JSON });
    }
    const rows = await db
      .select()
      .from(page)
      .where(and(eq(page.path, path), eq(page.locale, locale), eq(page.status, 'published')))
      .limit(1);

    if (!rows[0]) {
      return c.json(problem(404, 'Page not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }
    applyHeaders(c, ['pages', `page:${rows[0].slug}`]);
    return c.json({ data: rows[0] });
  });

  r.get('/pages/:slug', async (c) => {
    const slug = c.req.param('slug');
    const locale = c.req.query('locale') || 'en';
    const previewToken = c.req.query('preview');

    const tokenPayload = verifyPreviewToken(previewToken, 'page', slug);
    const isPreview = Boolean(tokenPayload);

    const condition = isPreview
      ? and(eq(page.slug, slug), eq(page.locale, locale))
      : and(eq(page.slug, slug), eq(page.locale, locale), eq(page.status, 'published'));

    const rows = await db.select().from(page).where(condition).limit(1);
    let pageRow = rows[0];
    if (!pageRow) {
      const pathCondition = isPreview
        ? and(eq(page.path, '/' + slug.replace(/^\//, '')), eq(page.locale, locale))
        : and(eq(page.path, '/' + slug.replace(/^\//, '')), eq(page.locale, locale), eq(page.status, 'published'));
      const pathRows = await db.select().from(page).where(pathCondition).limit(1);
      pageRow = pathRows[0];
    }
    if (!pageRow) {
      return c.json(problem(404, 'Page not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    applyHeaders(c, ['pages', `page:${pageRow.slug}`], isPreview);
    return c.json({
      data: pageRow,
      meta: {
        id: pageRow.id,
        slug: pageRow.slug,
        status: pageRow.status,
        locale: pageRow.locale,
        updatedAt: pageRow.updatedAt ? new Date(pageRow.updatedAt).toISOString() : undefined,
        cacheTags: ['pages', `page:${pageRow.slug}`],
        isPreview,
      },
    });
  });

  // --- 3. Products ---
  r.get('/products', async (c) => {
    const rows = await db
      .select()
      .from(product)
      .where(eq(product.status, 'published'))
      .orderBy(desc(product.id));

    applyHeaders(c, ['products']);
    return c.json({ data: rows });
  });

  r.get('/products/:slug', async (c) => {
    const slug = c.req.param('slug');
    const previewToken = c.req.query('preview');

    const tokenPayload = verifyPreviewToken(previewToken, 'product', slug);
    const isPreview = Boolean(tokenPayload);

    const condition = isPreview
      ? eq(product.slug, slug)
      : and(eq(product.slug, slug), eq(product.status, 'published'));

    const rows = await db.select().from(product).where(condition).limit(1);
    if (!rows[0]) {
      // Phase C (CMS-E3): archived products return 410 Gone
      const anyRow = await db.select({ status: product.status }).from(product).where(eq(product.slug, slug)).limit(1);
      if (anyRow[0] && anyRow[0].status === 'archived') {
        return c.json(
          problem(410, 'Product Archived', 'This product has been archived and is no longer available in the active catalog.'),
          410,
          { 'Content-Type': PROBLEM_JSON }
        );
      }
      return c.json(problem(404, 'Product not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    applyHeaders(c, ['products', `product:${slug}`], isPreview);
    return c.json({
      data: rows[0],
      meta: {
        id: rows[0].id,
        slug: rows[0].slug,
        status: rows[0].status,
        locale: 'en',
        updatedAt: rows[0].updatedAt ? new Date(rows[0].updatedAt).toISOString() : undefined,
        cacheTags: ['products', `product:${slug}`],
        isPreview,
      },
    });
  });

  // --- 4. Articles ---
  r.get('/articles', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await db
      .select()
      .from(article)
      .where(and(eq(article.locale, locale), eq(article.status, 'published')))
      .orderBy(desc(article.id));

    applyHeaders(c, ['articles', `articles:${locale}`]);
    return c.json({ data: rows });
  });

  r.get('/articles/:slug', async (c) => {
    const slug = c.req.param('slug');
    const locale = c.req.query('locale') || 'en';
    const previewToken = c.req.query('preview');

    const tokenPayload = verifyPreviewToken(previewToken, 'article', slug);
    const isPreview = Boolean(tokenPayload);

    const condition = isPreview
      ? and(eq(article.slug, slug), eq(article.locale, locale))
      : and(eq(article.slug, slug), eq(article.locale, locale), eq(article.status, 'published'));

    const rows = await db.select().from(article).where(condition).limit(1);
    if (!rows[0]) {
      return c.json(problem(404, 'Article not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    applyHeaders(c, ['articles', `article:${slug}`], isPreview);
    return c.json({
      data: rows[0],
      meta: {
        id: rows[0].id,
        slug: rows[0].slug,
        status: rows[0].status,
        locale: rows[0].locale,
        updatedAt: rows[0].updatedAt ? new Date(rows[0].updatedAt).toISOString() : undefined,
        cacheTags: ['articles', `article:${slug}`],
        isPreview,
      },
    });
  });

  // --- 5. News ---
  r.get('/news', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await db
      .select()
      .from(newsPost)
      .where(and(eq(newsPost.locale, locale), eq(newsPost.status, 'published')))
      .orderBy(desc(newsPost.id));

    applyHeaders(c, ['news', `news:${locale}`]);
    return c.json({ data: rows });
  });

  r.get('/news/:slug', async (c) => {
    const slug = c.req.param('slug');
    const locale = c.req.query('locale') || 'en';
    const previewToken = c.req.query('preview');

    const tokenPayload = verifyPreviewToken(previewToken, 'news', slug);
    const isPreview = Boolean(tokenPayload);

    const condition = isPreview
      ? and(eq(newsPost.slug, slug), eq(newsPost.locale, locale))
      : and(eq(newsPost.slug, slug), eq(newsPost.locale, locale), eq(newsPost.status, 'published'));

    const rows = await db.select().from(newsPost).where(condition).limit(1);
    if (!rows[0]) {
      return c.json(problem(404, 'News post not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    applyHeaders(c, ['news', `news:${slug}`], isPreview);
    return c.json({
      data: rows[0],
      meta: {
        id: rows[0].id,
        slug: rows[0].slug,
        status: rows[0].status,
        locale: rows[0].locale,
        updatedAt: rows[0].createdAt ? new Date(rows[0].createdAt).toISOString() : undefined,
        cacheTags: ['news', `news:${slug}`],

        isPreview,
      },
    });
  });

  // --- 6. FAQs ---
  r.get('/faqs', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const groupKey = c.req.query('groupKey');
    const condition = groupKey
      ? and(eq(faq.locale, locale), eq(faq.groupKey, groupKey))
      : eq(faq.locale, locale);

    const rows = await db.select().from(faq).where(condition).orderBy(asc(faq.sort));
    applyHeaders(c, ['faqs', `faqs:${locale}`]);
    return c.json({ data: rows });
  });

  // --- Phase C: Navigation Menus (Task C2b, CMS-E2) ---
  r.get('/navigation', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const menus = await db.select().from(navMenu).where(eq(navMenu.locale, locale));
    applyHeaders(c, ['nav', 'menus', `nav:${locale}`]);
    return c.json({ data: menus });
  });

  r.get('/navigation/:code', async (c) => {
    const code = c.req.param('code');
    const locale = c.req.query('locale') || 'en';

    const menuRows = await db
      .select()
      .from(navMenu)
      .where(and(eq(navMenu.code, code), eq(navMenu.locale, locale)))
      .limit(1);

    let targetMenu = menuRows[0];
    if (!targetMenu && locale !== 'en') {
      const fallbackRows = await db
        .select()
        .from(navMenu)
        .where(and(eq(navMenu.code, code), eq(navMenu.locale, 'en')))
        .limit(1);
      targetMenu = fallbackRows[0];
    }

    if (!targetMenu) {
      return c.json(problem(404, 'Navigation menu not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const items = await db
      .select()
      .from(navItem)
      .where(eq(navItem.menuId, targetMenu.id))
      .orderBy(asc(navItem.sort), asc(navItem.id));

    // Hierarchical tree construction
    const itemMap = new Map<number, any>();
    const roots: any[] = [];

    for (const it of items) {
      itemMap.set(it.id, { ...it, children: [] });
    }

    for (const it of items) {
      const node = itemMap.get(it.id);
      if (it.parentId && itemMap.has(it.parentId)) {
        itemMap.get(it.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    applyHeaders(c, ['nav', 'menus', `nav:${code}`]);
    return c.json({
      data: {
        ...targetMenu,
        items: roots,
      },
    });
  });

  // --- Phase C: Glossary (Task C5a, CMS-E6) ---
  r.get('/glossary', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const letter = c.req.query('letter');
    const search = c.req.query('search');

    const filters = [eq(glossaryTerm.locale, locale)];
    if (letter) {
      filters.push(eq(glossaryTerm.letter, letter.toUpperCase()));
    }
    if (search) {
      filters.push(or(ilike(glossaryTerm.term, `%${search}%`), ilike(glossaryTerm.definition, `%${search}%`))!);
    }

    const rows = await db
      .select()
      .from(glossaryTerm)
      .where(and(...filters))
      .orderBy(asc(glossaryTerm.letter), asc(glossaryTerm.term));

    applyHeaders(c, ['glossary', `glossary:${locale}`]);
    return c.json({ data: rows });
  });

  // --- Phase C: Offices (Task C5b, CMS-E7) ---
  r.get('/offices', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await db
      .select()
      .from(office)
      .where(eq(office.locale, locale))
      .orderBy(asc(office.sort), asc(office.id));

    applyHeaders(c, ['offices', `offices:${locale}`]);
    return c.json({ data: rows });
  });

  // --- Phase C: Testimonials (Task C5b, CMS-E8) ---
  r.get('/testimonials', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await db
      .select()
      .from(testimonial)
      .where(and(eq(testimonial.locale, locale), eq(testimonial.permissionFlag, true)))
      .orderBy(asc(testimonial.sort), asc(testimonial.id));

    applyHeaders(c, ['testimonials', `testimonials:${locale}`]);
    return c.json({ data: rows });
  });

  // --- Phase C: Policies (Task C6a, CMS-E8) ---
  r.get('/policies', async (c) => {
    const locale = c.req.query('locale') || 'en';
    const rows = await db
      .select()
      .from(policyDocument)
      .where(and(eq(policyDocument.locale, locale), eq(policyDocument.status, 'published')))
      .orderBy(asc(policyDocument.slug));

    applyHeaders(c, ['policies', `policies:${locale}`]);
    return c.json({ data: rows });
  });

  r.get('/policies/:slug', async (c) => {
    const slug = c.req.param('slug');
    const locale = c.req.query('locale') || 'en';

    const rows = await db
      .select()
      .from(policyDocument)
      .where(and(eq(policyDocument.slug, slug), eq(policyDocument.locale, locale), eq(policyDocument.status, 'published')))
      .limit(1);

    if (!rows[0]) {
      if (locale !== 'en') {
        const fallback = await db
          .select()
          .from(policyDocument)
          .where(and(eq(policyDocument.slug, slug), eq(policyDocument.locale, 'en'), eq(policyDocument.status, 'published')))
          .limit(1);
        if (fallback[0]) {
          applyHeaders(c, ['policies', `policy:${slug}`]);
          return c.json({ data: fallback[0] });
        }
      }
      return c.json(problem(404, 'Policy document not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    applyHeaders(c, ['policies', `policy:${slug}`]);
    return c.json({ data: rows[0] });
  });

  // --- Phase C: Form Definitions (Task C6b, CMS-E14) ---
  r.get('/forms/:type', async (c) => {
    const formType = c.req.param('type');

    const defRows = await db
      .select()
      .from(formDefinition)
      .where(and(eq(formDefinition.type, formType), eq(formDefinition.isActive, true)))
      .limit(1);

    if (!defRows[0]) {
      return c.json(problem(404, 'Form definition not found'), 404, { 'Content-Type': PROBLEM_JSON });
    }

    const fields = await db
      .select()
      .from(formField)
      .where(eq(formField.formId, defRows[0].id))
      .orderBy(asc(formField.sort), asc(formField.id));

    applyHeaders(c, ['forms', `form:${formType}`]);
    return c.json({
      data: {
        ...defRows[0],
        fields,
      },
    });
  });

  // --- 7. Settings & Menus ---
  r.get('/settings', async (c) => {
    const rows = await db.select().from(setting);
    const map: Record<string, unknown> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    applyHeaders(c, ['settings']);
    return c.json({ data: map });
  });

  r.get('/menus', async (c) => {
    const row = await db.select().from(setting).where(eq(setting.key, 'menus')).limit(1);
    applyHeaders(c, ['settings', 'menus']);
    return c.json({ data: row[0]?.value ?? {} });
  });

  // --- 8. Redirects ---
  r.get('/redirects', async (c) => {
    const rows = await db.select().from(redirect).orderBy(asc(redirect.id));
    applyHeaders(c, ['redirects']);
    return c.json({ data: rows });
  });

  // --- 9. Sitemap Data Endpoint (Dynamic, 0 drafts) ---
  r.get('/sitemap', async (c) => {
    const publishedPages = await db
      .select({ slug: page.slug, locale: page.locale, updatedAt: page.updatedAt })
      .from(page)
      .where(eq(page.status, 'published'));

    const publishedProducts = await db
      .select({ slug: product.slug, updatedAt: product.updatedAt })
      .from(product)
      .where(eq(product.status, 'published'));

    const publishedArticles = await db
      .select({ slug: article.slug, locale: article.locale, updatedAt: article.updatedAt })
      .from(article)
      .where(eq(article.status, 'published'));

    const publishedNews = await db
      .select({ slug: newsPost.slug, locale: newsPost.locale, updatedAt: newsPost.createdAt })
      .from(newsPost)
      .where(eq(newsPost.status, 'published'));


    const entries: Array<{ loc: string; lastmod?: string; locale: string }> = [];

    for (const p of publishedPages) {
      const prefix = p.locale === 'en' ? '' : `/${p.locale}`;
      const path = p.slug.startsWith('/') ? p.slug : `/${p.slug}`;
      entries.push({
        loc: `${prefix}${path}.html`,
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
        locale: p.locale,
      });
    }

    for (const prod of publishedProducts) {
      entries.push({
        loc: `/product.html?id=${prod.slug}`,
        lastmod: prod.updatedAt ? new Date(prod.updatedAt).toISOString() : undefined,
        locale: 'en',
      });
    }

    for (const a of publishedArticles) {
      const prefix = a.locale === 'en' ? '' : `/${a.locale}`;
      entries.push({
        loc: `${prefix}/articles/${a.slug}.html`,
        lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
        locale: a.locale,
      });
    }

    for (const n of publishedNews) {
      const prefix = n.locale === 'en' ? '' : `/${n.locale}`;
      entries.push({
        loc: `${prefix}/news/${n.slug}.html`,
        lastmod: n.updatedAt ? new Date(n.updatedAt).toISOString() : undefined,
        locale: n.locale,
      });
    }

    applyHeaders(c, ['sitemap']);
    return c.json({ data: entries });
  });

  return r;
}
