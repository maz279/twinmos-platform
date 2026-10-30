// Prototype navigation menus importer (Roadmap MS4.2 · T4.2.3/T4.2.4 / C2a / Z-15)
//
// Imports the exact 84 (header) + 56 (drawer) + 39 (footer) = 179 authentic
// anchors from the tracked prototype. Zero invented links.
//
// Tree model:
//   header  : 6 roots -> 16 mega-column group nodes -> 65 column links,
//             plus 6 feature links and 7 "all" links (84 hrefs, 100 rows)
//   drawer  : Home + 6 group toggles (the prototype's href="#") + 47 submenu
//             links + Compare + Quote (56 anchors: 50 hrefs + 6 groups)
//   footer  : Social (6), Products (11), Company (7), Support (11),
//             Contact (1) and Legal bar (3) groups (39 hrefs, 45 rows)
//
// Product/article/category hrefs become typed references when the entity
// exists in the CMS; otherwise they stay validated canonical URLs. Numeric
// product counts inside labels become {{products}} tokens resolved at
// delivery time from site.figures.productCount.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { createDb, navMenu, navItem, product as productTable, article as articleTable, category as categoryTable } from '@twinmos/db';
import { eq, and } from 'drizzle-orm';
import { recordOutboxEvent } from '../src/services/outbox.ts';
import { ensurePrototypeArticles } from './prototype-articles.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROTOTYPE_PATHS = [
  // Tracked copy in the repository root — portable across machines/CI.
  resolve(HERE, '../../../prototype/index.html'),
  // Authoring copy kept next to the project folder on the original workstation.
  resolve(HERE, '../../../../Corporate website development for TwinMOS/Features/prototype/index.html'),
  'C:/Software_Project/TwinMOS_Corporate_Website/Corporate website development for TwinMOS/Features/prototype/index.html',
];

const MENU_CODES = ['header', 'drawer', 'footer', 'legal'] as const;

type Target = {
  targetType: 'url' | 'page' | 'category' | 'product' | 'article';
  targetUrl: string | null;
  targetId: string | null;
};

function findPrototypePath(): string {
  for (const candidate of PROTOTYPE_PATHS) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    `Prototype index.html not found. Looked in:\n${PROTOTYPE_PATHS.map((p) => `  - ${p}`).join('\n')}`,
  );
}

const N = (s: string | null | undefined) => String(s || '').replace(/\s+/g, ' ').trim();

/** Counts in nav labels are computed from site.figures at delivery time. */
function withCountToken(label: string): { title: string; metadata: Record<string, unknown> } {
  if (/\b\d+\s+products?\b/i.test(label)) {
    return {
      title: label.replace(/\b\d+\s+(products?)\b/i, '{{products}} $1'),
      metadata: { countKey: 'products' },
    };
  }
  return { title: label, metadata: {} };
}

/** Strip legacy .html aliases so stored nav targets are the canonical routes. */
function cleanInternalUrl(url: string): string {
  const m = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  let path = m?.[1] ?? url;
  if (/\/index\.html$/i.test(path)) path = path.replace(/\/index\.html$/i, '/');
  else path = path.replace(/\.html$/i, '');
  if (!path) path = '/';
  return `${path}${m?.[2] ?? ''}${m?.[3] ?? ''}`;
}

/** Prototype-relative href -> absolute site path (validated at write time). */
function absoluteInternal(href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  const absolute = href.startsWith('/') ? href : `/${href.replace(/^\.\//, '')}`;
  return cleanInternalUrl(absolute);
}

function slugFromHref(href: string, marker: string): string | null {
  const idx = href.indexOf(marker);
  if (idx === -1) return null;
  const raw = href.slice(idx + marker.length).split(/[&#]/)[0];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function importPrototypeMenus(db = createDb()) {
  const prototypePath = findPrototypePath();
  const html = readFileSync(prototypePath, 'utf8');
  const doc = new JSDOM(html).window.document;

  const productSlugs = new Set(
    (await db.select({ slug: productTable.slug }).from(productTable)).map((r: any) => r.slug),
  );
  // Nav-referenced Knowledge Hub articles must exist so every target resolves.
  const navArticleSlugs = [
    ...new Set(
      [...doc.querySelectorAll('header .nav a, #drawer a, footer a')]
        .map((a) => slugFromHref(N(a.getAttribute('href')), 'article.html?id='))
        .filter(Boolean) as string[],
    ),
  ];
  const seededArticles = await ensurePrototypeArticles(db, navArticleSlugs);
  if (seededArticles.length > 0) {
    console.log(`[import-menus] Seeded ${seededArticles.length} referenced article(s): ${seededArticles.join(', ')}`);
  }
  const articleSlugs = new Set(
    (await db.select({ slug: articleTable.slug }).from(articleTable)).map((r: any) => r.slug),
  );
  const categorySlugs = new Set(
    (await db.select({ slug: categoryTable.slug }).from(categoryTable)).map((r: any) => r.slug),
  );

  function makeTarget(href: string | null): Target {
    const raw = N(href);
    if (!raw || raw === '#') return { targetType: 'url', targetUrl: null, targetId: null };

    if (/^https?:\/\//i.test(raw)) {
      return { targetType: 'url', targetUrl: raw, targetId: null };
    }

    const productSlug = slugFromHref(raw, 'product.html?id=');
    if (productSlug) {
      const url = `/products/${productSlug}`;
      return productSlugs.has(productSlug)
        ? { targetType: 'product', targetUrl: url, targetId: productSlug }
        : { targetType: 'url', targetUrl: url, targetId: null };
    }

    const articleSlug = slugFromHref(raw, 'article.html?id=');
    if (articleSlug) {
      const url = `/learn/${articleSlug}`;
      return articleSlugs.has(articleSlug)
        ? { targetType: 'article', targetUrl: url, targetId: articleSlug }
        : { targetType: 'url', targetUrl: url, targetId: null };
    }

    const categorySlug = slugFromHref(raw, 'shop.html?cat=');
    if (categorySlug) {
      const url = `/shop?cat=${categorySlug}`;
      return categorySlugs.has(categorySlug)
        ? { targetType: 'category', targetUrl: url, targetId: categorySlug }
        : { targetType: 'url', targetUrl: url, targetId: null };
    }

    return { targetType: 'url', targetUrl: absoluteInternal(raw), targetId: null };
  }

  // ---- Collect the authoritative prototype anchors ----
  const megaAnchors = [...doc.querySelectorAll('header .nav a')];
  const drawerAnchors = [...doc.querySelectorAll('#drawer a')];
  const footerAnchors = [...doc.querySelectorAll('footer a')];
  const totalAnchors = megaAnchors.length + drawerAnchors.length + footerAnchors.length;
  console.log(
    `[import-menus] Found ${megaAnchors.length} mega anchors, ${drawerAnchors.length} drawer anchors, ${footerAnchors.length} footer anchors.`,
  );
  if (totalAnchors !== 179) {
    throw new Error(`Expected exactly 179 anchors (84 + 56 + 39), got ${totalAnchors}`);
  }

  // Remove any previous import (including the old invented `legal` menu) so a
  // re-import is deterministic and no hand-written rows survive.
  for (const code of MENU_CODES) {
    await db.delete(navMenu).where(and(eq(navMenu.code, code), eq(navMenu.locale, 'en')));
  }

  const insertMenu = async (code: string, title: string) => {
    const [row] = await db.insert(navMenu).values({ code, title, locale: 'en' }).returning();
    return row;
  };

  let linkCount = 0;
  let groupCount = 0;
  let rowCount = 0;

  async function insertRow(values: any) {
    const [row] = await db.insert(navItem).values(values).returning();
    rowCount++;
    if (values.targetUrl) linkCount++;
    if (!values.targetUrl) groupCount++;
    return row;
  }

  // ---- Header: a real mega-menu tree ----
  const headerMenu = await insertMenu('header', 'Header Mega Menu');
  let megaSort = 0;
  for (const li of doc.querySelectorAll('header .nav > li')) {
    const top = li.querySelector(':scope > a');
    if (!top) continue;
    const topTarget = makeTarget(top.getAttribute('href'));
    const topLabel = withCountToken(N(top.childNodes[0]?.textContent).replace(/\s*▾\s*$/, ''));

    const topItem = await insertRow({
      menuId: headerMenu.id,
      title: topLabel.title,
      ...topTarget,
      sort: megaSort++,
      metadata: { kind: 'top_level', ...topLabel.metadata },
    });

    let colSort = 0;
    for (const col of li.querySelectorAll('.mega-col')) {
      const colTitle = N(col.querySelector('h4')?.textContent);
      const colItem = await insertRow({
        menuId: headerMenu.id,
        parentId: topItem.id,
        title: colTitle,
        targetType: 'url',
        targetUrl: null,
        targetId: null,
        sort: colSort++,
        metadata: { kind: 'column' },
      });

      let itemSort = 0;
      for (const a of col.querySelectorAll('a')) {
        const label = withCountToken(N(a.textContent).replace(/\s*▾\s*$/, ''));
        const emphasis = (a.getAttribute('style') || '').includes('accent-deep');
        await insertRow({
          menuId: headerMenu.id,
          parentId: colItem.id,
          title: label.title,
          ...makeTarget(a.getAttribute('href')),
          sort: itemSort++,
          metadata: { kind: 'link', ...(emphasis ? { emphasis: true } : {}), ...label.metadata },
        });
      }
    }

    const feature = li.querySelector('.mega-feature');
    if (feature) {
      const heading = N((feature.querySelector('b') || feature.querySelector('span'))?.textContent);
      const description = N(feature.querySelector('span')?.textContent);
      const featureImage = feature.querySelector('img');
      const featureLink = feature.querySelector('a');
      if (featureLink) {
        const label = withCountToken(N(featureLink.textContent).replace(/\s*▾\s*$/, ''));
        await insertRow({
          menuId: headerMenu.id,
          parentId: topItem.id,
          title: label.title,
          ...makeTarget(featureLink.getAttribute('href')),
          sort: colSort++,
          metadata: {
            kind: 'feature_panel',
            heading,
            description,
            image: featureImage?.getAttribute('src') || null,
            imageAlt: featureImage?.getAttribute('alt') || '',
            ...label.metadata,
          },
        });
      }
    }

    for (const a of li.querySelectorAll('.mega-all a')) {
      const label = withCountToken(N(a.textContent).replace(/\s*▾\s*$/, ''));
      await insertRow({
        menuId: headerMenu.id,
        parentId: topItem.id,
        title: label.title,
        ...makeTarget(a.getAttribute('href')),
        sort: colSort++,
        metadata: { kind: 'all_row', ...label.metadata },
      });
    }
  }

  // ---- Drawer: group toggles with their submenu links ----
  const drawerMenu = await insertMenu('drawer', 'Mobile Drawer Menu');
  const drawerPanel: Element | null =
    doc.querySelector('#drawer .drawer-panel') || doc.querySelector('#drawer');
  let drawerSort = 0;
  let drawerGroups = 0;

  for (const child of [...(drawerPanel?.children ?? [])]) {
    if (child.tagName !== 'A') continue;
    const anchor = child as HTMLAnchorElement;
    const rawHref = N(anchor.getAttribute('href'));
    const label = withCountToken(N(anchor.textContent).replace(/\s*▾\s*$/, ''));

    if (rawHref === '#' || rawHref === '') {
      // A group toggle is a UI affordance, not a destination: store it as a
      // group node so no nav target is an empty "#" link.
      const groupItem = await insertRow({
        menuId: drawerMenu.id,
        title: label.title,
        targetType: 'url',
        targetUrl: null,
        targetId: null,
        sort: drawerSort++,
        metadata: { kind: 'drawer_group', ...label.metadata },
      });
      drawerGroups++;

      const submenu = anchor.nextElementSibling;
      if (submenu && submenu.classList.contains('drawer-sub')) {
        let subSort = 0;
        for (const sub of [...submenu.querySelectorAll('a')]) {
          const subLabel = withCountToken(N(sub.textContent).replace(/\s*▾\s*$/, ''));
          await insertRow({
            menuId: drawerMenu.id,
            parentId: groupItem.id,
            title: subLabel.title,
            ...makeTarget(sub.getAttribute('href')),
            sort: subSort++,
            metadata: { kind: 'drawer_link', ...subLabel.metadata },
          });
        }
      }
      continue;
    }

    await insertRow({
      menuId: drawerMenu.id,
      title: label.title,
      ...makeTarget(rawHref),
      sort: drawerSort++,
      metadata: { kind: 'drawer_link', ...label.metadata },
    });
  }

  // ---- Footer: columns, social, contact and legal bar ----
  const footerMenu = await insertMenu('footer', 'Footer Menu');
  const footerGrid = doc.querySelector('footer .footer-grid');
  let footerSort = 0;

  const addGroupWithLinks = async (
    title: string,
    kind: string,
    anchors: Element[],
    parentId: number | null = null,
  ) => {
    const group = await insertRow({
      menuId: footerMenu.id,
      parentId,
      title,
      targetType: 'url',
      targetUrl: null,
      targetId: null,
      sort: footerSort++,
      metadata: { kind },
    });
    let sort = 0;
    for (const a of anchors) {
      const label = withCountToken(N(a.textContent).replace(/\s*▾\s*$/, ''));
      await insertRow({
        menuId: footerMenu.id,
        parentId: group.id,
        title: label.title,
        ...makeTarget(a.getAttribute('href')),
        sort: sort++,
        metadata: { kind: 'footer_link', ...label.metadata },
      });
    }
  };

  for (const child of [...(footerGrid?.children ?? [])]) {
    const socialAnchors = child.querySelectorAll('.social-row a');
    if (socialAnchors.length > 0) {
      await addGroupWithLinks('Social', 'social', [...socialAnchors]);
      continue;
    }

    const heading = N(child.querySelector('h4')?.textContent);
    if (child.classList.contains('footer-contact')) {
      // The contact column's <h4> is the company wordmark, not a menu title.
      await addGroupWithLinks('Contact', 'contact', [...child.querySelectorAll('a')]);
      continue;
    }

    if (heading) {
      const directAnchors = [...child.querySelectorAll(':scope > a')];
      if (directAnchors.length > 0) {
        await addGroupWithLinks(heading, 'column', directAnchors);
      }
    }
  }

  const legalBar = doc.querySelector('footer .footer-bar');
  if (legalBar) {
    await addGroupWithLinks('Legal', 'legal_bar', [...legalBar.querySelectorAll('a')]);
  }

  const expected = { mega: 84, drawer: 56, footer: 39 };
  const megaLinks = (await db.select().from(navItem).where(eq(navItem.menuId, headerMenu.id))).filter(
    (i: any) => i.targetUrl,
  ).length;
  const drawerRows = await db.select().from(navItem).where(eq(navItem.menuId, drawerMenu.id));
  const footerRows = await db.select().from(navItem).where(eq(navItem.menuId, footerMenu.id));
  const drawerLinks = drawerRows.filter((i: any) => i.targetUrl).length;
  const footerLinks = footerRows.filter((i: any) => i.targetUrl).length;

  if (megaLinks !== expected.mega || drawerRows.length !== expected.drawer || footerLinks !== expected.footer) {
    throw new Error(
      `Import mismatch: header ${megaLinks}/84, drawer rows ${drawerRows.length}/56, footer ${footerLinks}/39`,
    );
  }

  try {
    await recordOutboxEvent(db, 'nav.import', {
      action: 'import',
      totalLinks: 179,
      megaLinks,
      drawerLinks,
      drawerRows: drawerRows.length,
      drawerGroups,
      footerLinks,
      footerRows: footerRows.length,
      rows: rowCount,
      tags: ['nav', 'menus'],
    });
  } catch {}

  console.log(
    `[import-menus] Imported ${totalAnchors} prototype anchors: ${linkCount} links + ${groupCount} group nodes (${rowCount} rows).`,
  );
  return {
    total: totalAnchors,
    mega: megaLinks,
    drawer: drawerRows.length,
    footer: footerLinks,
    links: linkCount,
    groups: groupCount,
    rows: rowCount,
    drawerToggles: drawerGroups,
  };
}

// Direct execution CLI support
if (process.argv[1]?.endsWith('import-prototype-menus.ts')) {
  importPrototypeMenus()
    .then((res) => {
      console.log('Result:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Import failed:', err);
      process.exit(1);
    });
}
