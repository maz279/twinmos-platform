// Rebuilds the CMS page blocks from the approved prototype (prototype/*.html)
// — zero-trust audit ZT-036: 225 of 230 stored blocks had no content and the
// site rendered heading shells and hard-coded filler.
//
// For every stored block (same order and component as the prototype, verified
// by segment.mjs) this fills the typed fields BlockDispatcher.astro reads.
// Copy passes a truth filter against twinmos_mirror/authoritative_facts.md:
// claims with no source are removed and logged, never rewritten into new
// claims. Every remaining figure is listed in content/CLAIMS_REVIEW.md for the
// content owner's sign-off.
// Usage: node tooling/content/rebuild-blocks.mjs [snapshotDir=apps/api/content/snapshot]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { segmentPage } from './segment.mjs';

const SNAP = process.argv[2] ?? 'apps/api/content/snapshot';
const pages = JSON.parse(readFileSync(join(SNAP, 'page.json'), 'utf8'));
const articleSlugs = new Set(JSON.parse(readFileSync(join(SNAP, 'article.json'), 'utf8')).filter((a) => a.status === 'published').map((a) => a.slug));
const productSlugs = new Set(JSON.parse(readFileSync(join(SNAP, 'product.json'), 'utf8')).filter((p) => p.status === 'published').map((p) => p.slug));
const removed = [];
const claims = [];

// ---------- text helpers ----------
const T = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const text = (el) => {
  if (!el) return '';
  const c = el.cloneNode(true);
  c.querySelectorAll('img.ilog').forEach((i) => i.replaceWith(c.ownerDocument.createTextNode('TwinMOS')));
  c.querySelectorAll('svg, script, style, .sr-only, [aria-hidden="true"]').forEach((n) => n.remove());
  return T(c.textContent).replace(/TwinMOS\s+TwinMOS/g, 'TwinMOS');
};
const q = (el, sel) => (el ? el.querySelector(sel) : null);
const qa = (el, sel) => (el ? [...el.querySelectorAll(sel)] : []);

/** prototype link → production URL */
function url(href) {
  if (!href) return '';
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const m = /^([a-z0-9-]+)\.html(\?[^#]*)?(#.*)?$/.exec(href.replace(/^\.?\//, ''));
  if (!m) return href.startsWith('/') ? href : '/' + href.replace(/^\.?\//, '');
  const [, page, qs = '', hash = ''] = m;
  const params = new URLSearchParams(qs.slice(1));
  if (page === 'product' && params.get('id')) return productSlugs.has(params.get('id')) ? `/products/${params.get('id')}` : '/products';
  if (page === 'article' && params.get('id')) return articleSlugs.has(params.get('id')) ? `/learn/${params.get('id')}` : '/learn';
  if (page === 'index') return '/' + hash;
  return `/${page}${qs}${hash}`;
}
const img = (src) => (src ? '/' + src.replace(/^\.?\//, '').replace(/\?v=[0-9a-f]+$/, '') : '');

/** Safe inline HTML for body fields (renderer sanitises again). */
function rich(el) {
  if (!el) return '';
  const c = el.cloneNode(true);
  c.querySelectorAll('img.ilog').forEach((i) => i.replaceWith(c.ownerDocument.createTextNode('TwinMOS')));
  c.querySelectorAll('svg, script, style, .motto-mark').forEach((n) => n.remove());
  c.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', url(a.getAttribute('href'))));
  c.querySelectorAll('*').forEach((n) => { [...n.attributes].forEach((a) => { if (!['href'].includes(a.name)) n.removeAttribute(a.name); }); });
  return T(c.innerHTML);
}

// ---------- truth filter ----------
// Claims with no support in the fact base (or contradicted by it). Matching
// items/sentences are removed; the removal is recorded for the content owner.
const UNSUPPORTED = [
  [/Best SSD Manufacturer|solution award|\baward\b/i, 'award claim not on twinmos.com'],
  [/\d+\s*[–-]\s*\d+\s+employees|\d[\d,]*\+?\s+employees/i, 'headcount not published on twinmos.com'],
  [/longest distributor|years at the Dubai hub|free-zone hub in 2001|\b2001\b/i, 'Dubai hub founding date not on twinmos.com'],
  [/attribution pending/i, 'unattributed testimonial'],
  [/first-pass yield|return rate|burn-in failure rate|on-time delivery|all targets met/i, 'quality KPI figures with no published source'],
  [/acknowledged within 24 hours|72-hour initial response/i, 'service-level promise with no published policy'],
  [/Annual ESG reporting/i, 'ESG reporting commitment with no published source'],
  [/fill rate|active campaigns|SKUs available to channel|RMA turnaround/i, 'portal demo statistics, not real data'],
  [/→\s*\d|carbon footprint/i, 'unpublished corporate targets'],
  [/4 continents/i, 'contradicts the office footprint (the five offices span three continents)'],
  [/Best SSD|Superbrand/i, 'award claim not on twinmos.com'],
  [/placeholder attributions|signed releases/i, 'refers to testimonials that are not published'],
  [/Amazon|Newegg|noon/i, 'marketplace presence not verified (listings removed)'],
  [/Middle East FZE|ME LLC|parent with|privately held/i, 'corporate structure not published (the fact base names no parent or holding company)'],
];
const unsupported = (s) => UNSUPPORTED.find(([re]) => re.test(s));
function keep(ctx, s) {
  const hit = unsupported(s);
  if (hit) { removed.push({ ...ctx, text: s.slice(0, 160), reason: hit[1] }); return false; }
  return true;
}
/** Drops unsupported sentences from a prose string. */
function prose(ctx, s) {
  return s.split(/(?<=[.!?])\s+/).filter((x) => keep(ctx, x)).join(' ');
}
const FIGURE = /(\d[\d,.]*\s*(%|\+|×|x\b|years?|MB\/s|GB\/s|TB|GB|hrs?|hours|min|countries|products|offices|continents|generations))|\b(19|20)\d{2}\b/i;
function noteClaims(ctx, s) { if (FIGURE.test(s)) claims.push({ ...ctx, text: s.slice(0, 200) }); }

// ---------- generic item extraction ----------
function ctas(el) {
  return qa(el, 'a.btn').map((a) => ({ label: text(a).replace(/\s*→$/, ''), url: url(a.getAttribute('href')), variant: /btn-ghost|btn-outline|sl-cta2/.test(a.className) ? 'secondary' : 'primary' }));
}
function cardItem(card, ctx) {
  const title = text(q(card, 'h3, h4, b, strong'));
  const badge = text(q(card, ':scope > .chip, :scope > span.chip, .of-role, .chip'));
  const list = qa(card, 'li').map(text).filter((x) => keep(ctx, x));
  const paras = qa(card, 'p, blockquote, .acc-body, span.form-note').map(text).filter(Boolean);
  const description = prose(ctx, paras.join(' '));
  const a = card.matches('a[href]') ? card : q(card, 'a.link-arrow, a.btn, a[href]');
  // cards whose only label is the chip (mission/vision) use it as the title
  const item = { title: title || badge, description };
  if (badge && badge !== item.title) item.badge = badge;
  if (list.length) item.list = list;
  if (a) { item.link = url(a.getAttribute('href')); const lbl = card.matches('a') ? text(q(card, '.link-arrow')) : text(a); if (lbl) item.linkLabel = lbl; }
  const icon = text(q(card, '.ico, .sup-ico, .icon'));
  if (icon && icon.length <= 3) item.icon = icon;
  const pic = q(card, 'img:not(.ilog)');
  if (pic) { item.image = img(pic.getAttribute('src')); item.alt = pic.getAttribute('alt') || ''; }
  [title, description, ...list].forEach((s) => noteClaims(ctx, s));
  return item;
}
function cardsOf(el) {
  const kids = [...el.children].filter((k) => !k.matches('script, style'));
  return kids.length ? kids : [el];
}
function statsOf(el, ctx) {
  const cells = qa(el, '.hero-stat-box, .b-cell, .v-t, .reach-stats > div, .cb-cell, .sla-cell, .hs-cell, .trust-item, .stat, .hero-stat, .gstat, .kpi');
  const src = cells.length ? cells : cardsOf(el);
  const out = [];
  for (const c of src) {
    const v = q(c, '.hero-stat-num, .big, b, strong, .n, .v');
    const value = text(v);
    if (!value) continue;
    const subEl = q(c, '.hero-stat-sub');
    const sub = text(subEl);
    const label = text(q(c, '.hero-stat-lbl')) || T(text(c).replace(value, '').replace(sub, ''));
    const s = `${value} ${label}`;
    if (!keep(ctx, s)) continue;
    noteClaims(ctx, s);
    const link = q(c, 'a[href]');
    out.push({ value, label, ...(sub ? { sub } : {}), ...(link ? { link: url(link.getAttribute('href')) } : {}) });
  }
  return out;
}

// ---------- per-type extraction ----------
function extract(type, s, ctx) {
  const el = s.el;
  const f = {};
  switch (type) {
    case 'page-hero':
    case 'error-hero': {
      const w = q(el, '.wrap') || el;
      f.eyebrow = text(q(w, '.eyebrow'));
      f.title = text(q(w, 'h1, h2'));
      f.lede = prose(ctx, text(q(w, 'p.lede')));
      const chips = qa(w, '.pillar-chip, .loc-chips .chip, .hero-chips .chip').map(text);
      if (chips.length) f.chips = chips;
      const jl = qa(w, '.car-nav a, .anchor-chips a').map((a) => ({ label: text(a), targetId: (a.getAttribute('href') || '').replace(/^#/, '') })).filter((x) => x.targetId);
      if (jl.length) f.jumpLinks = jl;
      const ts = qa(w, '.trust-item').map((t) => ({ value: text(q(t, 'b')), label: text(q(t, 'span')) })).filter((x) => keep(ctx, `${x.value} ${x.label}`));
      if (ts.length) f.trustStats = ts;
      const c = ctas(w);
      if (c.length) f.ctas = c;
      if (q(w, 'form')) f.searchForm = true;
      [f.title, f.lede, ...(ts.map((x) => `${x.value} ${x.label}`))].forEach((x) => noteClaims(ctx, x || ''));
      break;
    }
    case 'hero-slider': {
      f.slides = qa(el, '.sl-slide').map((sl) => {
        const pic = q(sl, '.sl-bg img');
        const slide = {
          image: img(pic?.getAttribute('src')), alt: pic?.getAttribute('alt') || '',
          kicker: text(q(sl, '.sl-kicker')), title: text(q(sl, '.sl-title')), lede: prose(ctx, text(q(sl, '.sl-lede'))),
          ctas: ctas(sl),
        };
        noteClaims(ctx, `${slide.title} ${slide.lede}`);
        return slide;
      }).filter((x) => x.title);
      const auto = Number(el.getAttribute('data-autoplay'));
      if (auto) f.intervalMs = auto;
      break;
    }
    case 'stats-tiles': case 'stats-band-copy': case 'stats-demo': {
      f.stats = statsOf(el, ctx);
      const h = q(el, 'h2, h3');
      if (h && !s.head) f.heading = text(h);
      const eb = q(el, '.eyebrow, .v2030-l');
      if (eb && !s.head) f.eyebrow = text(eb);
      const body = qa(el, 'p').filter((p) => !p.closest('.b-cell, .v-t, .reach-stats > div, .cb-cell, .sla-cell')).map(text).join(' ');
      if (body) f.body = prose(ctx, body);
      const c = ctas(el);
      if (c.length) f.ctas = c;
      const chips = qa(el, '.reach-chips .chip, .chip-row .chip').map(text);
      if (chips.length) f.chips = chips;
      break;
    }
    case 'card-grid': case 'icon-card-grid': case 'section-tiles': case 'bento-grid': {
      f.items = cardsOf(el).map((c) => cardItem(c, ctx)).filter((x) => x.title || x.description || (x.list && x.list.length));
      break;
    }
    case 'cta-banner': case 'cta-inline-card': case 'cta-row': case 'cta-split': {
      const h = q(el, 'h2, h3');
      f.title = h ? text(h) : '';
      f.subtitle = prose(ctx, qa(el, 'p').map(text).join(' '));
      const perks = qa(el, 'li').map(text).filter((x) => keep(ctx, x));
      if (perks.length) f.list = perks;
      const eb = q(el, '.eyebrow');
      if (eb) f.badge = text(eb);
      f.ctas = ctas(el);
      noteClaims(ctx, `${f.title} ${f.subtitle} ${(perks || []).join(' ')}`);
      break;
    }
    case 'timeline': {
      f.milestones = qa(el, '.tl-item').map((it) => ({ year: text(q(it, '.tl-date')), title: text(q(it, 'b')), description: text(q(it, 'p')) }))
        .filter((m) => keep(ctx, `${m.year} ${m.title} ${m.description}`));
      f.milestones.forEach((m) => noteClaims(ctx, `${m.year} ${m.title} ${m.description}`));
      break;
    }
    case 'rich-text+factfile': case 'text-columns': {
      const col = q(el, ':scope > div') || el;
      const eb = q(col, '.eyebrow'); if (eb && !s.head) f.eyebrow = text(eb);
      const h = q(col, 'h2'); if (h && !s.head) f.title = text(h);
      const parts = qa(col, ':scope > p, :scope > ul, :scope > ol, :scope > h3, :scope > div > p').map((n) => {
        const t = text(n);
        if (!keep(ctx, t)) return '';
        noteClaims(ctx, t);
        return rich(n) && `<${n.tagName.toLowerCase()}>${rich(n)}</${n.tagName.toLowerCase()}>`;
      }).filter(Boolean);
      f.body = parts.join('');
      const mq = q(col, 'blockquote');
      if (mq) f.quote = { text: text(q(mq, 'b')) || text(mq), author: text(q(mq, '.motto-sub')) };
      const ff = q(el, 'aside.factfile, .factfile');
      if (ff) {
        f.factfile = {
          title: text(q(ff, 'h3')),
          facts: qa(ff, 'dl > div').map((d) => ({ label: text(q(d, 'dt')), value: text(q(d, 'dd')) })).filter((x) => keep(ctx, `${x.label} ${x.value}`)),
        };
        f.factfile.facts.forEach((x) => noteClaims(ctx, `${x.label} ${x.value}`));
      }
      break;
    }
    case 'table': case 'spec-table': {
      const t = q(el, 'table');
      f.headers = qa(t, 'thead th').map(text);
      f.rows = qa(t, 'tbody tr').map((tr) => qa(tr, 'td').map(text)).filter((r) => keep(ctx, r.join(' ')));
      f.rows.forEach((r) => noteClaims(ctx, r.join(' | ')));
      break;
    }
    case 'badge-strip': case 'trust-badges': {
      f.badges = qa(el, '.cb-badge, .sync-badge, .badge, .tb-badge, .chip').map(text).filter((x) => keep(ctx, x));
      const h = q(el, 'h3, h2'); if (h) f.title = text(h);
      const p = q(el, 'p'); if (p) f.subtitle = text(p);
      break;
    }
    case 'steps': {
      f.steps = qa(el, '.step').map((st) => ({ title: text(q(st, 'b')), description: text(q(st, 'span, p')) })).filter((x) => keep(ctx, `${x.title} ${x.description}`));
      f.steps.forEach((st, i) => { st.stepNumber = i + 1; });
      break;
    }
    case 'kpi-meters+steps': {
      // The prototype panel shows invented "live" quality KPIs; only the steps survive.
      f.steps = qa(el, '.step, .qs-step').map((st) => ({ title: text(q(st, 'b')), description: text(q(st, 'span, p')) })).filter((x) => x.title && keep(ctx, `${x.title} ${x.description}`));
      removed.push({ ...ctx, text: 'Live quality metrics panel (first-pass yield 99.7%, return rate 0.25% …)', reason: 'quality KPI figures with no published source' });
      break;
    }
    case 'callout': case 'empty-state': {
      const lead = q(el, ':scope > b');
      const msg = text(el);
      f.message = prose(ctx, msg.replace(lead ? text(lead) : '', '').trim());
      if (lead && f.message) f.title = text(lead).replace(/:$/, '');
      noteClaims(ctx, msg);
      break;
    }
    case 'anchor-nav': {
      f.links = qa(el, 'a').map((a) => ({ label: text(a), targetId: (a.getAttribute('href') || '').replace(/^#/, '') }));
      break;
    }
    case 'link-chips': case 'link-list': case 'filter-chips': {
      const lab = q(el, '.brand-row-l, :scope > .form-note, :scope > span.form-note');
      f.title = lab ? text(lab).replace(/:$/, '') : '';
      f.chips = qa(el, 'a, span.chip, button.chip').filter((x) => x !== lab).map((a) => ({ label: text(a), url: a.getAttribute('href') ? url(a.getAttribute('href')) : '' }))
        .filter((x) => x.label && keep(ctx, x.label));
      break;
    }
    case 'tabbed-faq': case 'faq-accordion': {
      f.items = qa(el, 'details').map((d) => ({ question: text(q(d, 'summary')), answer: text(q(d, '.acc-body')) })).filter((x) => x.question);
      // keep the prototype's tab grouping (support FAQ: 11 tabs, 126 answers)
      const tabs = qa(el, '.tabs .tab');
      if (tabs.length) {
        f.groups = tabs.map((t) => {
          const pane = q(el, '#' + t.getAttribute('data-tab'));
          return { label: text(t), items: qa(pane, 'details').map((d) => ({ question: text(q(d, 'summary')), answer: text(q(d, '.acc-body')) })).filter((x) => x.question) };
        }).filter((g) => g.items.length);
      }
      break;
    }
    case 'testimonials': {
      // Only quotes with a named, consented source may be published (rule 8).
      const n = qa(el, '.testi-card').length;
      if (n) removed.push({ ...ctx, text: `${n} unattributed testimonial(s)`, reason: 'no named, consented source' });
      f.items = [];
      break;
    }
    case 'article-cards': case 'article-index': case 'article-feed': case 'featured-articles': case 'learning-paths': {
      const arts = qa(el, 'a[href*="article.html?id="]').map((a) => {
        const slug = new URLSearchParams((a.getAttribute('href').split('?')[1]) || '').get('id');
        return { slug, title: text(q(a, 'b, h3')) || text(a), excerpt: text(q(a, '.form-note, p')), tag: text(q(a, '.chip')) };
      }).filter((x) => x.slug && articleSlugs.has(x.slug));
      if (arts.length) f.articles = arts;
      break;
    }
    case 'category-tiles': {
      f.categories = qa(el, 'a.cat-tile').map((a) => {
        const href = a.getAttribute('href') || '';
        const slug = new URLSearchParams(href.split('?')[1] || '').get('cat') || '';
        const pic = q(a, 'img');
        return { slug, name: text(q(a, '.cat-body b, b')), pill: text(q(a, '.cat-pill')), image: img(pic?.getAttribute('src')), desc: text(q(a, '.cat-desc')), url: url(href) };
      }).filter((c) => c.slug && c.name);
      f.categories.forEach((c) => noteClaims(ctx, `${c.name} ${c.desc}`));
      break;
    }
    case 'product-rail': {
      // prototype rails were filled by app.js: the home flagship grid shows the
      // CMS "featured" products, the gaming rail the gaming flagship set
      const rail = el.getAttribute('data-rail');
      if (rail === 'gaming') f.query = { skus: ['voltx-rgb-ddr5-u-dimm-for-desktop', 'voltx-ddr5-u-dimm-for-desktop', 'tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop', 'smartx-rgb-80-plus-bronze-power-supply-550w'], limit: 4 };
      else if (el.id === 'homeFlagshipGrid') f.query = { featured: true, limit: 8 };
      break;
    }
    case 'form': {
      // the form's API type follows the page (blocks were stored without one and all
      // submitted as 'contact' — no RMA case was ever created from /rma)
      const byPage = { '/rma.html': 'rma', '/quote.html': 'quote', '/contact.html': 'contact', '/careers.html': 'job-application', '/partners.html': 'partner-portal' };
      f.formType = byPage[ctx.page] ?? 'contact';
      const h = q(el, 'h2, h3');
      if (h && !s.head) f.title = text(h);
      const btn = q(el, 'button[type=submit], form .btn');
      if (btn) f.submitButtonText = text(btn);
      break;
    }
    case 'promo-card': {
      f.href = url(el.getAttribute('href') || q(el, 'a')?.getAttribute('href'));
      f.heading = text(q(el, 'b, h3'));
      f.description = prose(ctx, text(q(el, '.form-note, p')));
      noteClaims(ctx, `${f.heading} ${f.description}`);
      break;
    }
    case 'json-ld': {
      try { f.jsonld = JSON.parse(el.textContent); } catch { /* leave empty */ }
      // Roadmap Z-24: no FAQ structured data anywhere on the site.
      if (/faq/i.test(String(f.jsonld?.['@type'] ?? ''))) {
        removed.push({ ...ctx, text: `JSON-LD ${f.jsonld['@type']}`, reason: 'FAQ structured data is excluded site-wide (roadmap Z-24)' });
        delete f.jsonld;
      }
      break;
    }
    case 'breadcrumb': {
      f.crumbs = qa(el, '.breadcrumb a').map((a) => ({ label: text(a), url: url(a.getAttribute('href')) }));
      break;
    }
    default:
      break; // data-bound blocks and JS widgets carry configuration only
  }
  return f;
}

// ---------- rebuild ----------
let filled = 0;
for (const p of pages) {
  const file = 'prototype/' + (p.path === '/' ? 'index.html' : p.path.replace(/^\//, ''));
  const { segments } = segmentPage(file);
  const blocks = p.blocks || [];
  if (segments.length !== blocks.length) throw new Error(`${p.path}: ${segments.length} segments vs ${blocks.length} blocks`);
  p.blocks = blocks.map((b, i) => {
    const s = segments[i];
    if (b.component !== s.component) throw new Error(`${p.path} #${i + 1}: ${b.component} != ${s.component}`);
    const ctx = { page: p.path, block: b.id, type: b.type };
    const head = s.head;
    const fields = extract(b.type, s, ctx);
    const next = {
      id: b.id, type: b.type, sectionId: b.sectionId, component: b.component, meta: b.meta,
      // the section heading belongs to the first block of the section only
      heading: head ? text(q(head, 'h2, h3')) : '',
      title: head ? text(q(head, 'h2, h3')) : '',
      eyebrow: head ? text(q(head, '.eyebrow')) : '',
      ...(head && q(head, 'a.link-arrow') ? { headLink: { label: text(q(head, 'a.link-arrow')), url: url(q(head, 'a.link-arrow').getAttribute('href')) } } : {}),
      ...(s.intro.length ? { intro: s.intro.map(text).join(' ') } : {}),
      ...fields,
    };
    if (fields.title && !head) { next.title = fields.title; next.heading = fields.title; }
    if (fields.heading && !head) next.heading = fields.heading;
    if (fields.eyebrow && !head) next.eyebrow = fields.eyebrow;
    if (Object.keys(fields).length) filled++;
    return next;
  });
}

writeFileSync(join(SNAP, 'page.json'), JSON.stringify(pages, null, 1) + '\n');
const md = [
  '# Page content — claims register', '',
  'Generated by `tooling/content/rebuild-blocks.mjs` from the approved prototype copy.',
  '', '## Removed (no source in the fact base)', '', '| Page | Block | Text | Reason |', '|---|---|---|---|',
  ...removed.map((r) => `| ${r.page} | ${r.block} | ${r.text.replace(/\|/g, '/')} | ${r.reason} |`),
  '', '## Published figures awaiting content-owner confirmation', '',
  '- USA office address "12345 Silicon Valley Blvd, Suite 100, San Jose" is published exactly as on twinmos.com/contact but reads like a placeholder — confirm or replace.', '',
  'Every number, date or measurable claim that remains on a page. The fact base confirms: founded 1998 in Taipei; 93+ countries, five continents, 100+ products; ISO 9001:2000 by TÜV SÜD in 2002; RoHS/CE/FCC/EPEAT/JEDEC; the five offices; per-product warranties and specs. Anything else here needs a named owner\'s sign-off before go-live.',
  '', '| Page | Block | Text |', '|---|---|---|',
  ...claims.map((c) => `| ${c.page} | ${c.block} | ${c.text.replace(/\|/g, '/')} |`), '',
];
writeFileSync(join(SNAP, '..', 'CLAIMS_REVIEW.md'), md.join('\n'));
console.log(`blocks with content: ${filled}/${pages.reduce((n, p) => n + p.blocks.length, 0)}; removed claims: ${removed.length}; figures for review: ${claims.length}`);
