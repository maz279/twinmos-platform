// 25-block framework v2 (Tasks C4a..C4e, ADR D-4)
import { z } from 'zod';

export const BLOCK_TYPES = [
  // Core (C4b)
  'hero',
  'slider',
  'statsCounter',
  'featureGrid',
  'bentoGrid',
  'ctaBanner',
  'splitCta',
  'timeline',
  'textMedia',
  // Structured & Data (C4c)
  'faqAccordion',
  'table',
  'productShowcase',
  'specComparison',
  'whereToBuy',
  'downloadDatasheet',
  'qvlCompatibility',
  'testimonial',
  // UI Components (C4d)
  'badgeStrip',
  'steps',
  'kpiMeters',
  'callout',
  'linkChips',
  'anchorNav',
  'categoryTiles',
  // Entity-bound (C4e)
  'policyTabs',
  'form',
  'officeCards',
  'articleList',
  'glossaryIndex',
  'appEmbed',
] as const;

export const BLOCK_TYPE_SCHEMA = z.enum(BLOCK_TYPES);
export type BlockType = (typeof BLOCK_TYPES)[number];

// 1. Hero Block
export const heroBlockSchema = z.object({
  type: z.literal('hero'),
  eyebrow: z.string().optional(),
  title: z.string().min(1, 'Hero title is required'), // Supports {logo} token
  lede: z.string().optional(),
  chips: z.array(z.string()).default([]),
  trustStats: z.array(z.object({
    value: z.string(),
    label: z.string(),
    sub: z.string().optional(),
  })).default([]),
  jumpLinks: z.array(z.object({
    label: z.string(),
    targetId: z.string(),
  })).default([]),
  ctas: z.array(z.object({
    label: z.string(),
    url: z.string(),
    variant: z.enum(['primary', 'secondary', 'ghost', 'outline']).default('primary'),
  })).default([]),
  searchForm: z.boolean().default(false),
  bgMedia: z.object({
    key: z.string(),
    alt: z.string().default(''),
    kind: z.enum(['image', 'video']).default('image'),
  }).optional(),
});

// 2. Slider Block
export const sliderBlockSchema = z.object({
  type: z.literal('slider'),
  slides: z.array(z.object({
    image: z.string(),
    alt: z.string().min(1, 'Image alt text is mandatory'),
    title: z.string(),
    kicker: z.string().optional(),
    accent: z.string().optional(),
    cta: z.string().optional(),
    link: z.string().optional(),
    lede: z.string().optional(),
    ctas: z.array(z.object({
      label: z.string(),
      url: z.string(),
      variant: z.enum(['primary', 'secondary', 'ghost', 'outline']).default('primary').optional(),
    })).optional(),
  })).min(1, 'At least one slide is required'),
  autoplay: z.boolean().default(true),
  pauseControl: z.boolean().default(true),
  intervalMs: z.number().int().min(2000).max(15000).default(5000),
});

// 3. Stats Counter Block
export const statsCounterBlockSchema = z.object({
  type: z.literal('statsCounter'),
  title: z.string().optional(),
  stats: z.array(z.object({
    value: z.string(),
    label: z.string(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    note: z.string().optional(),
  })).min(1),
  columns: z.number().int().min(1).max(6).default(4),
});

// 4. Feature Grid Block
export const featureGridBlockSchema = z.object({
  type: z.literal('featureGrid'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(z.object({
    icon: z.string().optional(),
    title: z.string(),
    description: z.string(),
    badge: z.string().optional(),
    link: z.string().optional(),
  })),
  columns: z.number().int().min(2).max(4).default(3),
  variant: z.enum(['cards', 'minimal', 'bordered']).default('cards'),
});

// 5. Bento Grid Block
export const bentoGridBlockSchema = z.object({
  type: z.literal('bentoGrid'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(z.object({
    title: z.string(),
    description: z.string(),
    size: z.enum(['small', 'medium', 'large', 'tall', 'wide']).default('medium'),
    image: z.string().optional(),
    alt: z.string().optional(),
    badge: z.string().optional(),
    stat: z.string().optional(),
    cta: z.object({
      label: z.string(),
      url: z.string(),
    }).optional(),
  })),
});

// 6. CTA Banner Block
export const ctaBannerBlockSchema = z.object({
  type: z.literal('ctaBanner'),
  title: z.string(),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  ctas: z.array(z.object({
    label: z.string(),
    url: z.string(),
    variant: z.enum(['primary', 'secondary', 'outline']).default('primary'),
  })).min(1),
  variant: z.enum(['boxed', 'fullwidth', 'gradient', 'dark']).default('boxed'),
  bgMedia: z.string().optional(),
});

// 7. Split CTA Block
export const splitCtaBlockSchema = z.object({
  type: z.literal('splitCta'),
  left: z.object({
    title: z.string(),
    description: z.string(),
    ctaText: z.string(),
    ctaUrl: z.string(),
  }),
  right: z.object({
    title: z.string(),
    description: z.string(),
    ctaText: z.string(),
    ctaUrl: z.string(),
  }),
  dividerText: z.string().optional(),
});

// 8. Timeline Block
export const timelineBlockSchema = z.object({
  type: z.literal('timeline'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  milestones: z.array(z.object({
    year: z.string(),
    date: z.string().optional(),
    title: z.string(),
    description: z.string(),
    badge: z.string().optional(),
    image: z.string().optional(),
    alt: z.string().optional(),
  })),
});

// 9. Text Media Block
export const textMediaBlockSchema = z.object({
  type: z.literal('textMedia'),
  title: z.string().optional(),
  eyebrow: z.string().optional(),
  body: z.string().min(1, 'Body content is required'),
  mediaPosition: z.enum(['left', 'right', 'top', 'bottom']).default('right'),
  media: z.object({
    key: z.string(),
    alt: z.string().min(1, 'Media alt text is mandatory'),
    kind: z.enum(['image', 'video']).default('image'),
    caption: z.string().optional(),
  }).optional(),
  quote: z.object({
    text: z.string(),
    author: z.string().optional(),
  }).optional(),
});

// 10. FAQ Accordion Block
export const faqAccordionBlockSchema = z.object({
  type: z.literal('faqAccordion'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  groupKey: z.string().optional(), // If bound to entity
  tabsMode: z.boolean().default(false),
  items: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).default([]),
});

// 11. Table Block
export const tableBlockSchema = z.object({
  type: z.literal('table'),
  title: z.string().optional(),
  caption: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  isSpecTable: z.boolean().default(false),
  compareHighlight: z.number().optional(),
});

// 12. Product Showcase Block
export const productShowcaseBlockSchema = z.object({
  type: z.literal('productShowcase'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  query: z.object({
    categoryId: z.number().optional(),
    brandId: z.number().optional(),
    featured: z.boolean().optional(),
    limit: z.number().int().min(1).max(24).default(8),
    skus: z.array(z.string()).optional(),
  }).default({ limit: 8 }),
  tabs: z.array(z.object({
    label: z.string(),
    categoryId: z.number(),
  })).optional(),
  layout: z.enum(['grid', 'carousel']).default('grid'),
});

// 12b. Spec Comparison Block
export const specComparisonBlockSchema = z.object({
  type: z.literal('specComparison'),
  headline: z.string().optional(),
  title: z.string().optional(),
  columns: z.array(z.object({
    name: z.string(),
  })).default([]),
  rows: z.array(z.object({
    label: z.string(),
    values: z.string().default(''),
  })).default([]),
  version: z.number().int().default(1).optional(),
});

// 13. Where To Buy Block
export const whereToBuyBlockSchema = z.object({
  type: z.literal('whereToBuy'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  showDistributors: z.boolean().default(true),
  showMarketplaces: z.boolean().default(true),
  defaultRegion: z.string().default('Middle East'),
});

// 14. Download Datasheet Block
export const downloadDatasheetBlockSchema = z.object({
  type: z.literal('downloadDatasheet'),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  skus: z.array(z.string()).optional(),
  files: z.array(z.object({
    title: z.string(),
    sku: z.string().optional(),
    fileKey: z.string(),
    size: z.string().optional(),
    format: z.string().default('PDF'),
  })).default([]),
});

// 15. QVL Compatibility Block
export const qvlCompatibilityBlockSchema = z.object({
  type: z.literal('qvlCompatibility'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  defaultDeviceType: z.enum(['laptop', 'desktop', 'motherboard', 'server']).default('laptop'),
  showFinder: z.boolean().default(true),
});

// 16. Testimonial Block
export const testimonialBlockSchema = z.object({
  type: z.literal('testimonial'),
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  footnote: z.string().optional(),
  permissionFlag: z.boolean().default(true),
});

// 17. Badge Strip Block
export const badgeStripBlockSchema = z.object({
  type: z.literal('badgeStrip'),
  badges: z.array(z.object({
    icon: z.string().optional(),
    label: z.string(),
    description: z.string().optional(),
    link: z.string().optional(),
  })),
  layout: z.enum(['row', 'wrap']).default('wrap'),
});

// 18. Steps Block
export const stepsBlockSchema = z.object({
  type: z.literal('steps'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  steps: z.array(z.object({
    stepNumber: z.number().int(),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
  })),
});

// 19. KPI Meters Block
export const kpiMetersBlockSchema = z.object({
  type: z.literal('kpiMeters'),
  title: z.string().optional(),
  kpis: z.array(z.object({
    label: z.string(),
    current: z.number(),
    max: z.number(),
    unit: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['optimal', 'warning', 'critical', 'neutral']).default('optimal'),
  })),
});

// 20. Callout Block
export const calloutBlockSchema = z.object({
  type: z.literal('callout'),
  title: z.string().optional(),
  message: z.string(),
  variant: z.enum(['info', 'warning', 'success', 'tip']).default('info'),
  icon: z.string().optional(),
  cta: z.object({
    label: z.string(),
    url: z.string(),
  }).optional(),
});

// 21. Link Chips Block
export const linkChipsBlockSchema = z.object({
  type: z.literal('linkChips'),
  title: z.string().optional(),
  chips: z.array(z.object({
    label: z.string(),
    url: z.string(),
    anchor: z.string().optional(),
    isExternal: z.boolean().default(false),
    icon: z.string().optional(),
  })),
});

// 21b. Anchor Nav Block
export const anchorNavBlockSchema = z.object({
  type: z.literal('anchorNav'),
  title: z.string().optional(),
  sticky: z.boolean().default(true),
  links: z.array(z.object({
    label: z.string().min(1, 'Anchor label is required'),
    targetId: z.string().min(1, 'Target ID is required'),
    badge: z.string().optional(),
  })).default([]),
  version: z.number().int().default(1).optional(),
});

// 22. Category Tiles Block
export const categoryTilesBlockSchema = z.object({
  type: z.literal('categoryTiles'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  categoryIds: z.array(z.number()).default([]),
  showCounts: z.boolean().default(true),
  categories: z.array(z.object({
    slug: z.string(),
    name: z.string().optional(),
    title: z.string().optional(),
    pill: z.string().optional(),
    image: z.string().optional(),
    desc: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
});

// 23. Policy Tabs Block
export const policyTabsBlockSchema = z.object({
  type: z.literal('policyTabs'),
  title: z.string().optional(),
  defaultSlug: z.string().default('privacy-policy'),
  showLastUpdated: z.boolean().default(true),
});

// 24. Form Block
export const formBlockSchema = z.object({
  type: z.literal('form'),
  formType: z.enum(['contact', 'support', 'rma', 'partner', 'careers', 'newsletter', 'custom']).default('contact'),
  title: z.string().optional(),
  description: z.string().optional(),
  submitButtonText: z.string().default('Submit'),
  successMessage: z.string().optional(),
});

// 25. Office Cards Block
export const officeCardsBlockSchema = z.object({
  type: z.literal('officeCards'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  rolesFilter: z.array(z.string()).optional(),
  showMap: z.boolean().default(false),
});

// Data-bound extensions
export const articleListBlockSchema = z.object({
  type: z.literal('articleList'),
  title: z.string().optional(),
  query: z.object({
    category: z.string().optional(),
    tag: z.string().optional(),
    limit: z.number().int().min(1).max(20).default(6),
    sort: z.enum(['latest', 'popular', 'title']).default('latest'),
  }).default({ limit: 6, sort: 'latest' }),
  displayStyle: z.enum(['grid', 'list', 'cards']).default('grid'),
  showDate: z.boolean().default(true),
  showReadingTime: z.boolean().default(true),
});

export const glossaryIndexBlockSchema = z.object({
  type: z.literal('glossaryIndex'),
  title: z.string().optional(),
  showLettersFilter: z.boolean().default(true),
  defaultLetter: z.string().optional(),
});

export const appEmbedBlockSchema = z.object({
  type: z.literal('appEmbed'),
  widgetType: z.enum([
    'advisor',
    'speed_visualizer',
    'flagship',
    'ram_configurator',
    'power_calc',
    'ssd_tier',
    'roi_calc',
    'sn_checker',
    'rma_tracker',
    'distributor_locator',
    'glossary_filter',
  ]),
  title: z.string().optional(),
  config: z.record(z.string(), z.unknown()).default({}),
  microcopy: z.record(z.string(), z.string()).optional(),
});

export const BLOCK_SCHEMAS: Record<BlockType, z.ZodTypeAny> = {
  hero: heroBlockSchema,
  slider: sliderBlockSchema,
  statsCounter: statsCounterBlockSchema,
  featureGrid: featureGridBlockSchema,
  bentoGrid: bentoGridBlockSchema,
  ctaBanner: ctaBannerBlockSchema,
  splitCta: splitCtaBlockSchema,
  timeline: timelineBlockSchema,
  textMedia: textMediaBlockSchema,
  faqAccordion: faqAccordionBlockSchema,
  table: tableBlockSchema,
  productShowcase: productShowcaseBlockSchema,
  specComparison: specComparisonBlockSchema,
  whereToBuy: whereToBuyBlockSchema,
  downloadDatasheet: downloadDatasheetBlockSchema,
  qvlCompatibility: qvlCompatibilityBlockSchema,
  testimonial: testimonialBlockSchema,
  badgeStrip: badgeStripBlockSchema,
  steps: stepsBlockSchema,
  kpiMeters: kpiMetersBlockSchema,
  callout: calloutBlockSchema,
  linkChips: linkChipsBlockSchema,
  anchorNav: anchorNavBlockSchema,
  categoryTiles: categoryTilesBlockSchema,
  policyTabs: policyTabsBlockSchema,
  form: formBlockSchema,
  officeCards: officeCardsBlockSchema,
  articleList: articleListBlockSchema,
  glossaryIndex: glossaryIndexBlockSchema,
  appEmbed: appEmbedBlockSchema,
};

// Union of all block schemas
export const blockSchema = z.union([
  heroBlockSchema,
  sliderBlockSchema,
  statsCounterBlockSchema,
  featureGridBlockSchema,
  bentoGridBlockSchema,
  ctaBannerBlockSchema,
  splitCtaBlockSchema,
  timelineBlockSchema,
  textMediaBlockSchema,
  faqAccordionBlockSchema,
  tableBlockSchema,
  productShowcaseBlockSchema,
  specComparisonBlockSchema,
  whereToBuyBlockSchema,
  downloadDatasheetBlockSchema,
  qvlCompatibilityBlockSchema,
  testimonialBlockSchema,
  badgeStripBlockSchema,
  stepsBlockSchema,
  kpiMetersBlockSchema,
  calloutBlockSchema,
  linkChipsBlockSchema,
  anchorNavBlockSchema,
  categoryTilesBlockSchema,
  policyTabsBlockSchema,
  formBlockSchema,
  officeCardsBlockSchema,
  articleListBlockSchema,
  glossaryIndexBlockSchema,
  appEmbedBlockSchema,
]);

export type Block = z.infer<typeof blockSchema>;

export const pageBlocksSchema = z.array(blockSchema);

/**
 * Migrates a block JSON from earlier versions to current schema.
 */
export function migrateBlock(raw: Record<string, unknown>): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const migrated = { ...raw };
  if (typeof migrated.version !== 'number') {
    migrated.version = 1;
  }
  return migrated;
}

/**
 * Validates a block payload, throwing or returning detailed error.
 */
export function validateBlock(raw: unknown): { success: true; data: Block } | { success: false; errors: string[] } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { success: false, errors: ['root: Block must be an object'] };
  }
  const item = raw as Record<string, unknown>;
  if (typeof item.type !== 'string' || !item.type.trim()) {
    return { success: false, errors: ['type: Block type is required and must be a non-empty string'] };
  }
  if (!BLOCK_TYPES.includes(item.type as any)) {
    return {
      success: false,
      errors: [`type: Unknown block type "${item.type}"`],
    };
  }
  const schema = BLOCK_SCHEMAS[item.type as BlockType];
  const result = schema.safeParse(item);
  if (result.success) {
    return { success: true, data: result.data as Block };
  }
  const errors = result.error.issues.map((i) => {
    const p = i.path.length > 0 ? i.path.join('.') : 'root';
    return `${p}: ${i.message}`;
  });
  return { success: false, errors };
}

/**
 * Validates an entire list of blocks.
 */
export function validateBlocks(rawList: unknown): { success: true; data: Block[] } | { success: false; errors: Record<number, string[]> } {
  if (!Array.isArray(rawList)) {
    return { success: false, errors: { 0: ['Expected an array of blocks'] } };
  }
  const errors: Record<number, string[]> = {};
  const validBlocks: Block[] = [];

  rawList.forEach((item, idx) => {
    const val = validateBlock(item);
    if (!val.success) {
      errors[idx] = val.errors;
    } else {
      validBlocks.push(val.data);
    }
  });

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }
  return { success: true, data: validBlocks };
}
