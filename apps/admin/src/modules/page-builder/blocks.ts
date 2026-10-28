// Page Builder block registry — Comprehensive 30-block registry aligned 1:1 with @twinmos/shared.
// Tasks C4a..C4e, C12, T4.1.3, T4.1.5 (ADR D-4).
// Each type declares a field schema; PageBuilder renders editors generically from these definitions
// and preview renders the visual twin. Blocks persist into page.blocks (jsonb) as plain objects.
import { BLOCK_TYPES, FORM_BLOCK_TYPES } from '@twinmos/shared';
import type { BlockType } from '@twinmos/shared';

/** Recursive editor-field descriptor (schema-driven forms, no per-block code). */
export type FieldDef =
  | { k: 'text'; key: string; label: string; placeholder?: string }
  | { k: 'textarea'; key: string; label: string; placeholder?: string }
  | { k: 'number'; key: string; label: string; min?: number; max?: number }
  | { k: 'select'; key: string; label: string; options: readonly string[] }
  | { k: 'media'; key: string; label: string }
  | { k: 'lines'; key: string; label: string }
  | { k: 'list'; key: string; label: string; itemLabel: string; max?: number; defaultItem: Record<string, unknown>; itemFields: FieldDef[] };

export type BlockDef = {
  type: BlockType;
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

export const BLOCK_DEFS: BlockDef[] = [
  // 1. Hero
  {
    type: 'hero', label: 'Hero banner', icon: '🎬', desc: 'Full-width opening banner with headline, lede, background image and CTAs.',
    fields: [
      text('eyebrow', 'Eyebrow tag', 'New generation'),
      text('title', 'Headline *', 'VOLTX DDR5 — built for gaming'),
      area('lede', 'Lede copy', 'One-line supporting copy under the headline.'),
      media('bgMedia', 'Background media'),
    ],
    make: () => ({
      type: 'hero',
      title: 'New hero section',
      eyebrow: '',
      lede: '',
      chips: [],
      trustStats: [],
      jumpLinks: [],
      ctas: [],
      searchForm: false,
    }),
  },
  // 2. Slider
  {
    type: 'slider', label: 'Hero slider', icon: '🎠', desc: 'Carousel slider with auto-play, media slides and CTA buttons.',
    fields: [
      sel('autoplay', 'Auto-play', ['true', 'false']),
      {
        k: 'list', key: 'slides', label: 'Slides', itemLabel: 'Slide', max: 8,
        defaultItem: { image: '/media/slide1.webp', alt: 'TwinMOS Banner', title: 'Slide Title', cta: 'Explore', link: '/products.html' },
        itemFields: [text('image', 'Image Key/URL'), text('alt', 'Image Alt *'), text('title', 'Title'), text('cta', 'CTA label'), text('link', 'Target link')],
      },
    ],
    make: () => ({
      type: 'slider',
      autoplay: true,
      pauseControl: true,
      intervalMs: 5000,
      slides: [{ image: '/media/voltx-banner.webp', alt: 'TwinMOS VOLTX DDR5 Gaming Memory Banner', title: 'Next-Gen Performance', cta: 'Explore', link: '/products.html' }],
    }),
  },
  // 3. Stats Counter
  {
    type: 'statsCounter', label: 'Stats counter', icon: '📈', desc: 'Numeric KPI tiles with unit and label.',
    fields: [
      text('title', 'Section title (optional)'),
      {
        k: 'list', key: 'stats', label: 'Stats', itemLabel: 'Stat', max: 6,
        defaultItem: { value: '93', label: 'Countries served', prefix: '', suffix: '+' },
        itemFields: [text('value', 'Value'), text('label', 'Label'), text('prefix', 'Prefix'), text('suffix', 'Suffix')],
      },
    ],
    make: () => ({
      type: 'statsCounter',
      title: 'Proven Track Record',
      stats: [{ value: '25+', label: 'Years of Memory Expertise' }, { value: '93+', label: 'Countries Served' }],
      columns: 4,
    }),
  },
  // 4. Feature Grid
  {
    type: 'featureGrid', label: 'Feature grid', icon: '🧱', desc: '2–4 columns of feature cards with icon, title and description.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
      sel('variant', 'Variant', ['cards', 'minimal', 'bordered']),
      {
        k: 'list', key: 'items', label: 'Feature cards', itemLabel: 'Card', max: 12,
        defaultItem: { icon: '⚡', title: 'Feature', description: '', link: '' },
        itemFields: [text('icon', 'Icon (emoji)'), text('title', 'Title'), area('description', 'Description'), text('link', 'Link')],
      },
    ],
    make: () => ({
      type: 'featureGrid',
      title: 'Key Features',
      columns: 3,
      variant: 'cards',
      items: [{ icon: '⚡', title: 'Extreme Speed', description: 'Overclocked performance for power users.' }],
    }),
  },
  // 5. Bento Grid
  {
    type: 'bentoGrid', label: 'Bento grid', icon: '🍱', desc: 'Modern asymmetric feature tiles with variable spans.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
      {
        k: 'list', key: 'items', label: 'Bento items', itemLabel: 'Item', max: 12,
        defaultItem: { title: 'Feature', description: '', size: 'medium' },
        itemFields: [text('title', 'Title'), area('description', 'Description'), sel('size', 'Size', ['small', 'medium', 'large', 'tall', 'wide'])],
      },
    ],
    make: () => ({
      type: 'bentoGrid',
      title: 'Engineered for Dominance',
      items: [{ title: 'Speed Unleashed', description: 'Speeds up to 7200MT/s with Intel XMP 3.0.', size: 'large' }],
    }),
  },
  // 6. CTA Banner
  {
    type: 'ctaBanner', label: 'CTA banner', icon: '🎯', desc: 'Full-width colored or image-backed call-to-action banner.',
    fields: [
      text('title', 'Banner title *'),
      text('subtitle', 'Supporting subtitle'),
      sel('variant', 'Variant', ['boxed', 'fullwidth', 'gradient', 'dark']),
      {
        k: 'list', key: 'ctas', label: 'CTAs', itemLabel: 'Button', max: 3,
        defaultItem: { label: 'Explore', url: '/products.html', variant: 'primary' },
        itemFields: [text('label', 'Label'), text('url', 'Target URL'), sel('variant', 'Style', ['primary', 'secondary', 'outline'])],
      },
    ],
    make: () => ({
      type: 'ctaBanner',
      title: 'Upgrade Your Memory Today',
      variant: 'boxed',
      ctas: [{ label: 'Find a Retailer', url: '/where-to-buy.html', variant: 'primary' }],
    }),
  },
  // 7. Split CTA
  {
    type: 'splitCta', label: 'Split dual CTA', icon: '⚡', desc: 'Side-by-side contrasting call to action boxes.',
    fields: [
      text('dividerText', 'Divider text (optional)'),
    ],
    make: () => ({
      type: 'splitCta',
      left: { title: 'For Gamers & Creators', description: 'Experience maximum memory performance', ctaText: 'Explore Gaming', ctaUrl: '/products.html?brand=voltx' },
      right: { title: 'For Enterprises & OEMs', description: 'Scalable NAND storage and B2B pricing', ctaText: 'Partner with Us', ctaUrl: '/contact.html' },
    }),
  },
  // 8. Timeline
  {
    type: 'timeline', label: 'Timeline', icon: '🗓️', desc: 'Milestone entries with year, title, and description.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
      {
        k: 'list', key: 'milestones', label: 'Milestones', itemLabel: 'Milestone', max: 20,
        defaultItem: { year: '2026', title: '', description: '' },
        itemFields: [text('year', 'Year'), text('title', 'Title'), area('description', 'Description')],
      },
    ],
    make: () => ({
      type: 'timeline',
      title: 'Our Heritage',
      milestones: [{ year: '2026', title: 'VOLTX Series Launch', description: 'Next-generation memory built for DDR5 and PCIe 5.0.' }],
    }),
  },
  // 9. Text Media
  {
    type: 'textMedia', label: 'Text + Media', icon: '🖼️', desc: '50/50 split of rich text beside an image (left or right).',
    fields: [
      text('title', 'Title (optional)'),
      text('eyebrow', 'Eyebrow (optional)'),
      area('body', 'Body content (markdown) *'),
      sel('mediaPosition', 'Media position', ['left', 'right', 'top', 'bottom']),
    ],
    make: () => ({
      type: 'textMedia',
      title: 'Text & Media',
      body: 'TwinMOS high-performance hardware solutions.',
      mediaPosition: 'right',
    }),
  },
  // 10. FAQ Accordion
  {
    type: 'faqAccordion', label: 'FAQ accordion', icon: '❓', desc: 'Expandable question-and-answer items.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
      {
        k: 'list', key: 'items', label: 'Questions', itemLabel: 'Q&A', max: 20,
        defaultItem: { question: '', answer: '' },
        itemFields: [text('question', 'Question'), area('answer', 'Answer')],
      },
    ],
    make: () => ({
      type: 'faqAccordion',
      title: 'Frequently Asked Questions',
      items: [{ question: 'What is the warranty coverage?', answer: 'TwinMOS modules carry lifetime warranty support.' }],
    }),
  },
  // 11. Table
  {
    type: 'table', label: 'Data table', icon: '📋', desc: 'Structured tabular data with headers and cell rows.',
    fields: [
      text('title', 'Table title'),
      text('caption', 'Table caption'),
    ],
    make: () => ({
      type: 'table',
      title: 'Technical Specifications',
      caption: 'Specifications Overview',
      headers: ['Parameter', 'Specification'],
      rows: [['Form Factor', 'M.2 2280'], ['Interface', 'PCIe Gen4 x4']],
      isSpecTable: false,
    }),
  },
  // 12. Product Showcase
  {
    type: 'productShowcase', label: 'Product showcase', icon: '📦', desc: 'Highlighted products by SKU list with live spec chips.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
      sel('layout', 'Layout', ['grid', 'carousel']),
    ],
    make: () => ({
      type: 'productShowcase',
      title: 'Featured Products',
      layout: 'grid',
      query: { limit: 8 },
    }),
  },
  // 13. Spec Comparison
  {
    type: 'specComparison', label: 'Spec comparison', icon: '📊', desc: 'Comparative technical specification table across products.',
    fields: [
      text('headline', 'Section headline'),
      {
        k: 'list', key: 'columns', label: 'Product columns', itemLabel: 'Column', max: 4,
        defaultItem: { name: 'VOLTX DDR5' },
        itemFields: [text('name', 'Product name')],
      },
      {
        k: 'list', key: 'rows', label: 'Specification rows', itemLabel: 'Row', max: 30,
        defaultItem: { label: 'Capacity', values: '16GB | 32GB | 64GB' },
        itemFields: [text('label', 'Spec label'), text('values', 'Values (one per column, | separated)')],
      },
    ],
    make: () => ({
      type: 'specComparison',
      headline: 'Compare the line-up',
      columns: [{ name: 'Product A' }, { name: 'Product B' }],
      rows: [{ label: 'Speed', values: '6000 MT/s | 6400 MT/s' }],
    }),
  },
  // 14. Where to Buy
  {
    type: 'whereToBuy', label: 'Where to buy', icon: '📍', desc: 'Distributor locator teaser with region links.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
      text('defaultRegion', 'Default region', 'Middle East'),
    ],
    make: () => ({
      type: 'whereToBuy',
      title: 'Where to Buy',
      defaultRegion: 'Middle East',
      showDistributors: true,
      showMarketplaces: true,
    }),
  },
  // 15. Download Datasheet
  {
    type: 'downloadDatasheet', label: 'Downloads', icon: '📥', desc: 'Datasheet / QVL / quick-start download cards.',
    fields: [
      text('title', 'Section title'),
      text('description', 'Description'),
      {
        k: 'list', key: 'files', label: 'Files', itemLabel: 'File', max: 12,
        defaultItem: { title: 'Datasheet (PDF)', fileKey: 'datasheet.pdf', format: 'PDF' },
        itemFields: [text('title', 'Label'), text('fileKey', 'File Key'), text('format', 'Format')],
      },
    ],
    make: () => ({
      type: 'downloadDatasheet',
      title: 'Downloads & Resources',
      files: [{ title: 'VOLTX DDR5 Datasheet', fileKey: 'voltx-ddr5.pdf', format: 'PDF' }],
    }),
  },
  // 16. QVL Compatibility
  {
    type: 'qvlCompatibility', label: 'QVL widget', icon: '🔍', desc: 'Embedded compatibility-check widget section.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
      sel('defaultDeviceType', 'Default device', ['laptop', 'desktop', 'motherboard', 'server']),
    ],
    make: () => ({
      type: 'qvlCompatibility',
      title: 'System Compatibility',
      defaultDeviceType: 'laptop',
      showFinder: true,
    }),
  },
  // 17. Testimonial
  {
    type: 'testimonial', label: 'Testimonials', icon: '💬', desc: 'Customer quote with attribution and rating.',
    fields: [
      area('quote', 'Quote *'),
      text('author', 'Author *'),
      text('role', 'Role'),
      text('company', 'Company'),
    ],
    make: () => ({
      type: 'testimonial',
      quote: 'TwinMOS DDR5 delivers exceptional stability for our workstations.',
      author: 'Alex Chen',
      role: 'Lead Architect',
      company: 'Apex Systems',
      rating: 5,
      permissionFlag: true,
    }),
  },
  // 18. Badge Strip
  {
    type: 'badgeStrip', label: 'Badge strip', icon: '🎖️', desc: 'Horizontal strip of certification or warranty badges.',
    fields: [
      sel('layout', 'Layout', ['wrap', 'row']),
      {
        k: 'list', key: 'badges', label: 'Badges', itemLabel: 'Badge', max: 12,
        defaultItem: { label: 'ISO 9001', icon: '🛡️' },
        itemFields: [text('icon', 'Icon / Emoji'), text('label', 'Badge label')],
      },
    ],
    make: () => ({
      type: 'badgeStrip',
      layout: 'wrap',
      badges: [{ icon: '🛡️', label: 'ISO 9001' }, { icon: '⚡', label: 'Intel XMP 3.0' }],
    }),
  },
  // 19. Steps
  {
    type: 'steps', label: 'Steps / Process', icon: '🔢', desc: 'Numbered step-by-step workflow or setup guide.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
      {
        k: 'list', key: 'steps', label: 'Step items', itemLabel: 'Step', max: 6,
        defaultItem: { stepNumber: 1, title: 'Step 1', description: '' },
        itemFields: [{ k: 'number', key: 'stepNumber', label: 'Step #' }, text('title', 'Step title'), area('description', 'Description')],
      },
    ],
    make: () => ({
      type: 'steps',
      title: 'Warranty Claim Process',
      steps: [
        { stepNumber: 1, title: 'Verify serial number', description: 'Enter serial number on authenticity portal.' },
        { stepNumber: 2, title: 'Submit RMA ticket', description: 'Provide invoice and description of defect.' },
      ],
    }),
  },
  // 20. KPI Meters
  {
    type: 'kpiMeters', label: 'KPI meters', icon: '📊', desc: 'Visual progress meters and performance indicators.',
    fields: [
      text('title', 'Section title'),
      {
        k: 'list', key: 'kpis', label: 'Meters', itemLabel: 'Meter', max: 6,
        defaultItem: { label: 'Read Throughput', current: 7400, max: 8000, unit: 'MB/s' },
        itemFields: [text('label', 'Label'), { k: 'number', key: 'current', label: 'Current' }, { k: 'number', key: 'max', label: 'Max' }, text('unit', 'Unit')],
      },
    ],
    make: () => ({
      type: 'kpiMeters',
      title: 'Performance Metrics',
      kpis: [{ label: 'Sequential Read', current: 7400, max: 8000, unit: 'MB/s', status: 'optimal' }],
    }),
  },
  // 21. Callout
  {
    type: 'callout', label: 'Callout box', icon: '💡', desc: 'Prominent highlight box with colored border and icon.',
    fields: [
      sel('variant', 'Tone', ['info', 'warning', 'success', 'tip']),
      text('title', 'Callout title'),
      area('message', 'Callout message *'),
    ],
    make: () => ({
      type: 'callout',
      variant: 'info',
      title: 'System Compatibility Advice',
      message: 'Consult the TwinMOS QVL matrix before finalizing your memory kit.',
      cta: { label: 'Check Compatibility', url: '/compatibility.html' },
    }),
  },
  // 22. Link Chips
  {
    type: 'linkChips', label: 'Link chips', icon: '🏷️', desc: 'Pill-shaped quick navigation chips or filter tags.',
    fields: [
      text('title', 'Section title'),
      {
        k: 'list', key: 'chips', label: 'Chips', itemLabel: 'Chip', max: 16,
        defaultItem: { label: 'DDR5 Gaming', url: '/products.html' },
        itemFields: [text('label', 'Label'), text('url', 'Target URL')],
      },
    ],
    make: () => ({
      type: 'linkChips',
      title: 'Quick Links',
      chips: [
        { label: 'Gaming DRAM', url: '/products.html?cat=gaming-dram', isExternal: false },
        { label: 'Where to Buy', url: '/where-to-buy.html', isExternal: false },
      ],
    }),
  },
  // 23. Anchor Nav (NEW)
  {
    type: 'anchorNav', label: 'Anchor navigation', icon: '⚓', desc: 'Sticky in-page jump navigation bar.',
    fields: [
      text('title', 'Navigation title'),
      sel('sticky', 'Sticky bar', ['true', 'false']),
      {
        k: 'list', key: 'links', label: 'Jump links', itemLabel: 'Anchor', max: 8,
        defaultItem: { label: 'Overview', targetId: 'overview' },
        itemFields: [text('label', 'Label'), text('targetId', 'Target Section ID')],
      },
    ],
    make: () => ({
      type: 'anchorNav',
      title: 'Page Navigation',
      sticky: true,
      links: [
        { label: 'Overview', targetId: 'overview' },
        { label: 'Specifications', targetId: 'specs' },
      ],
    }),
  },
  // 24. Category Tiles
  {
    type: 'categoryTiles', label: 'Category tiles', icon: '🗂️', desc: 'Visual cards linking to primary product taxonomy categories.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
    ],
    make: () => ({
      type: 'categoryTiles',
      title: 'Product Categories',
      categoryIds: [],
      showCounts: true,
    }),
  },
  // 25. Policy Tabs
  {
    type: 'policyTabs', label: 'Policy tabs', icon: '📑', desc: 'Tabbed document viewer for multi-section policy documents.',
    fields: [
      text('title', 'Section title'),
      text('defaultSlug', 'Policy slug', 'privacy-policy'),
    ],
    make: () => ({
      type: 'policyTabs',
      title: 'Legal & Policies',
      defaultSlug: 'privacy-policy',
      showLastUpdated: true,
    }),
  },
  // 26. Form
  {
    type: 'form', label: 'Form embed', icon: '📝', desc: 'Interactive form widget mapped to form definition schema.',
    fields: [
      sel('formType', 'Form type', FORM_BLOCK_TYPES),
      text('title', 'Headline override (optional)'),
      area('description', 'Intro copy (optional)'),
    ],
    make: () => ({
      type: 'form',
      formType: 'contact',
      title: 'Contact Us',
      submitButtonText: 'Submit',
    }),
  },
  // 27. Office Cards
  {
    type: 'officeCards', label: 'Global office cards', icon: '🏢', desc: 'Dynamic cards rendering all corporate headquarters and regional hubs.',
    fields: [
      text('title', 'Section title'),
      text('subtitle', 'Section subtitle'),
    ],
    make: () => ({
      type: 'officeCards',
      title: 'Global Offices',
      showMap: false,
    }),
  },
  // 28. Article List
  {
    type: 'articleList', label: 'Article / News list', icon: '📰', desc: 'Dynamic list of recent articles or announcements.',
    fields: [
      text('title', 'Section title'),
      sel('displayStyle', 'Display style', ['grid', 'list', 'cards']),
    ],
    make: () => ({
      type: 'articleList',
      title: 'Latest Articles',
      query: { limit: 6, sort: 'latest' },
      displayStyle: 'grid',
      showDate: true,
      showReadingTime: true,
    }),
  },
  // 29. Glossary Index
  {
    type: 'glossaryIndex', label: 'Glossary index', icon: '📖', desc: 'Full A-Z interactive glossary directory with search filter.',
    fields: [
      text('title', 'Section title'),
      text('defaultLetter', 'Default letter (optional)'),
    ],
    make: () => ({
      type: 'glossaryIndex',
      title: 'Glossary Index',
      showLettersFilter: true,
    }),
  },
  // 30. App Embed
  {
    type: 'appEmbed', label: 'Interactive app embed', icon: '⚙️', desc: 'Embeddable interactive web application (e.g. SN Checker).',
    fields: [
      sel('widgetType', 'Widget Type', [
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
    ],
    make: () => ({
      type: 'appEmbed',
      widgetType: 'ram_configurator',
      config: {},
    }),
  },
];

export const blockDef = (type: string): BlockDef | undefined => BLOCK_DEFS.find((b) => b.type === type);

export type PageBlock = Record<string, unknown> & { type: string };

// Section blocks imported from the approved prototype use the renderer's own
// vocabulary (stats-tiles, card-grid, timeline, …), not the 30 builder types.
// Their editor is derived from the content they already hold, so every field
// an editor can see on the site is editable here (ZT-039).
const LONG = /^(lede|body|subtitle|description|desc|message|intro|excerpt|answer|quote)$/;
const SKIP = new Set(['id', 'type', 'component', 'meta', 'sectionId', 'html', 'version', 'jsonld']);
const human = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
function scalarField(key: string, sample: unknown): FieldDef | null {
  if (typeof sample === 'number') return { k: 'number', key, label: human(key) };
  if (typeof sample === 'string') return LONG.test(key) || sample.length > 80 ? { k: 'textarea', key, label: human(key) } : { k: 'text', key, label: human(key) };
  if (Array.isArray(sample) && sample.length > 0 && sample.every((x) => typeof x === 'string')) return { k: 'lines', key, label: `${human(key)} (one per line)` };
  return null;
}
// Item shapes for list keys the renderer knows, so an EMPTY list still gets the
// right editor (an empty array used to become a free-text list → 422 on save).
const KNOWN_ITEMS: Record<string, string[]> = {
  stats: ['value', 'label', 'sub'], items: ['title', 'description', 'badge', 'link', 'linkLabel'], ctas: ['label', 'url'],
  chips: ['label', 'url'], milestones: ['year', 'title', 'description'], steps: ['title', 'description'],
  links: ['label', 'targetId'], slides: ['title', 'kicker', 'lede', 'image', 'alt'], articles: ['slug', 'title', 'excerpt', 'tag'],
};
export function inferFields(block: Record<string, unknown>): FieldDef[] {
  const out: FieldDef[] = [];
  for (const [key, val] of Object.entries(block)) {
    if (SKIP.has(key)) continue;
    if (Array.isArray(val) && val.length === 0) {
      const shape = KNOWN_ITEMS[key];
      if (shape) out.push({ k: 'list', key, label: human(key), itemLabel: human(key).replace(/s$/, ''), defaultItem: Object.fromEntries(shape.map((k) => [k, ''])), itemFields: shape.map((k) => ({ k: 'text', key: k, label: human(k) }) as FieldDef) });
      continue;
    }
    const scalar = scalarField(key, val);
    if (scalar) { out.push(scalar); continue; }
    if (Array.isArray(val) && val.length && val.every((x) => x && typeof x === 'object' && !Array.isArray(x))) {
      const keys = [...new Set(val.flatMap((x) => Object.keys(x as object)))];
      const itemFields = keys.map((k) => scalarField(k, (val.find((x) => (x as Record<string, unknown>)[k] != null) as Record<string, unknown>)?.[k] ?? '')).filter(Boolean) as FieldDef[];
      out.push({ k: 'list', key, label: human(key), itemLabel: human(key).replace(/s$/, ''), defaultItem: Object.fromEntries(itemFields.map((f) => [f.key, f.k === 'lines' ? [] : ''])), itemFields });
    }
  }
  return out;
}
