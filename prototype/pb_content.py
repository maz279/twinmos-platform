# -*- coding: utf-8 -*-
"""Prototype builder — module 4: content-corpus importer.

Reads the authoritative content corpus (content/website-content, 445 md files)
and merges it into the prototype data structures:

  * 08-learn/*.md        -> SC.ARTICLES (buying guides, explainers, benchmarks,
                            glossary, blog posts) — F13.1/F13.2/F13.3/F13.5
  * 07-support/kb-*.md   -> SC.ARTICLES with cat 'KB' + SC.KB listing — F8.7
  * 07-support/faq-*.md  -> merged into SC.FAQ tabs (dedup by question) — F8.8

Run from build.py before write_data_js so data.js carries everything.
"""
import os
import re

ROOT   = os.path.dirname(os.path.abspath(__file__))
C_DIR  = os.path.dirname(os.path.dirname(ROOT))          # "Corporate website development for TwinMOS"
CORPUS = os.path.join(C_DIR, 'content', 'website-content')

# ---------------------------------------------------------------- parsing helpers

def _frontmatter(text):
    """Minimal YAML-subset parser: top-level scalars + inline/multiline lists
    (persona: [a, b] and cross_links:/ctas: blocks of '  - item' lines)."""
    if not text.startswith('---'):
        return {}, text
    parts = text.split('---', 2)
    if len(parts) < 3:
        return {}, text
    meta = {}
    cur_list = None
    for ln in parts[1].splitlines():
        if not ln or ln.lstrip().startswith('#'):
            continue
        if ln.startswith('  - ') and cur_list:
            meta.setdefault(cur_list, []).append(ln[4:].strip().strip('"').strip("'"))
            continue
        m = re.match(r'^([A-Za-z_][\w-]*):\s*(.*)$', ln)
        if not m:
            cur_list = None
            continue
        key, v = m.group(1), m.group(2).strip()
        if v.startswith('[') and v.endswith(']'):
            meta[key] = [i.strip().strip('"').strip("'") for i in v[1:-1].split(',') if i.strip()]
            cur_list = None
        elif v:
            meta[key] = v.strip('"').strip("'")
            cur_list = None
        else:
            cur_list = key           # next '  - ' lines belong to this key
    return meta, parts[2]

def _sections(body, max_sections=14):
    """Markdown body -> [(heading, paragraph), ...]; lists become sentences."""
    out, cur_h, buf = [], None, []
    def flush():
        nonlocal buf
        text = ' '.join(buf).strip()
        buf = []
        if cur_h and text:
            out.append((cur_h, text[:1200]))
    for ln in body.splitlines():
        s = ln.strip()
        if s.startswith('# ') or s.startswith('|') or s.startswith('```'):
            continue
        if s.startswith('## '):
            flush(); cur_h = s[3:].strip()[:120]; continue
        if s.startswith('### '):
            buf.append(s[4:].strip().rstrip(':') + ':'); continue
        if not s:
            continue
        if s.startswith('- ') or s.startswith('* '):
            buf.append(s[2:].strip().rstrip('.'))
            continue
        if re.match(r'^\d+\.\s', s):
            buf.append(re.sub(r'^\d+\.\s*', '', s).rstrip('.'))
            continue
        buf.append(s)
    flush()
    return out[:max_sections]

def _read(path):
    try:
        with open(path, encoding='utf-8') as f:
            return _frontmatter(f.read())
    except OSError:
        return {}, ''

# ---------------------------------------------------------------- image mapping

_IMG_RULES = [
    (('ram', 'dram', 'ddr', 'memory', 'dimmlatency', 'timings', 'xmp', 'expo', 'bandwidth', 'cas'), 'assets/img/cat-dram.webp'),
    (('ssd', 'nvme', 'pcie', 'nand', 'sata', 'trim', 'wear', 'smart', 'tbw', 'mtbf', 'storage'), 'assets/img/cat-nvme.webp'),
    (('portable', 'external hdd', 'drive pro'), 'assets/img/cat-portable.webp'),
    (('usb', 'flash drive', 'pen drive'), 'assets/img/cat-usb.webp'),
    (('microsd', 'sd card', 'card reader'), 'assets/img/cat-microsd.webp'),
    (('gaming', 'rgb', 'build guide', 'pc build', 'directstorage'), 'assets/img/rgb-ram.webp'),
    (('benchmark', 'performance', 'competitor'), 'assets/img/corex-pro.webp'),
    (('glossary', 'explained', 'story', 'blog'), 'assets/img/nvme-m2.webp'),
]

def _img_for(title, slug):
    hay = (title + ' ' + slug).lower()
    for keys, img in _IMG_RULES:
        if any(k in hay for k in keys):
            return img
    return 'assets/img/nvme-m2.webp'

# ---------------------------------------------------------------- importers

_LEARN_MAP = [  # (regex on filename, cat, tag)
    (r'^(0[2-9]|1[0-9])-.*', 'Guide', 'Buying guide'),
    (r'^5[2-5]-benchmark-.*', 'Benchmark', 'Benchmark'),
    (r'^56-glossary', 'Guide', 'Glossary'),
    (r'^(6[1-9])-.*', 'Blog', 'Blog'),
]

def _learn_cat(fname):
    for rx, cat, tag in _LEARN_MAP:
        if re.match(rx, fname):
            return cat, tag
    if 21 <= _try_num(fname) <= 49:
        return 'Explainer', 'Explained'
    return 'Guide', 'Learn'

def _try_num(fname):
    m = re.match(r'^(\d+)', fname)
    return int(m.group(1)) if m else -1

def _slug_of(url):
    """'/learn/explained/what-is-ddr5/' -> 'what-is-ddr5' (last non-empty segment)."""
    segs = [s for s in (url or '').split('/') if s]
    return segs[-1] if segs and not segs[-1].endswith('.html') else ''

def _learn_file(name):
    p = os.path.join(CORPUS, '08-learn', name)
    return _read(p) if os.path.isfile(p) else ({}, '')

_LINK_RX = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')

def _resolve(ids, slug):
    """Corpus hub URLs drop category prefixes the article slugs carry
    ('/learn/benchmarks/corex-pro…' vs id 'benchmark-corex-pro…') — exact
    match first, then suffix match."""
    if slug in ids:
        return slug
    tail = [i for i in ids if i.endswith('-' + slug) or i.endswith(slug)]
    return tail[0] if len(tail) == 1 else ''

def _strip_links(text):
    """'See [XMP](/learn/...)' -> ('See XMP', 'what-is-xmp') — keeps the label, returns article slug if the link targets one."""
    ref = ''
    def sub(m):
        nonlocal ref
        slug = _slug_of(m.group(2))
        if not ref and slug and '/learn/' in m.group(2):
            ref = slug
        return m.group(1)
    return _LINK_RX.sub(sub, text).replace('**', ''), ref

def learn_hubs(SC):
    """Parse the 08-learn hub pages into the grouping metadata the sub-hub
    pages render from (guides tables / explainer lists / benchmark methodology /
    blog coming-soon). Stored on SC.LEARN_HUBS; unknown slugs are dropped at
    render time, so the corpus stays authoritative."""
    out = {}
    ids = {a['id'] for a in SC.ARTICLES}

    # --- buying guides: '## Group' + table rows '| [Title](url) | Best for |'
    _meta, body = _learn_file('01-buying-guide-hub.md')
    groups, cur, sub = [], None, ''
    for ln in body.splitlines():
        s = ln.strip()
        if s.startswith('## '):
            cur, sub = s[3:].strip(), ''
        elif s.startswith('|') and '[' in s and cur:
            cells = [c.strip() for c in s.strip('|').split('|')]
            if len(cells) >= 2 and cells[0].startswith('['):
                m = _LINK_RX.match(cells[0])
                if m:
                    slug = _resolve(ids, _slug_of(m.group(2)))
                    sub = sub or cells[1]           # column-2 label doubles as group subtitle
                    groups.append((cur, sub, m.group(1), slug, cells[1]))
    by_g = []
    for g in dict.fromkeys(g for g, *_ in groups):
        rows = [(t, s, bf) for cg, _sb, t, s, bf in groups if cg == g and s in ids]
        sublbl = next((_sb for cg, _sb, *_ in groups if cg == g), '')
        if rows:
            by_g.append((g, sublbl, rows))
    out['guides'] = dict(
        lede='Choosing the right memory and storage can feel overwhelming. These guides cut through the spec sheets with clear, actionable advice for your exact build, budget or fleet.',
        groups=by_g)

    # --- explainers: '## Major' + '### Group' + '- [Title](url) — blurb'
    _meta, body = _learn_file('20-explained-hub.md')
    majors, cur_major, cur_grp = [], None, None
    for ln in body.splitlines():
        s = ln.strip()
        if s.startswith('## ') and not s.startswith('## Sources'):
            cur_major, cur_grp = s[3:].strip(), None
            majors.append((cur_major, []))
        elif s.startswith('### ') and majors:
            cur_grp = s[4:].strip()
            majors[-1][1].append((cur_grp, []))
        elif s.startswith('- [') and majors and majors[-1][1]:
            m = _LINK_RX.match(s[2:])
            if m:
                slug = _resolve(ids, _slug_of(m.group(2)))
                blurb = s[m.end():].lstrip('—- ').strip()
                majors[-1][1][-1][1].append((m.group(1), slug, blurb))
    out['explained'] = dict(
        lede='The technology behind the spec sheet — banks, subchannels, NAND layers, protocols — explained by the engineers who build the hardware. Start with the fundamentals and go as deep as you like.',
        majors=[(maj, [(g, [(t, s, b) for t, s, b in rows if s in ids]) for g, rows in grps])
                for maj, grps in majors])

    # --- benchmarks: philosophy ###s + category items + test rig + caveats
    _meta, body = _learn_file('50-benchmarks-hub.md')
    phil, items, rig, caveats, mode, cur = [], [], [], [], None, None
    for ln in body.splitlines():
        s = ln.strip()
        if s.startswith('## '):
            h = s[3:].strip()
            mode = 'phil' if 'Philosophy' in h else 'rig' if 'Test Systems' in h else 'cav' if 'Understanding Benchmarks' in h else 'cat'
            cur = h if mode == 'cat' else None
            continue
        if s.startswith('### '):
            h = s[4:].strip()
            if mode == 'phil':
                cur = h; phil.append((cur, ''))
            elif mode == 'cat':
                cur = h
            continue
        elif mode == 'phil' and s and phil and not s.startswith('#'):
            phil[-1] = (phil[-1][0], (phil[-1][1] + ' ' + s).strip())
        elif mode == 'cat' and s.startswith('- ['):
            m = _LINK_RX.match(s[2:])
            if m:
                slug = _resolve(ids, _slug_of(m.group(2)))
                blurb = s[m.end():].lstrip('—- ').strip()
                items.append((cur or 'Benchmarks', m.group(1), slug, blurb))
        elif mode == 'rig' and s.startswith('- **'):
            kv = s.lstrip('- *').replace('**', '').split(':', 1)
            if len(kv) == 2:
                rig.append((kv[0].strip(), kv[1].strip()))
        elif mode == 'cav' and s.startswith('- **'):
            caveats.append(s.replace('**', '').lstrip('- ').strip())
    out['benchmarks'] = dict(
        lede='Specifications tell part of the story — real-world performance tells the rest. Transparent, reproducible testing from the TwinMOS lab, with complete configurations published.',
        philosophy=[(h, p) for h, p in phil if p],
        groups=[(g, [(t, s, b) for _g, t, s, b in items if _g == g and s in ids])
                for g in dict.fromkeys(g for g, *_ in items)],
        rig=rig, caveats=caveats)

    # --- blog: coming-soon topics + category table
    _meta, body = _learn_file('59-blog-hub.md')
    coming, cats, mode = [], [], None
    for ln in body.splitlines():
        s = ln.strip()
        if s.startswith('## ') or s.startswith('### '):
            h = s.lstrip('#').strip()
            mode = 'soon' if 'Coming' in h else 'cats' if h == 'Categories' else None
        elif mode == 'soon' and s.startswith('- ') and 'TwinMOS' not in s:
            coming.append(s[2:].strip())
        elif mode == 'cats' and s.startswith('|') and '---' not in s and 'Category' not in s:
            cells = [c.strip() for c in s.strip('|').split('|')]
            if len(cells) == 2:
                cats.append((cells[0], cells[1]))
    out['blog'] = dict(
        lede='Product launches, event coverage and engineering commentary — straight from the TwinMOS team.',
        coming=coming, cats=cats)

    SC.LEARN_HUBS = out
    return sum(len(g[2]) for g in out.get('guides', {}).get('groups', [])) if out.get('guides') else 0

def import_glossary(SC):
    """56-glossary.md -> SC.GLOSSARY [{t,d,l,ref}] with /learn/ links resolved to article ids."""
    _meta, body = _learn_file('56-glossary.md')
    ids = {a['id'] for a in SC.ARTICLES}
    terms, letter = [], ''
    for ln in body.splitlines():
        s = ln.strip()
        if s.startswith('## ') and len(s[3:].strip()) == 1:
            letter = s[3:].strip().upper()
        m = re.match(r'^\*\*(.+?)\*\*\s*[—–-]\s*(.+)$', s)
        if m and letter:
            clean, ref = _strip_links(m.group(2))
            terms.append(dict(t=m.group(1).strip(), d=clean[:360], l=letter,
                              ref=_resolve(ids, ref) if ref else ''))
    SC.GLOSSARY = terms
    return len(terms)

def import_learn(SC):
    folder = os.path.join(CORPUS, '08-learn')
    added = 0
    for fname in sorted(os.listdir(folder)):
        if not fname.endswith('.md') or 'hub' in fname or 'template' in fname:
            continue
        meta, body = _read(os.path.join(folder, fname))
        title = meta.get('title') or fname[:-3].replace('-', ' ').title()
        slug = meta.get('slug') or fname[:-3]
        aid = slug
        if any(a['id'] == aid for a in SC.ARTICLES):
            continue
        cat, tag = _learn_cat(fname)
        secs = _sections(body)
        if len(secs) < 2:
            continue
        words = sum(len(p.split()) for _h, p in secs)
        links = [_slug_of(u) for u in (meta.get('cross_links') or []) if isinstance(u, str)]
        personas = [p for p in (meta.get('persona') or []) if isinstance(p, str)]
        SC.ARTICLES.append(dict(
            id=aid, cat=cat, date=meta.get('last_reviewed', '2026-06-02'),
            tag=tag, title=title,
            desc=(meta.get('description') or secs[0][1])[:200],
            body=[dict(h=h, p=p) for h, p in secs],
            img=_img_for(title, slug),
            num=_try_num(fname), links=links, personas=personas,
            mins=max(2, round(words / 200.0))))
        added += 1
    # keep corpus reading order stable inside each category (prev/next navigation)
    SC.ARTICLES.sort(key=lambda a: (a.get('num', 999) if a.get('cat') in ('Guide', 'Explainer', 'Benchmark', 'Blog') else 0, a['id']))
    # resolve cross_links to real article ids (corpus URLs drop the benchmark- prefix;
    # page links like /gaming/ resolve to nothing and are dropped)
    ids = {a['id'] for a in SC.ARTICLES}
    for a in SC.ARTICLES:
        if a.get('links'):
            a['links'] = [r for r in (_resolve(ids, l) for l in a['links']) if r]
    return added

def import_kb(SC):
    folder = os.path.join(CORPUS, '07-support', 'kb-articles')
    SC.KB = []
    if not os.path.isdir(folder):
        return 0
    added = 0
    for fname in sorted(os.listdir(folder)):
        if not fname.endswith('.md'):
            continue
        meta, body = _read(os.path.join(folder, fname))
        title = meta.get('title') or fname[:-3].replace('-', ' ').title()
        slug = meta.get('slug') or ('kb-' + fname[:-3])
        secs = _sections(body)
        if len(secs) < 2:
            continue
        SC.KB.append(dict(slug=slug, title=title,
                          desc=(meta.get('description') or secs[0][1])[:160]))
        if not any(a['id'] == slug for a in SC.ARTICLES):
            SC.ARTICLES.append(dict(
                id=slug, cat='KB', date=meta.get('last_reviewed', '2026-06-10'),
                tag='Knowledge base', title=title,
                desc=(meta.get('description') or secs[0][1])[:200],
                body=[dict(h=h, p=p) for h, p in secs],
                img=_img_for(title, slug)))
            added += 1
    return added

def import_faq(SC):
    """Merge corpus FAQ sets into SC.FAQ tabs (dedup by question text)."""
    folder = os.path.join(CORPUS, '07-support')
    rx = re.compile(r'^(2[3-9]|30)-faq-')
    names = {t.lower(): t for t, _ in SC.FAQ}
    items_by = {t.lower(): list(items) for t, items in SC.FAQ}
    known_q = {q.lower() for _, items in SC.FAQ for q, _ in items}
    added = 0
    for fname in sorted(os.listdir(folder)):
        if not rx.match(fname) or not fname.endswith('.md'):
            continue
        meta, body = _read(os.path.join(folder, fname))
        tab = meta.get('title', 'FAQ').replace(' FAQ', '').replace('Faq', '').strip() or 'General'
        key = tab.lower()
        names.setdefault(key, tab)
        items_by.setdefault(key, [])
        items, cur_q, buf = [], None, []
        def flush():
            nonlocal buf
            ans = ' '.join(buf).strip(); buf = []
            if cur_q and ans:
                items.append((cur_q, ans[:800]))
        for ln in body.splitlines():
            s = ln.strip()
            if s.startswith('## ') and not s.startswith('## Sources'):
                flush(); cur_q = s[3:].strip()[:200]; continue
            if s.startswith('#') or s.startswith('|') or not s:
                if not s and cur_q:
                    flush()
                continue
            if cur_q is not None:
                buf.append(s)
        flush()
        for q, a in items:
            if q.lower() in known_q:
                continue
            known_q.add(q.lower())
            items_by[key].append((q, a))
            added += 1
    SC.FAQ[:] = [(names[k], items_by[k]) for k in names]
    return added

def solution_verticals():
    """04-solutions corpus -> [(chip, title, desc)] for the solutions page grid."""
    folder = os.path.join(CORPUS, '04-solutions')
    out = []
    if not os.path.isdir(folder):
        return out
    stop = ('hub', 'template', 'reserved', 'case-stud')
    for fname in sorted(os.listdir(folder)):
        if not fname.endswith('.md') or any(s in fname for s in stop):
            continue
        meta, _body = _read(os.path.join(folder, fname))
        title = meta.get('title') or fname[:-3].replace('-', ' ').title()
        desc = (meta.get('description') or '')[:150]
        if not desc:
            continue
        chip = 'Vertical'
        for k, c in (('gaming', 'Gaming'), ('content', 'Creators'), ('builder', 'System builders'),
                     ('enterprise', 'Enterprise'), ('education', 'Education'),
                     ('field', 'Portable & field'), ('notebook', 'Notebook fleets')):
            if k in fname:
                chip = c; break
        out.append((chip, title, desc))
    return out[:7]

def tech_topics(SC):
    """06-technology corpus -> [(title, desc, linked_article_id)] for the hub page."""
    folder = os.path.join(CORPUS, '06-technology')
    out = []
    if not os.path.isdir(folder):
        return out
    stop = ('hub', 'template', 'reserved', 'whitepaper', 'patents', 'roadmap')
    for fname in sorted(os.listdir(folder)):
        if not fname.endswith('.md') or any(s in fname for s in stop):
            continue
        meta, _body = _read(os.path.join(folder, fname))
        title = meta.get('title') or fname[:-3].replace('-', ' ').title()
        desc = (meta.get('description') or '')[:170]
        if not desc:
            continue
        words = [w for w in re.split(r'[^a-z0-9]+', title.lower()) if len(w) > 4]
        link = ''
        for a in SC.ARTICLES:
            hay = a['id'].lower()
            if any(w in hay for w in words):
                link = a['id']; break
        out.append((title, desc, link))
    return out[:9]

def corpus_cards(rel_folder, names=None, stop=('hub', 'template', 'reserved')):
    """Generic frontmatter -> [(title, desc)] extractor for hub cards."""
    folder = os.path.join(CORPUS, rel_folder)
    out = []
    if not os.path.isdir(folder):
        return out
    for fname in sorted(os.listdir(folder)):
        if not fname.endswith('.md') or any(s in fname for s in stop):
            continue
        stem = fname[:-3]
        if names and not any(n in stem for n in names):
            continue
        meta, _body = _read(os.path.join(folder, fname))
        title = meta.get('title') or stem.replace('-', ' ').title()
        desc = (meta.get('description') or '')[:170]
        if desc:
            out.append((title, desc))
    return out

# ---------------------------------------------------------------- where-to-buy: country channel table

# Curated from the corpus regional/market pages (11-regional/*.md) and the partner
# distributor hubs (09-partners/18|19|20-*.md). Post-remediation editorial rule:
# country-level COVERAGE STATUS is verified corpus fact; individual distributor
# NAMES are not published until TwinMOS confirms them in writing — so cards show
# status + cities + hub routing, and route inquiries to sales@twinmos.com.
# status: hub | authorized | expanding | seeking
DISTRIBUTOR_REGIONS = [
    ('me', 'Middle East & GCC'), ('af', 'Africa'), ('as', 'Asia-Pacific'),
    ('eu', 'Europe'), ('cis', 'Russia & CIS'), ('am', 'Americas'),
]
DISTRIBUTOR_COUNTRIES = [
    # (region, country, cc, status, tag, cities, note, corpus source)
    ('me', 'United Arab Emirates', 'AE', 'hub', 'Regional HQ — Dubai (DAFZA)', ['Dubai'],
     'MEA/CIS headquarters since 2001 — free-zone logistics reach the GCC, Africa and South Asia within 48–72 hours.',
     '11-regional/01-uae-gcc.md'),
    ('me', 'Saudi Arabia', 'SA', 'authorized', 'Nationwide authorized distribution', ['Riyadh', 'Jeddah', 'Dammam'],
     'Kingdom-wide coverage via the authorized regional distributor, spanning retail, SI and Vision 2030 government programs.',
     '11-regional/05-saudi-arabia.md'),
    ('me', 'Qatar', 'QA', 'authorized', 'Established authorized distributor', ['Doha'],
     'Full portfolio with bilingual support and GCC technical-regulation compliance.',
     '11-regional/06-qatar.md'),
    ('me', 'Kuwait', 'KW', 'expanding', 'Retail & SI coverage expanding', ['Kuwait City'],
     'Served from the Dubai hub while local retail and system-integrator coverage grows.',
     '11-regional/01-uae-gcc.md'),
    ('me', 'Bahrain', 'BH', 'expanding', 'Retail & SI coverage expanding', ['Manama'],
     'Served from the Dubai hub while local retail and system-integrator coverage grows.',
     '11-regional/01-uae-gcc.md'),
    ('me', 'Oman', 'OM', 'expanding', 'Retail & SI coverage expanding', ['Muscat'],
     'Served from the Dubai hub while local retail and system-integrator coverage grows.',
     '11-regional/01-uae-gcc.md'),
    ('af', 'Egypt', 'EG', 'authorized', 'Multi-distributor network', ['Cairo', 'Alexandria'],
     'Robust authorized network supplying retail, e-commerce, system integrators and government channels.',
     '11-regional/07-egypt.md'),
    ('af', 'Morocco', 'MA', 'authorized', 'Authorized partner network', ['Casablanca', 'Rabat', 'Marrakech'],
     'Coverage across major cities — the gateway to Francophone Africa.',
     '11-regional/08-morocco.md'),
    ('af', 'Algeria', 'DZ', 'authorized', 'Diversified distributor network', ['Algiers', 'Oran'],
     'Authorized distribution with consumer, SI and government reach.',
     '11-regional/09-algeria.md'),
    ('af', 'Libya', 'LY', 'authorized', 'Authorized local coverage', ['Tripoli', 'Benghazi'],
     'Authorized distributors provide local coverage with bilingual product labeling.',
     '11-regional/16-libya.md'),
    ('af', 'Nigeria', 'NG', 'authorized', 'Multi-distributor network', ['Lagos', 'Abuja', 'Port Harcourt'],
     'West Africa hub — authorized distributors based in Lagos with nationwide reach.',
     '11-regional/11-nigeria.md'),
    ('af', 'Ghana', 'GH', 'authorized', 'Authorized distributors', ['Accra', 'Kumasi'],
     'Accra-based authorized distribution with regional coverage.',
     '11-regional/13-ghana.md'),
    ('af', 'Senegal', 'SN', 'seeking', 'Partners being appointed', ['Dakar'],
     'UEMOA gateway — verified local partners are being appointed; ask sales for the current channel.',
     '11-regional/20-senegal.md'),
    ('af', 'Cameroon', 'CM', 'authorized', 'Authorized distributors', [],
     'Central Africa — CEMAC regional coverage through authorized distributors.',
     '11-regional/17-cameroon.md'),
    ('af', 'Kenya', 'KE', 'authorized', 'Distribution partners', ['Nairobi', 'Mombasa'],
     "East Africa's technology hub — distribution partners with regional reach.",
     '11-regional/12-kenya.md'),
    ('af', 'Ethiopia', 'ET', 'authorized', 'Authorized distributor network', ['Addis Ababa'],
     'Authorized distribution serving government, education and enterprise buyers.',
     '11-regional/14-ethiopia.md'),
    ('af', 'Rwanda', 'RW', 'seeking', 'Partners being verified', ['Kigali'],
     'EAC market — distribution partners are being verified; contact regional sales.',
     '11-regional/19-rwanda.md'),
    ('af', 'South Africa', 'ZA', 'authorized', 'Nationwide distributor network', ['Johannesburg', 'Cape Town', 'Durban'],
     "Southern Africa hub — the continent's most developed IT channel, SANS/ICASA compliant.",
     '11-regional/10-south-africa.md'),
    ('af', 'Angola', 'AO', 'authorized', 'Authorized regional distributor', ['Luanda'],
     'Coverage from Luanda with Portuguese and English support.',
     '11-regional/15-angola.md'),
    ('af', 'Namibia', 'NA', 'authorized', 'Authorized distributors', ['Windhoek'],
     'Local coverage with SACU market access.',
     '11-regional/18-namibia.md'),
    ('af', 'Botswana & Lesotho', 'BW', 'expanding', 'Regional-hub coverage', ['Gaborone', 'Maseru'],
     'Served via South Africa and Namibia hub partners; local presence in progress.',
     '11-regional/21-botswana-lesotho.md'),
    ('as', 'Taiwan', 'TW', 'hub', 'Founding HQ · R&D center', ['Taipei'],
     'Founding office since 1998 — R&D, BSMI certification and 100% pre-delivery testing.',
     '11-regional/27-taiwan.md'),
    ('as', 'India', 'IN', 'authorized', 'Authorized distribution network', [],
     'Strategic P0 market — nationwide authorized distribution coordinated from the Dubai office; BIS compliance planned for Phase 2.',
     '11-regional/02-india.md'),
    ('as', 'Pakistan', 'PK', 'expanding', 'Network being established', ['Karachi', 'Lahore', 'Islamabad'],
     'Phase 2 growth market — nationwide ICT distributors sought; regional sales run from Dubai.',
     '11-regional/04-pakistan.md'),
    ('as', 'Hong Kong', 'HK', 'authorized', 'Established local distributor', ['Hong Kong'],
     'Free-port logistics advantage and Greater Bay Area market access.',
     '11-regional/26-hong-kong.md'),
    ('as', 'Singapore', 'SG', 'authorized', 'SEA distribution hub', ['Singapore'],
     'Authorized local distributors anchoring ASEAN coverage.',
     '11-regional/25-southeast-asia.md'),
    ('as', 'Malaysia', 'MY', 'authorized', 'SEA distribution hub', ['Kuala Lumpur'],
     'Established distributor coverage alongside the Singapore hub.',
     '11-regional/25-southeast-asia.md'),
    ('as', 'Southeast Asia (ASEAN)', 'SEA', 'expanding', 'Expanding across ASEAN', ['Thailand', 'Indonesia', 'Philippines', 'Vietnam'],
     'Growth markets served from the Singapore and Malaysia hubs via regional e-commerce and retail channels.',
     '11-regional/25-southeast-asia.md'),
    ('as', 'China', 'CN', 'hub', 'Manufacturing facility', ['Dongguan'],
     'TwinMOS manufacturing facility — Greater China market and global supply.',
     '11-regional/27-taiwan.md'),
    ('eu', 'Germany', 'DE', 'authorized', 'European office + local distributors', ['Cologne'],
     'DACH coverage from the Cologne office through authorized local distributors.',
     '11-regional/23-europe.md'),
    ('eu', 'Netherlands', 'NL', 'authorized', 'Authorized local distributors', [],
     'Benelux coverage — CE, REACH and GDPR compliant EU distribution.',
     '11-regional/23-europe.md'),
    ('eu', 'United Kingdom', 'GB', 'authorized', 'European partner network', [],
     'UKCA-compliant products served through European distributor partners.',
     '11-regional/24-uk.md'),
    ('cis', 'Russia & CIS', 'RU', 'expanding', 'EAC-certified market', ['Moscow', 'St. Petersburg'],
     'Products carry EAC certification for the whole EAEU — national distribution is being appointed.',
     '11-regional/22-russia-cis.md'),
    ('cis', 'Kazakhstan', 'KZ', 'seeking', 'Regional distributor sought', ['Almaty', 'Astana'],
     'EAEU member market served under EAC certification; a regional distributor is being sought.',
     '11-regional/22-russia-cis.md'),
    ('am', 'United States & Canada', 'US', 'authorized', 'Selective distribution', ['San Jose'],
     'American office plus selective channel partnerships and the Newegg storefront.',
     '11-regional/28-north-america.md'),
]

# Marketplace rows listed in the corpus where-to-buy hub as "verify before publish".
MARKETPLACES_PENDING = [
    'Amazon Saudi Arabia / UK / Egypt / USA', 'Noon (UAE · KSA · Egypt)', 'Daraz (South Asia)',
]

def import_distributors(SC):
    """Country channel table for the where-to-buy locator (from corpus regional pages)."""
    regions = dict(DISTRIBUTOR_REGIONS)
    SC.DISTRIB_REGIONS = [{'id': rid, 'label': label} for rid, label in DISTRIBUTOR_REGIONS]
    SC.DISTRIB_COUNTRIES = [
        dict(region=rg, region_label=regions[rg], country=c, cc=cc, status=st, tag=tag,
             cities=cities, note=note, src=src)
        for rg, c, cc, st, tag, cities, note, src in DISTRIBUTOR_COUNTRIES
    ]
    SC.MARKETPLACES_PENDING = list(MARKETPLACES_PENDING)
    return len(SC.DISTRIB_COUNTRIES)

# ---------------------------------------------------------------- careers (12-careers corpus)
# Curated from content/website-content/12-careers/*.md — same pattern as
# DISTRIBUTOR_COUNTRIES: pb_content.py is the importer layer where corpus facts
# are structured; careers.html renders from these, never hand-copied text.

CAREERS_WHY = [  # 00-careers-hub.md — "Why TwinMOS"
    ('Global impact', 'Your work reaches customers in 93+ countries across five continents.'),
    ('Heritage of innovation', '27+ years of expertise — from DDR1 pioneers to DDR5 and PCIe Gen 5 leaders.'),
    ('Cutting-edge technology', 'Work on industry-first products like the CoreX Pro Gen 5 NVMe SSD and VOLTX RGB DDR5.'),
    ('Diverse global team', 'Collaborate with colleagues across Taipei, Dubai, Cologne, San Jose and Dongguan.'),
    ('Growth opportunities', 'Professional development in a rapidly scaling technology business.'),
    ('Competitive value', 'Market-competitive compensation with performance-based incentives.'),
]

CAREERS_VALUES = [  # 00-careers-hub.md "What We Value" + 01-life-at-twinmos.md "Core Values in Action"
    ('Integrity', 'We do business honestly and transparently with partners, customers and each other — '
                  'the foundation of trust that has sustained TwinMOS for over 27 years.'),
    ('Quality', 'Rigorous pre-delivery testing is not just for products; it reflects our standards in '
                'everything we do, from burn-in validation to campaign reviews.'),
    ('Innovation', 'From DDR1 to DDR5 and PCIe Gen 5, we continuously push technological boundaries — '
                   'in the lab and in every department.'),
    ('Collaboration', 'Cross-functional teamwork across regions, disciplines and time zones drives our '
                      'success — the best ideas emerge when different minds connect.'),
]

CAREERS_DEPTS = [  # 04-departments.md — (name, tagline, what-we-do highlights, sample roles)
    ('Engineering', 'Building the technology of tomorrow',
     ['Design next-generation DDR5 DRAM modules and PCIe Gen 5 NVMe SSDs',
      'Develop firmware for SSD controllers and memory management',
      'Engineer thermal solutions — graphene heatsinks and aluminium heatspreaders',
      'Validate hardware compatibility across desktop, laptop, server and gaming platforms'],
     ['Hardware Design Engineer (DRAM/SSD)', 'Firmware Engineer', 'PCB Layout Engineer',
      'Thermal Design Engineer', 'Validation & Compatibility Engineer', 'R&D Scientist'],
     'EE / computer-engineering degree, CAD & simulation tools, DDR / NAND / PCIe knowledge, detail-driven problem solving'),
    ('Sales', 'Connecting technology with the world',
     ['Manage distributor relationships and channel partnerships across 93+ countries',
      'Develop and execute regional sales strategies to meet revenue targets',
      'Cultivate new business opportunities in emerging markets',
      'Represent TwinMOS at COMPUTEX, GITEX and regional exhibitions'],
     ['Regional Sales Manager', 'Key Account Manager', 'Business Development Representative',
      'Channel Sales Specialist', 'Enterprise Sales Executive', 'Sales Operations Analyst'],
     'Business / marketing / engineering background, communication and negotiation, relationship building, willingness to travel internationally'),
    ('Marketing', 'Telling the TwinMOS story',
     ['Plan and execute product launches for new DRAM and SSD lines',
      'Run digital campaigns across social, search and display in nine locale markets',
      'Create datasheets, videos, blog content and technical documentation',
      'Organize event presence at COMPUTEX, gaming conventions and industry expos'],
     ['Product Marketing Manager', 'Digital Marketing Specialist', 'Content Creator / Copywriter',
      'Social Media Manager', 'Graphic Designer', 'Event Marketing Coordinator', 'Brand Manager'],
     'Marketing / communications / design background, creativity and storytelling, marketing tools and analytics, multilingual valued'),
    ('Operations', 'Keeping the world supplied',
     ['Oversee end-to-end supply chain and logistics operations',
      'Manage inventory planning and demand forecasting',
      'Coordinate with manufacturing partners in Taiwan and China',
      'Handle procurement of NAND flash, controllers and components; ensure import/export compliance'],
     ['Supply Chain Manager', 'Procurement Specialist', 'Logistics Coordinator',
      'Inventory Planner', 'Import/Export Compliance Officer', 'Warehouse Operations Manager'],
     'Supply-chain / business / engineering background, analytical mindset, ERP and inventory tools, international-trade regulations'),
    ('Quality Assurance', 'Excellence in every product',
     ['Incoming quality control on raw materials and components',
      'Burn-in validation and stress testing on finished products — a standard maintained since 1998',
      'Investigate and analyze product failures to drive continuous improvement',
      'Maintain compliance with ISO, CE, FCC, RoHS and REACH standards'],
     ['Quality Assurance Engineer', 'Lab Test Technician', 'Failure Analysis Engineer',
      'Compliance Specialist', 'Quality Control Inspector', 'Reliability Engineer'],
     'Engineering or technical degree, testing equipment and methodologies, ISO 9001 quality systems, methodical and precise'),
    ('Customer Service', 'Supporting our global community',
     ['Provide technical support for memory and SSD products',
      'Administer warranty policies and process RMA requests',
      'Maintain knowledge bases and support documentation',
      'Gather customer feedback to inform product improvements'],
     ['Technical Support Specialist', 'Warranty Administrator', 'Customer Success Manager',
      'Support Team Lead', 'Knowledge Base Manager', 'Partner Support Coordinator'],
     'Technical aptitude and troubleshooting, excellent written and verbal communication, patience and empathy, PC hardware and OS knowledge'),
]

CAREERS_LIFE_PILLARS = [  # 01-life-at-twinmos.md — "Our Culture"
    ('Respect', 'Every voice matters, regardless of role, region or tenure.'),
    ('Transparency', 'Open communication between leadership and teams.'),
    ('Accountability', 'We take ownership of our work and learn from every outcome.'),
    ('Celebration', 'We recognize milestones, product launches and personal achievements.'),
]

CAREERS_GROWTH = [  # 01-life-at-twinmos.md — "Growth and Development"
    ('On-the-job learning', 'Work alongside industry veterans on real projects — from next-gen product '
                            'development to global distribution strategy.'),
    ('Mentorship programs', 'New hires are paired with experienced mentors who share institutional '
                            'knowledge and help navigate career paths.'),
    ('Technical training', 'DDR5 architecture, PCIe Gen 5 controller integration, NAND flash management, '
                          'thermal design and AI-driven storage optimization.'),
    ('Leadership development', 'High-potential employees join leadership workshops, cross-functional '
                               'project leadership and executive exposure programs.'),
    ('Industry exposure', 'Represent TwinMOS at COMPUTEX Taipei, GITEX Dubai and regional trade shows — '
                         'network with industry leaders and stay ahead of trends.'),
]

CAREERS_GLOBAL_PERKS = [  # 01-life-at-twinmos.md — "A Global Perspective"
    ('Emerging markets', 'Work on expansion into high-growth regions like Africa, South Asia and Southeast Asia.'),
    ('Cross-cultural collaboration', 'Learn from colleagues with diverse backgrounds and professional experiences.'),
    ('Travel opportunities', 'Select roles include travel to COMPUTEX Taipei, GITEX Dubai, partner meetings and regional offices.'),
    ('Global career mobility', 'Potential for international assignments and cross-office transfers as you grow.'),
]

CAREERS_TESTIMONIALS = [  # 01-life-at-twinmos.md — quotes kept verbatim; named attributions
    # replaced with role attributions per the verified-claims policy (no named
    # individuals without signed releases, same rule as the home-page band).
    ('Working at TwinMOS has allowed me to grow professionally and personally. The collaborative '
     'culture and challenging projects keep me motivated every day.',
     'Senior Software Developer', 'Engineering · attribution pending written release'),
    ('TwinMOS\u2019s focus on innovation and customer satisfaction aligns perfectly with my professional '
     'goals. The support and resources provided here are exceptional.',
     'Sales Executive', 'Sales · attribution pending written release'),
]

CAREERS_BENEFIT_GROUPS = [  # 02-benefits.md — (chip, title, items)
    ('Compensation', 'Rewarding excellence', [
        'Market-competitive base salaries aligned with role, experience and regional benchmarks',
        'Performance-based incentives tied to individual, team and company success',
        'Spot awards, structured annual reviews and long-service awards',
    ]),
    ('Development', 'Growing our people', [
        'Technical training and certifications — DDR5, NAND management, PCIe Gen 5, thermal design',
        'Mentorship from senior leaders and cross-functional project exposure',
        'Conference and trade-show attendance: COMPUTEX, GITEX, CES and regional events',
        'Online learning platforms and tuition reimbursement (subject to approval)',
    ]),
    ('Health & wellness', 'Supporting wellbeing', [
        'Medical insurance for employees and eligible dependents (by location and local law)',
        'Dental and vision coverage where available; annual health check-ups',
        'Mental health support, wellness initiatives and fitness support (location-dependent)',
    ]),
    ('Work-life balance', 'Time to recharge', [
        'Annual, sick, parental and bereavement leave per regional standards',
        'Flexible, remote or hybrid arrangements for select roles',
        'Team-building events, annual celebrations and cultural events',
    ]),
]

CAREERS_BENEFITS_EXTRA = [  # 02-benefits.md — "Additional Benefits"
    ('Employee product purchase program', 'Exclusive discounts on TwinMOS memory modules, SSDs and accessories'),
    ('Relocation assistance', 'Visa sponsorship, housing allowance and moving expenses for select roles'),
    ('Travel opportunities', 'Business travel to trade shows, partner meetings and regional offices'),
    ('Meal & transportation allowances', 'Subsidies available at select locations'),
    ('Retirement & savings plans', 'Employer-matched contributions where applicable by region'),
    ('Employee referral bonuses', 'Rewards for referring successful candidates'),
]

CAREERS_BENEFITS_LOC = [  # 02-benefits.md — "Benefits by Location"
    ('Dubai, UAE', 'Comprehensive health insurance, annual air-ticket allowance, end-of-service benefits'),
    ('Taipei, Taiwan', 'National health insurance, labor insurance, pension contributions'),
    ('Cologne, Germany', 'Statutory health insurance, pension scheme, strong worker protections'),
    ('San Jose, USA', 'Competitive health, dental and vision packages, 401(k) matching'),
]

CAREERS_OFFICES = [  # 03-locations.md (+ Dongguan focus from 04-departments/prototype roles)
    # (flag, city, role, functions, career focus)
    ('🇹🇼', 'Taipei, Taiwan', 'Global HQ & R&D Center',
     'Research & development, product design, manufacturing coordination, quality engineering.',
     'Hardware engineering, firmware development, PCB design, thermal engineering, product management, QA, R&D leadership.'),
    ('🇦🇪', 'Dubai, UAE (DAFZA)', 'International operations hub',
     'Sales, marketing, partner management, finance and HR for the Middle East, Africa, CIS and South Asia.',
     'Senior management, sales leadership, marketing, finance, HR, international business development, operations.'),
    ('🇨🇳', 'Dongguan, China', 'Manufacturing facility',
     'Manufacturing base serving the global catalog — production and on-line quality systems.',
     'Quality engineering, SPC and supplier quality, production and warehouse operations.'),
    ('🇩🇪', 'Cologne, Germany', 'European office',
     'European market expansion, partner relations, distribution management, regulatory compliance (CE, UKCA, REACH, RoHS).',
     'European sales, partner management, regulatory affairs, logistics, technical support.'),
    ('🇺🇸', 'San Jose, USA', 'American office',
     'North American market development, enterprise sales, technical support and brand building.',
     'North American sales, enterprise business development, technical marketing, customer success, product management.'),
]

CAREERS_REMOTE_FUNCS = [  # 03-locations.md — "Supported Remote Work Functions"
    'Software and firmware development', 'Digital marketing and content creation',
    'Technical writing and documentation', 'Certain sales and customer support roles',
    'Data analysis and business intelligence',
]

CAREERS_INTERNSHIP_WHO = [  # 05-internships.md — "Who We Look For"
    ('Technical fields', 'Electrical / computer engineering and related degrees — hardware design, firmware, testing and R&D roles.'),
    ('Business fields', 'Business administration, marketing or supply-chain management — sales, marketing, operations and BD roles.'),
    ('IT & computer science', 'Software, firmware, technical support and systems roles.'),
    ('Any discipline', 'With demonstrated interest in hardware technology — curiosity and passion count as much as formal qualifications.'),
]

CAREERS_INTERNSHIP_STRONG = [  # 05-internships.md — "What Makes a Strong Candidate"
    'Strong academic performance (GPA requirements vary by program)',
    'Demonstrated interest in technology, hardware or semiconductors',
    'Excellent communication and teamwork skills',
    'Proactive attitude and willingness to take initiative',
    'Fluency in English — additional languages are a plus for regional roles',
]

CAREERS_INTERNSHIP_GAINS = [  # 05-internships.md — "What You Will Gain"
    ('Hands-on technical experience', 'Work with real DRAM, SSD and storage products; join testing, validation and QA processes; use industry-standard tools.'),
    ('Business & operational exposure', 'See how global semiconductor supply chains run; learn distributor management and channel sales; contribute to launches.'),
    ('Professional development', 'One-on-one mentorship, regular feedback sessions and networking with leaders across the organization.'),
    ('Career advancement', 'Potential conversion to full-time roles — many of our current full-time employees started as interns; priority for the graduate program.'),
]

CAREERS_INTERNSHIP_TRACKS = [  # 05-internships.md — "Available Internship Tracks"
    ('Engineering', ['Hardware design and validation testing', 'Firmware development and debugging',
                     'Thermal and power-management analysis', 'PCB layout and signal-integrity fundamentals']),
    ('Marketing', ['Marketing strategies and campaigns', 'Market research and competitive analysis',
                   'Social, blog and product-page content', 'Event planning and trade-show coordination']),
    ('Sales & BD', ['Lead generation and market research', 'Sales presentations and proposals',
                    'Distributor management and channel partnerships', 'Market-expansion planning']),
    ('Operations & supply chain', ['Inventory planning and demand forecasting', 'Procurement and vendor management',
                                   'Logistics and import/export compliance', 'Process-improvement initiatives']),
    ('Customer support', ['Customer inquiries and technical issues', 'Knowledge bases and support docs',
                          'Warranty administration and RMA processes', 'Product training sessions']),
]

CAREERS_PROCESS_STEPS = [  # 07-application-form.md "What Happens Next" + 06 template timeline
    ('Application review', 'HR reviews your application within 2–3 weeks of submission.'),
    ('Screening', 'Shortlisted candidates are contacted to schedule an initial phone or video screening.'),
    ('Interviews', 'Technical / functional interviews, then a final conversation with department leadership.'),
    ('Offer', 'A formal offer with detailed compensation and benefits information.'),
    ('Onboarding', 'Welcome to the TwinMOS team!'),
]

CAREERS_PRIVACY_POINTS = [  # 08-applicant-privacy.md + 07-application-form.md
    'Data is used solely for recruitment and hiring purposes — never sold or shared for marketing',
    'Retained for up to 24 months after the recruitment process concludes (or per local law)',
    'Encryption in transit and at rest, access controls and regular security assessments',
    'Your rights: access, correction, deletion, restriction and portability — honored within 30 days',
]

def _career_faq_groups(path):
    """Parse 09-careers-faq.md — '## Group' / '### Question' / paragraphs → [(group, [(q, a)])]."""
    _meta, body = _read(path)
    groups, g, q, buf = [], None, None, []

    def flush_q():
        nonlocal q, buf
        if q is not None and g is not None:
            parts = []
            for s in buf:
                s = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', s)          # md links → label
                s = re.sub(r'\*\*([^*]+)\*\*', r'\1', s)                # bold off
                s = re.sub(r'\*([^*]+)\*', r'\1', s)                    # italic off
                parts.append(s)
            text = re.sub(r'\s+', ' ', ' '.join(parts)).strip()
            if text:
                g[1].append((q.rstrip('?.!') + '?', text[:700]))
        q, buf = None, []

    def flush_g():
        nonlocal g
        flush_q()
        if g and g[1]:
            groups.append(g)
        g = None

    for ln in body.splitlines():
        s = ln.strip()
        if s.startswith('## '):
            flush_g(); g = (s[3:].strip(), []); continue
        if s.startswith('### '):
            flush_q(); q = s[4:].strip(); continue
        if not s or s.startswith('#') or s.startswith('|') or s.startswith('>'):
            continue
        if s.startswith('- ') or s.startswith('* '):
            buf.append('— ' + s[2:].strip().rstrip('.')); continue
        m = re.match(r'^(\d+)\.\s+(.*)$', s)
        if m:
            buf.append(m.group(1) + ') ' + m.group(2).rstrip('.')); continue
        buf.append(s)
    flush_g()
    return groups

def import_careers(SC):
    """Careers hub content from 12-careers/*.md (see the CAREERS_* tables above)."""
    SC.CAREERS_WHY = list(CAREERS_WHY)
    SC.CAREERS_VALUES = list(CAREERS_VALUES)
    SC.CAREERS_DEPTS = list(CAREERS_DEPTS)
    SC.CAREERS_LIFE_PILLARS = list(CAREERS_LIFE_PILLARS)
    SC.CAREERS_GROWTH = list(CAREERS_GROWTH)
    SC.CAREERS_GLOBAL_PERKS = list(CAREERS_GLOBAL_PERKS)
    SC.CAREERS_TESTIMONIALS = list(CAREERS_TESTIMONIALS)
    SC.CAREERS_BENEFIT_GROUPS = list(CAREERS_BENEFIT_GROUPS)
    SC.CAREERS_BENEFITS_EXTRA = list(CAREERS_BENEFITS_EXTRA)
    SC.CAREERS_BENEFITS_LOC = list(CAREERS_BENEFITS_LOC)
    SC.CAREERS_OFFICES = list(CAREERS_OFFICES)
    SC.CAREERS_REMOTE_FUNCS = list(CAREERS_REMOTE_FUNCS)
    SC.CAREERS_INTERNSHIP_WHO = list(CAREERS_INTERNSHIP_WHO)
    SC.CAREERS_INTERNSHIP_STRONG = list(CAREERS_INTERNSHIP_STRONG)
    SC.CAREERS_INTERNSHIP_GAINS = list(CAREERS_INTERNSHIP_GAINS)
    SC.CAREERS_INTERNSHIP_TRACKS = list(CAREERS_INTERNSHIP_TRACKS)
    SC.CAREERS_PROCESS_STEPS = list(CAREERS_PROCESS_STEPS)
    SC.CAREERS_PRIVACY_POINTS = list(CAREERS_PRIVACY_POINTS)
    faq = _career_faq_groups(os.path.join(CORPUS, '12-careers', '09-careers-faq.md'))
    if faq:
        SC.CAREERS_FAQ = faq
    return sum(len(items) for _g, items in faq) if faq else 0

def enrich(SC):
    """Entry point: extend site_content data with corpus content."""
    if not os.path.isdir(CORPUS):
        print('  [corpus] content folder not found, skipped')
        return
    a = import_learn(SC)
    k = import_kb(SC)
    f = import_faq(SC)
    d = import_distributors(SC)
    c = import_careers(SC)
    g = import_glossary(SC)
    learn_hubs(SC)
    print('  [corpus] +%d learn articles, +%d KB articles, +%d FAQ answers, %d distributor markets, %d careers FAQ answers, %d glossary terms'
          % (a, k, f, d, c, g))
