// Page Builder block registry — the 13 TwinMOS page block types from the
// Phase 2 plan (TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §2.1). Each type declares a
// field schema; PageBuilder renders editors generically from these definitions
// and BlockPreview renders the visual twin. Blocks persist into page.blocks
// (jsonb) as plain objects — { type, ...fields }.

/** Recursive editor-field descriptor (schema-driven forms, no per-block code). */
export type FieldDef =
  | { k: 'text'; key: string; label: string; placeholder?: string }
  | { k: 'textarea'; key: string; label: string; placeholder?: string }
  | { k: 'number'; key: string; label: string; min?: number; max?: number }
  | { k: 'select'; key: string; label: string; options: readonly string[] }
  | { k: 'media'; key: string; label: string }
  | { k: 'list'; key: string; label: string; itemLabel: string; max?: number; defaultItem: Record<string, unknown>; itemFields: FieldDef[] };

export type BlockDef = {
  type: string;
  label: string;
  icon: string;
  desc: string;
  fields: FieldDef[];
  make: () => Record<string, unknown>;
};

const text = (key: string, label: string, placeholder?: string): FieldDef => ({ k: 'text', key, label, placeholder });
const area = (key: string, label: string, placeholder?: string): FieldDef => ({ k: 'textarea', key, label, placeholder });
const sel = (key: string, label: string, options: readonly string[]): FieldDef => ({ k: 'select', key, label, options });
const media = (key: string, label: string): FieldDef => ({ k: 'media', key, label });

const CTA_FIELDS: FieldDef[] = [
  text('ctaLabel', 'CTA label', 'Buy now'),
  text('ctaHref', 'CTA link', 'https://… or /where-to-buy'),
];

export const BLOCK_DEFS: BlockDef[] = [
  {
    type: 'hero', label: 'Hero banner', icon: '🎬', desc: 'Full-width opening banner with headline, deck, background image and CTAs.',
    fields: [
      text('eyebrow', 'Eyebrow tag', 'New generation'),
      text('title', 'Headline *', 'VOLTX DDR5 — built for gaming'),
      area('subdeck', 'Sub-deck', 'One-line supporting copy under the headline.'),
      media('bgMediaId', 'Background image'),
      ...CTA_FIELDS,
      text('ctaSecondaryLabel', 'Secondary CTA label'),
      text('ctaSecondaryHref', 'Secondary CTA link'),
    ],
    make: () => ({ type: 'hero', eyebrow: '', title: 'New hero section', subdeck: '', bgMediaId: null, ctaLabel: '', ctaHref: '', ctaSecondaryLabel: '', ctaSecondaryHref: '' }),
  },
  {
    type: 'textMedia', label: 'Text + Media', icon: '🖼️', desc: '50/50 split of rich text beside an image (left or right).',
    fields: [
      sel('layout', 'Media position', ['left', 'right']),
      media('mediaId', 'Image'),
      area('markdown', 'Text (markdown)'),
      text('caption', 'Caption'),
      text('badge', 'Badge'),
    ],
    make: () => ({ type: 'textMedia', layout: 'right', mediaId: null, markdown: '', caption: '', badge: '' }),
  },
  {
    type: 'featureGrid', label: 'Feature grid', icon: '🧱', desc: '2–4 columns of feature cards with icon, title and link.',
    fields: [
      text('headline', 'Section headline'),
      sel('columns', 'Columns', ['2', '3', '4']),
      {
        k: 'list', key: 'items', label: 'Feature cards', itemLabel: 'Card', max: 12,
        defaultItem: { icon: '⚡', title: 'Feature', desc: '', href: '' },
        itemFields: [text('icon', 'Icon (emoji)'), text('title', 'Title'), area('desc', 'Description'), text('href', 'Link')],
      },
    ],
    make: () => ({ type: 'featureGrid', headline: '', columns: '3', items: [{ icon: '⚡', title: 'Feature one', desc: '', href: '' }] }),
  },
  {
    type: 'productShowcase', label: 'Product showcase', icon: '📦', desc: 'Highlighted products by SKU list with live spec chips.',
    fields: [
      text('headline', 'Section headline'),
      area('blurb', 'Intro copy'),
      {
        k: 'list', key: 'skus', label: 'Product SKUs', itemLabel: 'SKU', max: 8,
        defaultItem: { sku: 'VLT-DDR5-16G' },
        itemFields: [text('sku', 'SKU'), text('note', 'Badge note')],
      },
    ],
    make: () => ({ type: 'productShowcase', headline: 'Featured memory', blurb: '', skus: [{ sku: '', note: '' }] }),
  },
  {
    type: 'specComparison', label: 'Spec comparison', icon: '📊', desc: 'Comparative technical specification table across products.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'rows', label: 'Specification rows', itemLabel: 'Row', max: 30,
        defaultItem: { label: 'Capacity', values: '16GB | 32GB | 64GB' },
        itemFields: [text('label', 'Spec label'), text('values', 'Values (one per column, | separated)')],
      },
      {
        k: 'list', key: 'columns', label: 'Product columns', itemLabel: 'Column', max: 4,
        defaultItem: { name: 'VOLTX DDR5' },
        itemFields: [text('name', 'Product name')],
      },
    ],
    make: () => ({ type: 'specComparison', headline: 'Compare the line-up', columns: [{ name: 'Product A' }, { name: 'Product B' }], rows: [{ label: 'Speed', values: '6000 MT/s | 6400 MT/s' }] }),
  },
  {
    type: 'whereToBuy', label: 'Where to buy', icon: '📍', desc: 'Distributor locator teaser with region links.',
    fields: [
      text('headline', 'Section headline'),
      area('blurb', 'Intro copy'),
      {
        k: 'list', key: 'regions', label: 'Regions', itemLabel: 'Region', max: 8,
        defaultItem: { region: 'Middle East', href: '' },
        itemFields: [text('region', 'Region name'), text('href', 'Locator link')],
      },
    ],
    make: () => ({ type: 'whereToBuy', headline: 'Where to buy', blurb: '', regions: [{ region: 'Region', href: '' }] }),
  },
  {
    type: 'downloadDatasheet', label: 'Downloads', icon: '📥', desc: 'Datasheet / QVL / quick-start download cards.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'files', label: 'Files', itemLabel: 'File', max: 12,
        defaultItem: { label: 'Datasheet (PDF)', url: '' },
        itemFields: [text('label', 'Label'), text('url', 'URL')],
      },
    ],
    make: () => ({ type: 'downloadDatasheet', headline: 'Downloads & resources', files: [{ label: 'Datasheet (PDF)', url: '' }] }),
  },
  {
    type: 'qvlCompatibility', label: 'QVL widget', icon: '🔍', desc: 'Embedded compatibility-check widget section.',
    fields: [
      text('headline', 'Section headline'),
      area('blurb', 'Intro copy'),
      text('ctaLabel', 'CTA label', 'Open compatibility finder'),
      text('ctaHref', 'CTA link', '/compatibility'),
    ],
    make: () => ({ type: 'qvlCompatibility', headline: 'Is it compatible with your system?', blurb: '', ctaLabel: 'Open compatibility finder', ctaHref: '/compatibility' }),
  },
  {
    type: 'testimonial', label: 'Testimonials', icon: '💬', desc: 'Customer quotes with attribution and verified badge.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'items', label: 'Quotes', itemLabel: 'Testimonial', max: 9,
        defaultItem: { quote: '', author: '', company: '', avatarMediaId: null, verified: false },
        itemFields: [area('quote', 'Quote'), text('author', 'Author'), text('company', 'Company'), { k: 'media', key: 'avatarMediaId', label: 'Avatar' }, { k: 'select', key: 'verified', label: 'Verified', options: ['no', 'yes'] }],
      },
    ],
    make: () => ({ type: 'testimonial', headline: 'Trusted by builders', items: [{ quote: '', author: '', company: '', avatarMediaId: null, verified: 'no' }] }),
  },
  {
    type: 'ctaBanner', label: 'CTA banner', icon: '🎯', desc: 'Full-width colored or image-backed call-to-action banner.',
    fields: [
      text('title', 'Banner title'),
      area('blurb', 'Supporting copy'),
      sel('tone', 'Tone', ['brand', 'dark', 'light']),
      media('bgMediaId', 'Background image (optional)'),
      ...CTA_FIELDS,
    ],
    make: () => ({ type: 'ctaBanner', title: '', blurb: '', tone: 'brand', bgMediaId: null, ctaLabel: '', ctaHref: '' }),
  },
  {
    type: 'faqAccordion', label: 'FAQ accordion', icon: '❓', desc: 'Expandable question-and-answer items.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'items', label: 'Questions', itemLabel: 'Q&A', max: 20,
        defaultItem: { q: '', a: '' },
        itemFields: [text('q', 'Question'), area('a', 'Answer (markdown)')],
      },
    ],
    make: () => ({ type: 'faqAccordion', headline: 'Frequently asked questions', items: [{ q: '', a: '' }] }),
  },
  {
    type: 'statsCounter', label: 'Stats counter', icon: '📈', desc: 'Numeric KPI tiles with unit and label.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'items', label: 'Stats', itemLabel: 'Stat', max: 6,
        defaultItem: { value: '93', unit: '+', label: 'Countries served' },
        itemFields: [text('value', 'Value'), text('unit', 'Unit'), text('label', 'Label')],
      },
    ],
    make: () => ({ type: 'statsCounter', headline: '', items: [{ value: '25', unit: '+', label: 'Years of memory expertise' }] }),
  },
  {
    type: 'timeline', label: 'Timeline', icon: '🗓️', desc: 'Milestone entries with date, title, description and media.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'items', label: 'Milestones', itemLabel: 'Milestone', max: 20,
        defaultItem: { date: '2026', title: '', desc: '', mediaId: null },
        itemFields: [text('date', 'Date / year'), text('title', 'Title'), area('desc', 'Description'), { k: 'media', key: 'mediaId', label: 'Media' }],
      },
    ],
    make: () => ({ type: 'timeline', headline: 'Our story', items: [{ date: '2026', title: '', desc: '', mediaId: null }] }),
  },
];

export const blockDef = (type: string): BlockDef | undefined => BLOCK_DEFS.find((b) => b.type === type);

export type PageBlock = Record<string, unknown> & { type: string };
