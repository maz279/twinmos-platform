import { z } from 'zod';

export const DELIVERY_ENTITIES = [
  'page',
  'product',
  'article',
  'news',
  'faq',
  'setting',
  'menu',
  'redirect',
  'glossary',
  'office',
  'testimonial',
  'policy',
  'form',
  'navigation',
] as const;
export const DELIVERY_ENTITY_SCHEMA = z.enum(DELIVERY_ENTITIES);
export type DeliveryEntity = (typeof DELIVERY_ENTITIES)[number];

export const deliveryNavMenuItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.number(),
    title: z.string(),
    targetType: z.string(),
    targetUrl: z.string().nullable().optional(),
    targetId: z.string().nullable().optional(),
    sort: z.number(),
    metadata: z.record(z.string(), z.unknown()).default({}),
    icon: z.string().nullable().optional(),
    badge: z.string().nullable().optional(),
    children: z.array(deliveryNavMenuItemSchema).default([]),
  })
);

export const deliveryNavMenuSchema = z.object({
  id: z.number(),
  code: z.string(),
  title: z.string(),
  locale: z.string(),
  items: z.array(deliveryNavMenuItemSchema),
});
export type DeliveryNavMenu = z.infer<typeof deliveryNavMenuSchema>;

export const deliveryGlossaryTermSchema = z.object({
  id: z.number(),
  term: z.string(),
  definition: z.string(),
  letter: z.string(),
  explainerSlug: z.string().nullable().optional(),
  locale: z.string(),
});
export type DeliveryGlossaryTerm = z.infer<typeof deliveryGlossaryTermSchema>;

export const deliveryOfficeSchema = z.object({
  id: z.number(),
  role: z.string(),
  title: z.string(),
  entity: z.string(),
  address: z.string(),
  flag: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  sort: z.number(),
  locale: z.string(),
});
export type DeliveryOffice = z.infer<typeof deliveryOfficeSchema>;

export const deliveryTestimonialSchema = z.object({
  id: z.number(),
  quote: z.string(),
  author: z.string(),
  role: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  sort: z.number(),
  locale: z.string(),
});
export type DeliveryTestimonial = z.infer<typeof deliveryTestimonialSchema>;

export const deliveryPolicySchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  version: z.string(),
  effectiveDate: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  body: z.string(),
  cookieCategories: z.unknown().optional(),
  locale: z.string(),
  updatedAt: z.string(),
});
export type DeliveryPolicy = z.infer<typeof deliveryPolicySchema>;

export const deliveryFormDefinitionSchema = z.object({
  id: z.number(),
  type: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  successMessage: z.string().nullable().optional(),
  privacyNotice: z.string().nullable().optional(),
  fields: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      label: z.string(),
      type: z.string(),
      placeholder: z.string().nullable().optional(),
      helpText: z.string().nullable().optional(),
      required: z.boolean(),
      options: z.unknown().optional(),
      sort: z.number(),
    })
  ),
});
export type DeliveryFormDefinition = z.infer<typeof deliveryFormDefinitionSchema>;

export const deliveryPageSchema = z.object({
  id: z.number(),
  slug: z.string(),
  path: z.string().nullable().optional(),
  title: z.string(),
  template: z.string(),
  blocks: z.array(z.unknown()),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  ogMediaId: z.number().nullable().optional(),
  noindex: z.boolean().default(false),
  locale: z.string(),
  publishedAt: z.string().nullable().optional(),
  updatedAt: z.string(),
});
export type DeliveryPage = z.infer<typeof deliveryPageSchema>;


export const previewTokenPayloadSchema = z.object({
  entityType: DELIVERY_ENTITY_SCHEMA,
  entityId: z.union([z.string(), z.number()]),
  slug: z.string().optional(),
  exp: z.number().int().positive(), // Epoch seconds
  iat: z.number().int().positive().optional(),
});
export type PreviewTokenPayload = z.infer<typeof previewTokenPayloadSchema>;

export const deliveryQuerySchema = z.object({
  locale: z.string().trim().default('en'),
  preview: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type DeliveryQuery = z.infer<typeof deliveryQuerySchema>;

export const deliveryItemMetaSchema = z.object({
  id: z.union([z.string(), z.number()]),
  slug: z.string(),
  status: z.string(),
  locale: z.string(),
  updatedAt: z.string().optional(),
  publishedAt: z.string().optional(),
  cacheTags: z.array(z.string()),
  isPreview: z.boolean().default(false),
});
export type DeliveryItemMeta = z.infer<typeof deliveryItemMetaSchema>;

export const deliveryResponseSchema = z.object({
  data: z.unknown(),
  meta: deliveryItemMetaSchema.optional(),
});

export const deliverySitemapEntrySchema = z.object({
  loc: z.string(),
  lastmod: z.string().optional(),
  changefreq: z.string().optional(),
  priority: z.number().optional(),
  locale: z.string(),
  alternates: z.array(z.object({
    locale: z.string(),
    href: z.string(),
  })).optional(),
});
export type DeliverySitemapEntry = z.infer<typeof deliverySitemapEntrySchema>;

// Phase D Search Contracts (Tasks D7a, D7b)
export const searchResultItemSchema = z.object({
  type: z.enum(['product', 'article', 'page', 'glossary']),
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  slug: z.string(),
  url: z.string(),
  snippet: z.string(),
  badge: z.string().optional(),
  category: z.string().optional(),
  locale: z.string().default('en'),
});
export type SearchResultItem = z.infer<typeof searchResultItemSchema>;

export const searchResponseSchema = z.object({
  query: z.string(),
  total: z.number(),
  page: z.number().default(1),
  limit: z.number().default(20),
  facets: z.record(z.string(), z.number()).optional(),
  results: z.array(searchResultItemSchema),
});
export type SearchResponse = z.infer<typeof searchResponseSchema>;

export const searchSuggestResponseSchema = z.object({
  query: z.string(),
  suggestions: z.array(z.object({
    text: z.string(),
    type: z.string(),
    url: z.string(),
  })),
});
export type SearchSuggestResponse = z.infer<typeof searchSuggestResponseSchema>;

