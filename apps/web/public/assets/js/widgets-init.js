// widgets-init.js — mounts the CMS appEmbed islands (MS4.8 T4.8.2).
// The server renders each appEmbed block as [data-widget][data-config]; this
// script turns the canonical typed config into a working, data-driven island.
// Content is inserted with DOM APIs (never innerHTML) because block config is
// CMS-editable.
(function () {
  'use strict';

  function parse(el, attr) {
    try {
      return JSON.parse(el.getAttribute(attr) || '{}') || {};
    } catch (e) {
      return {};
    }
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = String(text);
    return node;
  }
  function link(href, text, cls) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (cls) a.className = cls;
    return a;
  }
  function select(options, onChange) {
    var s = el('select', 'input');
    s.setAttribute('aria-label', 'Choose an option');
    options.forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      s.appendChild(o);
    });
    s.addEventListener('change', function () { onChange(s.value); });
    return s;
  }

  function mountAdvisor(root, config, micro) {
    var groups = Object.keys(config);
    if (!groups.length) return mountFallback(root, micro);
    root.appendChild(el('h3', 'h3', micro.title || 'Quick Upgrade Advisor'));
    if (micro.subtitle) root.appendChild(el('p', 'form-note', micro.subtitle));
    var out = el('div', 'widget-output');
    function render(group) {
      out.textContent = '';
      (config[group] || []).forEach(function (item) {
        var card = el('div', 'card card-pad');
        card.style.marginTop = '10px';
        card.appendChild(el('span', 'chip', item.tag || 'Recommendation'));
        card.appendChild(el('b', '', ' ' + item.label));
        card.appendChild(el('p', 'form-note', item.desc || ''));
        card.appendChild(link('/products/' + encodeURIComponent(item.prodId), 'View product →', 'link-arrow'));
        out.appendChild(card);
      });
    }
    root.appendChild(select(groups.map(function (g) { return { value: g, label: g.charAt(0).toUpperCase() + g.slice(1) }; }), render));
    root.appendChild(out);
    render(groups[0]);
  }

  function mountSpeed(root, config, micro) {
    var workloads = Object.keys(config);
    if (!workloads.length) return mountFallback(root, micro);
    root.appendChild(el('h3', 'h3', micro.title || 'Speed Workload Simulator'));
    if (micro.subtitle) root.appendChild(el('p', 'form-note', micro.subtitle));
    var out = el('div', 'widget-output');
    function render(name) {
      out.textContent = '';
      var w = config[name] || {};
      if (w.takeaway) out.appendChild(el('p', '', w.takeaway));
      var table = el('table', 'table');
      table.style.width = '100%';
      table.style.marginTop = '12px';
      var thead = el('thead');
      var hr = el('tr');
      ['Drive', 'Speed', 'Time to load'].forEach(function (h) { hr.appendChild(el('th', '', h)); });
      thead.appendChild(hr);
      table.appendChild(thead);
      var tbody = el('tbody');
      (w.rows || []).forEach(function (row) {
        var tr = el('tr');
        var nameCell = el('td', '', row.name + (row.badge ? ' (' + row.badge + ')' : ''));
        var speedCell = el('td', '', row.speed);
        var etaCell = el('td', '', row.eta);
        tr.appendChild(nameCell); tr.appendChild(speedCell); tr.appendChild(etaCell);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      out.appendChild(table);
    }
    root.appendChild(select(workloads.map(function (w) { return { value: w, label: w }; }), render));
    root.appendChild(out);
    render(workloads[0]);
  }

  function mountFlagship(root, config, micro) {
    var segments = Object.keys(config);
    if (!segments.length) return mountFallback(root, micro);
    root.appendChild(el('h3', 'h3', micro.title || 'Flagship Segments Showcase'));
    if (micro.subtitle) root.appendChild(el('p', 'form-note', micro.subtitle));
    var out = el('div', 'widget-output');
    function render(segment) {
      out.textContent = '';
      var list = el('ul', 'link-list');
      (config[segment] || []).forEach(function (slug) {
        var li = el('li');
        li.appendChild(link('/products/' + encodeURIComponent(slug), slug.replace(/-/g, ' ')));
        list.appendChild(li);
      });
      out.appendChild(list);
    }
    root.appendChild(select(segments.map(function (s) { return { value: s, label: s }; }), render));
    root.appendChild(out);
    render(segments[0]);
  }

  function mountFallback(root, micro) {
    root.appendChild(el('h3', 'h3', micro.title || 'Interactive tool'));
    root.appendChild(el('p', 'form-note', micro.helpText || micro.subtitle || 'This tool is being configured.'));
    if (micro.disclaimer) root.appendChild(el('p', 'form-note', micro.disclaimer));
  }

  function mountRgbLab(root, config, micro) {
    root.appendChild(el('h3', 'h3', micro.title || 'VOLTX RGB Effects Lab'));
    if (micro.subtitle) root.appendChild(el('p', 'form-note', micro.subtitle));
    var card = el('div', 'card rgb-lab');
    card.style.marginTop = '12px';
    var stage = el('div', 'rgb-stage');
    var mod = el('div', 'rgb-module');
    mod.setAttribute('role', 'img');
    mod.setAttribute('aria-label', 'VOLTX RGB lighting preview');
    for (var i = 0; i < 8; i++) mod.appendChild(el('i'));
    stage.appendChild(mod);
    card.appendChild(stage);
    var fxRow = el('div', 'fx-row');
    fxRow.setAttribute('role', 'radiogroup');
    fxRow.setAttribute('aria-label', 'Lighting effect');
    var effects = config.effects || ['Static', 'Breathing', 'Rainbow', 'Wave', 'Meteor'];
    effects.forEach(function (fx, idx) {
      var id = 'fx-embed-' + idx;
      var radio = el('input');
      radio.type = 'radio';
      radio.name = 'rgbfx-embed';
      radio.id = id;
      if (idx === 0) radio.checked = true;
      card.insertBefore(radio, stage);
      var lbl = el('label', 'fx-chip');
      lbl.setAttribute('for', id);
      lbl.appendChild(el('span', '', fx));
      fxRow.appendChild(lbl);
    });
    card.appendChild(fxRow);
    if (micro.disclaimer) card.appendChild(el('p', 'form-note', micro.disclaimer));
    root.appendChild(card);
  }

  function mountCounters(root, config, micro) {
    root.appendChild(el('h3', 'h3', micro.title || 'Platform Metrics'));
    if (micro.subtitle) root.appendChild(el('p', 'form-note', micro.subtitle));
    var grid = el('div', 'grid g4');
    grid.style.marginTop = '12px';
    var stats = config.stats || [
      { num: 1998, label: 'Founded' },
      { num: 93, label: 'Countries' },
      { num: 14000, label: 'MB/s Read' }
    ];
    stats.forEach(function (st) {
      var cell = el('div', 'card card-pad');
      var b = el('b', 'h2', String(st.num));
      b.setAttribute('data-counter', String(st.num));
      cell.appendChild(b);
      cell.appendChild(el('div', 'form-note', st.label));
      grid.appendChild(cell);
    });
    root.appendChild(grid);
  }

  function mountTabs(root, config, micro) {
    root.appendChild(el('h3', 'h3', micro.title || 'Interactive Tabs'));
    if (micro.subtitle) root.appendChild(el('p', 'form-note', micro.subtitle));
    var tabsWrap = el('div', 'tabs');
    tabsWrap.setAttribute('role', 'tablist');
    tabsWrap.style.marginTop = '12px';
    var contentWrap = el('div', 'widget-output');
    contentWrap.style.marginTop = '12px';
    var items = config.items || [
      { id: 'tab1', label: 'Overview', content: 'Overview content' },
      { id: 'tab2', label: 'Specifications', content: 'Specs content' }
    ];
    function renderTab(activeId) {
      contentWrap.textContent = '';
      items.forEach(function (item) {
        if (item.id === activeId) {
          var panel = el('div', 'card card-pad');
          panel.appendChild(el('p', '', item.content || item.desc || ''));
          contentWrap.appendChild(panel);
        }
      });
    }
    items.forEach(function (item, idx) {
      var btn = el('button', 'tab' + (idx === 0 ? ' on' : ''), item.label);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(tabsWrap.querySelectorAll('.tab'), function (b) {
          var on = b === btn;
          b.classList.toggle('on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        renderTab(item.id);
      });
      tabsWrap.appendChild(btn);
    });
    root.appendChild(tabsWrap);
    root.appendChild(contentWrap);
    if (items.length) renderTab(items[0].id);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-widget]'), function (root) {
      if (root.getAttribute('data-widget-mounted') === '1') return;
      root.setAttribute('data-widget-mounted', '1');
      var type = root.getAttribute('data-widget') || '';
      var config = parse(root, 'data-config');
      var micro = parse(root, 'data-microcopy');
      if (type === 'advisor') mountAdvisor(root, config, micro);
      else if (type === 'speed_visualizer') mountSpeed(root, config, micro);
      else if (type === 'flagship') mountFlagship(root, config, micro);
      else if (type === 'rgb_lab' || type === 'rgb-lab') mountRgbLab(root, config, micro);
      else if (type === 'counters') mountCounters(root, config, micro);
      else if (type === 'tabs') mountTabs(root, config, micro);
      else mountFallback(root, micro);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
