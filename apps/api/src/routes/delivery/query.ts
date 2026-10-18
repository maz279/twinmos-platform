import { eq, and, or, lte, desc, asc, ilike, isNull, inArray, type SQL } from 'drizzle-orm';
import type { DB } from '@twinmos/db';
import {
  page,
  product,
  category,
  brand,
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
  searchQueryLog,
  compatibilityRule,
} from '@twinmos/db';
import { slugify } from '@twinmos/shared';

// Safe public setting keys allowlist (T3.1.1 / Z-12)
export const PUBLIC_SETTING_KEYS = new Set([
  'site_name',
  'site_description',
  'site_url',
  'contact_email',
  'contact_phone',
  'address',
  'social_links',
  'footer_links',
  'announcement_banner',
  'theme',
  'brand_theme',
  'menus',
  'default_locale',
  'supported_locales',
]);

// --- 1. Pages Queries ---

export async function findPublishedPages(db: DB, locale = 'en', path?: string) {
  const now = new Date();
  const conditions: SQL[] = [
    eq(page.locale, locale),
    eq(page.status, 'published'),
    isNull(page.deletedAt),
    or(isNull(page.publishedAt), lte(page.publishedAt, now))!,
  ];

  if (path) {
    conditions.push(eq(page.path, path));
  }

  return await db
    .select()
    .from(page)
    .where(and(...conditions))
    .orderBy(asc(page.slug));
}

export async function findPublishedPageBySlug(
  db: DB,
  slug: string,
  locale = 'en',
  isPreview = false
) {
  const now = new Date();
  const conditions: SQL[] = [
    eq(page.slug, slug),
    eq(page.locale, locale),
    isNull(page.deletedAt),
  ];

  if (!isPreview) {
    conditions.push(
      eq(page.status, 'published'),
      or(isNull(page.publishedAt), lte(page.publishedAt, now))!
    );
  }

  let rows = await db
    .select()
    .from(page)
    .where(and(...conditions))
    .limit(1);

  if (!rows[0]) {
    // Try path-based lookup fallback (e.g. /slug)
    const normalizedPath = '/' + slug.replace(/^\//, '');
    const pathConditions: SQL[] = [
      eq(page.path, normalizedPath),
      eq(page.locale, locale),
      isNull(page.deletedAt),
    ];
    if (!isPreview) {
      pathConditions.push(
        eq(page.status, 'published'),
        or(isNull(page.publishedAt), lte(page.publishedAt, now))!
      );
    }
    const pathRows = await db
      .select()
      .from(page)
      .where(and(...pathConditions))
      .limit(1);
    rows = pathRows;
  }

  return rows[0] || null;
}

export async function findPublishedPageByPath(db: DB, path: string, locale = 'en') {
  const now = new Date();
  const rows = await db
    .select()
    .from(page)
    .where(
      and(
        eq(page.path, path),
        eq(page.locale, locale),
        eq(page.status, 'published'),
        isNull(page.deletedAt),
        or(isNull(page.publishedAt), lte(page.publishedAt, now))!
      )
    )
    .limit(1);

  return rows[0] || null;
}

// --- 2. Products Queries ---

export interface ProductQueryFilters {
  catSlug?: string;
  brandSlug?: string;
  q?: string;
}

export async function findPublishedProducts(db: DB, filters: ProductQueryFilters = {}) {
  const now = new Date();
  let rows = await db
    .select()
    .from(product)
    .where(
      and(
        eq(product.status, 'published'),
        isNull(product.deletedAt),
        or(isNull(product.launchDate), lte(product.launchDate, now))!
      )
    )
    .orderBy(desc(product.id));

  if (filters.catSlug) {
    const targetCat = await db
      .select()
      .from(category)
      .where(eq(category.slug, filters.catSlug))
      .limit(1);
    if (targetCat[0]) {
      rows = rows.filter((p) => p.categoryId === targetCat[0].id);
    } else {
      return [];
    }
  }

  if (filters.brandSlug) {
    const targetBrand = await db
      .select()
      .from(brand)
      .where(eq(brand.slug, filters.brandSlug))
      .limit(1);
    if (targetBrand[0]) {
      rows = rows.filter((p) => p.brandId === targetBrand[0].id);
    } else {
      return [];
    }
  }

  if (filters.q) {
    const cleanQ = filters.q.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(cleanQ) ||
        (p.description && p.description.toLowerCase().includes(cleanQ)) ||
        (p.shortSpec && p.shortSpec.toLowerCase().includes(cleanQ))
    );
  }

  return rows;
}

export async function findPublishedProductBySlug(
  db: DB,
  slug: string,
  isPreview = false
) {
  const now = new Date();
  const conditions: SQL[] = [eq(product.slug, slug), isNull(product.deletedAt)];

  if (!isPreview) {
    conditions.push(
      eq(product.status, 'published'),
      or(isNull(product.launchDate), lte(product.launchDate, now))!
    );
  }

  const rows = await db
    .select()
    .from(product)
    .where(and(...conditions))
    .limit(1);

  if (!rows[0]) {
    // Check if archived for 410 Gone detection (CMS-E3)
    const anyRow = await db
      .select({ status: product.status })
      .from(product)
      .where(eq(product.slug, slug))
      .limit(1);
    return { product: null, isArchived: anyRow[0]?.status === 'archived' };
  }

  return { product: rows[0], isArchived: false };
}

export async function findProductFacets(db: DB) {
  const now = new Date();
  const products = await db
    .select()
    .from(product)
    .where(
      and(
        eq(product.status, 'published'),
        isNull(product.deletedAt),
        or(isNull(product.launchDate), lte(product.launchDate, now))!
      )
    );

  const categories = await db.select().from(category);
  const brands = await db.select().from(brand);

  const catCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};
  const genCounts: Record<string, number> = {};
  const formCounts: Record<string, number> = {};
  const capCounts: Record<string, number> = {};

  for (const p of products) {
    if (p.categoryId) {
      const cat = categories.find((ct) => ct.id === p.categoryId);
      if (cat) catCounts[cat.slug] = (catCounts[cat.slug] || 0) + 1;
    }
    if (p.brandId) {
      const br = brands.find((b) => b.id === p.brandId);
      if (br) brandCounts[br.slug] = (brandCounts[br.slug] || 0) + 1;
    }
    const facets = (p.facets || {}) as Record<string, any>;
    if (facets.gen) {
      const val = String(facets.gen);
      genCounts[val] = (genCounts[val] || 0) + 1;
    }
    if (facets.form) {
      const val = String(facets.form);
      formCounts[val] = (formCounts[val] || 0) + 1;
    }
    if (facets.cap) {
      const val = String(facets.cap);
      capCounts[val] = (capCounts[val] || 0) + 1;
    }
  }

  return {
    total: products.length,
    categories: categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      count: catCounts[cat.slug] || 0,
    })),
    brands: brands.map((br) => ({
      id: br.id,
      slug: br.slug,
      name: br.name,
      count: brandCounts[br.slug] || 0,
    })),
    gen: Object.entries(genCounts).map(([value, count]) => ({ value, count })),
    form: Object.entries(formCounts).map(([value, count]) => ({ value, count })),
    capacities: Object.entries(capCounts).map(([value, count]) => ({ value, count })),
  };
}

export async function findProductsForComparison(db: DB, slugsOrIds: string[]) {
  if (!slugsOrIds || slugsOrIds.length === 0) return [];
  const now = new Date();

  const isNumeric = slugsOrIds.every((v) => /^\d+$/.test(v));
  const filterClause = isNumeric
    ? inArray(product.id, slugsOrIds.map((v) => parseInt(v, 10)))
    : inArray(product.slug, slugsOrIds);

  return await db
    .select()
    .from(product)
    .where(
      and(
        filterClause,
        eq(product.status, 'published'),
        isNull(product.deletedAt),
        or(isNull(product.launchDate), lte(product.launchDate, now))!
      )
    );
}

// --- 3. Articles Queries ---

export async function findPublishedArticles(db: DB, locale = 'en') {
  const now = new Date();
  return await db
    .select()
    .from(article)
    .where(
      and(
        eq(article.locale, locale),
        eq(article.status, 'published'),
        isNull(article.deletedAt),
        or(isNull(article.publishAt), lte(article.publishAt, now))!
      )
    )
    .orderBy(desc(article.id));
}

export async function findPublishedArticleBySlug(
  db: DB,
  slug: string,
  locale = 'en',
  isPreview = false
) {
  const now = new Date();
  const conditions: SQL[] = [
    eq(article.slug, slug),
    eq(article.locale, locale),
    isNull(article.deletedAt),
  ];

  if (!isPreview) {
    conditions.push(
      eq(article.status, 'published'),
      or(isNull(article.publishAt), lte(article.publishAt, now))!
    );
  }

  const rows = await db
    .select()
    .from(article)
    .where(and(...conditions))
    .limit(1);

  return rows[0] || null;
}

// --- 4. News Queries ---

export async function findPublishedNews(db: DB, locale = 'en') {
  const now = new Date();
  return await db
    .select()
    .from(newsPost)
    .where(
      and(
        eq(newsPost.locale, locale),
        eq(newsPost.status, 'published'),
        isNull(newsPost.deletedAt),
        or(isNull(newsPost.publishAt), lte(newsPost.publishAt, now))!
      )
    )
    .orderBy(desc(newsPost.id));
}

export async function findPublishedNewsBySlug(
  db: DB,
  slug: string,
  locale = 'en',
  isPreview = false
) {
  const now = new Date();
  const conditions: SQL[] = [
    eq(newsPost.slug, slug),
    eq(newsPost.locale, locale),
    isNull(newsPost.deletedAt),
  ];

  if (!isPreview) {
    conditions.push(
      eq(newsPost.status, 'published'),
      or(isNull(newsPost.publishAt), lte(newsPost.publishAt, now))!
    );
  }

  const rows = await db
    .select()
    .from(newsPost)
    .where(and(...conditions))
    .limit(1);

  return rows[0] || null;
}

// --- 5. FAQs Queries ---

export async function findPublishedFaqs(db: DB, locale = 'en', groupKey?: string) {
  const conditions: SQL[] = [
    eq(faq.locale, locale),
    eq(faq.status, 'published'),
  ];

  if (groupKey) {
    conditions.push(eq(faq.groupKey, groupKey));
  }

  return await db
    .select()
    .from(faq)
    .where(and(...conditions))
    .orderBy(asc(faq.sort));
}

// --- 6. Navigation Queries ---

export async function findPublishedNavMenus(db: DB, locale = 'en') {
  return await db.select().from(navMenu).where(eq(navMenu.locale, locale));
}

export async function findPublishedNavMenu(db: DB, code: string, locale = 'en') {
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

  if (!targetMenu) return null;

  const items = await db
    .select()
    .from(navItem)
    .where(eq(navItem.menuId, targetMenu.id))
    .orderBy(asc(navItem.sort), asc(navItem.id));

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

  return {
    ...targetMenu,
    items: roots,
  };
}

// --- 7. Glossary Queries ---

export async function findGlossaryTerms(
  db: DB,
  locale = 'en',
  letter?: string,
  search?: string
) {
  const filters: SQL[] = [eq(glossaryTerm.locale, locale)];
  if (letter) {
    filters.push(eq(glossaryTerm.letter, letter.toUpperCase()));
  }
  if (search) {
    filters.push(
      or(
        ilike(glossaryTerm.term, `%${search}%`),
        ilike(glossaryTerm.definition, `%${search}%`)
      )!
    );
  }

  return await db
    .select()
    .from(glossaryTerm)
    .where(and(...filters))
    .orderBy(asc(glossaryTerm.letter), asc(glossaryTerm.term));
}

// --- 8. Offices & Testimonials Queries ---

export async function findOffices(db: DB, locale = 'en') {
  return await db
    .select()
    .from(office)
    .where(eq(office.locale, locale))
    .orderBy(asc(office.sort), asc(office.id));
}

export async function findTestimonials(db: DB, locale = 'en') {
  return await db
    .select()
    .from(testimonial)
    .where(and(eq(testimonial.locale, locale), eq(testimonial.permissionFlag, true)))
    .orderBy(asc(testimonial.sort), asc(testimonial.id));
}

// --- 9. Policies Queries ---

export async function findPublishedPolicies(db: DB, locale = 'en') {
  return await db
    .select()
    .from(policyDocument)
    .where(
      and(eq(policyDocument.locale, locale), eq(policyDocument.status, 'published'))
    )
    .orderBy(asc(policyDocument.slug));
}

export async function findPublishedPolicyBySlug(db: DB, slug: string, locale = 'en') {
  const rows = await db
    .select()
    .from(policyDocument)
    .where(
      and(
        eq(policyDocument.slug, slug),
        eq(policyDocument.locale, locale),
        eq(policyDocument.status, 'published')
      )
    )
    .limit(1);

  if (!rows[0] && locale !== 'en') {
    const fallback = await db
      .select()
      .from(policyDocument)
      .where(
        and(
          eq(policyDocument.slug, slug),
          eq(policyDocument.locale, 'en'),
          eq(policyDocument.status, 'published')
        )
      )
      .limit(1);
    return fallback[0] || null;
  }

  return rows[0] || null;
}

// --- 10. Form Definitions Queries ---

export async function findActiveFormDefinition(db: DB, formType: string) {
  const defRows = await db
    .select()
    .from(formDefinition)
    .where(and(eq(formDefinition.type, formType), eq(formDefinition.isActive, true)))
    .limit(1);

  if (!defRows[0]) return null;

  const fields = await db
    .select()
    .from(formField)
    .where(eq(formField.formId, defRows[0].id))
    .orderBy(asc(formField.sort), asc(formField.id));

  // Security (Roadmap R0.3 / Z-12): never expose internal routingEmail on public delivery
  const { routingEmail, ...safeDef } = defRows[0];
  return {
    ...safeDef,
    fields,
  };
}

// --- 11. Settings, Menus & Redirects Queries ---

export async function findSafePublicSettings(db: DB) {
  const rows = await db.select().from(setting);
  const map: Record<string, unknown> = {};
  for (const r of rows) {
    if (PUBLIC_SETTING_KEYS.has(r.key)) {
      map[r.key] = r.value;
    }
  }
  return map;
}

export async function findMenusSetting(db: DB) {
  const row = await db.select().from(setting).where(eq(setting.key, 'menus')).limit(1);
  return row[0]?.value ?? {};
}

export async function findRedirects(db: DB) {
  return await db.select().from(redirect).orderBy(asc(redirect.id));
}

// --- 12. Sitemap Queries (Strict 0 Drafts / Scheduling Enforced) ---

export async function findPublishedSitemapEntries(db: DB, targetLocale?: string) {
  const now = new Date();

  const [publishedPages, publishedProducts, publishedArticles, publishedNews] =
    await Promise.all([
      db
        .select({ slug: page.slug, locale: page.locale, updatedAt: page.updatedAt })
        .from(page)
        .where(
          and(
            eq(page.status, 'published'),
            isNull(page.deletedAt),
            or(isNull(page.publishedAt), lte(page.publishedAt, now))!
          )
        ),
      db
        .select({ slug: product.slug, updatedAt: product.updatedAt })
        .from(product)
        .where(
          and(
            eq(product.status, 'published'),
            isNull(product.deletedAt),
            or(isNull(product.launchDate), lte(product.launchDate, now))!
          )
        ),
      db
        .select({
          slug: article.slug,
          locale: article.locale,
          updatedAt: article.updatedAt,
        })
        .from(article)
        .where(
          and(
            eq(article.status, 'published'),
            isNull(article.deletedAt),
            or(isNull(article.publishAt), lte(article.publishAt, now))!
          )
        ),
      db
        .select({
          slug: newsPost.slug,
          locale: newsPost.locale,
          updatedAt: newsPost.createdAt,
        })
        .from(newsPost)
        .where(
          and(
            eq(newsPost.status, 'published'),
            isNull(newsPost.deletedAt),
            or(isNull(newsPost.publishAt), lte(newsPost.publishAt, now))!
          )
        ),
    ]);

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

  if (!entries.some((e) => e.loc === '/' || e.loc === '/index.html')) {
    entries.unshift({ loc: '/', locale: 'en' });
  }

  return targetLocale ? entries.filter((e) => e.locale === targetLocale) : entries;
}

// --- 13. Search & Search Suggestions Queries ---

export async function findSearchSuggestions(db: DB, q: string) {
  const cleanQ = q.toLowerCase();
  const now = new Date();

  const [prods, arts, terms] = await Promise.all([
    db
      .select({ name: product.name, slug: product.slug })
      .from(product)
      .where(
        and(
          eq(product.status, 'published'),
          isNull(product.deletedAt),
          or(isNull(product.launchDate), lte(product.launchDate, now))!,
          ilike(product.name, `%${cleanQ}%`)
        )
      )
      .limit(5),
    db
      .select({ title: article.title, slug: article.slug })
      .from(article)
      .where(
        and(
          eq(article.status, 'published'),
          isNull(article.deletedAt),
          or(isNull(article.publishAt), lte(article.publishAt, now))!,
          ilike(article.title, `%${cleanQ}%`)
        )
      )
      .limit(5),
    db
      .select({ term: glossaryTerm.term })
      .from(glossaryTerm)
      .where(ilike(glossaryTerm.term, `%${cleanQ}%`))
      .limit(5),
  ]);

  const suggestions: Array<{ text: string; type: string; url: string }> = [];
  for (const p of prods) {
    suggestions.push({
      text: p.name,
      type: 'product',
      url: `/product.html?id=${p.slug}`,
    });
  }
  for (const a of arts) {
    suggestions.push({
      text: a.title,
      type: 'article',
      url: `/article.html?id=${a.slug}`,
    });
  }
  for (const t of terms) {
    suggestions.push({
      text: t.term,
      type: 'glossary',
      url: `/learn-glossary.html#term-${slugify(t.term)}`,
    });
  }

  return suggestions.slice(0, 8);
}

export interface SearchOptions {
  q: string;
  type?: string;
  locale?: string;
  page?: number;
  limit?: number;
}

export async function searchPublishedContent(db: DB, options: SearchOptions) {
  const { q, type, locale = 'en', page: pageNum = 1, limit = 20 } = options;
  if (!q) {
    return { query: '', total: 0, page: pageNum, limit, facets: {}, results: [] };
  }

  const cleanQ = q.toLowerCase();
  const queryTokens = cleanQ.split(/\s+/).filter(Boolean);
  const now = new Date();

  // 1. Products search
  let prodResults: any[] = [];
  if (!type || type === 'product') {
    const allProds = await db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortSpec: product.shortSpec,
        warranty: product.warranty,
        categoryId: product.categoryId,
      })
      .from(product)
      .where(
        and(
          eq(product.status, 'published'),
          isNull(product.deletedAt),
          or(isNull(product.launchDate), lte(product.launchDate, now))!
        )
      );

    prodResults = allProds
      .filter((p) => {
        const text = `${p.name} ${p.description || ''} ${p.shortSpec || ''}`.toLowerCase();
        return queryTokens.every((tok) => text.includes(tok));
      })
      .map((p) => ({
        type: 'product',
        id: p.id,
        title: p.name,
        slug: p.slug,
        url: `/product.html?id=${p.slug}`,
        snippet: p.shortSpec || (p.description ? p.description.slice(0, 160) : ''),
        badge: p.warranty || 'Product',
        locale: 'en',
      }));
  }

  // 2. Articles search
  let artResults: any[] = [];
  if (!type || type === 'article') {
    const allArts = await db
      .select({
        id: article.id,
        title: article.title,
        slug: article.slug,
        deck: article.deck,
        body: article.body,
        category: article.category,
        locale: article.locale,
      })
      .from(article)
      .where(
        and(
          eq(article.status, 'published'),
          eq(article.locale, locale),
          isNull(article.deletedAt),
          or(isNull(article.publishAt), lte(article.publishAt, now))!
        )
      );

    artResults = allArts
      .filter((a) => {
        const text = `${a.title} ${a.deck || ''} ${a.body}`.toLowerCase();
        return queryTokens.every((tok) => text.includes(tok));
      })
      .map((a) => ({
        type: 'article',
        id: a.id,
        title: a.title,
        slug: a.slug,
        url: `/article.html?id=${a.slug}`,
        snippet: a.deck || (a.body ? a.body.slice(0, 160) : ''),
        badge: a.category || 'Article',
        category: a.category,
        locale: a.locale,
      }));
  }

  // 3. Glossary search
  let glossaryResults: any[] = [];
  if (!type || type === 'glossary') {
    const allTerms = await db
      .select()
      .from(glossaryTerm)
      .where(eq(glossaryTerm.locale, locale));

    glossaryResults = allTerms
      .filter((t) => {
        const text = `${t.term} ${t.definition}`.toLowerCase();
        return queryTokens.every((tok) => text.includes(tok));
      })
      .map((t) => ({
        type: 'glossary',
        id: t.id,
        title: t.term,
        slug: t.term,
        url: `/learn-glossary.html#term-${slugify(t.term)}`,
        snippet: t.definition.slice(0, 160),
        badge: 'Glossary',
        locale: t.locale,
      }));
  }

  // 4. Pages search
  let pageResults: any[] = [];
  if (!type || type === 'page') {
    const allPages = await db
      .select({
        id: page.id,
        title: page.title,
        slug: page.slug,
        path: page.path,
        seoDescription: page.seoDescription,
        locale: page.locale,
      })
      .from(page)
      .where(
        and(
          eq(page.status, 'published'),
          eq(page.locale, locale),
          isNull(page.deletedAt),
          or(isNull(page.publishedAt), lte(page.publishedAt, now))!
        )
      );

    pageResults = allPages
      .filter((p) => {
        const text = `${p.title} ${p.seoDescription || ''}`.toLowerCase();
        return queryTokens.every((tok) => text.includes(tok));
      })
      .map((p) => ({
        type: 'page',
        id: p.id,
        title: p.title,
        slug: p.slug,
        url: p.path ? `${p.path}.html` : `/${p.slug}.html`,
        snippet: p.seoDescription ? p.seoDescription.slice(0, 160) : '',
        badge: 'Page',
        locale: p.locale,
      }));
  }

  const combined = [
    ...prodResults,
    ...artResults,
    ...glossaryResults,
    ...pageResults,
  ];
  const total = combined.length;

  try {
    await db.insert(searchQueryLog).values({
      query: q.slice(0, 200),
      locale,
      resultsCount: total,
    });
  } catch {}

  const facets: Record<string, number> = {
    product: prodResults.length,
    article: artResults.length,
    glossary: glossaryResults.length,
    page: pageResults.length,
  };

  const start = (pageNum - 1) * limit;
  const paginated = combined.slice(start, start + limit);

  return {
    query: q,
    total,
    page: pageNum,
    limit,
    facets,
    results: paginated,
  };
}

// --- 14. Compatibility Queries ---

export interface CompatibilityQueryParams {
  brand?: string;
  model?: string;
  deviceType?: string;
}

export async function findCompatibilityRules(
  db: DB,
  params: CompatibilityQueryParams = {}
) {
  const conditions: SQL[] = [];
  if (params.brand) {
    conditions.push(ilike(compatibilityRule.deviceBrand, `%${params.brand}%`));
  }
  if (params.model) {
    conditions.push(ilike(compatibilityRule.deviceModel, `%${params.model}%`));
  }
  if (params.deviceType) {
    conditions.push(eq(compatibilityRule.deviceType, params.deviceType));
  }

  const query = db.select().from(compatibilityRule);
  if (conditions.length > 0) {
    return await query.where(and(...conditions)).orderBy(asc(compatibilityRule.deviceBrand), asc(compatibilityRule.deviceModel));
  }
  return await query.orderBy(asc(compatibilityRule.deviceBrand), asc(compatibilityRule.deviceModel));
}
