/* P1 accessibility + CLS shim — attribute-only fixes for JS-generated markup.
 * Adds no visuals: ARIA attributes, label bindings, one role removal and
 * width/height reservation from the build-time intrinsic-size map.
 * Runs after app.js; a MutationObserver re-applies on dynamic re-renders
 * (client-side routing re-generates forms and grids).
 * Every write is change-guarded (setAttr) so the observer never re-triggers
 * itself — otherwise the page never reaches CPU idle.
 * Remove when P2 islands own this markup natively.
 */
(function () {
  'use strict';

  var idSeq = 0;

  function setAttr(el, name, val) {
    if (el.getAttribute(name) !== val) el.setAttribute(name, val);
  }

  function bindLabelledControls(root) {
    /* Pattern used by app.js forms: <div class="fg"><label>Text</label><input|select|textarea></div>
     * The label element exists but is not programmatically bound. */
    (root || document).querySelectorAll('.fg').forEach(function (g) {
      var label = g.querySelector('label');
      var ctl = g.querySelector('input, select, textarea');
      if (!label || !ctl) return;
      var text = (label.textContent || '').trim();
      if (!ctl.id) setAttr(ctl, 'id', 'fg-ctl-' + (++idSeq));
      if (!label.getAttribute('for')) setAttr(label, 'for', ctl.id);
      if (!ctl.getAttribute('aria-label') && !ctl.getAttribute('aria-labelledby')) {
        setAttr(ctl, 'aria-label', text);
      }
    });

    /* Global inputs outside .fg (header search input, RMA tracker, etc.) */
    var searchInput = (root || document).getElementById('searchInput');
    if (searchInput && !searchInput.getAttribute('aria-label')) {
      setAttr(searchInput, 'aria-label', 'Search catalog products, articles, topics');
    }
    var rmaInput = (root || document).getElementById('rmaId');
    if (rmaInput && !rmaInput.getAttribute('aria-label')) {
      setAttr(rmaInput, 'aria-label', 'RMA tracking number');
    }
    (root || document).querySelectorAll('input, select, textarea').forEach(function (i) {
      if (i.type === 'hidden' || i.style.display === 'none') return;
      var hasId = i.id && document.querySelector('label[for="' + i.id + '"]');
      var hasAria = i.getAttribute('aria-label') || i.getAttribute('aria-labelledby');
      if (!hasId && !hasAria && !i.closest('label')) {
        var placeholder = i.getAttribute('placeholder') || i.getAttribute('name') || i.getAttribute('id') || 'Input';
        setAttr(i, 'aria-label', placeholder);
      }
    });
  }

  function fixTablists(root) {
    var scope = root || document;
    /* #catChips (shop filters) carries role="tablist" but its children are filter
     * buttons, not tabs — an ARIA pattern violation. A filter group needs no role. */
    scope.querySelectorAll('[role="tablist"]').forEach(function (el) {
      if (!el.querySelector('[role="tab"]')) el.removeAttribute('role');
    });
    /* Inverse: app.js marks picker pills as role="tab" (e.g. #uaGoalRow) but leaves
     * the container without role="tablist", which breaks the tab pattern. */
    scope.querySelectorAll('[role="tab"]').forEach(function (tab) {
      var parent = tab.parentElement;
      if (!parent || parent.getAttribute('role')) return;
      if (parent.closest('[role="tablist"]') === null) {
        setAttr(parent, 'role', 'tablist');
      }
    });
  }

  function fixSliderRoles(root) {
    /* Hero slides are <article role="group"> — role not allowed there
     * (Lighthouse aria-allowed-role). Dropping the role keeps semantics valid. */
    (root || document).querySelectorAll('article[role="group"].sl-slide').forEach(function (el) {
      el.removeAttribute('role');
    });
  }

  function fixAlts(root) {
    (root || document).querySelectorAll('img:not([alt])').forEach(function (img) {
      setAttr(img, 'alt', '');
    });
  }

  function fixImageDims(root) {
    /* width/height attributes from the build-time intrinsic-size map let the
     * browser reserve the exact box before decode — kills CLS on JS-inserted
     * imagery (PDP gallery, cards) with zero visual change. */
    var map = window.IMG_DIMS;
    if (!map) return;
    (root || document).querySelectorAll('img:not([data-dims])').forEach(function (img) {
      setAttr(img, 'data-dims', '1');
      if (img.getAttribute('width')) return;
      var src = (img.getAttribute('src') || '').replace(/^\.\//, '');
      var d = map[src];
      if (d) {
        img.setAttribute('width', d[0]);
        img.setAttribute('height', d[1]);
      }
    });
  }

  function fixBreadcrumbRole(root) {
    /* app.js renders breadcrumbs as <nav class="breadcrumb"><li>…</li></nav>
     * — list items without a list parent. Wrapping the <li>s in a <ul> is the
     * valid pattern; the override stylesheet replicates the nav's flex layout
     * on the wrapper so pixels are unchanged. */
    (root || document).querySelectorAll('nav.breadcrumb').forEach(function (nav) {
      if (nav.querySelector('ul, ol')) return;
      var lis = [];
      nav.querySelectorAll(':scope > li').forEach(function (li) { lis.push(li); });
      if (!lis.length) return;
      var ul = document.createElement('ul');
      lis.forEach(function (li) { ul.appendChild(li); });
      nav.appendChild(ul);
    });
  }

  function nameButtons(root) {
    /* Icon-only buttons generated by app.js (e.g. carousel arrows) get names
     * from their title or class context. */
    (root || document).querySelectorAll('button').forEach(function (b) {
      if (b.getAttribute('aria-label') || b.textContent.trim()) return;
      if (b.getAttribute('aria-hidden') === 'true') return;
      setAttr(b, 'aria-label', b.getAttribute('title') || 'Action');
    });
  }

  function applyAll(root) {
    try {
      bindLabelledControls(root);
      fixTablists(root);
      fixSliderRoles(root);
      fixAlts(root);
      fixImageDims(root);
      fixBreadcrumbRole(root);
      nameButtons(root);
    } catch (e) { /* never break the page */ }
  }

  applyAll(document);

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      applyAll(document);
    });
  }
  var mo = new MutationObserver(function (muts) {
    var changed = false;
    muts.forEach(function (m) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(function (n) { if (n.nodeType === 1) changed = true; });
      } else if (m.attributeName !== 'data-dims') {
        changed = true;
      }
    });
    /* Own writes never match the filter (change-guarded + role/class only),
     * so only app.js activity schedules here — coalesced to one pass per frame,
     * which still runs before paint so CLS reservations hold. */
    if (changed) schedule();
  });
  mo.observe(document.documentElement, {
    childList: true, subtree: true,
    attributes: true, attributeFilter: ['role', 'class', 'data-dims'],
  });
})();
