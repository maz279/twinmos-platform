import { z } from 'zod';

export const DELIVERY_ENTITIES = ['page', 'product', 'article', 'news', 'faq', 'setting', 'menu', 'redirect'] as const;
export const DELIVERY_ENTITY_SCHEMA = z.enum(DELIVERY_ENTITIES);
export type DeliveryEntity = (typeof DELIVERY_ENTITIES)[number];

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
