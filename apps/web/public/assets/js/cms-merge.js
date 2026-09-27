/* P3 CMS merge — adds CMS-published content (cms-content.js) into the page data
 * BEFORE app.js renders. Strictly additive: only slugs absent from the
 * prototype data.js are merged, so an imported corpus can never duplicate what
 * the prototype already shows — visual parity is preserved by construction.
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
})();
