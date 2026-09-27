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
})();
