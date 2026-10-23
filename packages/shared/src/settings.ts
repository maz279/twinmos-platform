// Typed site settings schemas (Milestone MS4.2 · T4.2.1 / C1 / Z-39)
import { z } from 'zod';

// 1. site.brand
export const siteBrandSchema = z.object({
  name: z.string().trim().min(1).max(100).default('TwinMOS Technologies'),
  tagline: z.string().trim().min(1).max(200).default('Legendary Memory Brand'),
  logoUrl: z.string().trim().min(1).default('/assets/img/logo.webp'),
  faviconUrl: z.string().trim().optional().default('/favicon.ico'),
  foundingYear: z.number().int().min(1900).max(2100).default(1998),
});
export type SiteBrandSettings = z.infer<typeof siteBrandSchema>;

// 2. site.contact
export const siteContactSchema = z.object({
  email: z.string().trim().email().default('info@twinmos.com'),
  supportEmail: z.string().trim().email().optional().default('support@twinmos.com'),
  salesEmail: z.string().trim().email().optional().default('sales@twinmos.com'),
  phone: z.string().trim().min(1).max(50).default('+886 2 2659 0880'),
  address: z.string().trim().min(1).max(300).default('5F.-5, No. 29, Sec. 1, Minsheng E. Rd., Zhongshan Dist., Taipei City 104619, Taiwan'),
  country: z.string().trim().optional().default('Taiwan'),
});
export type SiteContactSettings = z.infer<typeof siteContactSchema>;

// 3. site.social (single source for footer and Organization JSON-LD)
export const siteSocialSchema = z.object({
  facebook: z.string().trim().url().default('https://www.facebook.com/twinmos.tech'),
  instagram: z.string().trim().url().default('https://instagram.com/twinmos.tech'),
  linkedin: z.string().trim().url().default('https://www.linkedin.com/company/twinmos-technologies/'),
  x: z.string().trim().url().default('https://x.com/twinmos'),
  youtube: z.string().trim().url().default('https://www.youtube.com/c/TwinMOStech'),
  pinterest: z.string().trim().url().optional().default('https://www.pinterest.com/twinmos'),
});
export type SiteSocialSettings = z.infer<typeof siteSocialSchema>;

// 4. site.cookie
export const siteCookieSchema = z.object({
  title: z.string().trim().min(1).max(100).default('Cookie Preferences'),
  description: z.string().trim().min(1).max(500).default('We use essential cookies to ensure site security and proper functionality.'),
  policyUrl: z.string().trim().min(1).default('/legal.html#cookies'),
  essentialOnlyDefault: z.boolean().default(true),
});
export type SiteCookieSettings = z.infer<typeof siteCookieSchema>;

// 5. site.whatsapp: keep the wa.me/<digits> format
export const siteWhatsappSchema = z.object({
  phoneNumber: z.string().trim().regex(/^\d{7,15}$/, 'Phone number must contain only digits (7 to 15 digits)').default('886226590880'),
  waUrl: z.string().trim().regex(/^(https:\/\/)?wa\.me\/\d{7,15}$/, 'WhatsApp URL must follow the wa.me/<digits> format').default('https://wa.me/886226590880'),
  defaultMessage: z.string().trim().optional().default(''),
});
export type SiteWhatsappSettings = z.infer<typeof siteWhatsappSchema>;

// 6. site.figures: "93+" countries, founding year (computes "N years"), product count (fixes "45" vs "39")
export const siteFiguresSchema = z.object({
  countriesCount: z.string().trim().min(1).default('93+'),
  foundingYear: z.number().int().min(1900).max(2100).default(1998),
  productCount: z.number().int().min(1).default(40),
});
export type SiteFiguresSettings = z.infer<typeof siteFiguresSchema>;

// 7. seo.defaults
export const seoDefaultsSchema = z.object({
  titleTemplate: z.string().trim().min(1).default('%s | TwinMOS Technologies'),
  defaultTitle: z.string().trim().min(1).default('TwinMOS Technologies — Legendary Memory & Storage'),
  defaultDescription: z.string().trim().min(1).default('Memory modules, SSDs, portable storage and accessories for customers worldwide.'),
  defaultOgImage: z.string().trim().min(1).default('/assets/img/og-cover.png'),
  defaultRobots: z.string().trim().min(1).default('index, follow'),
});
export type SeoDefaultsSettings = z.infer<typeof seoDefaultsSchema>;

// 8. integrations: Turnstile site key and analytics switch
export const integrationsSchema = z.object({
  turnstileSiteKey: z.string().trim().min(1).default('0x4AAAAAAAx'),
  analyticsEnabled: z.boolean().default(false),
  googleAnalyticsId: z.string().trim().optional().default(''),
});
export type IntegrationsSettings = z.infer<typeof integrationsSchema>;

// Registry of typed settings groups
export const SETTINGS_GROUP_SCHEMAS = {
  'site.brand': siteBrandSchema,
  'site.contact': siteContactSchema,
  'site.social': siteSocialSchema,
  'site.cookie': siteCookieSchema,
  'site.whatsapp': siteWhatsappSchema,
  'site.figures': siteFiguresSchema,
  'seo.defaults': seoDefaultsSchema,
  'integrations': integrationsSchema,
} as const;

export type SettingsGroupKey = keyof typeof SETTINGS_GROUP_SCHEMAS;
export const SETTINGS_GROUP_KEYS = Object.keys(SETTINGS_GROUP_SCHEMAS) as SettingsGroupKey[];

// Single source of truth for the default value of every typed group. Keeping
// this derived from the schemas stops the API, the admin editor and the web
// chrome from drifting into three different copies of the same defaults.
export const SETTINGS_GROUP_DEFAULTS = Object.fromEntries(
  SETTINGS_GROUP_KEYS.map((key) => [key, SETTINGS_GROUP_SCHEMAS[key].parse({})]),
) as { [K in SettingsGroupKey]: z.infer<(typeof SETTINGS_GROUP_SCHEMAS)[K]> };

export function getSettingsGroupDefaults<K extends SettingsGroupKey>(key: K): (typeof SETTINGS_GROUP_DEFAULTS)[K] {
  return SETTINGS_GROUP_DEFAULTS[key];
}

/**
 * Parse a stored (possibly partial) group value through its schema so missing
 * fields fall back to the group defaults instead of disappearing from delivery.
 */
export function normalizeSettingsGroup<K extends SettingsGroupKey>(
  key: K,
  value: unknown,
): (typeof SETTINGS_GROUP_DEFAULTS)[K] {
  return SETTINGS_GROUP_SCHEMAS[key].parse(value ?? {}) as (typeof SETTINGS_GROUP_DEFAULTS)[K];
}


// Helper to compute dynamic "N years" from founding year
export function computeYearsInBusiness(foundingYear: number, currentYear = new Date().getFullYear()): number {
  return Math.max(1, currentYear - foundingYear);
}

export function formatYearsString(foundingYear: number, currentYear = new Date().getFullYear()): string {
  const years = computeYearsInBusiness(foundingYear, currentYear);
  return `${years} years`;
}

export function resolveComputedFigures(figures: SiteFiguresSettings, currentYear = new Date().getFullYear()) {
  const years = computeYearsInBusiness(figures.foundingYear, currentYear);
  return {
    ...figures,
    years,
    yearsFormatted: `${years} years`,
    yearsLabel: `${years}-year`,
  };
}
