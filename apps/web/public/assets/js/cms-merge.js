/* P3 CMS merge — adds CMS-published content (cms-content.js) into the page data
 * BEFORE app.js renders. Articles/news are strictly additive (only slugs absent
 * from the prototype data.js) so an imported corpus can never duplicate what the
 * prototype already shows — visual parity is preserved by construction.
 * Products (catalog bridge): published CMS products override matching entries
 * per-field (only CMS-provided fields) and append genuinely new SKUs.
 * Remove when the prototype data.js retires (master plan §4.1). */
(function () {
  'use strict';
  var CMS = window.CMS_CONTENT;
  if (!CMS || !window.TM) return;

  function existingSlugs(list) {
    var set = {};
    (list || []).forEach(function (x) { if (x && x.id) set[x.id] = true; });
    return set;
  }

  var known = existingSlugs(window.TM.articles);

  // Articles (learn/KB): adapted to the prototype article shape ({h,p} blocks).
  var addArticles = (CMS.articles || []).filter(function (a) { return !known[a.slug]; })
    .map(function (a) {
      return {
        id: a.slug, cat: a.cat || 'Guide', date: a.date,
        title: a.title, desc: a.deck || '', tag: 'Guide',
        mins: Math.max(1, Math.round((a.body || '').length / 900)),
        body: (a.body || '').split(/\n{2,}/).filter(Boolean).map(function (para) {
          var h = para.match(/^#+\s*(.+)/);
          if (h) return { h: h[1], p: para.replace(/^#+\s*.+\n?/, '').trim() };
          return { p: para.trim() };
        }),
        img: 'assets/img/cat-nvme.webp',
      };
    });

  // News & events: appended to the same list the newsroom page renders.
  var addNews = (CMS.news || []).filter(function (x) { return !known[x.slug]; })
    .map(function (n) {
      return {
        id: n.slug, cat: n.eventDate ? 'Event' : 'News', tag: n.tag || (n.eventDate ? 'Event' : 'News'),
        date: n.eventDate || n.date, title: n.title, desc: n.deck || '',
        mins: Math.max(1, Math.round((n.body || '').length / 900)),
        body: (n.body || '').split(/\n{2,}/).filter(Boolean).map(function (para) {
          var h = para.match(/^#+\s*(.+)/);
          if (h) return { h: h[1], p: para.replace(/^#+\s*.+\n?/, '').trim() };
          return { p: para.trim() };
        }),
        img: 'assets/img/cat-nvme.webp',
      };
    });

  if (window.TM.articles && (addArticles.length || addNews.length)) {
    Array.prototype.push.apply(window.TM.articles, addArticles);
    Array.prototype.push.apply(window.TM.articles, addNews);
  }

  // Newsroom (news.html) renders a STATIC card grid from the prototype — the
  // merge layer appends CMS cards so published news/events appear live there
  // too. Cards mirror the prototype markup: <a.card.article-card data-ncat>.
  var isNewsroom = /\/news\.html$/.test(location.pathname);
  if (isNewsroom && addNews.length) {
    var grid = document.querySelector('#main .grid.g3') || document.querySelector('#main .grid.g2');
    if (grid) {
      addNews.forEach(function (n) {
        var a = document.createElement('a');
        a.className = 'card card-pad article-card';
        a.setAttribute('data-ncat', n.cat);
        a.href = 'article.html?id=' + encodeURIComponent(n.id);
        var chip = document.createElement('span');
        chip.className = 'chip';
        chip.style.alignSelf = 'flex-start';
        chip.textContent = n.cat;
        var b = document.createElement('b');
        b.style.cssText = 'display:block;color:var(--ink);margin:8px 0 6px;font-size:15.5px';
        b.textContent = n.title;
        var note = document.createElement('span');
        note.className = 'form-note';
        note.textContent = (n.desc || n.title).slice(0, 110) + '…';
        a.appendChild(chip); a.appendChild(b); a.appendChild(note);
        grid.appendChild(a);
      });
    }
  }

  // ---- Catalog bridge (master plan §4.1 direction) -----------------------
  // Published CMS products OVERRIDE the matching prototype entry per-field —
  // only fields the CMS actually provides (name, warranty, shortSpec/copy,
  // specs, first badge, price, facets, variants) — so prototype imagery stays
  // in charge of pixels while catalog edits made in the admin render on the
  // live site. A null/absent CMS field leaves the prototype value untouched;
  // an explicitly-set warranty (even '') replaces it. CMS-only SKUs (no
  // prototype entry) are APPENDED with a placeholder image so they appear
  // in the shop listing and on the PDP.
  var cmsProducts = CMS.products || [];
  if (cmsProducts.length && window.TM.products) {
    var byId = {};
    window.TM.products.forEach(function (p) { if (p && p.id) byId[p.id] = p; });
    cmsProducts.forEach(function (cp) {
      if (!cp || !cp.slug) return;
      var existing = byId[cp.slug];
      if (existing) {
        if (cp.name) existing.name = cp.name;
        if (cp.warranty !== null && cp.warranty !== undefined) existing.warranty = cp.warranty;
        if (cp.shortSpec) existing.shortSpec = cp.shortSpec;
        if (cp.specs && Object.keys(cp.specs).length) existing.specs = cp.specs;
        if (cp.badges && cp.badges.length) existing.badge = cp.badges[0];
        if (cp.priceUsd !== null && cp.priceUsd !== undefined) {
          existing.priceUsd = cp.priceUsd;
          existing.currency = cp.currency;
        }
        // 0016: shop facets (gen/cap/interface/form) + PDP variant chips
        if (cp.gen) existing.gen = cp.gen;
        if (cp.cap) existing.cap = cp.cap;
        if (cp.interface) existing.interface = cp.interface;
        if (cp.form) existing.form = cp.form;
        if (cp.variants && cp.variants.length) existing.variants = cp.variants;
        // Imagery bridge: admin-picked hero/gallery (public media URLs).
        // Unset → prototype imagery stays in charge (parity by default).
        if (cp.img) existing.img = cp.img;
        if (cp.gallery && cp.gallery.length) existing.gallery = cp.gallery;
      } else {
        window.TM.products.push({
          id: cp.slug,
          name: cp.name || cp.slug,
          cat: cp.cat || 'products',
          catLabel: cp.catLabel || cp.cat || 'Products',
          shortSpec: cp.shortSpec || cp.description || '',
          warranty: cp.warranty || '',
          badge: (cp.badges && cp.badges[0]) || '',
          brand: cp.brand || '',
          gen: cp.gen || '',
          cap: cp.cap || '',
          interface: cp.interface || '',
          form: cp.form || '',
          variants: cp.variants || [],
          img: cp.img || 'assets/img/cat-nvme.webp',
          gallery: (cp.gallery && cp.gallery.length) ? cp.gallery : ['assets/img/cat-nvme.webp'],
          specs: cp.specs || {},
          priceUsd: cp.priceUsd !== undefined ? cp.priceUsd : null,
          currency: cp.currency || 'USD',
        });
      }
    });
  }

  // ---- Careers bridge (0022) ------------------------------------------------
  // Published CMS job postings append to the public careers page openings
  // table as new <tr> rows matching the static markup (title + location,
  // focus summary, Apply mailto). Matched by title — never duplicated.
  var cmsJobs = CMS.jobs;
  var isCareers = /\/careers\.html$/.test(location.pathname);
  if (cmsJobs && cmsJobs.length && isCareers) {
    var openings = document.querySelector('#openings table tbody');
    if (openings) {
      var knownTitles = {};
      openings.querySelectorAll('td b').forEach(function (b) {
        knownTitles[(b.textContent || '').trim().toLowerCase()] = true;
      });
      cmsJobs.forEach(function (j) {
        if (!j || !j.title || knownTitles[String(j.title).toLowerCase()]) return;
        var tr = document.createElement('tr');
        var td1 = document.createElement('td');
        var b = document.createElement('b');
        b.style.color = 'var(--ink)';
        b.textContent = j.title;
        td1.appendChild(b);
        var loc = document.createElement('br');
        td1.appendChild(loc);
        var note = document.createElement('span');
        note.className = 'form-note';
        note.textContent = j.location + (j.type && j.type !== 'full-time' ? ' · ' + j.type : '') + (j.applyBy ? ' · apply by ' + j.applyBy : '');
        td1.appendChild(note);
        var td2 = document.createElement('td');
        td2.textContent = j.summary || j.dept || '';
        var td3 = document.createElement('td');
        var a = document.createElement('a');
        a.className = 'btn btn-ghost btn-sm';
        a.href = 'mailto:hr@twinmos.com?subject=' + encodeURIComponent(j.title);
        a.textContent = 'Apply / ask';
        td3.appendChild(a);
        tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
        openings.appendChild(tr);
      });
    }
  }

  // ---- Where-to-buy directory bridge (0020) -------------------------------
  // CMS distributor/marketplace entries append to the static where-to-buy
  // page: new country cards join #locGrid (the locator initializes AFTER this
  // script, so appended .dcard elements get search/filter/geo for free), and
  // CMS marketplaces join the #marketplaces grid. Built with DOM nodes +
  // textContent — no HTML injection of CMS data. Existing static entries are
  // matched by country/platform name and never duplicated.
  var dir = CMS.directory;
  var isWtb = /\/where-to-buy\.html$/.test(location.pathname);
  if (dir && isWtb) {
    var REGION_LABELS = { me: 'Middle East & GCC', af: 'Africa', as: 'Asia', eu: 'Europe', cis: 'CIS', am: 'Americas' };
    var STATUS_LABELS = { hub: 'TwinMOS hub', authorized: 'Authorized distribution', expanding: 'Expanding coverage', seeking: 'Seeking distributors' };
    var grid = document.getElementById('locGrid');

    (dir.distributors || []).forEach(function (d) {
      if (!d || !d.country || !grid) return;
      var existing = grid.querySelector('.dcard');
      var already = false;
      var cards = grid.querySelectorAll('.dcard');
      for (var ci = 0; ci < cards.length; ci++) {
        var t = cards[ci].querySelector('.dc-title b');
        if (t && t.textContent.trim().toLowerCase() === String(d.country).toLowerCase()) { already = true; break; }
      }
      if (already) return;

      var cardNode = document.createElement('div');
      cardNode.className = 'dcard';
      cardNode.setAttribute('data-cc', '');
      cardNode.setAttribute('data-region', d.region || 'me');
      cardNode.setAttribute('data-status', d.status || 'authorized');
      cardNode.setAttribute('data-search', [d.country, d.name, d.region && REGION_LABELS[d.region], (d.cities || []).join(' '), d.note].filter(Boolean).join(' '));

      var head = document.createElement('div'); head.className = 'dc-head';
      var flag = document.createElement('span'); flag.className = 'dc-flag'; flag.setAttribute('aria-hidden', 'true');
      flag.textContent = String(d.country).slice(0, 2).toUpperCase();
      var title = document.createElement('div'); title.className = 'dc-title';
      var b = document.createElement('b'); b.textContent = d.country;
      var reg = document.createElement('span'); reg.className = 'dc-region';
      reg.textContent = REGION_LABELS[d.region] || d.region || '';
      title.appendChild(b); title.appendChild(reg); head.appendChild(flag); head.appendChild(title);
      cardNode.appendChild(head);

      var chip = document.createElement('span'); chip.className = 'chip dc-chip';
      chip.textContent = STATUS_LABELS[d.status] || d.status || '';
      cardNode.appendChild(chip);

      if (d.name && d.name !== d.country) {
        var tag = document.createElement('p'); tag.className = 'dc-tag'; tag.textContent = d.name;
        cardNode.appendChild(tag);
      }
      if (d.note) {
        var note = document.createElement('p'); note.className = 'dc-note'; note.textContent = d.note;
        cardNode.appendChild(note);
      }
      if (d.cities && d.cities.length) {
        var cities = document.createElement('div'); cities.className = 'dc-cities';
        d.cities.forEach(function (c) {
          var s = document.createElement('span'); s.textContent = c; cities.appendChild(s);
        });
        cardNode.appendChild(cities);
      }
      var actions = document.createElement('div'); actions.className = 'dc-actions';
      if (d.website) {
        var a = document.createElement('a'); a.className = 'btn btn-primary btn-sm';
        a.href = d.website; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Visit website ↗'; actions.appendChild(a);
      }
      if (d.email) {
        var m = document.createElement('a'); m.className = 'btn btn-ghost btn-sm';
        m.href = 'mailto:' + d.email; m.textContent = 'Email'; actions.appendChild(m);
      }
      if (actions.firstChild) cardNode.appendChild(actions);
      grid.appendChild(cardNode);
    });

    var mkGrid = document.querySelector('#marketplaces .grid');
    (dir.marketplaces || []).forEach(function (m) {
      if (!m || !m.platform || !mkGrid) return;
      var already = false;
      var h3s = mkGrid.querySelectorAll('h3');
      for (var hi = 0; hi < h3s.length; hi++) {
        if (h3s[hi].textContent.trim().toLowerCase() === String(m.platform).toLowerCase()) { already = true; break; }
      }
      if (already) return;
      var cardNode = document.createElement('div'); cardNode.className = 'card card-pad';
      var chip = document.createElement('span'); chip.className = 'chip ok'; chip.textContent = 'Verified · TwinMOS channel';
      cardNode.appendChild(chip);
      var h3 = document.createElement('h3'); h3.className = 'h3'; h3.style.marginTop = '10px'; h3.textContent = m.platform;
      cardNode.appendChild(h3);
      if (m.country) {
        var p = document.createElement('p'); p.textContent = 'Official TwinMOS storefront — ' + m.country + '.';
        cardNode.appendChild(p);
      }
      var a = document.createElement('a'); a.className = 'btn btn-primary btn-sm';
      a.href = m.url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Visit ' + m.platform + ' ↗';
      cardNode.appendChild(a);
      mkGrid.appendChild(cardNode);
    });
  }

  // ---- Compatibility bridge (0017) ----------------------------------------
  // Admin QVL rules merge into the finder hierarchy TM.compat
  // {types:[{id,label,brands:[{id,label,models:[…]]}]}]} — matched per model
  // on (type id, brand slug, model label→slug). Labels are the human contract
  // the admin edits, and prototype v slugs are custom (they don't equal
  // slugified labels), so label is the primary key with v as fallback.
  // Existing models are overridden field-by-field (only finder-meaningful,
  // non-empty values); new models, brands and type tabs are appended.
  var cmsCompat = CMS.compat;
  if (cmsCompat && cmsCompat.types && window.TM.compat && window.TM.compat.types) {
    var slg = function (s) { return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
    var typeById = {};
    window.TM.compat.types.forEach(function (t) { typeById[t.id] = t; });
    (cmsCompat.types || []).forEach(function (ct) {
      var t = typeById[ct.id];
      if (!t) { t = { id: ct.id, label: ct.label || ct.id, brands: [] }; window.TM.compat.types.push(t); typeById[ct.id] = t; }
      // brands match by id OR by slugified label — prototype ids are custom
      // (e.g. id "intel" for the label "Intel NUC"), and the CMS emits
      // slug(deviceBrand), so the label index is the reliable join.
      var brandById = {}, brandByLabel = {};
      t.brands.forEach(function (b) { brandById[b.id] = b; brandByLabel[slg(b.label)] = b; });
      (ct.brands || []).forEach(function (cb) {
        var b = brandByLabel[slg(cb.label)] || brandById[cb.id];
        if (!b) { b = { id: cb.id, label: cb.label || cb.id, models: [] }; t.brands.push(b); brandById[cb.id] = b; }
        var byV = {}, byLabel = {};
        b.models.forEach(function (m) { byV[m.v] = m; byLabel[slg(m.l)] = m; });
        (cb.models || []).forEach(function (cm) {
          var m = byLabel[slg(cm.l)] || byV[cm.v];
          if (m) {
            if (cm.l) m.l = cm.l;
            if (cm.gen) m.gen = cm.gen;
            if (cm.form) m.form = cm.form;
            if (cm.cats && cm.cats.length) m.cats = cm.cats;
            if (cm.max_gb !== null && cm.max_gb !== undefined) m.max_gb = cm.max_gb;
            if (cm.slots !== null && cm.slots !== undefined) m.slots = cm.slots;
            if (cm.speed) m.speed = cm.speed;
            if (cm.ssd) m.ssd = cm.ssd;
            if (cm.ssd_cats && cm.ssd_cats.length) m.ssd_cats = cm.ssd_cats;
            if (cm.note) m.note = cm.note;
          } else {
            b.models.push(cm);
          }
        });
      });
    });
  }
})();
