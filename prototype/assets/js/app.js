/* ============================================================================
   TwinMOS Corporate Website — Prototype Application Layer
   Vanilla JS · no dependencies · works on file:// and any static host
   QA: any uncaught error sets <body data-js-error> so headless checks can see it
   ========================================================================== */
'use strict';
window.addEventListener('error', function (e) {
  // record only OUR errors: same-origin scripts (or inline). Browser-automation
  // harnesses inject their own scripts whose failures are not site bugs.
  var f = e.filename || '';
  if (f && f.indexOf(location.origin) !== 0 && f.indexOf('/') !== 0) return;
  document.body && document.body.setAttribute('data-js-error', ((e.message || 'error') + ' @ ' + (f || '?').split('/').pop() + ':' + e.lineno + ':' + e.colno).slice(0, 240));
});

var TM = window.TM || {};
(function () {
  /* ---------- utils ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  // reuse the versioned logo URL the server already rendered (cache-busts with the build)
  var LOGO = ($('.site-header .logo img') || {}).src || 'assets/img/logo.webp';
  function icon(name, size) {
    size = size || 17;
    var p = {
      close: '<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>'
    }[name];
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">' + p + '</svg>';
  }
  function brandI(h) { return '<img class="ilog" src="' + LOGO + '" alt="TwinMOS" style="height:' + h + 'px;width:auto">'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function param(name) {
    return new URLSearchParams(location.search).get(name) || '';
  }
  function toast(msg, kind) {
    var wrap = $('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = '.3s'; }, 2600);
    setTimeout(function () { t.remove(); }, 3000);
  }
  window.tmToast = toast;

  /* ---------- compare tray (localStorage) ---------- */
  var CMP_KEY = 'tm_compare_v1';
  function cmpGet() { try { return JSON.parse(localStorage.getItem(CMP_KEY) || '[]'); } catch (e) { return []; } }
  function cmpSet(arr) { try { localStorage.setItem(CMP_KEY, JSON.stringify(arr)); } catch (e) {} syncCmpUI(); }
  function cmpToggle(id) {
    var arr = cmpGet();
    var i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
    else {
      if (arr.length >= 4) { toast('Compare tray holds up to 4 products', 'err'); return false; }
      arr.push(id);
    }
    cmpSet(arr);
    return true;
  }
  function syncCmpUI() {
    var arr = cmpGet();
    $$('.cmp-btn').forEach(function (b) {
      var on = arr.indexOf(b.getAttribute('data-id')) >= 0;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.title = on ? 'Remove from compare' : 'Add to compare';
    });
    $$('[data-tray-count]').forEach(function (el) { el.textContent = arr.length; el.style.display = arr.length ? '' : 'none'; });
    var tray = $('#cmpTray');
    if (tray) {
      tray.classList.toggle('show', arr.length > 0);
      var n = $('#cmpTrayN'); if (n) n.textContent = arr.length;
    }
  }
  window.tmCmp = { get: cmpGet, toggle: cmpToggle };

  /* ---------- header: drawer / mega / search / lang ---------- */
  function initHeader() {
    var hdr = $('.site-header');
    if (hdr) {
      var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    var burger = $('#burger'), drawer = $('#drawer');
    if (burger && drawer) {
      burger.addEventListener('click', function () { drawer.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); });
      $$('.drawer-close', drawer).forEach(function (b) { b.addEventListener('click', function () { drawer.classList.remove('open'); }); });
      $('.drawer-veil', drawer).addEventListener('click', function () { drawer.classList.remove('open'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') drawer.classList.remove('open'); });
      $$('.dlink[data-sub]', drawer).forEach(function (a) {
        a.addEventListener('click', function (e) {
          if (a.getAttribute('href') === '#') {
            e.preventDefault();
            var sub = document.getElementById(a.getAttribute('data-sub'));
            if (sub) sub.classList.toggle('open');
          }
        });
      });
    }
    var sBtn = $('#searchBtn'), sOverlay = $('#searchOverlay');
    if (sBtn && sOverlay) {
      sBtn.addEventListener('click', function () { sOverlay.classList.add('open'); var i = $('#searchInput'); if (i) setTimeout(function () { i.focus(); }, 40); });
      $$('.search-close', sOverlay).forEach(function (b) { b.addEventListener('click', function () { sOverlay.classList.remove('open'); }); });
      $('.drawer-veil', sOverlay) && $('.drawer-veil', sOverlay).addEventListener('click', function () { sOverlay.classList.remove('open'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') sOverlay.classList.remove('open'); });
      // F1.5 — "/" opens search from anywhere (ignored while typing in a field)
      document.addEventListener('keydown', function (e) {
        if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
        var t = e.target && e.target.tagName;
        if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (e.target && e.target.isContentEditable)) return;
        e.preventDefault();
        sOverlay.classList.add('open');
        var i = $('#searchInput'); if (i) setTimeout(function () { i.focus(); }, 40);
      });
      var form = $('#searchForm');
      form && form.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = ($('#searchInput').value || '').trim();
        location.href = 'search.html?q=' + encodeURIComponent(q);
      });
    }
    var langs = $$('.lang-sel');
    if (langs.length) {
      langs.forEach(function (sel) {
        sel.addEventListener('change', function () {
          var v = sel.value;
          langs.forEach(function (o) { o.value = v; });
          if (v === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
            toast('Arabic (RTL) layout enabled — full localization ships with the production i18n pipeline', 'ok');
          } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', 'en');
            if (v !== 'en') toast('Locale "' + v.toUpperCase() + '" stored — content stays on the English base in this prototype', 'ok');
          }
          try { localStorage.setItem('tm_locale', v); } catch (e) {}
        });
      });
      try {
        var saved = localStorage.getItem('tm_locale');
        if (saved) langs.forEach(function (o) { o.value = saved; });
        if (saved === 'ar') document.documentElement.setAttribute('dir', 'rtl');
      } catch (e) {}
    }
    $$('[data-cmp-toggle]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); cmpToggle(b.getAttribute('data-cmp-toggle')); });
    });
  }

  /* ---------- cookie consent ---------- */
  function initCookie() {
    var bar = $('#cookieBar');
    if (!bar) return;
    var ok = false;
    try { ok = localStorage.getItem('tm_cookie') === '1'; } catch (e) {}
    if (!ok) setTimeout(function () { bar.classList.add('show'); }, 700);
    $$('.cookie-accept', bar).forEach(function (b) {
      b.addEventListener('click', function () {
        bar.classList.remove('show');
        try { localStorage.setItem('tm_cookie', '1'); } catch (e) {}
      });
    });
  }

  /* ---------- product cards rendering ---------- */
  // Warranty display text: values are durations ("3 Years", "Lifetime"), but
  // some catalog rows already carry the word ("Lifetime warranty") — never
  // append a second one.
  function wtyText(w) {
    return /warranty$/i.test(w.trim()) ? w.trim() : w.trim() + ' warranty';
  }
  function warrantyChip(p) {
    var w = p.warranty || '';
    if (!w) return '';
    var cls = /lifetime/i.test(w) ? 'ok' : 'warn';
    return '<span class="chip ' + cls + '" style="align-self:flex-start">' + esc(wtyText(w)) + '</span>';
  }
  function productCard(p) {
    var badges = '';
    if (p.badge) badges += '<span class="' + (p.badge === 'Gen5' ? 'b-gen5' : p.badge === 'Gaming' ? 'b-gaming' : 'b-new') + '">' + esc(p.badge) + '</span>';
    var ic = p.imgC || p.img;  // trimmed card variant: product sizes the box, not the canvas
    return '' +
      '<article class="card pcard" data-id="' + esc(p.id) + '">' +
      '  <div class="pcard-img">' + (badges ? '<div class="badge"><span>' + esc(p.badge) + '</span></div>' : '') +
      '    <a href="product.html?id=' + encodeURIComponent(p.id) + '" aria-label="' + esc(p.name) + '"><img src="' + esc(ic) + '" alt="' + esc(p.name) + '" loading="lazy"></a>' +
      '    <button class="qv-btn" data-qv="' + esc(p.id) + '" aria-label="Quick view ' + esc(p.name) + '">Quick view</button>' +
      '  </div>' +
      '  <div class="pcard-body">' +
      '    <span class="pcard-cat">' + esc(p.catLabel) + (p.brand && p.brand !== 'TwinMOS' ? ' · ' + esc(p.brand) : '') + '</span>' +
      '    <a class="pcard-name" href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a>' +
      '    <span class="pcard-meta">' + esc(p.shortSpec || '') + '</span>' +
      warrantyChip(p) +
      '    <div class="pcard-foot">' +
      '      <a class="btn btn-ghost btn-sm" href="product.html?id=' + encodeURIComponent(p.id) + '">View details</a>' +
      '      <div class="pcard-actions"><button class="cmp-btn" data-id="' + esc(p.id) + '" title="Add to compare" aria-label="Add ' + esc(p.name) + ' to compare">⇄</button></div>' +
      '    </div>' +
      '  </div>' +
      '</article>';
  }
  window.tmProductCard = productCard;

  function bindCardCompare(scope) {
    $$('.cmp-btn', scope || document).forEach(function (b) {
      if (b._bound) return; b._bound = true;
      b.addEventListener('click', function () {
        var ok = cmpToggle(b.getAttribute('data-id'));
        if (ok) {
          var on = cmpGet().indexOf(b.getAttribute('data-id')) >= 0;
          toast(on ? 'Added to compare' : 'Removed from compare', 'ok');
        }
      });
    });
    syncCmpUI();
  }
  window.tmBindCardCompare = bindCardCompare;


  /* ---------- Quick View modal (F2.3 / F4.4) ---------- */
  function closeQV() {
    var m = $('#qvModal'); if (!m) return;
    m.classList.remove('open');
    setTimeout(function () { m.remove(); }, 200);
    document.body.style.overflow = '';
  }
  function openQV(id) {
    var p = (TM.products || []).filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    closeQV();
    var m = document.createElement('div');
    m.className = 'qv-modal'; m.id = 'qvModal'; m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Quick view ' + p.name);
    var specKeys = Object.keys(p.specs || {}).slice(0, 5);
    m.innerHTML =
      '<div class="qv-veil" data-qv-close></div>' +
      '<div class="qv-box">' +
      '  <button class="icon-btn qv-close" data-qv-close aria-label="Close quick view">' + icon('close') + '</button>' +
      '  <div class="qv-img"><img src="' + esc(p.imgC || p.img) + '" alt="' + esc(p.name) + '"></div>' +
      '  <div class="qv-body">' +
      '    <span class="pcard-cat">' + esc(p.catLabel) + (p.brand && p.brand !== 'TwinMOS' ? ' · ' + esc(p.brand) : '') + '</span>' +
      '    <h3>' + esc(p.name) + '</h3>' +
      '    <p class="form-note" style="margin:6px 0 12px">' + esc(p.shortSpec || '') + (p.warranty ? ' · ' + esc(wtyText(p.warranty)) : '') + '</p>' +
      (specKeys.length ? '<table class="spec-table"><tbody>' + specKeys.map(function (k) { return '<tr><th scope="row">' + esc(k) + '</th><td>' + esc(p.specs[k]) + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
      '    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">' +
      '      <a class="btn btn-primary btn-sm" href="product.html?id=' + encodeURIComponent(p.id) + '">Full details</a>' +
      '      <a class="btn btn-ghost btn-sm" href="where-to-buy.html">Where to buy</a>' +
      '      <button class="btn btn-ghost btn-sm cmp-btn" data-id="' + esc(p.id) + '">⇄ Compare</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    $$('[data-qv-close]', m).forEach(function (b) { b.addEventListener('click', closeQV); });
    document.addEventListener('keydown', function escCloser(e) { if (e.key === 'Escape') { closeQV(); document.removeEventListener('keydown', escCloser); } });
    bindCardCompare(m);
  }
  function bindQuickView(scope) {
    $$('.qv-btn', scope || document).forEach(function (b) {
      if (b._bound) return; b._bound = true;
      b.addEventListener('click', function (e) { e.preventDefault(); openQV(b.getAttribute('data-qv')); });
    });
  }

  /* ---------- SHOP page ---------- */
  function initShop() {
    var mount = $('#shopGrid');
    if (!mount || !TM.products) return;
    var products = TM.products;
    var state = { cat: param('cat') || 'all', q: param('q') || '', gens: [], caps: [], brands: [], sort: 'featured' };
    var brandParam = param('brand');
    if (brandParam) state.brands = [brandParam];   // deep-link from home brand explorer

    function genOf(p) { return p.gen || ''; }
    function capOf(p) { return p.cap || ''; }
    function passes(p) {
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (state.gens.length && state.gens.indexOf(genOf(p)) < 0) return false;
      if (state.caps.length && state.caps.indexOf(capOf(p)) < 0) return false;
      if (state.brands.length && state.brands.indexOf(p.brand || 'TwinMOS') < 0) return false;
      if (state.q) {
        var hay = (p.name + ' ' + (p.catLabel || '') + ' ' + (p.search || '')).toLowerCase();
        var need = state.q.toLowerCase().split(/\s+/).filter(Boolean);
        for (var i = 0; i < need.length; i++) if (hay.indexOf(need[i]) < 0) return false;
      }
      return true;
    }
    function render() {
      var list = products.filter(passes);
      if (state.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      if (state.sort === 'cat') list.sort(function (a, b) { return (a.catLabel || '').localeCompare(b.catLabel || ''); });
      mount.innerHTML = list.length
        ? list.map(productCard).join('')
        : '<div class="empty-state" style="grid-column:1/-1"><h3>No products match</h3><p>Try clearing a filter or searching a different term.</p><button class="btn btn-ghost" id="clearAll2">Clear all filters</button></div>';
      var c = $('#resultCount'); if (c) c.textContent = list.length + ' product' + (list.length === 1 ? '' : 's');
      var c2 = $('#clearAll2'); if (c2) c2.addEventListener('click', function () { reset(); });
      bindCardCompare(mount);
    bindQuickView(mount);
      var af = $('#activeFilters');
      if (af) {
        var chips = [];
        if (state.cat !== 'all') chips.push('<button class="chip" data-clear="cat">' + esc(catLabel(state.cat)) + ' ✕</button>');
        state.gens.forEach(function (g) { chips.push('<button class="chip" data-clear="gen:' + g + '">' + g + ' ✕</button>'); });
        state.caps.forEach(function (g) { chips.push('<button class="chip" data-clear="cap:' + g + '">' + g + ' ✕</button>'); });
        state.brands.forEach(function (g) { chips.push('<button class="chip" data-clear="brand:' + g + '">' + g + ' ✕</button>'); });
        if (state.q) chips.push('<button class="chip" data-clear="q">“' + esc(state.q) + '” ✕</button>');
        af.innerHTML = chips.join('');
        $$('[data-clear]', af).forEach(function (b) {
          b.addEventListener('click', function () {
            var v = b.getAttribute('data-clear');
            if (v === 'cat') state.cat = 'all';
            else if (v === 'q') state.q = '';
            else if (v.indexOf('gen:') === 0) state.gens.splice(state.gens.indexOf(v.slice(4)), 1);
            else if (v.indexOf('cap:') === 0) state.caps.splice(state.caps.indexOf(v.slice(4)), 1);
            else if (v.indexOf('brand:') === 0) state.brands.splice(state.brands.indexOf(v.slice(6)), 1);
            syncInputs(); render();
          });
        });
      }
    }
    function catLabel(id) { var c = (TM.categories || []).filter(function (x) { return x.id === id; })[0]; return c ? c.label : id; }
    function syncInputs() {
      $$('[data-fcat]').forEach(function (r) { r.checked = state.cat === r.getAttribute('data-fcat'); });
      $$('[data-fgen]').forEach(function (r) { r.checked = state.gens.indexOf(r.getAttribute('data-fgen')) >= 0; });
      $$('[data-fcap]').forEach(function (r) { r.checked = state.caps.indexOf(r.getAttribute('data-fcap')) >= 0; });
      $$('[data-fbrand]').forEach(function (r) { r.checked = state.brands.indexOf(r.getAttribute('data-fbrand')) >= 0; });
      var q = $('#shopSearch'); if (q && document.activeElement !== q) q.value = state.q;
      var s = $('#sortSel'); if (s) s.value = state.sort;
    }
    function reset() {
      state = { cat: 'all', q: '', gens: [], caps: [], brands: [], sort: state.sort };
      syncInputs(); render();
    }

    $$('[data-fcat]').forEach(function (r) { r.addEventListener('change', function () { if (r.checked) { state.cat = r.getAttribute('data-fcat'); $$('[data-fcat]').forEach(function (o) { if (o !== r) o.checked = false; }); } else state.cat = 'all'; render(); }); });
    $$('[data-fgen]').forEach(function (r) { r.addEventListener('change', function () { var g = r.getAttribute('data-fgen'); var i = state.gens.indexOf(g); if (r.checked && i < 0) state.gens.push(g); if (!r.checked && i >= 0) state.gens.splice(i, 1); render(); }); });
    $$('[data-fcap]').forEach(function (r) { r.addEventListener('change', function () { var g = r.getAttribute('data-fcap'); var i = state.caps.indexOf(g); if (r.checked && i < 0) state.caps.push(g); if (!r.checked && i >= 0) state.caps.splice(i, 1); render(); }); });
    $$('[data-fbrand]').forEach(function (r) { r.addEventListener('change', function () { var g = r.getAttribute('data-fbrand'); var i = state.brands.indexOf(g); if (r.checked && i < 0) state.brands.push(g); if (!r.checked && i >= 0) state.brands.splice(i, 1); render(); }); });
    var qs = $('#shopSearch');
    if (qs) {
      var deb;
      qs.addEventListener('input', function () { clearTimeout(deb); deb = setTimeout(function () { state.q = qs.value.trim(); render(); }, 180); });
    }
    var ss = $('#sortSel');
    if (ss) ss.addEventListener('change', function () { state.sort = ss.value; render(); });
    var clear = $('#clearAll'); if (clear) clear.addEventListener('click', reset);

    var catChips = $('#catChips');
    if (catChips) {
      catChips.innerHTML = ['all'].concat((TM.categories || []).map(function (c) { return c.id; })).map(function (id) {
        return '<button class="tab' + (state.cat === id ? ' on' : '') + '" data-catchip="' + id + '">' + esc(id === 'all' ? 'All products' : catLabel(id)) + '</button>';
      }).join('');
      $$('[data-catchip]', catChips).forEach(function (b) {
        b.addEventListener('click', function () { state.cat = b.getAttribute('data-catchip'); syncInputs(); render(); $$('[data-catchip]').forEach(function (x) { x.classList.toggle('on', x === b); }); });
      });
    }
    syncInputs(); render();
  }

  function shareRow(p) {
    var url = location.href, t = encodeURIComponent(p.name + ' — TwinMOS'), u = encodeURIComponent(url);
    var sum = encodeURIComponent((p.shortSpec || '') + ' | ' + (p.warranty ? wtyText(p.warranty) : 'TwinMOS'));
    return '<div class="share-row" aria-label="Share this product">' +
      '<span class="share-l">Share</span>' +
      '<a href="https://wa.me/?text=' + t + '%20' + u + '" target="_blank" rel="noopener" aria-label="Share on WhatsApp">WhatsApp</a>' +
      '<a href="https://twitter.com/intent/tweet?text=' + t + '&url=' + u + '" target="_blank" rel="noopener" aria-label="Share on X">X</a>' +
      '<a href="https://www.facebook.com/sharer/sharer.php?u=' + u + '" target="_blank" rel="noopener" aria-label="Share on Facebook">Facebook</a>' +
      '<a href="mailto:?subject=' + t + '&body=' + sum + '%20' + u + '" aria-label="Share by email">Email</a>' +
      '<button type="button" data-copy-link="' + esc(url) + '">Copy link</button></div>';
  }

  /* ---------- PDP ---------- */
  function initPDP() {
    var root = $('#pdpRoot');
    if (!root || !TM.products) return;
    var id = param('id');
    var p = TM.products.filter(function (x) { return x.id === id; })[0];
    if (!p) {
      root.innerHTML = '<div class="empty-state"><h3>Product not found</h3><p>The product “' + esc(id) + '” does not exist in the catalog.</p><a class="btn btn-primary" href="shop.html">Browse all products</a></div>';
      return;
    }
    document.title = p.name + ' — TwinMOS';
    var ld = document.createElement('script'); ld.type = 'application/ld+json';
    // P2.4 (audit U-9): honest structured data — offers ONLY when a real list
    // price exists (never a fabricated price:0), with the product's currency.
    var ldObj = { '@context': 'https://schema.org', '@type': 'Product',
      name: p.name, image: p.img, sku: p.id, mpn: (p.specs && (p.specs['1 TB'] || p.specs['2 TB'])) || p.id,
      brand: { '@type': 'Brand', name: 'TwinMOS' }, category: p.catLabel,
      description: p.shortSpec || p.name };
    if (p.priceUsd != null && p.priceUsd > 0) {
      ldObj.offers = { '@type': 'Offer', priceCurrency: p.currency || 'USD', price: String(p.priceUsd),
        availability: 'https://schema.org/InStock', url: location.href };
    }
    ld.textContent = JSON.stringify(ldObj);
    document.head.appendChild(ld);
    var bld = document.createElement('script'); bld.type = 'application/ld+json';
    bld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.twinmos.com/index.html' },
        { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.twinmos.com/shop.html' },
        { '@type': 'ListItem', position: 3, name: p.name, item: location.href }] });
    document.head.appendChild(bld);
    var bc = $('#bcName'); if (bc) bc.textContent = p.name;
    var imgs = (p.gallery && p.gallery.length ? p.gallery : [p.img]);
    var gimgs = (p.galleryC && p.galleryC.length ? p.galleryC : [p.imgC || p.img]);
    var variantHtml = (p.variants && p.variants.length)
      ? '<h3 class="h3" style="margin-top:26px">Available capacities</h3><div class="variant-row">' + p.variants.map(function (v, i) { return '<button class="variant' + (i === 0 ? ' on' : '') + '">' + esc(v) + '</button>'; }).join('') + '</div>'
      : '';
    var specRows = p.specs && Object.keys(p.specs).length
      ? Object.keys(p.specs).map(function (k) { return '<tr><th scope="row">' + esc(k) + '</th><td>' + esc(p.specs[k]) + '</td></tr>'; }).join('')
      : '';
    var desc = p.description || '';
    root.innerHTML =
      '<div class="pdp">' +
      '  <div>' +
      '    <div class="gallery-main"><img id="galMain" src="' + esc(gimgs[0]) + '" alt="' + esc(p.name) + '"></div>' +
      (imgs.length > 1 ? '<div class="gallery-thumbs">' + gimgs.map(function (u, i) { return '<button class="' + (i === 0 ? 'on' : '') + '" data-thumb="' + esc(u) + '" aria-label="View image ' + (i + 1) + '"><img src="' + esc(u) + '" alt=""></button>'; }).join('') + '</div>' : '') +
      '  </div>' +
      '  <div class="pdp-info">' +
      '    <span class="pcard-cat">' + esc(p.catLabel) + '</span>' +
      '    <h1>' + esc(p.name) + '</h1>' +
      '    <p class="lede" style="margin-bottom:18px">' + esc(p.shortSpec || '') + (p.warranty ? ' · ' + esc(wtyText(p.warranty)) : '') + '</p>' +
      // P2.4 (audit U-9): the DB carries a real list price — show it as an
      // MSRP line; products without one keep the quote-first flow unchanged.
      (p.priceUsd != null && p.priceUsd > 0
        ? '<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:14px"><span style="font-size:26px;font-weight:800;color:var(--ink)">' + esc(p.currency || 'USD') + ' ' + esc(p.priceUsd.toFixed(2)) + '</span><span class="form-note">MSRP — where to buy shows local pricing</span></div>'
        : '') +
      '    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px">' +
      '      <a class="btn btn-primary btn-lg" href="where-to-buy.html">Where to buy</a>' +
      '      <a class="btn btn-ghost btn-lg" href="quote.html?product=' + encodeURIComponent(p.id) + '">Request a quote</a>' +
      '      <button class="btn btn-ghost btn-lg cmp-btn" data-id="' + esc(p.id) + '">⇄ Compare</button>' +
      '    </div>' +
      shareRow(p) +
      '    <div class="note-box" style="margin-bottom:24px"><b>OEM / volume orders —</b> ' + brandI(14) + ' manufactures and supplies under its own brand and as an OEM provider. <a href="solutions.html">Explore solutions</a> or <a href="quote.html?product=' + encodeURIComponent(p.id) + '">request a quotation</a>.</div>' +
      variantHtml +
      '    <h3 class="h3" style="margin-top:30px">Specifications</h3>' +
      (specRows ? '<div style="overflow-x:auto"><table class="spec-table"><tbody>' + specRows + '</tbody></table></div>' : '<p class="form-note">Detailed specifications for this SKU are being finalized — <a href="contact.html">contact us</a> for the datasheet.</p>') +
      (desc ? '<details style="margin-top:22px" class="acc"><summary>About this product</summary><div class="acc-body">' + esc(desc).replace(/\n+/g, '</p><p style="font-size:14.5px">') + '</div></details>' : '') +
      '  </div>' +
      '</div>';
    $$('#pdpRoot [data-thumb]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = $('#galMain');
        if (m) {
          m.src = b.getAttribute('data-thumb');
          m.classList.remove('gal-in'); void m.offsetWidth; m.classList.add('gal-in');
        }
        $$('#pdpRoot [data-thumb]').forEach(function (x) { x.classList.toggle('on', x === b); });
      });
    });
    $$('#pdpRoot .variant').forEach(function (b) {
      b.addEventListener('click', function () { $$('#pdpRoot .variant').forEach(function (x) { x.classList.toggle('on', x === b); }); });
    });
    var cp = $('#pdpRoot [data-copy-link]');
    if (cp) cp.addEventListener('click', function () {
      var v = cp.getAttribute('data-copy-link');
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { toast('Link copied', 'ok'); });
      else toast('Link: ' + v, 'ok');
    });
    bindCardCompare(root);
    bindQuickView(root);
    var rel = $('#relatedGrid');
    if (rel) {
      var relList = TM.products.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 4);
      rel.innerHTML = relList.map(productCard).join('') || '<p class="form-note">No related products in this category.</p>';
      bindCardCompare(rel);
      bindQuickView(rel);
    }
    // knowledge-hub cross-links: topic guides per product category (corpus 08-learn)
    var gWrap = $('#pdpGuides');
    if (gWrap && TM.articles) {
      var GUIDES = {
        'dram-gaming': ['best-ram-for-gaming', 'what-is-xmp', 'rgb-ram-buyers-guide'],
        'dram-desktop': ['how-to-choose-ram', 'ddr4-vs-ddr5'],
        'dram-notebook': ['so-dimm-vs-udimm', 'how-to-choose-ram'],
        'ssd-nvme': ['how-to-choose-an-ssd', 'pcie-gen3-vs-gen4-vs-gen5', 'what-is-nvme'],
        'ssd-sata': ['nvme-vs-sata-ssd', 'how-to-choose-an-ssd'],
        'portable-ssd': ['best-portable-ssd', 'portable-ssd-vs-external-hdd'],
        'portable-hdd': ['portable-ssd-vs-external-hdd', 'best-portable-ssd']
      };
      var gids = GUIDES[p.cat] || [];
      var gArts = gids.map(function (gid) {
        return TM.articles.filter(function (x) { return x.id === gid; })[0];
      }).filter(Boolean);
      if (gArts.length) {
        gWrap.innerHTML = '<div class="learn-band" style="margin-top:clamp(18px,2.4vw,28px)"><b style="flex:none">Learn before you buy</b>' +
          gArts.map(function (g) {
            return '<a href="article.html?id=' + encodeURIComponent(g.id) + '">' + esc(g.title) + '</a>';
          }).join('') +
          '<a href="learn.html" style="color:var(--accent-deep);font-weight:750">Knowledge hub →</a></div>';
      }
    }
  }

  /* ---------- compare page ---------- */
  function initCompare() {
    var mount = $('#cmpMount');
    if (!mount || !TM.products) return;
    var arr = cmpGet();
    var list = TM.products.filter(function (p) { return arr.indexOf(p.id) >= 0; });
    if (!list.length) {
      mount.innerHTML = '<div class="empty-state"><h3>Nothing to compare yet</h3><p>Add up to 4 products from the <a href="shop.html">catalog</a> using the ⇄ button on any product card.</p><a class="btn btn-primary" href="shop.html">Browse products</a></div>';
      return;
    }
    var keys = ['catLabel', 'shortSpec', 'interface', 'gen', 'cap', 'warranty'];
    var labels = { catLabel: 'Category', shortSpec: 'Summary', interface: 'Interface', gen: 'Generation', cap: 'Capacity', warranty: 'Warranty' };
    var allSpecKeys = {};
    list.forEach(function (p) { Object.keys(p.specs || {}).forEach(function (k) { if (!/^(1 TB|2 TB|Capacity|Part)/i.test(k)) allSpecKeys[k] = 1; }); });
    var specKeys = Object.keys(allSpecKeys).slice(0, 14);
    function row(label, get, isSpec) {
      var vals = list.map(function (p) { var v = isSpec ? (p.specs ? p.specs[label] : '') : p[label]; return v == null || v === '' ? '—' : esc(v); });
      var uniq = vals.filter(function (v, i) { return vals.indexOf(v) === i; });
      var hi = uniq.length > 1 ? ' class="diff-hi"' : '';
      return '<tr' + hi + '><td>' + esc(isSpec ? labels[label] || label : labels[label] || label) + '</td>' + vals.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>';
    }
    mount.innerHTML =
      '<div class="cmp-table-wrap"><table class="cmp"><thead><tr><th>Product</th>' +
      list.map(function (p) {
        return '<th class="cmp-prod-head"><img src="' + esc(p.imgC || p.img) + '" alt=""><a href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a><br><button class="cmp-btn on" data-id="' + esc(p.id) + '" title="Remove">✕</button></th>';
      }).join('') +
      '</tr></thead><tbody>' +
      keys.map(function (k) { return row(k, null, false); }).join('') +
      specKeys.map(function (k) { return row(k, null, true); }).join('') +
      '</tbody></table></div>' +
      '<p class="form-note" style="margin-top:12px">Rows with a highlight differ across the selection. The tray persists in your browser (localStorage).</p>';
    bindCardCompare(mount);
    $$('#cmpMount .cmp-btn').forEach(function (b) {
      b.addEventListener('click', function () { initCompare(); });
    });
  }

  /* ---------- compatibility finder ---------- */
  function initCompat() {
    var root = $('#compatRoot');
    if (!root || !TM.compat) return;
    var sType = $('#fType'), sBrand = $('#fBrand'), sModel = $('#fModel'), go = $('#fGo');
    var db = TM.compat;
    function fill(sel, items, ph) {
      sel.innerHTML = '<option value="">' + ph + '</option>' + items.map(function (i) { return '<option value="' + esc(i.v) + '">' + esc(i.l) + '</option>'; }).join('');
      sel.disabled = !items.length;
    }
    fill(sType, db.types.map(function (t) { return { v: t.id, l: t.label }; }), 'Select device type');
    var typeData = null;
    sType.addEventListener('change', function () {
      typeData = db.types.filter(function (t) { return t.id === sType.value; })[0] || null;
      fill(sBrand, typeData ? typeData.brands.map(function (b) { return { v: b.id, l: b.label }; }) : [], 'Select brand');
      fill(sModel, [], 'Select model');
    });
    sBrand.addEventListener('change', function () {
      var brand = typeData && typeData.brands.filter(function (b) { return b.id === sBrand.value; })[0];
      fill(sModel, brand ? brand.models : [], 'Select model / platform');
    });

    // top MT/s figure in a product spec like "DDR5-6000" or "4800MHz,5200MHz,5600MHz"
    function topSpeed(p) {
      var s = (p.shortSpec || '') + ' ' + (p.interface || '');
      var best = 0, m;
      var re = /(\d{4})\s*(?:MHz|MT\/s)|DDR\d-(\d{4})/g;
      while ((m = re.exec(s))) { best = Math.max(best, parseInt(m[1] || m[2], 10)); }
      return best;
    }
    function deviceMaxSpeed(model) {
      var m = /(\d{4})/.exec(model.speed || '');
      return m ? parseInt(m[1], 10) : 0;
    }
    function memReason(p, model) {
      var ps = topSpeed(p), ds = deviceMaxSpeed(model);
      if (ps && ds) return ps <= ds ? 'Runs at ' + ps + ' MT/s \u2713' : 'Downclocks to ' + ds + ' MT/s';
      return p.form ? esc(p.form) + ' fits this slot' : 'Generation match';
    }

    function render(typeId, brandId, modelV) {
      var out = $('#compatOut');
      var t = db.types.filter(function (x) { return x.id === typeId; })[0];
      if (!t) return;
      var brand = t.brands.filter(function (b) { return b.id === brandId; })[0];
      if (!brand) return;
      var model = brand.models.filter(function (m) { return m.v === modelV; })[0];
      if (!model) return;
      typeData = t; sType.value = typeId;
      fill(sBrand, t.brands.map(function (b) { return { v: b.id, l: b.label }; }), 'Select brand');
      sBrand.value = brandId;
      fill(sModel, brand.models, 'Select model / platform');
      sModel.value = modelV;

      var memCats = (model.cats || []).filter(function (c) { return c.indexOf('dram') === 0; });
      var mems = (TM.products || []).filter(function (p) {
        return memCats.length && memCats.indexOf(p.cat) >= 0;
      }).filter(function (p) {
        if (model.gen && p.gen && p.gen !== model.gen) return false;
        if (model.form && p.form && p.form !== model.form) return false;
        return true;
      }).slice(0, 8);

      var ssdCats = (model.ssd_cats || []).filter(function (c) { return c.indexOf('ssd') === 0; });
      var ssds = (TM.products || []).filter(function (p) {
        return ssdCats.length && ssdCats.indexOf(p.cat) >= 0;
      }).slice(0, 4);
      var portables = (TM.products || []).filter(function (p) {
        return p.cat === 'portable-ssd';
      }).slice(0, 2);

      var qvlBadge = '';
      if (model.qvl === 'verified') qvlBadge = '<span class="chip ok">QVL verified</span>';
      else if (model.qvl === 'tested') qvlBadge = '<span class="chip ok">Tested by TwinMOS lab</span>';
      else if (model.qvl === 'spec') qvlBadge = '<span class="chip">Spec-compatible</span>';

      var facts = [];
      if (model.max_gb) facts.push('<b>' + model.max_gb + ' GB</b><span>max memory</span>');
      if (model.slots) facts.push('<b>' + model.slots + '</b><span>memory slots</span>');
      if (model.speed) facts.push('<b style="font-size:14px">' + esc(model.speed) + '</b><span>memory speed</span>');
      if (model.form) facts.push('<b style="font-size:14px">' + esc(model.form) + '</b><span>form factor</span>');
      if (model.ssd) facts.push('<b style="font-size:14px">' + esc(model.ssd) + '</b><span>storage slot</span>');

      out.innerHTML =
        '<div class="card dev-panel">' +
        '<div class="dev-head"><span class="eyebrow">' + esc(t.label) + ' \u00b7 ' + esc(brand.label) + '</span>' + qvlBadge + '</div>' +
        '<h3 class="h3" style="margin:4px 0 10px">' + esc(model.l) + '</h3>' +
        (facts.length ? '<div class="dev-facts">' + facts.map(function (f) { return '<div class="dev-fact">' + f + '</div>'; }).join('') + '</div>' : '') +
        (model.note ? '<div class="note-box" style="margin:12px 0 0">' + esc(model.note) + '</div>' : '') +
        '</div>' +
        (mems.length
          ? '<div class="grp-head"><h4>Compatible memory <span>' + mems.length + ' match' + (mems.length > 1 ? 'es' : '') + '</span></h4></div>' +
            '<div class="grid g3">' + mems.map(function (p) {
              return productCard(p).replace('class="card pcard"', 'class="card pcard" data-reason="' + esc(memReason(p, model)) + '"');
            }).join('') + '</div>'
          : '') +
        (ssds.length
          ? '<div class="grp-head"><h4>Compatible internal storage <span>' + ssds.length + ' match' + (ssds.length > 1 ? 'es' : '') + '</span></h4></div>' +
            '<div class="grid g3">' + ssds.map(function (p) { return productCard(p); }).join('') + '</div>'
          : '') +
        (portables.length
          ? '<div class="grp-head"><h4>Always compatible \u2014 external <span>works with any USB device</span></h4></div>' +
            '<div class="grid g3">' + portables.map(function (p) { return productCard(p); }).join('') + '</div>'
          : '') +
        (!mems.length && !ssds.length && !portables.length
          ? '<div class="empty-state"><p>No catalog match for this platform in the prototype database \u2014 <a href="contact.html">ask support</a> and we will confirm compatibility.</p></div>'
          : '') +
        '<div class="card card-pad" style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-top:20px;background:var(--bg-tint)">' +
        '<div><b>Can\u2019t find your device?</b><p class="form-note" style="margin:2px 0 0">Our support team verifies compatibility manually \u2014 send the exact model and we\u2019ll confirm the right upgrade.</p></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-ghost btn-sm" href="contact.html">Ask support</a>' +
        '<a class="btn btn-ghost btn-sm" href="where-to-buy.html">Where to buy</a></div></div>' +
        '<p class="form-note" style="margin-top:14px">Demo compatibility database for the prototype \u2014 \u201cSpec-compatible\u201d never means incompatible. Always confirm against your device manual \u2014 see <a href="article.html?id=how-to-check-motherboard-ram-compatibility">How to check your motherboard and RAM compatibility</a>.</p>';

      // reason chips under memory cards
      $$('#compatOut [data-reason]').forEach(function (card) {
        var chip = document.createElement('span');
        chip.className = 'reason-chip';
        chip.textContent = card.getAttribute('data-reason');
        card.querySelector('.pcard-body').appendChild(chip);
      });

      bindCardCompare(out);
      bindQuickView(out);
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    go.addEventListener('click', function () {
      if (!sModel.value) { toast('Pick a device type, brand and model to see matches', 'err'); return; }
      render(sType.value, sBrand.value, sModel.value);
    });

    // popular quick-picks + deep links (?type=&brand=&model=)
    $$('.quick-pick').forEach(function (b) {
      b.addEventListener('click', function () {
        render(b.getAttribute('data-t'), b.getAttribute('data-b'), b.getAttribute('data-m'));
        window.scrollTo({ top: (root.getBoundingClientRect().top + window.scrollY - 90), behavior: 'smooth' });
      });
    });
    var qt = param('type'), qb = param('brand'), qm = param('model');
    if (qt && qb && qm) render(qt, qb, qm);
  }

  /* ---------- RMA ---------- */
  // P1.3 (audit finding U-3): the trackers were deterministic string-hash demos
  // that invented a status for ANY number while a chip claimed "Live in
  // production". Both page widgets now read the real, PII-masked case record
  // from the API (GET /api/v1/rma/:number) — 7 canonical states, truthful
  // "not found" handling, no fabricated data.
  var RMA_STAGES = [
    ['submitted', 'Received & registered'],
    ['under_review', 'Diagnosis & testing'],
    ['approved', 'Approved — awaiting unit'],
    ['in_repair', 'Repair / replacement'],
    ['shipped', 'Replacement shipped'],
    ['delivered', 'Delivered'],
    ['closed', 'Closed']
  ];
  function rmaStageIndex(status) {
    for (var i = 0; i < RMA_STAGES.length; i++) if (RMA_STAGES[i][0] === status) return i;
    return 0;
  }
  function rmaWhen(iso) {
    try {
      var d = new Date(iso);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return ''; }
  }
  function rmaFetchCase(id, render, fail) {
    var api = String(window.TWINMOS_API || '/api/v1').replace(/\/+$/, '');
    fetch(api + '/rma/' + encodeURIComponent(id))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(render)
      .catch(fail);
  }
  function rmaTrackFail(out, id, status) {
    if (status === 404) {
      out.innerHTML = '<div class="empty-state"><h3>Case not found</h3><p>No RMA exists with number <b>' + esc(id) + '</b>. Check the number in your confirmation email, or contact support with your proof of purchase.</p></div>';
    } else {
      out.innerHTML = '<div class="empty-state"><h3>Status unavailable</h3><p>The service centre could not be reached — please retry in a moment.</p></div>';
    }
  }
  function initRMA() {
    // "Start an RMA" form: wire it through the shared form pipeline even when
    // the page predates its data-tm-form attribute (audit fix 2026-09-25).
    var rf = $('#rmaForm');
    if (rf && !rf.hasAttribute('data-tm-form')) {
      rf.setAttribute('data-tm-form', '');
      rf.setAttribute('data-success', 'RMA request received — your RMA number and shipping instructions arrive by email within one business day.');
    }
    var track = $('#rmaTrackBtn');
    if (track) {
      track.addEventListener('click', function () {
        var id = ($('#rmaId').value || '').trim().toUpperCase();
        var out = $('#rmaOut');
        if (!/^TM-RMA-\d{4}-\d{3,8}$/.test(id)) {
          out.innerHTML = '<div class="empty-state"><h3>Enter a valid RMA number</h3><p>Format: <span class="kbd">TM-RMA-2026-0142</span> — the full number from your confirmation email.</p></div>';
          return;
        }
        out.innerHTML = '<p class="form-note" style="margin-top:14px">Checking live case status…</p>';
        rmaFetchCase(id, function (d) {
          var idx = rmaStageIndex(d.status);
          var last = (d.timeline && d.timeline.length) ? d.timeline[d.timeline.length - 1] : null;
          out.innerHTML =
            '<div class="card card-pad" style="margin-top:18px">' +
            '<h3 class="h3" style="margin-bottom:4px">RMA ' + esc(d.number || id) + '</h3>' +
            '<p class="form-note">' + esc((d.maskedInfo && d.maskedInfo.product) || 'Registered product') +
            (last && last.at ? ' · Updated ' + esc(rmaWhen(last.at)) : '') + '</p>' +
            '<div class="rma-track">' + RMA_STAGES.map(function (s, i) {
              return '<div class="rma-stage ' + (i < idx ? 'done' : i === idx ? 'now' : '') + '">' + s[1] + '</div>';
            }).join('') + '</div>' +
            (idx >= 5 ? '<span class="chip ok">Completed</span>' : '<span class="chip warn">Currently: ' + esc(RMA_STAGES[idx][1]) + '</span>') +
            ' <span class="form-note">Live status from the TwinMOS service centre</span></div>';
        }, function (status) { rmaTrackFail(out, id, status); });
      });
    }
    var form = $('#rmaForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(form)) return;
        var demo = 'TM-RMA-2026-0' + (1000 + Math.floor(Math.random() * 8999));
        var box = form.parentElement;
        form.style.display = 'none';
        var ok = document.createElement('div');
        ok.className = 'form-success show';
        ok.innerHTML = '<div class="tick">✓</div><h3>Request registered</h3><p>Your demo RMA number is <b class="kbd">' + demo + '</b>.<br>In production this is emailed to you and the tracker above goes live immediately.</p>';
        box.appendChild(ok);
      });
    }
  }

  /* ---------- forms (contact / quote / newsletter) ---------- */
  function validate(form) {
    var ok = true;
    $$('.fg[data-req]', form).forEach(function (fg) {
      var inp = $('.input', fg);
      var v = inp ? (inp.value || '').trim() : '';
      var bad = !v;
      if (!bad && inp.type === 'email') bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      if (!bad && fg.getAttribute('data-min') && v.length < +fg.getAttribute('data-min')) bad = true;
      fg.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) toast('Please complete the highlighted fields', 'err');
    return ok;
  }
  function initForms() {
    $$('form[data-tm-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(form)) return;
        var box = form.closest('[data-form-box]') || form.parentElement;
        form.style.display = 'none';
        var ok = document.createElement('div');
        ok.className = 'form-success show';
        var msg = form.getAttribute('data-success') || ('Thank you — the ' + brandI(14) + ' team will reply within one business day.');
        ok.innerHTML = '<div class="tick">✓</div><h3>Submitted</h3><p>' + msg + '</p>';
        box.appendChild(ok);
        toast('Submitted successfully', 'ok');
      });
    });
    var nl = $('#nlForm');
    if (nl) {
      nl.addEventListener('submit', function (e) {
        e.preventDefault();
        var em = $('#nlEmail').value.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Enter a valid email address', 'err'); return; }
        nl.innerHTML = '<span class="chip ok">✓ Subscribed — welcome aboard</span>';
        toast('Subscribed to the TwinMOS newsletter', 'ok');
      });
    }
    var pre = param('product');
    if (pre && $('#qProduct')) {
      // P2.5 (audit U-8): hydrate the select from the LIVE catalog first —
      // the hardcoded 39 options predate DB products, so a CMS slug used to
      // collapse the selection to empty instead of prefilling.
      var sel = $('#qProduct');
      var have = {};
      Array.prototype.forEach.call(sel.options, function (o) { have[o.value] = o.textContent || o.value; });
      (TM.products || []).forEach(function (x) {
        if (!have[x.id] && !have[x.name]) {
          var opt = document.createElement('option');
          opt.value = x.name; // the prototype options carry display names
          opt.textContent = x.name;
          sel.appendChild(opt);
          have[x.name] = x.name;
        }
      });
      var p = (TM.products || []).filter(function (x) { return x.id === pre; })[0];
      sel.value = p ? p.name : (have[decodeURIComponent(pre)] ? decodeURIComponent(pre) : '');
    }
  }

  /* ---------- search page ---------- */
  function initSearch() {
    var mount = $('#searchMount');
    if (!mount) return;
    var q = param('q').trim();
    $('#searchQ').textContent = q;
    document.title = (q ? 'Search: ' + q : 'Search') + ' — TwinMOS';
    if (!q) {
      mount.innerHTML = '<div class="empty-state"><h3>Type a query in the search field</h3><p>Search covers all ' + ((TM.products || []).length) + ' catalog products and the media & articles library.</p></div>';
      return;
    }
    var need = q.toLowerCase().split(/\s+/).filter(Boolean);
    function hit(hay) { hay = hay.toLowerCase(); return need.every(function (n) { return hay.indexOf(n) >= 0; }); }
    var prods = (TM.products || []).filter(function (p) { return hit(p.name + ' ' + (p.catLabel || '') + ' ' + (p.search || '') + ' ' + (p.shortSpec || '')); });
    var arts = (TM.articles || []).filter(function (a) { return a.id !== 'glossary' && hit(a.title + ' ' + a.desc + ' ' + (a.tag || '')); });
    var terms = (TM.glossary || []).filter(function (t) { return hit(t.t + ' ' + t.d); }).slice(0, 12);
    var html = '';
    html += '<section><h2 class="h3">Products <span class="chip">' + prods.length + '</span></h2>';
    html += prods.length ? '<div class="grid g4" style="margin-top:14px">' + prods.map(productCard).join('') + '</div>' : '<p class="form-note">No product matches.</p></section>';
    html += '<section><h2 class="h3">Media & articles <span class="chip">' + arts.length + '</span></h2><div class="grid g3" style="margin-top:14px">';
    html += arts.length ? arts.map(function (a) {
      return '<a class="card card-pad article-card" href="article.html?id=' + encodeURIComponent(a.id) + '"><span class="chip" style="align-self:flex-start">' + esc(a.cat) + '</span><b style="display:block;color:var(--ink);margin:8px 0 6px;font-size:15.5px">' + esc(a.title) + '</b><span class="form-note">' + esc(a.desc.slice(0, 110)) + '…</span></a>';
    }).join('') : '<p class="form-note">No article matches.</p>';
    html += '</div></section>';
    if (terms.length) {
      html += '<section><h2 class="h3">Glossary terms <span class="chip">' + terms.length + '</span></h2>' +
        '<p class="form-note">From the <a href="learn-glossary.html">A–Z glossary</a> — jump straight to the definition.</p>' +
        '<div class="grid g3" style="margin-top:14px">' + terms.map(function (t) {
          return '<a class="card card-pad" href="learn-glossary.html#gL' + encodeURIComponent(t.l) + '">' +
            '<span class="chip">' + esc(t.l) + '</span>' +
            '<b style="display:block;color:var(--ink);margin:8px 0 6px;font-size:15.5px">' + esc(t.t) + '</b>' +
            '<span class="form-note">' + esc(t.d.slice(0, 110)) + '…</span></a>';
        }).join('') + '</div></section>';
    }
    mount.innerHTML = html;
    bindCardCompare(mount);
    bindQuickView(mount);
  }

  /* ---------- article page (knowledge-hub aware: TOC, reading time, prev/next, related) ---------- */
  var HUB_BY_CAT = { Guide: ['learn-guides.html', 'Buying guides'], Explainer: ['learn-explained.html', 'Technology explainers'],
                     Benchmark: ['learn-benchmarks.html', 'Benchmarks'], Blog: ['learn-blog.html', 'Tech insights'] };

  function initArticle() {
    var root = $('#artRoot');
    if (!root || !TM.articles) return;
    // the glossary is a dedicated A-Z page now — redirect legacy article links
    if (param('id') === 'glossary') { location.replace('learn-glossary.html'); return; }
    var id = param('id');
    var a = TM.articles.filter(function (x) { return x.id === id; })[0];
    if (!a) {
      root.innerHTML = '<div class="empty-state"><h3>Article not found</h3><p>That piece isn\u2019t in the library — browse everything from ' + brandI(15) + ' instead.</p><a class="btn btn-primary" href="learn.html">Open the Knowledge hub</a></div>';
      return;
    }
    document.title = a.title + ' — TwinMOS';
    var ald = document.createElement('script'); ald.type = 'application/ld+json';
    ald.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article',
      headline: a.title, description: a.desc, datePublished: a.date,
      author: { '@type': 'Organization', name: 'TwinMOS Technologies' },
      publisher: { '@type': 'Organization', name: 'TwinMOS' }, mainEntityOfPage: location.href });
    document.head.appendChild(ald);

    var hub = HUB_BY_CAT[a.cat];
    // extend the static Home/Newsroom crumb with the knowledge-hub trail for learn articles
    if (hub) {
      var bc = document.querySelector('.breadcrumb');
      var cur = bc && bc.querySelector('li[aria-current="page"]');
      if (cur) {
        var li = document.createElement('li');
        li.style.listStyle = 'none';
        var alink = document.createElement('a');
        alink.href = hub[0]; alink.textContent = 'Knowledge hub';
        li.appendChild(alink);
        var sep = document.createElement('li');
        sep.setAttribute('aria-hidden', 'true'); sep.style.listStyle = 'none'; sep.textContent = '/';
        cur.parentNode.insertBefore(li, cur);
        cur.parentNode.insertBefore(sep, cur);
        cur.textContent = hub[1];
      }
    }

    var secs = a.body.map(function (s, i) {
      return '<h2 id="as' + i + '">' + esc(s.h) + '</h2><p>' + esc(s.p) + '</p>';
    }).join('');
    var toc = a.body.length >= 3
      ? '<aside class="art-toc" aria-label="On this page"><b>On this page</b>' +
        a.body.map(function (s, i) { return '<a href="#as' + i + '">' + esc(s.h) + '</a>'; }).join('') + '</aside>'
      : '';

    var backChip = hub
      ? '<a class="chip" href="' + hub[0] + '" style="text-decoration:none">↑ ' + hub[1] + '</a>'
      : (a.cat === 'KB'
          ? '<a class="chip" href="support.html" style="text-decoration:none">↑ Support center</a>'
          : '<a class="chip" href="news.html" style="text-decoration:none">↑ Newsroom</a>');
    var metaChips = '<span class="chip">' + esc(a.date) + '</span>' +
      (a.mins ? '<span class="chip">' + esc(a.mins) + ' min read</span>' : '') +
      (a.tag ? '<span class="chip">' + esc(a.tag) + '</span>' : '') +
      backChip;

    // prev / next inside the same category, in corpus reading order
    var pn = '';
    if (hub) {
      var seq = TM.articles.filter(function (x) { return x.cat === a.cat && x.id !== 'glossary'; });
      var idx = seq.indexOf(a);
      var prev = idx > 0 ? seq[idx - 1] : null;
      var next = idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : null;
      pn = '<div class="art-pn">' +
        (prev ? '<a href="article.html?id=' + encodeURIComponent(prev.id) + '"><span>← Previous</span><b>' + esc(prev.title) + '</b></a>' : '') +
        (next ? '<a href="article.html?id=' + encodeURIComponent(next.id) + '" style="text-align:right"><span>Next →</span><b>' + esc(next.title) + '</b></a>' : '') +
        '</div>';
    }

    // related reading: corpus cross_links first, then same-tag neighbours
    var relIds = [];
    (a.links || []).forEach(function (l) { if (l !== a.id && relIds.indexOf(l) === -1) relIds.push(l); });
    TM.articles.forEach(function (x) {
      if (relIds.length >= 6 || x.id === a.id || x.id === 'glossary') return;
      if (x.cat === a.cat && x.tag === a.tag && relIds.indexOf(x.id) === -1) relIds.push(x.id);
    });
    var relArts = relIds.map(function (rid) {
      return TM.articles.filter(function (x) { return x.id === rid; })[0];
    }).filter(Boolean).slice(0, 3);
    var relChips = relIds.length
      ? '<div class="art-rel-chips">' + relIds.slice(0, 6).map(function (rid) {
          var r = TM.articles.filter(function (x) { return x.id === rid; })[0];
          return r ? '<a href="article.html?id=' + encodeURIComponent(r.id) + '">' + esc(r.title) + '</a>' : '';
        }).join('') + '</div>'
      : '';

    // products that match the article topic (keyword → category map)
    var prodsHtml = '';
    if (TM.products) {
      var hay = (a.title + ' ' + a.desc + ' ' + (a.tag || '')).toLowerCase();
      var cats = [];
      if (/portable|external|on-the-go/.test(hay)) cats.push('portable-ssd', 'portable-hdd');
      if (/ssd|nvme|nand|pcie|sata|trim|wear|tbw|mtbf|storage|drive/.test(hay)) cats.push('ssd-nvme', 'ssd-sata');
      if (/ddr|dram|memory|ram|latency|timings|xmp|expo|dimms?|bandwidth|pmic|ecc/.test(hay)) cats.push('dram-gaming', 'dram-desktop', 'dram-notebook');
      if (/gaming|rgb|voltx/.test(hay)) cats.push('dram-gaming', 'ssd-nvme');
      var picks = TM.products.filter(function (p) { return cats.indexOf(p.cat) !== -1; });
      picks = picks.slice(0, 4);
      if (picks.length) {
        prodsHtml = '<div class="section-head" style="margin-top:clamp(26px,3vw,40px)"><div><span class="eyebrow">Shop the topic</span>' +
          '<h2 class="h2">' + (a.cat === 'Benchmark' ? 'Products tested' : 'Featured for this topic') + '</h2></div>' +
          '<a class="link-arrow" href="shop.html">All products</a></div><div class="grid g4" id="artProds">' +
          picks.map(productCard).join('') + '</div>';
      }
    }

    root.innerHTML =
      '<div class="art-layout"><div class="article-body">' +
      '<span class="eyebrow">' + esc(a.cat) + '</span>' +
      '<h1 class="h1" style="margin-bottom:10px">' + esc(a.title) + '</h1>' +
      '<div class="article-meta">' + metaChips + '</div>' +
      (a.img ? '<figure class="article-hero"><img src="' + esc(a.img) + '" alt="' + esc(a.title) + '"></figure>' : '') +
      '<p class="lede">' + esc(a.desc) + '</p>' +
      secs +
      pn + relChips +
      '<div class="helpful" id="helpfulBox"><span>Was this article helpful?</span>' +
      '<button type="button" data-helpful="yes">👍 Yes</button><button type="button" data-helpful="no">👎 No</button>' +
      '<button type="button" id="artShare" title="Copy link">🔗 Copy link</button></div>' +
      '</div>' + toc + '</div>' + prodsHtml;

    $$('#helpfulBox [data-helpful]').forEach(function (b) {
      b.addEventListener('click', function () {
        var box = $('#helpfulBox');
        box.innerHTML = '<span>Thanks — your feedback helps us improve the library.</span>';
        try {
          var f = JSON.parse(localStorage.getItem('tm_helpful') || '{}');
          f[a.id] = b.getAttribute('data-helpful');
          localStorage.setItem('tm_helpful', JSON.stringify(f));
        } catch (e) {}
        toast('Feedback recorded', 'ok');
      });
    });
    var share = $('#artShare');
    if (share) share.addEventListener('click', function () {
      var url = location.href;
      var done = function () { toast('Link copied', 'ok'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () {});
      else {
        var ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });

    var rel = $('#artMore');
    if (rel) {
      var others = relArts.length ? relArts : TM.articles.filter(function (x) {
        return x.id !== id && x.cat !== 'KB' && x.id !== 'glossary' && x.cat === a.cat;
      }).slice(0, 3);
      if (!others.length) others = TM.articles.filter(function (x) { return x.id !== id && x.cat !== 'KB'; }).slice(0, 3);
      rel.innerHTML = others.map(function (o) {
        return '<a class="card card-pad" href="article.html?id=' + encodeURIComponent(o.id) + '"><span class="chip">' + esc(o.cat) + '</span><b style="display:block;color:var(--ink);margin:8px 0 4px">' + esc(o.title) + '</b><span class="form-note">' + esc(o.date) + '</span></a>';
      }).join('');
    }
    var prodGrid = $('#artProds');
    if (prodGrid) { bindCardCompare(prodGrid); bindQuickView(prodGrid); }
  }

  /* ---------- shop/pdp data hooks on home/gaming rails ---------- */
  function initRails() {
    $$('[data-rail]').forEach(function (el) {
      if (!TM.products) return;
      var spec = el.getAttribute('data-rail');
      var list;
      if (spec === 'featured') list = TM.products.filter(function (p) { return p.featured; }).slice(0, 4);
      else if (spec === 'gaming') list = TM.products.filter(function (p) { return p.badge === 'Gaming'; }).slice(0, 4);
      else if (spec === 'new') list = TM.products.filter(function (p) { return p.isNew; }).slice(0, 4);
      else if (spec === 'gen5') list = TM.products.filter(function (p) { return p.badge === 'Gen5' || /Gen 5/i.test(p.name); }).slice(0, 4);
      else list = TM.products.slice(0, 4);
      el.innerHTML = list.map(productCard).join('');
      bindCardCompare(el);
      bindQuickView(el);
    });
  }

  /* ---------- boot ---------- */
  /* ---------- generic tab component (support FAQ, legal) ---------- */
  function initTabs() {
    var tabs = $$('.tabs .tab[data-tab]');
    if (!tabs.length) return;
    function activate(btn) {
      var id = btn.getAttribute('data-tab');
      var bar = btn.parentElement;
      $$('.tab', bar).forEach(function (t) {
        var on = t === btn;
        t.classList.toggle('on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      var host = bar.parentElement;
      $$('.tabpane', host).forEach(function (p) { p.classList.toggle('on', p.id === id); });
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () { activate(b); }); });
    // deep link: legal.html#terms / #warranty / #privacy / #eol etc.
    function onHash() {
      var h = (location.hash || '').split('?')[0].slice(1);
      if (!h) return;
      var match = tabs.filter(function (b) {
        var t = b.getAttribute('data-tab') || '';
        return t === h || t === 'legal-' + h || t.slice(t.lastIndexOf('-') + 1) === h;
      })[0];
      if (match) activate(match);
    }
    onHash();
    window.addEventListener('hashchange', onHash);
  }

  /* ---------- hero slider (multi-slide carousel) ---------- */
  function initSlider() {
    $$('[data-slider]').forEach(function (root) {
      var slides = $$('.sl-slide', root);
      if (slides.length < 2) return;
      var dots = $$('[data-sl-dot]', root);
      var prev = $('[data-sl-prev]', root), next = $('[data-sl-next]', root);
      var i = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('on'); }));
      var timer = null, hover = false;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var rtl = document.documentElement.getAttribute('dir') === 'rtl';
      var counter = $('.sl-count b', root);

      function show(n) {
        i = (n + slides.length) % slides.length;
        slides.forEach(function (s, k) {
          var on = k === i;
          s.classList.toggle('on', on);
          s.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        dots.forEach(function (d, k) {
          d.classList.toggle('on', k === i);
          d.setAttribute('aria-selected', k === i ? 'true' : 'false');
        });
        if (counter) counter.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
      }
      function step(d) { show(i + d); restart(); }
      function restart() {
        if (timer) clearInterval(timer);
        if (reduce || hover) return;
        var ms = parseInt(root.getAttribute('data-autoplay') || '6000', 10);
        timer = setInterval(function () { if (!hover) show(i + 1); }, ms);
      }

      if (prev) prev.addEventListener('click', function () { step(rtl ? 1 : -1); });
      if (next) next.addEventListener('click', function () { step(rtl ? -1 : 1); });
      dots.forEach(function (d) {
        d.addEventListener('click', function () { show(parseInt(d.getAttribute('data-sl-dot'), 10)); restart(); });
      });
      root.addEventListener('mouseenter', function () { hover = true; });
      root.addEventListener('mouseleave', function () { hover = false; restart(); });
      root.addEventListener('focusin', function () { hover = true; });
      root.addEventListener('focusout', function () { hover = false; });
      root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); step(rtl ? -1 : 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(rtl ? 1 : -1); }
      });
      // swipe (pointer + touch)
      var x0 = null, y0 = null;
      root.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; hover = true; }, { passive: true });
      root.addEventListener('pointermove', function (e) {
        if (x0 === null) return;
        var dx = e.clientX - x0, dy = e.clientY - y0;
        if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          var forward = rtl ? dx < 0 : dx > 0;
          step(forward ? 1 : -1);
          x0 = null;
        }
      }, { passive: true });
      root.addEventListener('pointerup', function () { x0 = null; hover = false; restart(); }, { passive: true });
      root.addEventListener('pointercancel', function () { x0 = null; hover = false; restart(); }, { passive: true });
      // pause autoplay while tab is hidden
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { if (timer) clearInterval(timer); }
        else restart();
      });
      show(i);
      restart();
    });
  }

  /* ---------- Home Page Enhancements (2026 Redesign) ---------- */
  function initHomeEnhancements() {
    // 1. Quick Upgrade Advisor Engine
    var devRow = $('#uaDeviceRow');
    var goalRow = $('#uaGoalRow');
    var recBox = $('#uaRecommendation');
    
    if (devRow && goalRow && recBox && TM.products) {
      var advisors = {
        laptop: [
          { id: 'ram', label: '⚡ Fast Laptop Memory (SO-DIMM)', prodId: 'voltx-ddr5-so-dimm-for-laptop', tag: 'DDR5 · 5600MHz · MTCD Thermal', desc: 'High-density DDR5 SODIMM to eradicate multitasking lag in modern laptops.' },
          { id: 'ssd', label: '🚀 M.2 NVMe SSD Expansion', prodId: 'alphapro-nvme-m2-2280-new-ssd', tag: 'PCIe Gen 3/4 · M.2 2280', desc: 'High-speed NVMe SSD with low power consumption and high endurance for slim laptops.' }
        ],
        desktop: [
          { id: 'gen5', label: '🔥 Flagship PCIe Gen 5.0 SSD', prodId: 'corex-pro-m2-pcie-gen-5-0-nvme-ssd', tag: '14,000 MB/s · Graphene Foil', desc: 'Next-generation NVMe 2.0 throughput for uncompromising PC rigs and heavy workloads.' },
          { id: 'ddr5', label: '⚡ VOLTX DDR5 RGB RAM', prodId: 'voltx-rgb-ddr5-u-dimm-for-desktop', tag: 'DDR5-6000 · Intel XMP 3.0', desc: 'Board-synced addressable RGB lighting, on-die ECC, and lifetime warranty.' },
          { id: 'psu', label: '🔌 80 PLUS Bronze Power', prodId: 'smartx-rgb-80-plus-bronze-power-supply-550w', tag: '550W · 80 PLUS Bronze · RGB', desc: 'Clean, reliable 12V single rail power delivery with hydraulic silent fan.' }
        ],
        gaming: [
          { id: 'gen5_direct', label: '🎮 DirectStorage Gen 5.0 SSD', prodId: 'corex-pro-m2-pcie-gen-5-0-nvme-ssd', tag: 'DirectStorage Ready · 14,000 MB/s', desc: 'Streams game assets directly to GPU VRAM for instant open-world transitions.' },
          { id: 'rgb_ram', label: '⚡ VOLTX RGB 6000MHz Memory', prodId: 'voltx-rgb-ddr5-u-dimm-for-desktop', tag: 'Low Latency · Sync Lighting', desc: 'Engineered for overclocking headroom and high FPS stability in demanding titles.' },
          { id: 'ps5_ssd', label: '🕹️ PS5 Compatible Gen 4 NVMe', prodId: 'xtreme-gen4x4-nvme-pro-m2-2280-ssd', tag: 'PCIe Gen 4x4 · Up to 7,400 MB/s', desc: 'Meets and exceeds PlayStation 5 internal expansion requirements with heatsink.' }
        ],
        creator: [
          { id: 'portable', label: '💼 1,100 MB/s Portable USB-C SSD', prodId: 'portable-ssd-elite-drive-pro-usb-type-c', tag: 'USB 3.2 Gen 2 · Rugged Pocket', desc: 'Shock-resistant pocket storage for on-set 4K video scrubbing and high-speed backups.' },
          { id: 'nvme_2tb', label: '🎬 High-Endurance 2TB NVMe', prodId: 'corex-pro-m2-pcie-gen-5-0-nvme-ssd', tag: '1,400 TBW · 3D TLC NAND', desc: 'Endurance and speed tuned for massive ProRes renders and uncompressed video timelines.' },
          { id: 'microsd_v30', label: '📹 4K V30 MicroSD Card', prodId: 'microsdxc-class-10-v30-uhs-3', tag: 'V30 · UHS-I U3 · 4K UHD Video', desc: 'Validated for 4K action cameras, drones, and handheld gaming consoles.' }
        ]
      };

      var curDev = 'laptop';
      var curGoal = 'ram';

      function renderAdvisor() {
        var goals = advisors[curDev] || advisors.laptop;
        var activeGoalObj = goals.filter(function (g) { return g.id === curGoal; })[0] || goals[0];
        curGoal = activeGoalObj.id;

        // Render goal pills
        goalRow.innerHTML = goals.map(function (g) {
          var on = g.id === curGoal;
          return '<button class="ua-pill' + (on ? ' on' : '') + '" data-goal="' + g.id + '" role="tab" aria-selected="' + (on ? 'true' : 'false') + '">' + g.label + '</button>';
        }).join('');

        // Bind goal buttons
        $$('[data-goal]', goalRow).forEach(function (btn) {
          btn.addEventListener('click', function () {
            curGoal = btn.getAttribute('data-goal');
            renderAdvisor();
          });
        });

        // Find product
        var p = (TM.products || []).filter(function (x) { return x.id === activeGoalObj.prodId; })[0];
        if (!p) p = TM.products[0];

        var img = p.imgC || p.img || 'assets/img/card/corex-pro.webp';
        recBox.innerHTML =
          '<div class="ua-rec-img">' +
          '  <img src="' + esc(img) + '" alt="' + esc(p.name) + '">' +
          '</div>' +
          '<div class="ua-rec-info">' +
          '  <div class="ua-rec-tag"><span class="pulse-indicator pulse-cyan"></span> ' + esc(activeGoalObj.tag) + '</div>' +
          '  <h3 class="ua-rec-title">' + esc(p.name) + '</h3>' +
          '  <div class="ua-rec-specs">' + esc(activeGoalObj.desc) + '</div>' +
          '</div>' +
          '<div class="ua-rec-actions">' +
          '  <a class="btn btn-accent btn-sm" href="product.html?id=' + encodeURIComponent(p.id) + '">View Product Details →</a>' +
          '  <a class="btn btn-ghost btn-sm" style="color:#fff;border-color:rgba(255,255,255,.3)" href="compatibility.html">Check Compatibility</a>' +
          '</div>';
      }

      $$('[data-dev]', devRow).forEach(function (btn) {
        btn.addEventListener('click', function () {
          curDev = btn.getAttribute('data-dev');
          $$('[data-dev]', devRow).forEach(function (b) {
            var on = b === btn;
            b.classList.toggle('on', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          curGoal = (advisors[curDev][0] || {}).id || 'ram';
          renderAdvisor();
        });
      });

      renderAdvisor();
    }

    // 2. Speed Benchmark Simulator Engine
    var swTabs = $('#speedWorkloadTabs');
    var sBarsWrap = $('#speedBarsWrap');
    var sTakeaway = $('#speedTakeawayText');

    if (swTabs && sBarsWrap && sTakeaway) {
      var workloads = {
        directstorage: {
          takeaway: 'TwinMOS CoreX Pro Gen 5 streams assets directly to GPU VRAM at up to 14,000 MB/s, cutting massive open-world texture load times from minutes on HDD down to just 3.6 seconds.',
          rows: [
            { name: 'TwinMOS CoreX Pro', badge: 'Gen 5', bCls: 'sbg-g5', fCls: 'sbf-g5', pct: 100, speed: '14,000 MB/s', eta: '3.6 sec' },
            { name: 'PCIe Gen 4.0 NVMe', badge: 'Gen 4', bCls: 'sbg-g4', fCls: 'sbf-g4', pct: 53, speed: '7,400 MB/s', eta: '6.8 sec' },
            { name: 'PCIe Gen 3.0 NVMe', badge: 'Gen 3', bCls: 'sbg-g3', fCls: 'sbf-g3', pct: 25, speed: '3,500 MB/s', eta: '14.3 sec' },
            { name: 'SATA III 2.5″ SSD', badge: 'SATA', bCls: 'sbg-sata', fCls: 'sbf-sata', pct: 14, speed: '550 MB/s', eta: '1m 31s' },
            { name: 'Mechanical 7.2K HDD', badge: 'HDD', bCls: 'sbg-hdd', fCls: 'sbf-hdd', pct: 8, speed: '120 MB/s', eta: '6m 56s' }
          ]
        },
        video8k: {
          takeaway: 'Exporting or scrubbing 100GB of ProRes 8K video streams saturates interface bandwidth. CoreX Pro Gen 5.0 with graphene cooling handles sustained workloads without throttling.',
          rows: [
            { name: 'TwinMOS CoreX Pro', badge: 'Gen 5', bCls: 'sbg-g5', fCls: 'sbf-g5', pct: 100, speed: '14,000 MB/s', eta: '7.1 sec' },
            { name: 'PCIe Gen 4.0 NVMe', badge: 'Gen 4', bCls: 'sbg-g4', fCls: 'sbf-g4', pct: 53, speed: '7,400 MB/s', eta: '13.5 sec' },
            { name: 'PCIe Gen 3.0 NVMe', badge: 'Gen 3', bCls: 'sbg-g3', fCls: 'sbf-g3', pct: 25, speed: '3,500 MB/s', eta: '28.6 sec' },
            { name: 'SATA III 2.5″ SSD', badge: 'SATA', bCls: 'sbg-sata', fCls: 'sbf-sata', pct: 14, speed: '550 MB/s', eta: '3m 02s' },
            { name: 'Mechanical 7.2K HDD', badge: 'HDD', bCls: 'sbg-hdd', fCls: 'sbf-hdd', pct: 8, speed: '120 MB/s', eta: '13m 53s' }
          ]
        },
        boot: {
          takeaway: 'Instantaneous boot and application launch: 14,000 MB/s sequential combined with high 4K random IOPS launches the OS and creative suites almost instantaneously.',
          rows: [
            { name: 'TwinMOS CoreX Pro', badge: 'Gen 5', bCls: 'sbg-g5', fCls: 'sbf-g5', pct: 100, speed: '14,000 MB/s', eta: '4.2 sec' },
            { name: 'PCIe Gen 4.0 NVMe', badge: 'Gen 4', bCls: 'sbg-g4', fCls: 'sbf-g4', pct: 60, speed: '7,400 MB/s', eta: '7.5 sec' },
            { name: 'PCIe Gen 3.0 NVMe', badge: 'Gen 3', bCls: 'sbg-g3', fCls: 'sbf-g3', pct: 36, speed: '3,500 MB/s', eta: '12.0 sec' },
            { name: 'SATA III 2.5″ SSD', badge: 'SATA', bCls: 'sbg-sata', fCls: 'sbf-sata', pct: 22, speed: '550 MB/s', eta: '26.0 sec' },
            { name: 'Mechanical 7.2K HDD', badge: 'HDD', bCls: 'sbg-hdd', fCls: 'sbf-hdd', pct: 10, speed: '120 MB/s', eta: '85.0 sec' }
          ]
        }
      };

      function renderSpeedSim(wk) {
        var data = workloads[wk] || workloads.directstorage;
        sTakeaway.textContent = data.takeaway;
        sBarsWrap.innerHTML = data.rows.map(function (r) {
          return '<div class="speed-row">' +
            '<div class="speed-name"><span class="speed-badge-gen ' + r.bCls + '">' + r.badge + '</span> ' + r.name + '</div>' +
            '<div class="speed-bar-track">' +
            '  <div class="speed-bar-fill ' + r.fCls + '" style="width:' + r.pct + '%">' + r.speed + '</div>' +
            '</div>' +
            '<div class="speed-metrics">' +
            '  <span class="speed-num">' + r.speed + '</span>' +
            '  <span class="speed-eta">ETA: ' + r.eta + '</span>' +
            '</div>' +
            '</div>';
        }).join('');
      }

      $$('[data-workload]', swTabs).forEach(function (tab) {
        tab.addEventListener('click', function () {
          var wk = tab.getAttribute('data-workload');
          $$('[data-workload]', swTabs).forEach(function (t) {
            var on = t === tab;
            t.classList.toggle('on', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          renderSpeedSim(wk);
        });
      });

      renderSpeedSim('directstorage');
    }

    // 3. Flagship Segment Tabs Filter
    var fTabs = $('#flagshipTabs');
    var fGrid = $('#homeFlagshipGrid');
    if (fTabs && fGrid && TM.products) {
      var segments = {
        all: ['voltx-rgb-ddr5-u-dimm-for-desktop', 'corex-pro-m2-pcie-gen-5-0-nvme-ssd', 'portable-ssd-elite-drive-pro-usb-type-c', 'tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop'],
        nvme: ['corex-pro-m2-pcie-gen-5-0-nvme-ssd', 'corex-m2-pcie-gen-4-0-nvme-ssd', 'xtreme-gen4x4-nvme-pro-m2-2280-ssd', 'alphapro-nvme-m2-2280-new-ssd'],
        gaming: ['voltx-rgb-ddr5-u-dimm-for-desktop', 'voltx-ddr5-u-dimm-for-desktop', 'tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop', 'smartx-rgb-80-plus-bronze-power-supply-550w'],
        portable: ['portable-ssd-elite-drive-pro-usb-type-c', 'portable-ssd-elitedrive-usb-3-0-type-c', 'portable-hdd-prodrive-ultra-usb-3-0', 'x3-ultra-usb-3-2-flash-drive']
      };

      function renderFlagships(segKey) {
        var ids = segments[segKey] || segments.all;
        var list = [];
        ids.forEach(function (id) {
          var hit = TM.products.filter(function (p) { return p.id === id; })[0];
          if (hit) list.push(hit);
        });
        if (!list.length) list = TM.products.slice(0, 4);

        fGrid.innerHTML = list.map(productCard).join('');
        bindCardCompare(fGrid);
        bindQuickView(fGrid);
      }

      $$('[data-fseg]', fTabs).forEach(function (b) {
        b.addEventListener('click', function () {
          var seg = b.getAttribute('data-fseg');
          $$('[data-fseg]', fTabs).forEach(function (x) {
            var on = x === b;
            x.classList.toggle('on', on);
            x.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          renderFlagships(seg);
        });
      });

      renderFlagships('all');
    }

    // 4. Hero Animated Stat Counters
    var counters = $$('[data-counter]');
    if (counters.length && 'IntersectionObserver' in window) {
      var counterObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseInt(el.getAttribute('data-counter'), 10);
            if (!target || el._animated) return;
            el._animated = true;
            var duration = 1200;
            var startTime = null;
            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              var ease = 1 - Math.pow(1 - progress, 3);
              var cur = Math.floor(ease * target);
              el.textContent = cur.toLocaleString() + (target === 93 ? '+' : '');
              if (progress < 1) requestAnimationFrame(step);
              else el.textContent = target.toLocaleString() + (target === 93 ? '+' : '');
            }
            requestAnimationFrame(step);
            counterObs.unobserve(el);
          }
        });
      }, { threshold: 0.2 });
      counters.forEach(function (c) { counterObs.observe(c); });
    }
  }

  // ---- learn hub: category filter chips + ?cat= deep link (corpus 08-learn)
  // ---- glossary page: live term filter + letter visibility sync ----
  function initGlossary() {
    var input = $('#glossQ');
    if (!input) return;
    var terms = $$('.lterm');
    var letters = $$('.lsec-letter');
    var idxLinks = $$('.lidx-a');
    var count = $('#glossCount');
    var empty = $('.lterm-empty');
    function apply() {
      var q = (input.value || '').trim().toLowerCase();
      var n = 0;
      terms.forEach(function (t) {
        var ok = !q || (t.getAttribute('data-search') || '').indexOf(q) >= 0;
        t.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      letters.forEach(function (sec) {
        var vis = $$('.lterm', sec).some(function (t) { return t.style.display !== 'none'; });
        sec.style.display = vis ? '' : 'none';
      });
      idxLinks.forEach(function (a) {
        var sec = $('.lsec-letter[data-letter="' + a.getAttribute('data-letter') + '"]');
        a.style.display = (!q || (sec && sec.style.display !== 'none')) ? '' : 'none';
      });
      if (count) count.textContent = n;
      if (empty) empty.hidden = n > 0;
    }
    input.addEventListener('input', apply);
  }

  // ---- where-to-buy: country distributor locator (search + region chips + status + geo-detect)
  function initLocator() {
    var grid = $('#locGrid');
    if (!grid) return;
    var cards = $$('.dcard', grid);
    var searchIn = $('#locSearch'), statusSel = $('#locStatus'), chipsBar = $('#locChips');
    var countEl = $('#locCount'), emptyEl = $('#locEmpty'), geoBar = $('#geoBar');
    var state = { q: '', rg: 'all', st: 'all' };

    function apply() {
      var q = state.q.toLowerCase();
      var n = 0;
      cards.forEach(function (c) {
        var okQ = !q || (c.getAttribute('data-search') || '').indexOf(q) !== -1;
        var okR = state.rg === 'all' || c.getAttribute('data-region') === state.rg;
        var okS = state.st === 'all' || c.getAttribute('data-status') === state.st;
        var show = okQ && okR && okS;
        c.style.display = show ? '' : 'none';
        if (show) n++;
      });
      countEl.textContent = 'Showing ' + n + (n === 1 ? ' market' : ' markets');
      emptyEl.hidden = n !== 0;
    }

    searchIn.addEventListener('input', function () { state.q = searchIn.value.trim(); apply(); });
    statusSel.addEventListener('change', function () { state.st = statusSel.value; apply(); });
    $$('[data-rg]', chipsBar).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-rg]', chipsBar).forEach(function (x) {
          var on = x === b;
          x.classList.toggle('on', on);
          x.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        state.rg = b.getAttribute('data-rg');
        apply();
      });
    });

    function focusCountry(cc) {
      // deep-link a single country: empty search, all regions, then pin its card
      state.q = ''; state.rg = 'all'; state.st = 'all';
      searchIn.value = ''; statusSel.value = 'all';
      $$('[data-rg]', chipsBar).forEach(function (x) {
        var on = x.getAttribute('data-rg') === 'all';
        x.classList.toggle('on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      cards.forEach(function (c) { c.style.display = c.getAttribute('data-cc') === cc ? '' : 'none'; });
      countEl.textContent = 'Showing 1 market';
      emptyEl.hidden = true;
    }
    window.TMfocusCountry = focusCountry;

    // deep links: where-to-buy.html?region=africa / ?country=IN / #locator
    var qs = new URLSearchParams(location.search);
    var qRegion = qs.get('region'), qCountry = (qs.get('country') || '').toUpperCase();
    if (qCountry) {
      var hit = cards.filter(function (c) { return c.getAttribute('data-cc') === qCountry; })[0];
      if (hit) { focusCountry(qCountry); return; }
    }
    if (qRegion) {
      // P2.5 (audit U-8): accept human region names, not just chip codes —
      // ?region=africa previously matched nothing and silently no-oped.
      var REGION_ALIASES = { africa: 'af', 'middle-east': 'me', middle_east: 'me', gcc: 'me',
        'asia-pacific': 'as', asia: 'as', europe: 'eu', cis: 'cis', americas: 'am', am: 'am' };
      var code = REGION_ALIASES[qRegion.toLowerCase()] || qRegion.toLowerCase();
      var rb = $('[data-rg="' + code + '"]', chipsBar);
      if (rb) rb.click();
      else console.warn('[where-to-buy] unknown ?region=', qRegion, '— expected: af, me, as, eu, cis, am (or a full region name)');
    }

    // geo-detect (timezone only — no network, no storage): suggest, never auto-filter
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      var TZ2CC = {
        'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW',
        'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM', 'Africa/Cairo': 'EG', 'Africa/Casablanca': 'MA',
        'Africa/Algiers': 'DZ', 'Africa/Tripoli': 'LY', 'Africa/Lagos': 'NG', 'Africa/Accra': 'GH',
        'Africa/Dakar': 'SN', 'Africa/Douala': 'CM', 'Africa/Nairobi': 'KE', 'Africa/Addis_Ababa': 'ET',
        'Africa/Kigali': 'RW', 'Africa/Johannesburg': 'ZA', 'Africa/Luanda': 'AO', 'Africa/Windhoek': 'NA',
        'Africa/Gaborone': 'BW', 'Africa/Maseru': 'LS', 'Asia/Taipei': 'TW', 'Asia/Kolkata': 'IN',
        'Asia/Karachi': 'PK', 'Asia/Hong_Kong': 'HK', 'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY',
        'Asia/Bangkok': 'SEA', 'Asia/Jakarta': 'SEA', 'Asia/Manila': 'SEA', 'Asia/Shanghai': 'CN',
        'Europe/Berlin': 'DE', 'Europe/Amsterdam': 'NL', 'Europe/London': 'GB', 'Europe/Moscow': 'RU',
        'Asia/Almaty': 'KZ', 'America/Los_Angeles': 'US', 'America/New_York': 'US', 'America/Chicago': 'US',
        'America/Toronto': 'US', 'America/Vancouver': 'US'
      };
      var cc = TZ2CC[tz];
      if (!cc) return;
      var card = cards.filter(function (c) { return c.getAttribute('data-cc') === cc; })[0];
      if (!card) return;
      var name = (card.querySelector('.dc-title b') || {}).textContent || 'your region';
      geoBar.hidden = false;
      geoBar.innerHTML = '📍 Detected: <b>' + name + '</b>'
        + '<button class="btn btn-primary btn-sm" type="button">Show my channel</button>'
        + '<button class="geo-x" type="button" aria-label="Dismiss">✕</button>';
      var showBtn = geoBar.querySelector('.btn');
      showBtn.addEventListener('click', function () {
        focusCountry(cc);
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      geoBar.querySelector('.geo-x').addEventListener('click', function () { geoBar.hidden = true; });
    } catch (e) { /* Intl unavailable — locator stays fully usable */ }
  }

  function boot() {
    initHeader(); initCookie(); initTabs(); initSlider(); initShop(); initPDP(); initCompare(); initCompat();
    initRMA(); initForms(); initSearch(); initArticle(); initRails(); initHomeEnhancements(); syncCmpUI();
    initLocator(); initGlossary();
    // P2.6 (audit U-14): the mega menus and feature bands baked "39 products"
    // into every page when the prototype shipped — the live catalog has since
    // grown. cms-merge has already run (script order: data → cms-content →
    // cms-merge → app), so TM.products is final here. Patch the literal so
    // every page states the real catalog size.
    var liveCount = (TM.products || []).length;
    if (liveCount && liveCount !== 39) {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var nodes = [];
      while (walker.nextNode()) { if (/39 products/.test(walker.currentNode.nodeValue || '')) nodes.push(walker.currentNode); }
      nodes.forEach(function (n) { n.nodeValue = String(n.nodeValue || '').replace(/39 products/g, liveCount + ' products'); });
    }
    // support page: search router + RMA tracker demo
    var supForm = $('#supSearch');
    if (supForm) supForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = ($('#supSearchInput').value || '').trim();
      if (q) location.href = 'search.html?q=' + encodeURIComponent(q);
    });
    var rmaForm = $('#rmaTrackForm');
    if (rmaForm) rmaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = ($('#rmaTrackInput').value || '').trim().toUpperCase();
      var out = $('#rmaTrackOut');
      // accept both confirmation formats: RMA-2026-123456 and TM-RMA-2026-0142
      if (!/^(TM-)?RMA-\d{4}-\d{3,8}$/.test(v)) {
        out.innerHTML = '<p class="form-note" style="color:#B3261E;margin:0">Enter the full format from your email — e.g. RMA-2026-123456 or TM-RMA-2026-0142.</p>';
        return;
      }
      // P1.3: live case record from the API — no invented states (was sum % 5)
      out.innerHTML = '<p class="form-note" style="margin:8px 0 0">Checking live case status…</p>';
      rmaFetchCase(v, function (d) {
        var idx = rmaStageIndex(d.status);
        var labels = RMA_STAGES.map(function (s) { return s[1]; });
        var last = (d.timeline && d.timeline.length) ? d.timeline[d.timeline.length - 1] : null;
        out.innerHTML =
          '<div class="rma-status"><b>' + esc(d.number || v) + '</b><span class="chip ' + (idx >= 5 ? 'ok' : '') + '">' + esc(labels[idx]) + '</span></div>' +
          '<div class="rma-timeline">' + labels.map(function (s, i) {
            return '<span class="rt-step' + (i <= idx ? ' on' : '') + (i === idx ? ' now' : '') + '">' + s + '</span>';
          }).join('<i>→</i>') + '</div>' +
          '<p class="form-note" style="margin:8px 0 0">Live status from the TwinMOS service centre' +
          (last && last.at ? ' · updated ' + esc(rmaWhen(last.at)) : '') + '.</p>';
      }, function (status) {
        if (status === 404) {
          out.innerHTML = '<p class="form-note" style="color:#B3261E;margin:8px 0 0">No RMA case exists with that number — check your confirmation email, or contact support with your proof of purchase.</p>';
        } else {
          out.innerHTML = '<p class="form-note" style="color:#B3261E;margin:8px 0 0">The service centre could not be reached — please retry in a moment.</p>';
        }
      });
    });
    // F14.1 — news category filter chips
    var nch = $('#newsChips');
    if (nch) {
      $$('[data-ncat]', nch).forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-ncat');
          $$('[data-ncat]', nch).forEach(function (x) { x.classList.toggle('on', x === b); });
          $$('#newsGrid [data-ncat]').forEach(function (card) {
            card.style.display = (v === 'all' || card.getAttribute('data-ncat') === v) ? '' : 'none';
          });
        });
      });
    }
    // F1.7 — cookie preference save (legal tab)
    var cps = $('#cookiePrefsSave');
    if (cps) cps.addEventListener('click', function () { toast('Preferences saved — the production site stores granular consent', 'ok'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* F1.8 — about-page refinements: reveal-on-scroll + fact-file copy buttons */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var rvs = [].slice.call(d.querySelectorAll('.rv'));
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    rvs.forEach(function (el) { el.classList.add('in'); });
  } else {
    // scroll/resize listener instead of IntersectionObserver: IO callbacks are not
    // delivered in some embedded browsers, which would leave content hidden.
    // interval + timed force-reveal are backstops for event-starved runtimes
    var sync = function () {
      var vh = window.innerHeight || root.clientHeight;
      for (var i = 0; i < rvs.length; i++) {
        var el = rvs[i];
        if (el._rvIn) continue;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) { el._rvIn = 1; el.classList.add('in'); }
      }
    };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    var ticks = 0;
    var iv = setInterval(function () {
      sync(); ticks++;
      if (!document.querySelectorAll('.rv:not(.in)').length || ticks > 40) clearInterval(iv);
    }, 350);
    setTimeout(function () { rvs.forEach(function (el) { el.classList.add('in'); }); }, 2500);
  }
  d.addEventListener('click', function (ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest('.ff-copy') : null;
    if (!btn) return;
    var val = btn.getAttribute('data-copy') || '';
    var done = function () {
      btn.classList.add('ok');
      var html = btn.innerHTML;
      btn.innerHTML = '&#10003;';
      setTimeout(function () { btn.classList.remove('ok'); btn.innerHTML = html; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { navigator.clipboard.writeText(val).then(done, done); } catch (e) { done(); }
    } else done();
  });
})();
