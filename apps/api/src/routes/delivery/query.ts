import { eq, ne, and, or, lte, gt, desc, asc, ilike, isNull, inArray, sql, type SQL } from 'drizzle-orm';
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
  entityTranslation,
  office,
  testimonial,
  policyDocument,
  formDefinition,
  formField,
  searchQueryLog,
  compatibilityRule,
  distributor,
  marketplaceListing,
  jobPosting,
  specDictionary,
  specTemplate,
  deviceTypeLabel,
  mediaAsset,
} from '@twinmos/db';
import {
  slugify,
  SETTINGS_GROUP_DEFAULTS,
  SETTINGS_GROUP_KEYS,
  normalizeSettingsGroup,
  resolveComputedFigures,
  type SettingsGroupKey,
} from '@twinmos/shared';

// Safe public setting keys allowlist (T3.1.1 / Z-12 / MS4.2 T4.2.1)
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
  // MS4.2 Typed Settings Groups (C1)
  'site.brand',
  'site.contact',
  'site.social',
  'site.cookie',
  'site.whatsapp',
  'site.figures',
  'seo.defaults',
  'integrations',
]);

// --- 1. Pages Queries ---

/** Resolve baseline figure claims in CMS copy from site.figures (T4.2.1). */
async function figureTextResolver(db: DB): Promise<(text: string) => string> {
  let figures = SETTINGS_GROUP_DEFAULTS['site.figures'];
  try {
    const rows = await db.select().from(setting).where(eq(setting.key, 'site.figures')).limit(1);
    figures = normalizeSettingsGroup('site.figures', rows[0]?.value ?? {});
  } catch {}
  return (text: string) =>
    String(text)
      .replace(/\b93\+\s+countries\b/gi, `${figures.countriesCount} countries`)
      .replace(/\b(since|founded)\s+1998\b/gi, (_match, word) => `${word} ${figures.foundingYear}`)
      .replace(/\b(39|45)\s+products?\b/gi, `${figures.productCount} products`);
}

function mapStrings(value: any, fn: (text: string) => string): any {
  if (typeof value === 'string') return fn(value);
  if (Array.isArray(value)) return value.map((item) => mapStrings(item, fn));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) out[key] = mapStrings(item, fn);
    return out;
  }
  return value;
}

/**
 * T4.8.3: apply entity translations (from Translation Studio / XLIFF) to a
 * delivered row. Only overrides whose source has not changed since translation
 * (sourceHash matches the live value) are applied — an edited source falls
 * back to English rather than serving a stale translation.
 */
export async function applyEntityTranslations<T extends Record<string, any>>(
  db: DB, entity: string, row: T, locale: string,
): Promise<T> {
  if (!row || locale === 'en' || !row.id) return row;
  try {
    const overrides = await db
      .select()
      .from(entityTranslation)
      .where(and(
        eq(entityTranslation.entity, entity),
        eq(entityTranslation.entityId, Number(row.id)),
        eq(entityTranslation.locale, locale),
      ));
    if (overrides.length === 0) return row;
    const { createHash } = await import('node:crypto');
    const out: Record<string, any> = { ...row };
    for (const o of overrides) {
      const current = String(row[o.field] ?? '');
      const hash = createHash('sha256').update(current).digest('hex');
      if (o.sourceHash && o.sourceHash !== hash) continue; // source changed → outdated
      if (typeof row[o.field] === 'object' && row[o.field] !== null && typeof o.value === 'string' && (o.value.startsWith('{') || o.value.startsWith('['))) {
        try {
          out[o.field] = JSON.parse(o.value);
        } catch {
          out[o.field] = o.value;
        }
      } else {
        out[o.field] = o.value;
      }
    }
    return out as T;
  } catch {
    return row;
  }
}

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
  isPreview = false,
  fallbackToEnglish = false
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

  // D-8 (T4.7.5): a missing locale variant is NOT served as English from the
  // localized URL — the caller 301s to the English URL instead. The English
  // fallback stays available for entity translations applied at delivery
  // (applyEntityTranslations) but must not mask a missing variant for the
  // locale-resolution middleware. Guard it behind an explicit flag.
  if (!rows[0] && locale !== 'en' && fallbackToEnglish) {
    const enConditions: SQL[] = [
      eq(page.slug, slug),
      eq(page.locale, 'en'),
      isNull(page.deletedAt),
    ];
    if (!isPreview) {
      enConditions.push(
        eq(page.status, 'published'),
        or(isNull(page.publishedAt), lte(page.publishedAt, now))!
      );
    }
    const enRows = await db
      .select()
      .from(page)
      .where(and(...enConditions))
      .limit(1);
    if (enRows[0]) {
      rows = enRows;
    } else {
      const normalizedPath = '/' + slug.replace(/^\//, '');
      const enPathConditions: SQL[] = [
        eq(page.path, normalizedPath),
        eq(page.locale, 'en'),
        isNull(page.deletedAt),
      ];
      if (!isPreview) {
        enPathConditions.push(
          eq(page.status, 'published'),
          or(isNull(page.publishedAt), lte(page.publishedAt, now))!
        );
      }
      rows = await db
        .select()
        .from(page)
        .where(and(...enPathConditions))
        .limit(1);
    }
  }

  const raw = rows[0];
  if (!raw) return null;
  const row = await applyEntityTranslations(db, 'page', raw, locale);
  const resolve = await figureTextResolver(db);
  return {
    ...row,
    title: resolve(row.title),
    seoTitle: row.seoTitle ? resolve(row.seoTitle) : row.seoTitle,
    seoDescription: row.seoDescription ? resolve(row.seoDescription) : row.seoDescription,
    blocks: mapStrings(row.blocks, resolve),
  };
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
  sort?: string;
}

export function attachComputedProductFields(p: any) {
  if (!p) return p;
  const now = Date.now();
  const badges: string[] = Array.isArray(p.badges) ? [...p.badges] : [];
  let isNew = false;
  if (p.launchDate) {
    const launchTime = new Date(p.launchDate).getTime();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    if (now >= launchTime && now - launchTime <= ninetyDaysMs) {
      isNew = true;
      if (!badges.includes('New')) badges.unshift('New');
    }
  }
  return {
    ...p,
    isNew,
    isNewBadge: isNew,
    badges,
  };
}

export async function findPublishedProducts(db: DB, filters: ProductQueryFilters = {}) {
  const now = new Date();
  const conditions: SQL[] = [
    eq(product.status, 'published'),
    isNull(product.deletedAt),
    or(isNull(product.launchDate), lte(product.launchDate, now))!,
  ];

  if (filters.catSlug && filters.catSlug !== 'all') {
    const targetCat = await db
      .select({ id: category.id })
      .from(category)
      .where(eq(category.slug, filters.catSlug))
      .limit(1);
    if (targetCat[0]) {
      conditions.push(eq(product.categoryId, targetCat[0].id));
    } else {
      return [];
    }
  }

  if (filters.brandSlug) {
    const targetBrand = await db
      .select({ id: brand.id })
      .from(brand)
      .where(eq(brand.slug, filters.brandSlug))
      .limit(1);
    if (targetBrand[0]) {
      conditions.push(eq(product.brandId, targetBrand[0].id));
    } else {
      return [];
    }
  }

  if (filters.q) {
    const cleanQ = filters.q.trim();
    conditions.push(
      or(
        ilike(product.name, `%${cleanQ}%`),
        ilike(product.description, `%${cleanQ}%`),
        ilike(product.shortSpec, `%${cleanQ}%`)
      )!
    );
  }

  let queryBuilder = db
    .select()
    .from(product)
    .where(and(...conditions));

  if (filters.sort === 'name') {
    queryBuilder = queryBuilder.orderBy(asc(sql`lower(${product.name})`)) as any;
  } else if (filters.sort === 'cat') {
    queryBuilder = queryBuilder.orderBy(asc(product.categoryId), desc(product.id)) as any;
  } else if (filters.sort === 'featured') {
    queryBuilder = queryBuilder.orderBy(desc(product.featured), desc(product.id)) as any;
  } else {
    queryBuilder = queryBuilder.orderBy(desc(product.id)) as any;
  }

  const rows = await queryBuilder;
  return rows.map(attachComputedProductFields);
}

export async function findPublishedProductBySlug(
  db: DB,
  slug: string,
  isPreview = false,
  locale = 'en'
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

  const translated = locale === 'en' ? rows[0] : await applyEntityTranslations(db, 'product', rows[0], locale);
  return { product: attachComputedProductFields(translated), isArchived: false };
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

  if (!rows[0]) return null;
  const art = await applyEntityTranslations(db, 'article', rows[0], locale);
  let heroMedia = null;
  if (art.heroMediaId) {
    const mediaRows = await db.select().from(mediaAsset).where(eq(mediaAsset.id, art.heroMediaId)).limit(1);
    if (mediaRows[0]) {
      heroMedia = {
        id: mediaRows[0].id,
        key: mediaRows[0].key,
        alt: mediaRows[0].alt,
        isDecorative: mediaRows[0].isDecorative,
        variants: mediaRows[0].variants,
      };
    }
  }

  const relatedRows = await db
    .select({
      id: article.id,
      slug: article.slug,
      title: article.title,
      deck: article.deck,
      category: article.category,
      readingTimeMin: article.readingTimeMin,
      heroMediaId: article.heroMediaId,
    })
    .from(article)
    .where(
      and(
        eq(article.locale, locale),
        eq(article.status, 'published'),
        isNull(article.deletedAt),
        or(isNull(article.publishAt), lte(article.publishAt, now))!
      )
    )
    .limit(4);

  const relatedArticles = relatedRows.filter((r) => r.slug !== slug).slice(0, 3);

  return {
    ...art,
    heroMedia,
    relatedArticles,
  };
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
  const now = new Date();
  const conditions: SQL[] = [
    eq(faq.locale, locale),
    eq(faq.status, 'published'),
    isNull(faq.deletedAt),
    ne(faq.answer, ''),
    or(isNull(faq.publishAt), lte(faq.publishAt, now))!,
    or(isNull(faq.unpublishAt), gt(faq.unpublishAt, now))!,
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

  // T4.2.3: references are resolved to canonical URLs at delivery. An entity
  // that no longer exists falls back to the validated stored URL.
  const refIds = (type: string) =>
    [...new Set(items.filter((i) => i.targetType === type && i.targetId).map((i) => i.targetId as string))];

  const productIds = refIds('product');
  const articleIds = refIds('article');
  const categoryIds = refIds('category');
  const pageIds = refIds('page');

  const productSet = new Set(
    productIds.length
      ? (await db.select({ slug: product.slug }).from(product).where(inArray(product.slug, productIds))).map(
          (r) => r.slug,
        )
      : [],
  );
  const articleSet = new Set(
    articleIds.length
      ? (
          await db
            .select({ slug: article.slug })
            .from(article)
            .where(and(eq(article.locale, targetMenu.locale), inArray(article.slug, articleIds)))
        ).map((r) => r.slug)
      : [],
  );
  const categorySet = new Set(
    categoryIds.length
      ? (await db.select({ slug: category.slug }).from(category).where(inArray(category.slug, categoryIds))).map(
          (r) => r.slug,
        )
      : [],
  );
  const pagePathMap = new Map<string, string>();
  if (pageIds.length) {
    const pageRows = await db
      .select({ slug: page.slug, path: page.path })
      .from(page)
      .where(and(eq(page.locale, targetMenu.locale), inArray(page.slug, pageIds)));
    for (const row of pageRows) pagePathMap.set(row.slug, row.path || `/${row.slug}`);
  }

  // Label counts and figure claims are computed from site.figures (T4.2.3).
  let figures = SETTINGS_GROUP_DEFAULTS['site.figures'];
  try {
    const figureRows = await db.select().from(setting).where(eq(setting.key, 'site.figures')).limit(1);
    figures = normalizeSettingsGroup('site.figures', figureRows[0]?.value ?? {});
  } catch {}

  const resolveNavText = (value: unknown): string =>
    String(value ?? '')
      .replace(/\{\{products\}\}/g, String(figures.productCount))
      .replace(/\{\{countries\}\}/g, figures.countriesCount)
      .replace(/\{\{foundingYear\}\}/g, String(figures.foundingYear))
      .replace(/\b(since)\s+1998\b/gi, (_match, word) => `${word} ${figures.foundingYear}`)
      .replace(/\b93\+\s+countries\b/gi, `${figures.countriesCount} countries`);

  const resolveNavMetadata = (metadata: any): any => {
    if (!metadata || typeof metadata !== 'object') return metadata;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      out[key] = typeof value === 'string' ? resolveNavText(value) : value;
    }
    return out;
  };

  const resolveUrl = (item: any): string | null => {
    if (item.targetType === 'product' && item.targetId && productSet.has(item.targetId)) {
      return `/products/${item.targetId}`;
    }
    if (item.targetType === 'article' && item.targetId && articleSet.has(item.targetId)) {
      return `/learn/${item.targetId}`;
    }
    if (item.targetType === 'category' && item.targetId && categorySet.has(item.targetId)) {
      return `/shop?cat=${item.targetId}`;
    }
    if (item.targetType === 'page' && item.targetId && pagePathMap.has(item.targetId)) {
      return pagePathMap.get(item.targetId)!;
    }
    return null;
  };

  const itemMap = new Map<number, any>();
  const roots: any[] = [];

  for (const it of items) {
    const resolvedUrl = resolveUrl(it) ?? it.targetUrl;
    itemMap.set(it.id, {
      ...it,
      title: resolveNavText(it.title),
      metadata: resolveNavMetadata(it.metadata),
      targetUrl: resolvedUrl,
      resolvedUrl,
      children: [],
    });
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
  const filters: SQL[] = [
    eq(glossaryTerm.locale, locale),
    eq(glossaryTerm.status, 'published'),
  ];
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
    .where(and(eq(office.locale, locale), eq(office.status, 'published')))
    .orderBy(asc(office.sort), asc(office.id));
}

export async function findTestimonials(db: DB, locale = 'en') {
  return await db
    .select()
    .from(testimonial)
    .where(and(
      eq(testimonial.locale, locale),
      eq(testimonial.status, 'published'),
      eq(testimonial.permissionFlag, true)
    ))
    .orderBy(asc(testimonial.sort), asc(testimonial.id));
}

// --- 9. Policies Queries (MS4.3 T4.3.3 & T4.3.4: Legal-Approved & Version Retrievable) ---

export async function findPublishedPolicies(db: DB, locale = 'en') {
  const rows = await db
    .select()
    .from(policyDocument)
    .where(
      and(
        eq(policyDocument.locale, locale),
        eq(policyDocument.status, 'published'),
        eq(policyDocument.legalApproved, true)
      )
    )
    .orderBy(asc(policyDocument.slug), desc(policyDocument.version), desc(policyDocument.publishedAt));

  // Deduplicate by slug to ensure only the latest legal-approved version of each policy is returned in the catalogue
  const seen = new Set<string>();
  const latestPolicies = [];
  for (const row of rows) {
    if (!seen.has(row.slug)) {
      seen.add(row.slug);
      latestPolicies.push(row);
    }
  }
  return latestPolicies;
}

export async function findPublishedPolicyBySlug(db: DB, slug: string, locale = 'en', version?: string) {
  // T4.3.3: an explicitly requested older version stays retrievable even
  // after a newer version retires it (archived ≠ deleted).
  const statusCondition = version
    ? or(eq(policyDocument.status, 'published'), eq(policyDocument.status, 'archived'))!
    : eq(policyDocument.status, 'published');
  const baseConditions: SQL[] = [
    eq(policyDocument.slug, slug),
    eq(policyDocument.locale, locale),
    statusCondition,
    eq(policyDocument.legalApproved, true),
  ];
  if (version) {
    baseConditions.push(eq(policyDocument.version, version));
  }

  const rows = await db
    .select()
    .from(policyDocument)
    .where(and(...baseConditions))
    .orderBy(desc(policyDocument.version), desc(policyDocument.publishedAt))
    .limit(1);

  if (!rows[0] && locale !== 'en') {
    const fallbackConditions: SQL[] = [
      eq(policyDocument.slug, slug),
      eq(policyDocument.locale, 'en'),
      eq(policyDocument.status, 'published'),
      eq(policyDocument.legalApproved, true),
    ];
    if (version) {
      fallbackConditions.push(eq(policyDocument.version, version));
    }

    const fallback = await db
      .select()
      .from(policyDocument)
      .where(and(...fallbackConditions))
      .orderBy(desc(policyDocument.version), desc(policyDocument.publishedAt))
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

  // 1. Defaults for every typed group come from the shared schemas only.
  for (const key of SETTINGS_GROUP_KEYS) {
    map[key] = SETTINGS_GROUP_DEFAULTS[key];
  }

  // 2. Overlay persisted values, re-normalised so a partial stored object still
  //    exposes every field with its default (T4.2.1).
  for (const r of rows) {
    if (!PUBLIC_SETTING_KEYS.has(r.key)) continue;
    if (r.key in SETTINGS_GROUP_DEFAULTS) {
      try {
        map[r.key] = normalizeSettingsGroup(r.key as SettingsGroupKey, r.value);
      } catch {
        // A corrupt stored group must not take the whole site down.
        map[r.key] = SETTINGS_GROUP_DEFAULTS[r.key as SettingsGroupKey];
      }
    } else {
      map[r.key] = r.value;
    }
  }

  // 3. Dynamic "N years" computed from the founding year (T4.2.1).
  if (map['site.figures'] && typeof map['site.figures'] === 'object') {
    map['site.figures'] = resolveComputedFigures(map['site.figures'] as any);
  }

  // 4. Integrations are public-safe: rebuild with allowlisted fields only.
  if (map['integrations'] && typeof map['integrations'] === 'object') {
    const integ = map['integrations'] as any;
    map['integrations'] = {
      turnstileSiteKey: String(integ.turnstileSiteKey || '0x4AAAAAAAx'),
      analyticsEnabled: Boolean(integ.analyticsEnabled),
      googleAnalyticsId: String(integ.googleAnalyticsId || ''),
    };
  }

  // 5. WhatsApp always keeps the wa.me/<digits> shape.
  if (map['site.whatsapp'] && typeof map['site.whatsapp'] === 'object') {
    const wa = map['site.whatsapp'] as any;
    const cleanNumber = String(wa.phoneNumber || '').replace(/\D/g, '') || '886226590880';
    map['site.whatsapp'] = {
      ...wa,
      phoneNumber: cleanNumber,
      waUrl: wa.waUrl || `https://wa.me/${cleanNumber}`,
    };
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
        .select({ slug: page.slug, path: page.path, locale: page.locale, updatedAt: page.updatedAt })
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

  const cleanPath = (raw: string) => {
    let value = raw || '/';
    value = value.replace(/\.html?$/i, '');
    if (value === '/index' || value === 'index' || value === '') value = '/';
    if (!value.startsWith('/')) value = `/${value}`;
    return value.replace(/\/{2,}/g, '/');
  };

  const SITEMAP_EXCLUDED = new Set(['/404', '/article', '/product']);

  for (const p of publishedPages) {
    const path = cleanPath(p.path || p.slug);
    if (SITEMAP_EXCLUDED.has(path)) continue;
    // Localised CMS pages are served at /<locale>/<path> by [locale]/[...slug].
    const loc = p.locale === 'en'
      ? path
      : `/${p.locale}${path === '/' ? '' : path}`;
    entries.push({
      loc,
      lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
      locale: p.locale,
    });
  }

  for (const prod of publishedProducts) {
    entries.push({
      loc: `/products/${prod.slug}`,
      lastmod: prod.updatedAt ? new Date(prod.updatedAt).toISOString() : undefined,
      locale: 'en',
    });
  }

  for (const a of publishedArticles) {
    if (a.locale !== 'en') continue;
    entries.push({
      loc: `/learn/${a.slug}`,
      lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
      locale: a.locale,
    });
  }

  for (const n of publishedNews) {
    if (n.locale !== 'en') continue;
    entries.push({
      loc: `/news/${n.slug}`,
      lastmod: n.updatedAt ? new Date(n.updatedAt).toISOString() : undefined,
      locale: n.locale,
    });
  }

  if (!entries.some((e) => e.loc === '/')) {
    entries.unshift({ loc: '/', locale: 'en' });
  }

  // Locale landings exist for all eight non-English locales; they are real
  // routes (/ar, /zh-cn, ...) even before translated CMS content ships.
  for (const code of ['ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de']) {
    if (!entries.some((e) => e.loc === `/${code}`)) {
      entries.push({ loc: `/${code}`, locale: code });
    }
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
      url: `/products/${p.slug}`,
    });
  }
  for (const a of arts) {
    suggestions.push({
      text: a.title,
      type: 'article',
      url: `/learn/${a.slug}`,
    });
  }
  for (const t of terms) {
    suggestions.push({
      text: t.term,
      type: 'glossary',
      url: `/learn-glossary#term-${slugify(t.term)}`,
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

  // 1. Products search (SQL-level querying, Defect Z-22 resolved)
  let prodResults: any[] = [];
  if (!type || type === 'product') {
    const prodConditions: SQL[] = [
      eq(product.status, 'published'),
      isNull(product.deletedAt),
      or(isNull(product.launchDate), lte(product.launchDate, now))!,
    ];
    for (const tok of queryTokens) {
      prodConditions.push(
        or(
          ilike(product.name, `%${tok}%`),
          ilike(product.description, `%${tok}%`),
          ilike(product.shortSpec, `%${tok}%`)
        )!
      );
    }

    const prods = await db
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
      .where(and(...prodConditions))
      .limit(50);

    prodResults = prods.map((p) => ({
      type: 'product',
      id: p.id,
      title: p.name,
      slug: p.slug,
      url: `/products/${p.slug}`,
      snippet: p.shortSpec || (p.description ? p.description.slice(0, 160) : ''),
      badge: p.warranty || 'Product',
      locale: 'en',
    }));
  }

  // 2. Articles search (SQL-level querying, Defect Z-22 resolved)
  let artResults: any[] = [];
  if (!type || type === 'article') {
    const artConditions: SQL[] = [
      eq(article.status, 'published'),
      eq(article.locale, locale),
      isNull(article.deletedAt),
      or(isNull(article.publishAt), lte(article.publishAt, now))!,
    ];
    for (const tok of queryTokens) {
      artConditions.push(
        or(
          ilike(article.title, `%${tok}%`),
          ilike(article.deck, `%${tok}%`),
          ilike(article.body, `%${tok}%`)
        )!
      );
    }

    const arts = await db
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
      .where(and(...artConditions))
      .limit(50);

    artResults = arts.map((a) => ({
      type: 'article',
      id: a.id,
      title: a.title,
      slug: a.slug,
      url: `/learn/${a.slug}`,
      snippet: a.deck || (a.body ? a.body.slice(0, 160) : ''),
      badge: a.category || 'Article',
      category: a.category,
      locale: a.locale,
    }));
  }

  // 3. Glossary search (SQL-level querying, Defect Z-22 resolved)
  let glossaryResults: any[] = [];
  if (!type || type === 'glossary') {
    const glossConditions: SQL[] = [
      eq(glossaryTerm.locale, locale),
    ];
    for (const tok of queryTokens) {
      glossConditions.push(
        or(
          ilike(glossaryTerm.term, `%${tok}%`),
          ilike(glossaryTerm.definition, `%${tok}%`)
        )!
      );
    }

    const terms = await db
      .select()
      .from(glossaryTerm)
      .where(and(...glossConditions))
      .limit(50);

    glossaryResults = terms.map((t) => ({
      type: 'glossary',
      id: t.id,
      title: t.term,
      slug: t.term,
      url: `/learn-glossary#term-${slugify(t.term)}`,
      snippet: t.definition.slice(0, 160),
      badge: 'Glossary',
      locale: t.locale,
    }));
  }

  // 4. Pages search (SQL-level querying, Defect Z-22 resolved)
  let pageResults: any[] = [];
  if (!type || type === 'page') {
    const pageConditions: SQL[] = [
      eq(page.status, 'published'),
      eq(page.locale, locale),
      isNull(page.deletedAt),
      or(isNull(page.publishedAt), lte(page.publishedAt, now))!,
    ];
    for (const tok of queryTokens) {
      pageConditions.push(
        or(
          ilike(page.title, `%${tok}%`),
          ilike(page.seoDescription, `%${tok}%`)
        )!
      );
    }

    const pages = await db
      .select({
        id: page.id,
        title: page.title,
        slug: page.slug,
        path: page.path,
        seoDescription: page.seoDescription,
        locale: page.locale,
      })
      .from(page)
      .where(and(...pageConditions))
      .limit(50);

    pageResults = pages.map((p) => ({
      type: 'page',
      id: p.id,
      title: p.title,
      slug: p.slug,
      url: p.path ? p.path.replace(/\.html?$/i, '') : `/${p.slug}`,
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

// --- 15. Directory, Jobs & Catalogue Extensions (MS4.5) ---

export async function findDistributors(db: DB, filters: { region?: string; status?: string; country?: string } = {}) {
  const targetStatus = filters.status || 'authorized';
  const conditions: SQL[] = [eq(distributor.status, targetStatus)];
  if (filters.region) conditions.push(eq(distributor.region, filters.region));
  if (filters.country) conditions.push(ilike(distributor.country, `%${filters.country}%`));

  return await db
    .select()
    .from(distributor)
    .where(and(...conditions))
    .orderBy(asc(distributor.sort), asc(distributor.name));
}

export async function findMarketplaces(db: DB, country?: string) {
  const conditions: SQL[] = [];
  if (country) conditions.push(ilike(marketplaceListing.country, `%${country}%`));

  return await db
    .select()
    .from(marketplaceListing)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(marketplaceListing.sort), asc(marketplaceListing.platform));
}

export async function findPublishedJobs(db: DB, dept?: string) {
  const conditions: SQL[] = [eq(jobPosting.status, 'published'), isNull(jobPosting.deletedAt)];
  if (dept) conditions.push(eq(jobPosting.dept, dept));

  return await db
    .select()
    .from(jobPosting)
    .where(and(...conditions))
    .orderBy(desc(jobPosting.createdAt));
}

export async function findPublishedJobById(db: DB, id: number) {
  const rows = await db
    .select()
    .from(jobPosting)
    .where(and(eq(jobPosting.id, id), eq(jobPosting.status, 'published'), isNull(jobPosting.deletedAt)))
    .limit(1);
  return rows[0] || null;
}

export async function findSpecDictionary(db: DB, categoryId?: number) {
  const conditions: SQL[] = [];
  if (categoryId) conditions.push(eq(specDictionary.categoryId, categoryId));

  return await db
    .select()
    .from(specDictionary)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(specDictionary.key));
}

export async function findSpecTemplates(db: DB, categoryId?: number) {
  const conditions: SQL[] = [];
  if (categoryId) conditions.push(eq(specTemplate.categoryId, categoryId));

  return await db
    .select()
    .from(specTemplate)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(specTemplate.name));
}

/**
 * T4.7.5 locale activation gate: a locale is active only when its required
 * set (common strings + translated menus) is complete AND the row is flagged
 * active. English is always served.
 */
export async function findActiveLocales(db: DB) {
  const { locale: localeTable, translation: translationTable, navMenu, page: pageTable } = await import('@twinmos/db');
  const [rows, enPages] = await Promise.all([
    db.select().from(localeTable),
    db.select({ id: pageTable.id }).from(pageTable).where(and(eq(pageTable.locale, 'en'), eq(pageTable.status, 'published'))),
  ]);
  const locales = [];
  for (const row of rows) {
    if (row.code === 'en') { locales.push({ ...row, complete: true, active: true }); continue; }
    const strings = await db.select({ id: translationTable.id })
      .from(translationTable)
      .where(and(eq(translationTable.locale, row.code), eq(translationTable.ns, 'common')));
    const translatedMenus = await db.select({ code: navMenu.code }).from(navMenu).where(eq(navMenu.locale, row.code));
    const complete = enPages.length === 0 || (strings.length >= 8 && translatedMenus.length >= 3);
    locales.push({ ...row, complete, active: row.active && complete });
  }
  return locales;
}

export async function findDeviceTypeLabels(db: DB) {
  return await db.select().from(deviceTypeLabel).orderBy(asc(deviceTypeLabel.sort));
}

