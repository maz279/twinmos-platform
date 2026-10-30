// Rebuilds CMS page blocks from prototype/*.html with 100% fidelity.
// Extracts all structured fields for BlockDispatcher.astro across all 28 pages.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { segmentPage } from './segment.mjs';

const SNAP = process.argv[2] ?? 'apps/api/content/snapshot';
const pages = JSON.parse(readFileSync(join(SNAP, 'page.json'), 'utf8'));

const articleSlugs = new Set(
  JSON.parse(readFileSync(join(SNAP, 'article.json'), 'utf8'))
    .filter((a) => a.status === 'published')
    .map((a) => a.slug)
);
const productSlugs = new Set(
  JSON.parse(readFileSync(join(SNAP, 'product.json'), 'utf8'))
    .filter((p) => p.status === 'published')
    .map((p) => p.slug)
);

// Helpers
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

function url(href) {
  if (!href) return '';
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const m = /^([a-z0-9-]+)\.html(\?[^#]*)?(#.*)?$/.exec(href.replace(/^\.?\//, ''));
  if (!m) return href.startsWith('/') ? href : '/' + href.replace(/^\.?\//, '');
  const [, page, qs = '', hash = ''] = m;
  const params = new URLSearchParams(qs.slice(1));
  if (page === 'product' && params.get('id')) return `/product?id=${params.get('id')}`;
  if (page === 'article' && params.get('id')) return `/learn/${params.get('id')}`;
  if (page === 'index') return '/' + hash;
  return `/${page}${qs}${hash}`;
}

const img = (src) => {
  if (!src) return '';
  let clean = src.replace(/^\.?\//, '').replace(/\?v=[0-9a-f]+$/, '');
  return clean.startsWith('/') ? clean : '/' + clean;
};

function rich(el) {
  if (!el) return '';
  const c = el.cloneNode(true);
  c.querySelectorAll('img.ilog').forEach((i) => i.replaceWith(c.ownerDocument.createTextNode('TwinMOS')));
  c.querySelectorAll('svg, script, style, .motto-mark').forEach((n) => n.remove());
  c.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', url(a.getAttribute('href'))));
  c.querySelectorAll('img[src]').forEach((im) => im.setAttribute('src', img(im.getAttribute('src'))));
  return T(c.innerHTML);
}

function ctas(el) {
  return qa(el, 'a.btn, button.btn').map((a) => ({
    label: text(a).replace(/\s*→$/, ''),
    url: url(a.getAttribute('href') || ''),
    variant: /btn-ghost|btn-outline|sl-cta2/.test(a.className) ? 'secondary' : 'primary'
  })).filter(c => c.label);
}

function cardItem(card, ctx) {
  const title = text(q(card, 'h3, h4, b, strong'));
  const badge = text(q(card, ':scope > .chip, :scope > span.chip, .of-role, .chip, .badge'));
  const list = qa(card, 'li').map(text).filter(Boolean);
  const paras = qa(card, 'p, blockquote, .acc-body, span.form-note, .val-desc, .dep-desc').map(text).filter(Boolean);
  const description = paras.join(' ');
  const a = card.matches('a[href]') ? card : q(card, 'a.link-arrow, a.btn, a[href]');
  const item = { title: title || badge, description };
  if (badge && badge !== item.title) item.badge = badge;
  if (list.length) item.list = list;
  if (a) {
    item.link = url(a.getAttribute('href'));
    const lbl = card.matches('a') ? text(q(card, '.link-arrow')) : text(a);
    if (lbl) item.linkLabel = lbl;
  }
  const icon = text(q(card, '.ico, .sup-ico, .icon'));
  if (icon && icon.length <= 4) item.icon = icon;
  const pic = q(card, 'img:not(.ilog)');
  if (pic) {
    item.image = img(pic.getAttribute('src'));
    item.alt = pic.getAttribute('alt') || '';
  }
  return item;
}

function cardsOf(el) {
  const kids = [...el.children].filter((k) => !k.matches('script, style'));
  return kids.length ? kids : [el];
}

function statsOf(el, ctx) {
  const cells = qa(el, '.hero-stat-box, .b-cell, .v-t, .reach-stats > div, .cb-cell, .sla-cell, .hs-cell, .trust-item, .stat, .hero-stat, .gstat, .kpi, .kpi-meter');
  const src = cells.length ? cells : cardsOf(el);
  const out = [];
  for (const c of src) {
    const v = q(c, '.hero-stat-num, .big, b, strong, .n, .v, .kpi-val');
    const value = text(v);
    if (!value) continue;
    const subEl = q(c, '.hero-stat-sub, .kpi-sub');
    const sub = text(subEl);
    const label = text(q(c, '.hero-stat-lbl, .kpi-lbl')) || T(text(c).replace(value, '').replace(sub, ''));
    const link = q(c, 'a[href]');
    out.push({ value, label, ...(sub ? { sub } : {}), ...(link ? { link: url(link.getAttribute('href')) } : {}) });
  }
  return out;
}

function extract(type, s, ctx) {
  const el = s.el;
  const f = {};
  switch (type) {
    case 'page-hero':
    case 'error-hero': {
      const w = q(el, '.wrap') || el;
      f.eyebrow = text(q(w, '.eyebrow'));
      f.title = text(q(w, 'h1, h2'));
      f.lede = text(q(w, 'p.lede'));
      const chips = qa(w, '.pillar-chip, .loc-chips .chip, .hero-chips .chip').map(text);
      if (chips.length) f.chips = chips;
      const jl = qa(w, '.car-nav a, .anchor-chips a').map((a) => ({ label: text(a), targetId: (a.getAttribute('href') || '').replace(/^#/, '') })).filter((x) => x.targetId);
      if (jl.length) f.jumpLinks = jl;
      const ts = qa(w, '.trust-item').map((t) => ({ value: text(q(t, 'b')), label: text(q(t, 'span')) }));
      if (ts.length) f.trustStats = ts;
      const c = ctas(w);
      if (c.length) f.ctas = c;
      if (q(w, 'form')) f.searchForm = true;
      break;
    }
    case 'hero-slider': {
      f.slides = qa(el, '.sl-slide').map((sl) => {
        const pic = q(sl, '.sl-bg img');
        return {
          image: img(pic?.getAttribute('src')),
          alt: pic?.getAttribute('alt') || '',
          kicker: text(q(sl, '.sl-kicker')),
          title: text(q(sl, '.sl-title')),
          lede: text(q(sl, '.sl-lede')),
          ctas: ctas(sl),
        };
      }).filter((x) => x.title);
      const auto = Number(el.getAttribute('data-autoplay'));
      f.intervalMs = auto || 6500;
      break;
    }
    case 'stats-tiles': case 'stats-band-copy': case 'stats-demo': {
      f.stats = statsOf(el, ctx);
      const h = q(el, 'h2, h3');
      if (h && !s.head) f.heading = text(h);
      const eb = q(el, '.eyebrow, .v2030-l');
      if (eb && !s.head) f.eyebrow = text(eb);
      const body = qa(el, 'p').filter((p) => !p.closest('.b-cell, .v-t, .reach-stats > div, .cb-cell, .sla-cell')).map(text).join(' ');
      if (body) f.body = body;
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
      f.subtitle = qa(el, 'p').map(text).join(' ');
      const perks = qa(el, 'li').map(text);
      if (perks.length) f.list = perks;
      const eb = q(el, '.eyebrow');
      if (eb) f.badge = text(eb);
      f.ctas = ctas(el);
      break;
    }
    case 'timeline': {
      f.milestones = qa(el, '.tl-item').map((it) => ({
        year: text(q(it, '.tl-date')),
        title: text(q(it, 'b, strong, h4')),
        description: text(q(it, 'p, .tl-desc'))
      })).filter(m => m.title || m.year);
      break;
    }
    case 'rich-text+factfile': case 'text-columns': {
      const col = q(el, ':scope > div') || el;
      const eb = q(col, '.eyebrow'); if (eb && !s.head) f.eyebrow = text(eb);
      const h = q(col, 'h2'); if (h && !s.head) f.title = text(h);
      const parts = qa(col, ':scope > p, :scope > ul, :scope > ol, :scope > h3, :scope > div > p').map((n) => `<${n.tagName.toLowerCase()}>${rich(n)}</${n.tagName.toLowerCase()}>`).filter(Boolean);
      f.body = parts.join('');
      const mq = q(col, 'blockquote');
      if (mq) f.quote = { text: text(q(mq, 'b')) || text(mq), author: text(q(mq, '.motto-sub')) };
      const ff = q(el, 'aside.factfile, .factfile');
      if (ff) {
        f.factfile = {
          title: text(q(ff, 'h3')),
          facts: qa(ff, 'dl > div').map((d) => ({ label: text(q(d, 'dt')), value: text(q(d, 'dd')) }))
        };
      }
      break;
    }
    case 'table': case 'spec-table': {
      const t = q(el, 'table');
      f.headers = qa(t, 'thead th').map(text);
      f.rows = qa(t, 'tbody tr').map((tr) => qa(tr, 'td').map(text)).filter((r) => r.length > 0);
      break;
    }
    case 'badge-strip': case 'trust-badges': {
      f.badges = qa(el, '.cb-badge, .sync-badge, .badge, .tb-badge, .chip, img.ilog').map((b) => {
        if (b.tagName === 'IMG') return { image: img(b.getAttribute('src')), alt: b.getAttribute('alt') || 'Badge' };
        return text(b);
      }).filter(Boolean);
      const h = q(el, 'h3, h2'); if (h) f.title = text(h);
      const p = q(el, 'p'); if (p) f.subtitle = text(p);
      break;
    }
    case 'steps': {
      f.steps = qa(el, '.step, .qs-step').map((st) => ({
        title: text(q(st, 'b, strong, h4')),
        description: text(q(st, 'span, p, .step-desc'))
      })).filter((x) => x.title);
      f.steps.forEach((st, i) => { st.stepNumber = i + 1; });
      break;
    }
    case 'kpi-meters+steps': {
      f.kpis = qa(el, '.kpi-meter, .meter, .kpi').map(m => ({
        label: text(q(m, '.kpi-label, span, b')),
        value: text(q(m, '.kpi-val, strong, .big')),
        target: text(q(m, '.kpi-target, .target')),
      })).filter(k => k.label);
      f.steps = qa(el, '.step, .qs-step').map(st => ({
        title: text(q(st, 'b, strong, h4')),
        description: text(q(st, 'span, p, .step-desc')),
      })).filter(x => x.title);
      f.steps.forEach((st, i) => { st.stepNumber = i + 1; });
      break;
    }
    case 'callout': case 'empty-state': {
      const lead = q(el, ':scope > b, :scope > strong');
      const msg = text(el);
      f.message = lead ? msg.replace(text(lead), '').trim() : msg;
      if (lead) f.title = text(lead).replace(/:$/, '');
      if (!f.title) {
        const h = q(el, 'h3, h4');
        if (h) f.title = text(h);
      }
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
        .filter((x) => x.label);
      break;
    }
    case 'tabbed-faq': case 'faq-accordion': {
      f.items = qa(el, 'details').map((d) => ({ question: text(q(d, 'summary')), answer: text(q(d, '.acc-body')) })).filter((x) => x.question);
      const tabs = qa(el, '.tabs .tab, button[data-tab]');
      if (tabs.length) {
        f.groups = tabs.map((t) => {
          const tabId = t.getAttribute('data-tab');
          const pane = q(el, '#' + tabId);
          return { label: text(t), items: qa(pane, 'details').map((d) => ({ question: text(q(d, 'summary')), answer: text(q(d, '.acc-body')) })).filter((x) => x.question) };
        }).filter((g) => g.items.length);
      }
      break;
    }
    case 'testimonials': {
      f.items = qa(el, '.testi-card, .card').map(c => ({
        quote: text(q(c, 'blockquote, p, .testi-quote')) || text(c),
        author: text(q(c, 'b, strong, .testi-author')),
        role: text(q(c, '.testi-role, span')),
        avatar: img(q(c, 'img')?.getAttribute('src')),
        rating: qa(c, '.star').length || 5,
      })).filter(x => x.quote || x.author);
      break;
    }
    case 'office-cards': case 'offices': {
      f.offices = qa(el, '.card.office, .office-card, .card').map(c => {
        const pic = q(c, 'img');
        return {
          name: text(q(c, 'h3, b, strong')),
          address: text(q(c, 'address, p')),
          role: text(q(c, '.chip, .of-role')),
          email: text(q(c, 'a[href^="mailto:"]')),
          phone: text(q(c, 'a[href^="tel:"]')),
          image: img(pic?.getAttribute('src')),
        };
      }).filter(o => o.name);
      break;
    }
    case 'marketplace-cards': {
      f.marketplaces = qa(el, '.card, .mp-card, a.card').map(c => ({
        name: text(q(c, 'b, h3, h4')),
        desc: text(q(c, 'p, span')),
        link: url(c.getAttribute('href') || q(c, 'a')?.getAttribute('href')),
        badge: text(q(c, '.chip')),
        image: img(q(c, 'img')?.getAttribute('src')),
      })).filter(m => m.name || m.link);
      break;
    }
    case 'downloads-gallery': {
      f.items = qa(el, '.card, .dl-card, a.card').map(c => ({
        title: text(q(c, 'b, h3, h4')),
        desc: text(q(c, 'p, .form-note')),
        link: url(q(c, 'a')?.getAttribute('href') || c.getAttribute('href')),
        image: img(q(c, 'img')?.getAttribute('src')),
        badge: text(q(c, '.chip')),
      })).filter(x => x.title || x.image);
      break;
    }
    case 'tabbed-rich-text': case 'policyTabs': case 'tabs': {
      const tabs = qa(el, '.tabs .tab, button[data-tab], [role="tab"]');
      if (tabs.length) {
        f.tabs = tabs.map(t => {
          const id = t.getAttribute('data-tab') || t.getAttribute('aria-controls') || text(t).toLowerCase().replace(/\s+/g, '-');
          const pane = q(el, '#' + id) || q(el, `[data-pane="${id}"]`);
          return {
            id,
            label: text(t),
            content: pane ? rich(pane) : '',
            title: text(t),
          };
        });
      }
      break;
    }
    case 'article-cards': case 'article-index': case 'article-feed': case 'featured-articles': case 'learning-paths': {
      const arts = qa(el, 'a[href*="article.html?id="], a[href*="/learn/"]').map((a) => {
        const rawHref = a.getAttribute('href') || '';
        const slug = new URLSearchParams(rawHref.split('?')[1] || '').get('id') || rawHref.split('/learn/')[1] || '';
        return {
          slug,
          title: text(q(a, 'b, h3')) || text(a),
          excerpt: text(q(a, '.form-note, p')),
          tag: text(q(a, '.chip')),
          image: img(q(a, 'img')?.getAttribute('src'))
        };
      }).filter((x) => x.slug);
      if (arts.length) f.articles = arts;
      break;
    }
    case 'category-tiles': {
      f.categories = qa(el, 'a.cat-tile').map((a) => {
        const href = a.getAttribute('href') || '';
        const slug = new URLSearchParams(href.split('?')[1] || '').get('cat') || '';
        const pic = q(a, 'img');
        return {
          slug,
          name: text(q(a, '.cat-body b, b')),
          pill: text(q(a, '.cat-pill')),
          image: img(pic?.getAttribute('src')),
          desc: text(q(a, '.cat-desc')),
          url: url(href)
        };
      }).filter((c) => c.slug && c.name);
      break;
    }
    case 'product-rail': {
      const rail = el.getAttribute('data-rail');
      if (rail === 'gaming') f.query = { skus: ['voltx-rgb-ddr5-u-dimm-for-desktop', 'voltx-ddr5-u-dimm-for-desktop', 'tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop', 'smartx-rgb-80-plus-bronze-power-supply-550w'], limit: 4 };
      else if (el.id === 'homeFlagshipGrid') f.query = { featured: true, limit: 8 };
      break;
    }
    case 'form': {
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
      f.description = text(q(el, '.form-note, p'));
      break;
    }
    case 'breadcrumb': {
      f.crumbs = qa(el, '.breadcrumb a').map((a) => ({ label: text(a), url: url(a.getAttribute('href')) }));
      break;
    }
    default:
      break;
  }
  return f;
}

// Rebuild execution
let filled = 0;
for (const p of pages) {
  const file = 'prototype/' + (p.path === '/' ? 'index.html' : p.path.replace(/^\//, ''));
  const { segments } = segmentPage(file);
  const blocks = p.blocks || [];
  if (segments.length !== blocks.length) throw new Error(`${p.path}: ${segments.length} segments vs ${blocks.length} blocks`);
  
  p.blocks = blocks.map((b, i) => {
    const s = segments[i];
    const ctx = { page: p.path, block: b.id, type: b.type };
    const head = s.head;
    const fields = extract(b.type, s, ctx);
    
    const next = {
      id: b.id,
      type: b.type,
      sectionId: b.sectionId || '',
      component: b.component || '',
      meta: b.meta,
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

writeFileSync(join(SNAP, 'page.json'), JSON.stringify(pages, null, 2) + '\n');
console.log(`[rebuild-blocks-full] COMPLETE: blocks with rich content = ${filled}/${pages.reduce((n, p) => n + p.blocks.length, 0)} across 28 pages.`);
