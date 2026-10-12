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
  {
    type: 'slider', label: 'Hero slider', icon: '🎠', desc: 'Carousel slider with auto-play, media slides and CTA buttons.',
    fields: [
      sel('autoplay', 'Auto-play', ['yes', 'no']),
      {
        k: 'list', key: 'slides', label: 'Slides', itemLabel: 'Slide', max: 8,
        defaultItem: { title: 'Slide title', subtitle: '', mediaId: null, ctaLabel: '', ctaHref: '' },
        itemFields: [text('title', 'Title'), area('subtitle', 'Subtitle'), { k: 'media', key: 'mediaId', label: 'Background media' }, text('ctaLabel', 'CTA label'), text('ctaHref', 'CTA link')],
      },
    ],
    make: () => ({ type: 'slider', autoplay: 'yes', slides: [{ title: 'Next-Gen Performance', subtitle: 'Built with TwinMOS VOLTX DDR5', mediaId: null, ctaLabel: 'Explore', ctaHref: '/products.html' }] }),
  },
  {
    type: 'bentoGrid', label: 'Bento grid', icon: '🍱', desc: 'Modern asymmetric feature tiles with variable spans.',
    fields: [
      text('headline', 'Section headline'),
      area('blurb', 'Supporting copy'),
      {
        k: 'list', key: 'tiles', label: 'Bento tiles', itemLabel: 'Tile', max: 12,
        defaultItem: { colSpan: 1, rowSpan: 1, title: 'Feature', body: '', href: '' },
        itemFields: [
          { k: 'number', key: 'colSpan', label: 'Columns span (1-4)', min: 1, max: 4 },
          { k: 'number', key: 'rowSpan', label: 'Rows span (1-2)', min: 1, max: 2 },
          text('title', 'Title'), area('body', 'Body'), text('href', 'Link URL'),
        ],
      },
    ],
    make: () => ({ type: 'bentoGrid', headline: 'Engineered for dominance', blurb: '', tiles: [{ colSpan: 2, rowSpan: 1, title: 'Speed unleashed', body: 'Up to 7200MT/s', href: '' }] }),
  },
  {
    type: 'splitCta', label: 'Split dual CTA', icon: '⚡', desc: 'Side-by-side contrasting call to action boxes.',
    fields: [
      text('leftTitle', 'Left title'), area('leftBody', 'Left body'), text('leftCtaLabel', 'Left CTA label'), text('leftCtaHref', 'Left CTA link'),
      text('rightTitle', 'Right title'), area('rightBody', 'Right body'), text('rightCtaLabel', 'Right CTA label'), text('rightCtaHref', 'Right CTA link'),
    ],
    make: () => ({ type: 'splitCta', leftTitle: 'For Gamers & Creators', leftBody: 'Experience maximum memory performance', leftCtaLabel: 'Explore Gaming', leftCtaHref: '/products.html?brand=voltx', rightTitle: 'For Enterprises & OEMs', rightBody: 'Scalable NAND storage and B2B pricing', rightCtaLabel: 'Partner with Us', rightCtaHref: '/contact.html' }),
  },
  {
    type: 'table', label: 'Data table', icon: '📋', desc: 'Structured tabular data with sortable headers and cells.',
    fields: [
      text('caption', 'Table caption'),
      {
        k: 'list', key: 'headers', label: 'Column headers', itemLabel: 'Header', max: 8,
        defaultItem: { text: 'Column' },
        itemFields: [text('text', 'Header title')],
      },
      {
        k: 'list', key: 'rows', label: 'Rows', itemLabel: 'Row', max: 30,
        defaultItem: { cells: 'Value 1 | Value 2' },
        itemFields: [text('cells', 'Cells (| separated)')],
      },
    ],
    make: () => ({ type: 'table', caption: 'Specifications Overview', headers: [{ text: 'Parameter' }, { text: 'Specification' }], rows: [{ cells: 'Form Factor | M.2 2280' }, { cells: 'Interface | PCIe Gen4 x4' }] }),
  },
  {
    type: 'badgeStrip', label: 'Badge strip', icon: '🎖️', desc: 'Horizontal strip of certification, partner, or warranty badges.',
    fields: [
      text('headline', 'Section title (optional)'),
      {
        k: 'list', key: 'badges', label: 'Badges', itemLabel: 'Badge', max: 12,
        defaultItem: { label: 'ISO 9001', icon: '🛡️' },
        itemFields: [text('icon', 'Icon / Emoji'), text('label', 'Badge label')],
      },
    ],
    make: () => ({ type: 'badgeStrip', headline: 'Certified Quality', badges: [{ icon: '🛡️', label: 'ISO 9001' }, { icon: '⚡', label: 'Intel XMP 3.0' }, { icon: '🚀', label: 'AMD EXPO' }, { icon: '🔒', label: '5-Year Warranty' }] }),
  },
  {
    type: 'steps', label: 'Steps / Process', icon: '🔢', desc: 'Numbered step-by-step workflow or setup guide.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'steps', label: 'Step items', itemLabel: 'Step', max: 6,
        defaultItem: { stepNumber: 1, title: 'Step 1', desc: '' },
        itemFields: [{ k: 'number', key: 'stepNumber', label: 'Step #' }, text('title', 'Step title'), area('desc', 'Description')],
      },
    ],
    make: () => ({ type: 'steps', headline: 'How to claim your warranty', steps: [{ stepNumber: 1, title: 'Verify serial number', desc: 'Enter product serial on authenticity portal.' }, { stepNumber: 2, title: 'Submit RMA form', desc: 'Provide purchase details and defect description.' }] }),
  },
  {
    type: 'kpiMeters', label: 'KPI meters', icon: '📊', desc: 'Visual progress meters and percentage indicators.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'meters', label: 'Meters', itemLabel: 'Meter', max: 6,
        defaultItem: { label: 'Read Throughput', value: 7400, max: 8000, unit: 'MB/s' },
        itemFields: [text('label', 'Label'), { k: 'number', key: 'value', label: 'Value' }, { k: 'number', key: 'max', label: 'Max' }, text('unit', 'Unit')],
      },
    ],
    make: () => ({ type: 'kpiMeters', headline: 'Benchmark Speeds', meters: [{ label: 'Sequential Read', value: 7400, max: 8000, unit: 'MB/s' }, { label: 'Sequential Write', value: 6800, max: 8000, unit: 'MB/s' }] }),
  },
  {
    type: 'callout', label: 'Callout box', icon: '💡', desc: 'Prominent highlight box with colored border and icon.',
    fields: [
      sel('tone', 'Tone', ['info', 'warning', 'success', 'accent']),
      text('title', 'Callout title'),
      area('body', 'Callout body text'),
      text('ctaLabel', 'CTA label (optional)'),
      text('ctaHref', 'CTA link (optional)'),
    ],
    make: () => ({ type: 'callout', tone: 'accent', title: 'Need Motherboard Compatibility Advice?', body: 'Consult our official QVL memory compatibility matrix before building your gaming rig.', ctaLabel: 'Check Compatibility', ctaHref: '/compatibility.html' }),
  },
  {
    type: 'linkChips', label: 'Link chips', icon: '🏷️', desc: 'Pill-shaped quick navigation chips or filter tags.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'chips', label: 'Chips', itemLabel: 'Chip', max: 16,
        defaultItem: { label: 'DDR5 Gaming', href: '/products.html' },
        itemFields: [text('label', 'Label'), text('href', 'Target URL')],
      },
    ],
    make: () => ({ type: 'linkChips', headline: 'Popular Categories', chips: [{ label: 'Gaming DRAM', href: '/products.html?cat=gaming-dram' }, { label: 'PCIe Gen5 SSDs', href: '/products.html?cat=nvme-ssd' }, { label: 'Where to Buy', href: '/where-to-buy.html' }] }),
  },
  {
    type: 'categoryTiles', label: 'Category tiles', icon: '🗂️', desc: 'Visual cards linking to primary product taxonomy categories.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'tiles', label: 'Categories', itemLabel: 'Category', max: 8,
        defaultItem: { title: 'Category', slug: 'dram', desc: '', href: '' },
        itemFields: [text('title', 'Title'), text('slug', 'Slug'), area('desc', 'Description'), text('href', 'Link')],
      },
    ],
    make: () => ({ type: 'categoryTiles', headline: 'Explore Products', tiles: [{ title: 'Gaming Memory', slug: 'gaming-dram', desc: 'High-speed overclocked DDR5 & DDR4 modules', href: '/products.html?cat=gaming-dram' }] }),
  },
  {
    type: 'policyTabs', label: 'Policy tabs', icon: '📑', desc: 'Tabbed document viewer for multi-section policy documents.',
    fields: [
      text('policySlug', 'Policy slug', 'privacy-policy'),
      sel('showEffectiveDate', 'Show effective date', ['yes', 'no']),
    ],
    make: () => ({ type: 'policyTabs', policySlug: 'privacy-policy', showEffectiveDate: 'yes' }),
  },
  {
    type: 'form', label: 'Form embed', icon: '📝', desc: 'Interactive form widget mapped to form definition schema.',
    fields: [
      sel('formType', 'Form type', ['contact', 'rma', 'b2b', 'distributor', 'partner', 'press', 'feedback']),
      text('headline', 'Headline override (optional)'),
      area('blurb', 'Intro copy (optional)'),
    ],
    make: () => ({ type: 'form', formType: 'contact', headline: '', blurb: '' }),
  },
  {
    type: 'officeCards', label: 'Global office cards', icon: '🏢', desc: 'Dynamic cards rendering all corporate headquarters and regional hubs.',
    fields: [
      text('headline', 'Section headline'),
      area('blurb', 'Supporting copy'),
      sel('layout', 'Grid layout', ['2-col', '3-col']),
    ],
    make: () => ({ type: 'officeCards', headline: 'Global Presence', blurb: 'Headquartered in Dubai with technology hubs worldwide.', layout: '3-col' }),
  },
  {
    type: 'articleList', label: 'Article / News list', icon: '📰', desc: 'Dynamic list of recent articles or announcements.',
    fields: [
      text('headline', 'Headline'),
      text('category', 'Category filter (optional)'),
      { k: 'number', key: 'limit', label: 'Max items', min: 1, max: 12 },
    ],
    make: () => ({ type: 'articleList', headline: 'Latest News & Guides', category: '', limit: 4 }),
  },
  {
    type: 'glossaryIndex', label: 'Glossary index', icon: '📖', desc: 'Full A-Z interactive glossary directory with search filter.',
    fields: [
      text('headline', 'Section headline'),
      area('blurb', 'Intro text'),
    ],
    make: () => ({ type: 'glossaryIndex', headline: 'Hardware & Storage Glossary', blurb: 'Authoritative memory, NAND flash, and solid-state terminology guide.' }),
  },
  {
    type: 'appEmbed', label: 'Interactive app embed', icon: '⚙️', desc: 'Embeddable interactive web application (e.g. SN Checker).',
    fields: [
      sel('appId', 'Application ID', ['sn-checker', 'ram-configurator', 'ssd-selector']),
      text('headline', 'App headline'),
    ],
    make: () => ({ type: 'appEmbed', appId: 'sn-checker', headline: 'Check Product Authenticity' }),
  },
];

export const blockDef = (type: string): BlockDef | undefined => BLOCK_DEFS.find((b) => b.type === type);

export type PageBlock = Record<string, unknown> & { type: string };
