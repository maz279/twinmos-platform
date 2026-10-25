/**
 * Seed CMS Error Pages (T5.2.2 / MS5.2)
 * Ensures 404, 410, 500, and maintenance exist as CMS records in the database.
 */
import { createDb } from './db-bridge.ts';
import { page as pageTable } from '../packages/db/src/schema.ts';
import { eq, and } from 'drizzle-orm';

const errorPages = [
  {
    slug: '404',
    title: 'Page not found — TwinMOS',
    seoTitle: 'Page not found — TwinMOS',
    seoDescription: '404 — page not found.',
    path: '/404.html',
    template: '404',
    noindex: true,
    blocks: [
      {
        id: '404-block-1',
        type: 'error-hero',
        title: 'This page went out of stock',
        heading: 'This page went out of stock',
        eyebrow: '404 Error',
        lede: 'The address you followed does not exist. Everything else, though, is very much in stock.',
        component: 'div.wrap',
        ctas: [
          { label: 'Back to home', url: '/', variant: 'primary' },
          { label: 'Browse products', url: '/shop', variant: 'secondary' },
          { label: 'Try a search', url: '/search?q=ddr5', variant: 'ghost' },
        ],
      },
    ],
  },
  {
    slug: '410',
    title: 'Resource Gone — TwinMOS',
    seoTitle: 'Resource Gone — TwinMOS',
    seoDescription: '410 — resource permanently removed.',
    path: '/410.html',
    template: '410',
    noindex: true,
    blocks: [
      {
        id: '410-block-1',
        type: 'error-hero',
        title: 'This resource is no longer available',
        heading: 'This resource is no longer available',
        eyebrow: '410 Gone',
        lede: 'This product, specification, or document has reached end-of-life and has been permanently removed from our active catalog.',
        component: 'div.wrap',
        ctas: [
          { label: 'View active catalog', url: '/shop', variant: 'primary' },
          { label: 'EOL Product List', url: '/legal#eol', variant: 'secondary' },
          { label: 'Contact support', url: '/support', variant: 'ghost' },
        ],
      },
    ],
  },
  {
    slug: '500',
    title: 'Internal Server Error — TwinMOS',
    seoTitle: 'Internal Server Error — TwinMOS',
    seoDescription: '500 — internal server error.',
    path: '/500.html',
    template: '500',
    noindex: true,
    blocks: [
      {
        id: '500-block-1',
        type: 'error-hero',
        title: 'Something went wrong on our end',
        heading: 'Something went wrong on our end',
        eyebrow: '500 Server Error',
        lede: 'An unexpected server error occurred while processing your request. Please reload the page or return home.',
        component: 'div.wrap',
        ctas: [
          { label: 'Back to home', url: '/', variant: 'primary' },
          { label: 'Browse products', url: '/shop', variant: 'secondary' },
          { label: 'System status & support', url: '/support', variant: 'ghost' },
        ],
      },
    ],
  },
  {
    slug: 'maintenance',
    title: 'Scheduled Maintenance — TwinMOS',
    seoTitle: 'Scheduled Maintenance — TwinMOS',
    seoDescription: '503 — scheduled maintenance.',
    path: '/maintenance.html',
    template: 'maintenance',
    noindex: true,
    blocks: [
      {
        id: 'maintenance-block-1',
        type: 'error-hero',
        title: 'We will be right back',
        heading: 'We will be right back',
        eyebrow: 'System Maintenance',
        lede: 'Our systems are undergoing scheduled maintenance and upgrades. We apologize for the inconvenience and expect to be back online shortly.',
        component: 'div.wrap',
        ctas: [
          { label: 'Check status', url: '/support', variant: 'primary' },
          { label: 'Emergency support', url: 'mailto:support@twinmos.com', variant: 'secondary' },
        ],
      },
    ],
  },
];

async function main() {
  console.log('[seed-error-pages] Seeding CMS error and maintenance records (T5.2.2)...');
  const db = createDb();

  for (const pageData of errorPages) {
    const existing = await db.query.page.findFirst({
      where: and(eq(pageTable.slug, pageData.slug), eq(pageTable.locale, 'en')),
    });

    if (existing) {
      await db.update(pageTable).set({
        title: pageData.title,
        seoTitle: pageData.seoTitle,
        seoDescription: pageData.seoDescription,
        path: pageData.path,
        template: pageData.template,
        noindex: pageData.noindex,
        blocks: pageData.blocks as any,
        status: 'published',
        updatedAt: new Date(),
      }).where(eq(pageTable.id, existing.id));
      console.log(`[seed-error-pages] Updated existing page record for slug "${pageData.slug}" (ID ${existing.id}).`);
    } else {
      const [inserted] = await db.insert(pageTable).values({
        slug: pageData.slug,
        locale: 'en',
        title: pageData.title,
        seoTitle: pageData.seoTitle,
        seoDescription: pageData.seoDescription,
        path: pageData.path,
        template: pageData.template,
        noindex: pageData.noindex,
        blocks: pageData.blocks as any,
        status: 'published',
        publishedAt: new Date(),
        source: 'Content ownership matrix (PROC-05)',
        approver: 'Victoria Sterling',
      }).returning();
      console.log(`[seed-error-pages] Inserted new page record for slug "${pageData.slug}" (ID ${inserted.id}).`);
    }
  }

  console.log('[seed-error-pages] Done. All 4 error pages seeded into database.');
}

main().catch((err) => {
  console.error('[seed-error-pages] Error:', err);
  process.exit(1);
});
