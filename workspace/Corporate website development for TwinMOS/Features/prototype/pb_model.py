# -*- coding: utf-8 -*-
"""Prototype builder — module 2: product normalization from products.json."""
import json, os, re
import site_content as SC
import pb_images as PI

CAT_LABEL = dict(SC.CATS)

def slugify(name):
    s = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    s = s.replace('m-2', 'm2')          # "M.2" -> m2 (matches hand-written ids)
    return s[8:] if s.startswith('twinmos-') else s

def map_cat(cats, name):
    cs = set(cats); n = name.lower()
    # portable buckets must win before generic 'Solid State Drive'
    if 'Portable SSD' in cs: return 'portable-ssd'
    if 'Portable HDD' in cs: return 'portable-hdd'
    if 'Portable Drives' in cs: return 'portable-hdd' if 'hdd' in n else 'portable-ssd'
    if 'portable' in n or 'external' in n: return 'portable-hdd' if 'hdd' in n else 'portable-ssd'
    if 'Gaming DRAM' in cs: return 'dram-gaming'
    if 'Desktop DRAM' in cs: return 'dram-desktop'
    if 'Notebook DRAM' in cs: return 'dram-notebook'
    if 'DRAM Module' in cs: return 'dram-notebook' if 'so-dimm' in n else 'dram-desktop'
    if 'NVMe SSD' in cs: return 'ssd-nvme'
    if 'SATA SSD' in cs: return 'ssd-sata'
    if 'Solid State Drive' in cs: return 'ssd-sata' if ('sata' in n and 'nvme' not in n) else 'ssd-nvme'
    if 'Flash Drive' in cs: return 'flash'
    if 'MicroSD Card' in cs: return 'microsd'
    if 'Power Supply' in cs: return 'psu'
    if 'USB HUB' in cs: return 'hub'
    return 'dram-desktop'

def norm_product(p):
    name = p['name'].strip()
    pid = slugify(name)
    cat = map_cat(p.get('categories', []), name)
    specs = p.get('specifications') or {}
    n = name
    m = re.search(r'DDR[345]', n)
    gen = m.group(0) if m else ''
    form = ''
    if 'SO-DIMM' in n or 'Notebook' in n or 'Laptop' in n: form = 'SO-DIMM'
    elif 'U-DIMM' in n or 'Desktop' in n: form = 'U-DIMM'
    if 'M.2' in n or 'M.2' in str(specs.get('Form Factor', '')): form = (form + ' M.2').strip()
    if cat.startswith('portable'): form = 'External'
    interface = specs.get('Interface', '')
    if not interface:
        if cat == 'ssd-nvme': interface = 'PCIe NVMe'
        elif cat == 'ssd-sata': interface = 'SATA III'
        elif cat == 'flash': interface = 'USB 3.2'
        elif cat == 'microsd': interface = 'UHS-I'
        elif gen: interface = gen + ' ' + (form or 'DIMM')
    cap = specs.get('Capacity', '')
    if not cap:
        m2 = re.findall(r'(\d+\s?(?:GB|TB))', n + ' ' + ' '.join(str(v) for v in specs.values()))
        cap = ', '.join(sorted(set(m2)))[:40]
    warranty = specs.get('Warranty', '') or SC.WARRANTY_DEFAULT.get(cat, '')
    badge = ''
    if 'Gen 5' in (n + ' ' + interface + ' ' + str(specs.get('Interface', ''))):
        badge = 'Gen5'
    elif pid in SC.IS_NEW: badge = 'New'
    if not badge and cat == 'dram-gaming': badge = 'Gaming'
    # master brand line (F4.8 dual-axis navigation: category × brand)
    line = next((b for b in ('CoreX Pro', 'ELITE Drive', 'ProDrive Ultra', 'Mobile Disk', 'Hyper H2',
                             'TornadoX7', 'Thunder GX', 'Alpha Pro', 'VOLTX', 'Xtreme', 'Concord')
                 if b.lower() in n.lower()), 'TwinMOS')
    keys_pri = {
        'dram-gaming': ['Frequency', 'Speed', 'Capacity'], 'dram-desktop': ['Frequency', 'Speed', 'Capacity'],
        'dram-notebook': ['Frequency', 'Speed', 'Capacity'],
        'ssd-nvme': ['Interface', 'Sequential Read Speed', 'Capacity'],
        'ssd-sata': ['Interface', 'Sequential Read Speed', 'Capacity'],
        'portable-ssd': ['Interface', 'Capacity'], 'portable-hdd': ['Interface', 'Capacity'],
        'flash': ['Interface', 'Capacity'], 'microsd': ['Speed Class', 'Capacity', 'Interface'],
        'psu': ['Wattage', 'Efficiency', 'Capacity'], 'hub': ['Ports', 'Interface'],
    }.get(cat, ['Capacity', 'Interface'])
    parts = []
    for k in keys_pri:
        if specs.get(k): parts.append(str(specs[k]))
        if len(parts) >= 2: break
    if not parts:
        if gen: parts.append(gen)
        if cap: parts.append(cap)
    short = ' · '.join(parts[:3])[:90]

    img = None; gallery = []
    curated = SC.CURATED.get(name)
    if curated:
        r = PI.site_asset(curated)
        if r: img = r; gallery = [r]
    if not img:
        for im in (p.get('images') or []):
            src = PI.safe_join(PI.PROD, im.get('local_path', ''))
            if src and os.path.isfile(src):
                r = PI.img_out(src, pid + '-g%d' % len(gallery))
                if r:
                    gallery.append(r)
                    if not img: img = r
            if len(gallery) >= 4: break
    if not img:
        r = PI.site_asset(SC.CAT_FALLBACK.get(cat, 'cat-dram.webp'))
        if r: img = r; gallery = [r]
    elif len(gallery) < 2 and cat == 'ssd-nvme':
        extra = PI.site_asset('corex-pro.webp')
        if extra and extra not in gallery: gallery.append(extra)

    variants = []
    for key, vals in (p.get('variants') or {}).items():
        for x in vals: variants.append(str(x))
    if not variants and cap:
        variants = [c.strip() for c in cap.split(',') if c.strip()][:6]
    return {
        'id': pid, 'name': name, 'cat': cat, 'catLabel': CAT_LABEL[cat],
        'shortSpec': short, 'warranty': warranty, 'badge': badge, 'brand': line,
        'gen': gen, 'cap': cap, 'interface': interface, 'form': form.strip(),
        'img': img or '', 'gallery': gallery[:4], 'variants': variants,
        'specs': specs, 'description': (p.get('description') or '').strip()[:2600],
        'featured': pid in SC.FEATURED, 'isNew': pid in SC.IS_NEW,
        'search': ' '.join(str(x) for x in specs.values())[:400],
    }

def load_products():
    with open(PI.PRODUCTS_JSON, encoding='utf-8') as f:
        raw = json.load(f)
    products, seen = [], set()
    for p in raw:
        np_ = norm_product(p)
        if np_['id'] in seen:
            continue
        seen.add(np_['id'])
        products.append(np_)
    # gallery top-up: every PDP should offer multiple views — borrow shots from
    # sibling products in the same category (real photography, no placeholders)
    by_cat = {}
    for p in products:
        by_cat.setdefault(p['cat'], []).append(p['img'])
    for p in products:
        g = list(p['gallery'])
        if p['img'] and p['img'] not in g:
            g.insert(0, p['img'])
        for cand in by_cat.get(p['cat'], []):
            if len(g) >= 3:
                break
            if cand and cand not in g:
                g.append(cand)
        p['gallery'] = g[:4]
    return products
