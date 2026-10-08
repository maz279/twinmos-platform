// Products (P8 iteration 2) — full catalog management: searchable/filterable
// list with hero thumbnails and pricing, plus a complete editor covering
// basics, pricing, marketing copy, media (hero + gallery via the media picker),
// specifications (key/value), badges and datasheets. Deep-linkable per product
// via tab ctx { kind:'product', id }.
import React, { useEffect, useMemo, useState } from 'react';
import { API, ApiError, apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, CommandBar, Empty, Err, Field, formGrid, input, SectionCard, Table, td, Toolbar, useAsync, usePanelScroll } from '../ui';
import { MediaPicker } from '../media-picker';
import { AUTHORIZED_CURRENCIES } from '@twinmos/shared';
import type { ModProps, TabCtx } from '../nav';

const NAVY = '#1F2A37'; const CYAN = '#1DBF9F';

type Product = {
  id: number; sku: string; slug: string; name: string; brandId: number; categoryId: number;
  status: string; specs: Record<string, unknown>; description: string;
  priceUsd: string | null; currency: string; warranty: string | null;
  shortSpec: string | null; facets: Record<string, string> | null;
  heroMediaId: number | null; gallery: number[] | null; datasheets: Array<{ label: string; url: string }> | null;
  badges: string[] | null; releasedAt: string | null; createdAt: string; updatedAt: string;
};
type Taxonomy = { brands: Array<{ id: number; name: string; slug: string }>; categories: Array<{ id: number; name: string; slug: string }> };

export default function Products({ canWrite, ctx, nav }: ModProps) {
  const focusId = ctx?.kind === 'product' && ctx.id ? Number(ctx.id) : null;
  const [editing, setEditing] = useState<number | 'new' | null>(focusId ?? null);
  useEffect(() => { if (focusId != null && Number.isFinite(focusId)) setEditing(focusId); }, [focusId]);

  // Third-level sidebar deep link (§6.4): ctx { kind:'category', id } opens the
  // list pre-filtered to that taxonomy category (GET /admin/products?category=).
  const catFilter = ctx?.kind === 'category' && ctx.id && Number.isFinite(Number(ctx.id)) ? Number(ctx.id) : null;
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState<number | ''>(catFilter ?? '');
  useEffect(() => { if (catFilter != null) setCategory(catFilter); }, [catFilter]);
  const [bulk, setBulk] = useState(false);
  const query = useMemo(() => {
    const qs = new URLSearchParams();
    if (q.trim()) qs.set('q', q.trim());
    if (status) qs.set('status', status);
    if (category !== '') qs.set('category', String(category));
    return qs.toString();
  }, [q, status, category]);
  const { data, error, loading, reload } = useAsync<{ items: Product[] }>(() => apiGet('/admin/products' + (query ? '?' + query : '')), [query]);
  const tax = useAsync<Taxonomy>(() => apiGet('/admin/taxonomy'), []);

  if (editing !== null) {
    return <Editor id={editing === 'new' ? null : editing} taxonomy={tax.data} canWrite={canWrite}
      onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />;
  }

  const brandName = (id: number) => tax.data?.brands.find((b) => b.id === id)?.name ?? `#${id}`;
  return (
    <div>
      <Toolbar style={{ gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Products</h1>
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ New product</button>}
        <button style={btnGhost} onClick={() => setBulk(true)} title="Bulk CSV import and full-catalog export">Import / Export</button>
        <RefreshBridgeButton />
        <span style={{ flex: 1 }} />
        <input style={{ ...input, width: 240 }} placeholder="Search name or SKU…" aria-label="Search name or SKU" value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={input} value={category} onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : '')}
          aria-label="Filter by category"
          title="Filter by taxonomy category (sidebar: Catalog → Products → category)">
          <option value="">All categories</option>
          {(tax.data?.categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={input} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {['draft', 'in_review', 'scheduled', 'published', 'archived'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </Toolbar>
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
        <Table head={['', 'SKU', 'Product', 'Price', 'Status', 'Updated', '']}>
          {data.items.map((p) => (
            <tr key={p.id} onClick={() => setEditing(p.id)} style={{ cursor: 'pointer' }} title="Open editor">
              <td style={{ ...td, width: 56 }}>
                <span style={{ display: 'block', width: 44, height: 33, borderRadius: 6, background: '#EEF1F5', overflow: 'hidden' }}>
                  {p.heroMediaId && <img src={API + '/admin/media/' + p.heroMediaId + '/file?variant=thumb'} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </span>
              </td>
              <td style={td}><b>{p.sku}</b></td>
              <td style={td}>
                <b style={{ color: NAVY }}>{p.name}</b>
                <div style={{ color: '#93A0B4', fontSize: 11.5 }}>{brandName(p.brandId)} · {p.slug}</div>
                {(p.badges ?? []).slice(0, 4).map((b) => <span key={b} style={{ fontSize: 10.5, background: '#E7F7F2', color: '#0E9F7E', borderRadius: 5, padding: '1px 6px', marginRight: 4 }}>{b}</span>)}
              </td>
              <td style={td}>{p.priceUsd != null ? <b>{(p.currency || 'USD')} {Number(p.priceUsd).toFixed(2)}</b> : <span style={{ color: '#93A0B4' }}>—</span>}</td>
              <td style={td}><Badge value={p.status} /></td>
              <td style={{ ...td, color: '#66748A', fontSize: 12 }}>{fmtDate(p.updatedAt)}</td>
              <td style={{ ...td, width: 70 }}>
                <button style={{ ...btnGhost, padding: '4px 9px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); nav('products', { kind: 'product', id: String(p.id), label: p.sku }, { newTab: true }); }}>Tab ↗</button>
              </td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No products match — run npm run db:seed or clear the filters." />}
      {bulk && <BulkModal canImport={canWrite} onClose={() => setBulk(false)} onDone={reload} />}
    </div>
  );
}

function Editor({ id, taxonomy, canWrite, onDone, onCancel }: {
  id: number | null; taxonomy: Taxonomy | null; canWrite: boolean; onDone: () => void; onCancel: () => void;
}) {
  const isNew = id == null;
  const { data: existing, error, loading, reload } = useAsync<Product | null>(() => (isNew ? Promise.resolve(null) : apiGet('/admin/products/' + id)), [id]);
  // Phase 3: editor sub-tabs (Basics / Variants & SKUs) + optimistic-lock conflict flag
  const [tab, setTab] = useState<'basics' | 'variants'>('basics');
  const [conflict, setConflict] = useState(false);
  const [form, setForm] = useState({
    sku: '', slug: '', name: '', brandId: 0, categoryId: 0, status: 'draft',
    description: '', price: '', currency: 'USD', badges: '', warranty: '', shortSpec: '',
  });
  // 0016 storefront facets — controlled vocabularies that drive the public shop filters
  const [facets, setFacets] = useState({ gen: '', cap: '', interface: '', form: '' });
  const [specs, setSpecs] = useState<Array<[string, string]>>([]);
  const [hero, setHero] = useState<number | null>(null);
  const [gallery, setGallery] = useState<number[]>([]);
  const [datasheets, setDatasheets] = useState<Array<{ label: string; url: string }>>([]);
  const [picker, setPicker] = useState<null | 'hero' | 'gallery'>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Hydrate the form ONCE PER PRODUCT (deps: the id, not the object) — a
  // background refetch (TanStack refetchOnWindowFocus) produces a new
  // `existing` object and must never clobber unsaved edits mid-session.
  // Re-entering the editor for another product changes the id and rehydrates.
  useEffect(() => {
    if (!existing) return;
    setForm({
      sku: existing.sku, slug: existing.slug, name: existing.name,
      brandId: existing.brandId ?? 0, categoryId: existing.categoryId ?? 0, status: existing.status,
      description: existing.description ?? '', price: existing.priceUsd != null ? String(Number(existing.priceUsd)) : '',
      currency: existing.currency ?? 'USD', badges: (existing.badges ?? []).join(', '),
      warranty: existing.warranty ?? '', shortSpec: existing.shortSpec ?? '',
    });
    setFacets({
      gen: existing.facets?.gen ?? '', cap: existing.facets?.cap ?? '',
      interface: existing.facets?.interface ?? '', form: existing.facets?.form ?? '',
    });
    setSpecs(Object.entries(existing.specs ?? {}).map(([k, v]) => [k, String(v)]));
    setHero(existing.heroMediaId ?? null);
    setGallery(existing.gallery ?? []);
    setDatasheets(existing.datasheets ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  // Rules of Hooks: this hook MUST run before any conditional return below —
  // an early return on loading/error followed by a full render flips the hook
  // count and crashes the module ("Rendered more hooks than during the
  // previous render", audit finding U-1). Keep it above the returns.
  const panelRef = usePanelScroll<HTMLDivElement>();

  if (!isNew && loading) return <div ref={panelRef}><p>Loading…</p></div>;
  if (!isNew && error) return <div ref={panelRef}><Err error={error} /></div>;

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function save(publish?: boolean) {
    setErr(null);
    const price = form.price.trim() === '' ? null : Number(form.price);
    if (price != null && !Number.isFinite(price)) { setErr('Price must be a number (or empty).'); return; }
    if (!isNew && !canWrite) { setErr('Your role cannot save product changes.'); return; }
    const body = {
      sku: form.sku.trim().toUpperCase(), slug: form.slug.trim().toLowerCase() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name: form.name.trim(), brandId: form.brandId, categoryId: form.categoryId,
      status: publish ? 'published' : form.status,
      description: form.description, priceUsd: price, currency: form.currency.toUpperCase(),
      badges: form.badges.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8),
      warranty: form.warranty.trim() || null,
      shortSpec: form.shortSpec.trim() || null,
      facets: Object.fromEntries(Object.entries(facets).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()])),
      specs: Object.fromEntries(specs.filter(([k]) => k.trim()).map(([k, v]) => [k.trim(), v])),
      heroMediaId: hero, gallery, datasheets: datasheets.filter((d) => d.label && d.url),
    };
    setBusy(true);
    try {
      if (isNew) {
        if (!form.sku || !form.name || !form.brandId || !form.categoryId) { setErr('SKU, name, brand and category are required for a new product.'); setBusy(false); return; }
        await apiSend('POST', '/admin/products', body);
      } else {
        // Phase 3.4: send the revision we loaded — the API refuses with 409
        // when someone else saved in the meantime (no silent overwrites).
        await apiSend('PATCH', '/admin/products/' + id, body,
          existing ? { 'If-Match': new Date(existing.updatedAt).toISOString() } : undefined);
      }
      onDone();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setConflict(true);
      // Deep-iteration fix: surface ApiError.detail so a 422 names the failing
      // field instead of a bare "Validation Failed".
      else setErr(e instanceof ApiError ? `${e.message}${e.detail ? ` — ${e.detail}` : ''}` : e instanceof Error ? e.message : 'Save failed.');
    } finally { setBusy(false); }
  }

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: NAVY, display: 'block', margin: '12px 0 4px' };

  return (
    <div ref={panelRef}>
      {/* §6.4 command bar — pins under the tab strip while the long editor
          scrolls, so Save/Publish never scroll out of reach */}
      <CommandBar style={{ gap: 10, marginBottom: 14 }}>
        <button style={btnGhost} onClick={onCancel}>← Back to list</button>
        <h1 style={{ margin: 0, fontSize: 20 }}>{isNew ? 'New product' : `Edit ${existing?.sku ?? ''}`}</h1>
        {!isNew && existing && <Badge value={form.status} />}
        <span style={{ flex: 1 }} />
        {canWrite && !isNew && form.status !== 'published' && <button style={btnGhost} disabled={busy} onClick={() => save(true)}>Publish</button>}
        {canWrite && <button style={btn} disabled={busy} onClick={() => save(false)}>{busy ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}</button>}
      </CommandBar>
      {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 12px' }}>{err}</p>}
      {conflict && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', color: '#8A5A00', background: '#FBF3E2', border: '1px solid #E8CE9A', borderRadius: 8, padding: '8px 12px' }}>
          <b>Conflict:</b>
          <span style={{ flex: 1, minWidth: 200 }}>this product was saved by someone else while you were editing — your changes were NOT applied.</span>
          <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={() => { setConflict(false); reload(); }}>Reload fresh</button>
          <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={() => setConflict(false)}>Keep mine on screen</button>
        </div>
      )}

      {!isNew && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button style={tab === 'basics' ? btn : btnGhost} onClick={() => setTab('basics')}>Basics</button>
          <button style={tab === 'variants' ? btn : btnGhost} onClick={() => setTab('variants')}>Variants &amp; SKUs</button>
        </div>
      )}

      {tab === 'variants' && !isNew && id != null ? (
        <VariantsTab productId={id} baseSku={existing?.sku ?? ''} canWrite={canWrite} />
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <SectionCard title="Identity">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <span><label style={labelStyle}>Name *</label><input style={{ ...input, width: '100%' }} value={form.name} onChange={(e) => set('name', e.target.value)} /></span>
              <span><label style={labelStyle}>SKU * <span style={{ color: '#93A0B4', fontWeight: 400 }}>(A-Z 0-9 -)</span></label><input style={{ ...input, width: '100%' }} value={form.sku} onChange={(e) => set('sku', e.target.value)} disabled={!isNew} /></span>
              <span><label style={labelStyle}>Slug</label><input style={{ ...input, width: '100%' }} value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from name" /></span>
              <span><label style={labelStyle}>Status</label>
                <select style={{ ...input, width: '100%' }} value={form.status} onChange={(e) => set('status', e.target.value)} disabled={!canWrite}>
                  {['draft', 'in_review', 'scheduled', 'published', 'archived'].map((s) => <option key={s}>{s}</option>)}
                </select></span>
              <span><label style={labelStyle}>Brand *</label>
                <select style={{ ...input, width: '100%' }} value={form.brandId} onChange={(e) => set('brandId', Number(e.target.value))}>
                  <option value={0}>— choose —</option>
                  {(taxonomy?.brands ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></span>
              <span><label style={labelStyle}>Category *</label>
                <select style={{ ...input, width: '100%' }} value={form.categoryId} onChange={(e) => set('categoryId', Number(e.target.value))}>
                  <option value={0}>— choose —</option>
                  {(taxonomy?.categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></span>
            </div>
          </SectionCard>

          <SectionCard title="Storefront card — what shoppers see">
            <label style={labelStyle}>Catalog card line <span style={{ color: '#93A0B4', fontWeight: 400 }}>(one line under the product name — e.g. “USB 3.0 · 1TB”)</span></label>
            <input style={{ ...input, width: '100%' }} placeholder="e.g. DDR5 · 32GB · 6000 MT/s" value={form.shortSpec} onChange={(e) => set('shortSpec', e.target.value)} />
            <label style={labelStyle}>Description <span style={{ color: '#93A0B4', fontWeight: 400 }}>(marketing copy shown on the product page)</span></label>
            <textarea style={{ ...input, width: '100%', minHeight: 120, fontFamily: 'inherit' }} placeholder="Flagship DDR5 U-DIMM for gaming builds…"
              value={form.description} onChange={(e) => set('description', e.target.value)} />
            <label style={labelStyle}>Badges <span style={{ color: '#93A0B4', fontWeight: 400 }}>(comma separated, max 8 — shown as a pill on the card)</span></label>
            <input style={{ ...input, width: '100%' }} placeholder="New, Best seller,…" value={form.badges} onChange={(e) => set('badges', e.target.value)} />
            {form.badges.split(',').map((s) => s.trim()).filter(Boolean).length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {form.badges.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8).map((b) => (
                  <span key={b} style={{ fontSize: 11.5, fontWeight: 700, color: '#0F6B54', background: '#E4F8F2', border: '1px solid #BFE8DC', borderRadius: 999, padding: '2px 10px' }}>{b}</span>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Shop facets — drive the public filters">
            <p style={{ color: '#66748A', fontSize: 12, margin: '0 0 8px' }}>
              These power the generation / capacity / interface / form-factor filters in the shop. Empty = the product
              only appears when that filter is unset.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <span><label style={labelStyle}>Generation</label>
                <input style={{ ...input, width: '100%' }} list="tm-facet-gen" placeholder="DDR4 / DDR5…" value={facets.gen} onChange={(e) => setFacets((f) => ({ ...f, gen: e.target.value }))} /></span>
              <span><label style={labelStyle}>Capacity</label>
                <input style={{ ...input, width: '100%' }} list="tm-facet-cap" placeholder="16GB / 1TB…" value={facets.cap} onChange={(e) => setFacets((f) => ({ ...f, cap: e.target.value }))} /></span>
              <span><label style={labelStyle}>Interface</label>
                <input style={{ ...input, width: '100%' }} list="tm-facet-iface" placeholder="USB 3.0 / NVMe…" value={facets.interface} onChange={(e) => setFacets((f) => ({ ...f, interface: e.target.value }))} /></span>
              <span><label style={labelStyle}>Form factor</label>
                <input style={{ ...input, width: '100%' }} list="tm-facet-form" placeholder="External / M.2 2280…" value={facets.form} onChange={(e) => setFacets((f) => ({ ...f, form: e.target.value }))} /></span>
            </div>
            <datalist id="tm-facet-gen">{['DDR3', 'DDR4', 'DDR5', 'LPDDR4', 'LPDDR5'].map((v) => <option key={v} value={v} />)}</datalist>
            <datalist id="tm-facet-cap">{['8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB'].map((v) => <option key={v} value={v} />)}</datalist>
            <datalist id="tm-facet-iface">{['USB 3.0', 'USB 3.1', 'USB-C', 'NVMe PCIe 3.0', 'NVMe PCIe 4.0', 'NVMe PCIe 5.0', 'SATA III', 'SATA', 'UHS-I'].map((v) => <option key={v} value={v} />)}</datalist>
            <datalist id="tm-facet-form">{['External', 'Internal', 'Desktop', 'SO-DIMM', 'U-DIMM', 'M.2 2280', 'mSATA', 'Portable', 'Flash drive'].map((v) => <option key={v} value={v} />)}</datalist>
          </SectionCard>

          <SectionCard title="Specifications">
            {specs.map(([k, v], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 30px', gap: 8, marginBottom: 6 }}>
                <input style={input} placeholder="Label (e.g. Speed)" value={k} onChange={(e) => setSpecs((s) => s.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} />
                <input style={input} placeholder="Value (e.g. 6000 MT/s)" value={v} onChange={(e) => setSpecs((s) => s.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} />
                <button style={{ ...btnGhost, padding: '4px 8px' }} title="Remove" onClick={() => setSpecs((s) => s.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setSpecs((s) => [...s, ['', '']])}>+ Add specification</button>
          </SectionCard>

          <SectionCard title="Datasheets" collapsible>
            {datasheets.map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 30px', gap: 8, marginBottom: 6 }}>
                <input style={input} placeholder="Label" value={d.label} onChange={(e) => setDatasheets((s) => s.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))} />
                <input style={input} placeholder="https://… (PDF URL)" value={d.url} onChange={(e) => setDatasheets((s) => s.map((r, j) => (j === i ? { ...r, url: e.target.value } : r)))} />
                <button style={{ ...btnGhost, padding: '4px 8px' }} title="Remove" onClick={() => setDatasheets((s) => s.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            {datasheets.length < 6 && <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setDatasheets((s) => [...s, { label: '', url: '' }])}>+ Add datasheet</button>}
          </SectionCard>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <StorefrontPreview
            name={form.name || 'Product name'}
            catLabel={(taxonomy?.categories ?? []).find((c) => c.id === form.categoryId)?.name ?? 'Category'}
            shortSpec={form.shortSpec}
            warranty={form.warranty}
            badge={form.badges.split(',').map((s) => s.trim()).filter(Boolean)[0] ?? ''}
            price={form.price}
            currency={form.currency}
            heroId={hero}
            published={form.status === 'published'}
          />

          <SectionCard title="Pricing & warranty">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 8 }}>
              <span><label style={labelStyle}>List price</label><input style={{ ...input, width: '100%' }} placeholder="e.g. 129.99" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} /></span>
              <span><label style={labelStyle}>Cur.</label>
                <select style={{ ...input, width: '100%' }} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                  {AUTHORIZED_CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select></span>
            </div>
            <label style={labelStyle}>Warranty <span style={{ color: '#93A0B4', fontWeight: 400 }}>(shown on the product page, e.g. “Lifetime” / “3 Years”)</span></label>
            <input style={{ ...input, width: '100%' }} placeholder="e.g. 5 Years" value={form.warranty} onChange={(e) => set('warranty', e.target.value)} />
            <label style={labelStyle}>Badges <span style={{ color: '#93A0B4', fontWeight: 400 }}>(comma separated, max 8)</span></label>
            <input style={{ ...input, width: '100%' }} placeholder="New, Best seller,…" value={form.badges} onChange={(e) => set('badges', e.target.value)} />
          </SectionCard>

          <SectionCard title="Images">
            <label style={labelStyle}>Hero image</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 96, height: 72, borderRadius: 8, background: '#EEF1F5', overflow: 'hidden', display: 'block', flexShrink: 0 }}>
                {hero && <img src={API + '/admin/media/' + hero + '/file?variant=card'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </span>
              <button style={btnGhost} onClick={() => setPicker('hero')}>{hero ? 'Change' : 'Choose'}</button>
              {hero && <button style={{ ...btnGhost, padding: '4px 8px' }} onClick={() => setHero(null)}>✕</button>}
            </div>
            <label style={labelStyle}>Gallery ({gallery.length}/12) <span style={{ color: '#93A0B4', fontWeight: 400 }}>(first image follows the hero on the product page — ‹ › to reorder)</span></label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {gallery.map((g, i) => (
                <span key={g} style={{ position: 'relative', width: 64, height: 48, borderRadius: 6, background: '#EEF1F5', overflow: 'hidden' }}>
                  <img src={API + '/admin/media/' + g + '/file?variant=thumb'} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button title="Remove" onClick={() => setGallery((s) => s.filter((x) => x !== g))}
                    style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, border: 0, borderRadius: 4, background: 'rgba(10,37,64,.75)', color: '#fff', fontSize: 10, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                  {i === 0 && gallery.length > 1 && <span title="Lead gallery image" style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 9, background: 'rgba(29,191,159,.9)', color: '#fff', borderRadius: 4, padding: '0 4px', fontWeight: 700 }}>1st</span>}
                  <span style={{ position: 'absolute', bottom: 2, right: 2, display: 'flex', gap: 1 }}>
                    <button title="Move earlier" disabled={i === 0} onClick={() => setGallery((s) => { const n = [...s]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })}
                      style={{ width: 14, height: 14, border: 0, borderRadius: 3, background: 'rgba(10,37,64,.65)', color: '#fff', fontSize: 9, cursor: i === 0 ? 'default' : 'pointer', lineHeight: 1, opacity: i === 0 ? 0.4 : 1 }}>‹</button>
                    <button title="Move later" disabled={i === gallery.length - 1} onClick={() => setGallery((s) => { const n = [...s]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; })}
                      style={{ width: 14, height: 14, border: 0, borderRadius: 3, background: 'rgba(10,37,64,.65)', color: '#fff', fontSize: 9, cursor: i === gallery.length - 1 ? 'default' : 'pointer', lineHeight: 1, opacity: i === gallery.length - 1 ? 0.4 : 1 }}>›</button>
                  </span>
                </span>
              ))}
            </div>
            <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setPicker('gallery')}>+ Add gallery images</button>
          </SectionCard>

          {!isNew && existing && (
            <SectionCard title="Record" collapsible defaultOpen={false} titleStyle={{ color: NAVY }} style={{ color: '#93A0B4', fontSize: 12 }}>
              Created {fmtDate(existing.createdAt)} · Updated {fmtDate(existing.updatedAt)} · ID #{existing.id}
            </SectionCard>
          )}
        </div>
      </div>
      )}

      {picker && (
        <MediaPicker
          multi={picker === 'gallery'}
          selected={picker === 'hero' ? (hero ? [hero] : []) : gallery}
          onConfirm={(ids) => { if (picker === 'hero') setHero(ids[0] ?? null); else setGallery(ids); setPicker(null); }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

// ---- Storefront preview — mirrors the public shop grid card -----------------// Field-for-field replica of how the site renders a product card (category chip,
// image, name, card line, warranty chip, badge pill, price), so the editor sees
// the customer-facing result while typing. Values flow to the site through the
// content export + cms-merge bridge once the product is published.
function StorefrontPreview({ name, catLabel, shortSpec, warranty, badge, price, currency, heroId, published }: {
  name: string; catLabel: string; shortSpec: string; warranty: string; badge: string;
  price: string; currency: string; heroId: number | null; published: boolean;
}) {
  const INK = '#1F2A37'; const MUTED = '#66748A';
  return (
    <div style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Storefront preview</span>
        <span style={{ fontWeight: 700, letterSpacing: 0.2, textTransform: 'none', fontSize: 10.5, color: published ? '#0F6B54' : '#8A5A00', background: published ? '#E4F8F2' : '#FBF3E2', border: `1px solid ${published ? '#BFE8DC' : '#E8CE9A'}`, borderRadius: 999, padding: '1px 8px' }}>
          {published ? '● live on next export' : '● draft — not on site'}
        </span>
      </div>
      {/* the card itself — same visual rhythm as the public shop grid */}
      <div style={{ border: '1px solid #EDF1F5', borderRadius: 10, padding: 12, background: '#FFFFFF', boxShadow: '0 1px 2px rgba(31,42,55,.04)' }}>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#0F6B54', border: '1px solid #BFE8DC', background: '#F2FBF8', borderRadius: 999, padding: '2px 10px', marginBottom: 8 }}>{catLabel}</span>
        <div style={{ width: '100%', aspectRatio: '4 / 3', borderRadius: 8, background: 'linear-gradient(135deg,#F4F7FA,#E9EEF4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative' }}>
          {heroId
            ? <img src={API + '/admin/media/' + heroId + '/file?variant=card'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <span style={{ color: '#B7C2CF', fontSize: 12.5 }}>no hero image</span>}
          {badge && (
            <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10.5, fontWeight: 800, color: '#fff', background: '#1DBF9F', borderRadius: 999, padding: '2px 9px' }}>{badge}</span>
          )}
        </div>
        <div style={{ fontWeight: 800, color: INK, fontSize: 14.5, lineHeight: 1.3 }}>{name}</div>
        {shortSpec && <div style={{ color: MUTED, fontSize: 12.5, marginTop: 3 }}>{shortSpec}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {warranty && <span style={{ fontSize: 11, fontWeight: 700, color: INK, border: '1px solid #DCE3EB', borderRadius: 6, padding: '2px 8px' }}>🛡 {warranty}</span>}
          {price.trim() !== '' && Number.isFinite(Number(price)) && (
            <span style={{ fontSize: 13, fontWeight: 800, color: INK, marginLeft: 'auto' }}>{currency} {Number(price).toFixed(2)}</span>
          )}
        </div>
      </div>
      <div style={{ color: '#93A0B4', fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
        Mirrors the public shop card. Published products reach the site on the next content export (build prebuild, or the manual export tool).
      </div>
    </div>
  );
}

// ---- Phase 3.1: Variants & SKUs tab -------------------------------------
type VariantRow = {
  id: number; productId: number; sku: string;
  attrs: { capacity?: string; speed?: string; finish?: string; lighting?: string; priceUsd?: number | null; status?: string; stock?: number };
};

function VariantsTab({ productId, baseSku, canWrite }: { productId: number; baseSku: string; canWrite: boolean }) {
  const { data, error, loading, reload } = useAsync<{ items: VariantRow[] }>(() => apiGet(`/admin/products/${productId}/variants`), [productId]);
  const [capacity, setCapacity] = useState('16GB');
  const [speed, setSpeed] = useState('');
  const [finish, setFinish] = useState('');
  const [lighting, setLighting] = useState<'RGB' | 'Non-RGB' | ''>('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [status, setStatus] = useState<'active' | 'discontinued'>('active');
  const [sku, setSku] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Suggested SKU: base SKU + capacity + speed + lighting (e.g. VLT-DDR5-16GB-6000-RGB)
  const suggested = useMemo(() => {
    const parts = [baseSku, capacity, speed, lighting].filter(Boolean).join('-').toUpperCase();
    return parts.replace(/[^A-Z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  }, [baseSku, capacity, speed, lighting]);

  function reset() { setEditId(null); setSku(''); setPrice(''); setStock('0'); setStatus('active'); setErr(null); }

  function loadForEdit(v: VariantRow) {
    setEditId(v.id); setSku(v.sku);
    setCapacity(v.attrs.capacity ?? ''); setSpeed(v.attrs.speed ?? ''); setFinish(v.attrs.finish ?? '');
    setLighting((v.attrs.lighting as 'RGB' | 'Non-RGB') ?? '');
    setPrice(v.attrs.priceUsd != null ? String(v.attrs.priceUsd) : '');
    setStock(String(v.attrs.stock ?? 0));
    setStatus((v.attrs.status as 'active' | 'discontinued') ?? 'active');
  }

  async function submit() {
    if (!canWrite) return;
    setErr(null);
    if (!capacity.trim()) { setErr('Capacity is required (e.g. 16GB, 32GB, 1TB).'); return; }
    const finalSku = (sku.trim() || suggested).toUpperCase();
    if (!/^[A-Z0-9-]{3,40}$/.test(finalSku)) { setErr('SKU must be 3-40 chars of A-Z, 0-9 and dashes.'); return; }
    const p = price.trim() === '' ? null : Number(price);
    if (p != null && !Number.isFinite(p)) { setErr('Price must be a number (or empty).'); return; }
    const body = {
      attrs: {
        capacity: capacity.trim(),
        ...(speed.trim() ? { speed: speed.trim() } : {}),
        ...(finish.trim() ? { finish: finish.trim() } : {}),
        ...(lighting ? { lighting } : {}),
      },
      sku: finalSku, priceUsd: p, status, stock: Math.max(0, Math.trunc(Number(stock) || 0)),
    };
    setBusy(true);
    try {
      if (editId != null) await apiSend('PATCH', `/admin/products/${productId}/variants/${editId}`, body);
      else await apiSend('POST', `/admin/products/${productId}/variants`, body);
      reset(); reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed.');
    } finally { setBusy(false); }
  }

  async function remove(v: VariantRow) {
    setErr(null); setBusy(true);
    try { await apiSend('DELETE', `/admin/products/${productId}/variants/${v.id}`); reload(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Delete failed.'); }
    finally { setBusy(false); }
  }

  const items = data?.items ?? [];

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SectionCard title={editId != null ? 'Edit variant' : 'Add variant'}>
        {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px' }}>{err}</p>}
        <div style={formGrid()}>
          <Field label="Capacity *">
            <input style={{ ...input, width: '100%' }} placeholder="16GB / 32GB / 1TB" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></Field>
          <Field label="Speed">
            <input style={{ ...input, width: '100%' }} placeholder="6000MT/s" value={speed} onChange={(e) => setSpeed(e.target.value)} /></Field>
          <Field label="Finish">
            <input style={{ ...input, width: '100%' }} placeholder="Black / Titanium" value={finish} onChange={(e) => setFinish(e.target.value)} /></Field>
          <Field label="Lighting">
            <select style={{ ...input, width: '100%' }} value={lighting} onChange={(e) => setLighting(e.target.value as 'RGB' | 'Non-RGB' | '')}>
              <option value="">—</option><option>RGB</option><option>Non-RGB</option>
            </select></Field>
          <Field label="SKU" hint={`(suggested: ${suggested || '—'})`}>
            <input style={{ ...input, width: '100%' }} placeholder={suggested} value={sku} onChange={(e) => setSku(e.target.value)} /></Field>
          <Field label="Price (USD)">
            <input style={{ ...input, width: '100%' }} placeholder="e.g. 74.50" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
          <Field label="Stock">
            <input style={{ ...input, width: '100%' }} inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} /></Field>
          <Field label="Status">
            <select style={{ ...input, width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'discontinued')}>
              <option value="active">active</option><option value="discontinued">discontinued</option>
            </select></Field>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {canWrite && <button style={btn} disabled={busy} onClick={submit}>{busy ? 'Saving…' : editId != null ? 'Save variant' : 'Add variant'}</button>}
          {editId != null && <button style={btnGhost} onClick={reset}>Cancel edit</button>}
          {!canWrite && <span style={{ color: '#93A0B4', fontSize: 12.5, alignSelf: 'center' }}>Read-only — editor role required to manage variants.</span>}
        </div>
      </SectionCard>

      <SectionCard title={`Variants (${items.length})`} style={{ paddingBottom: 12 }}>
        {error ? <Err error={error} /> : loading ? <p>Loading…</p> : items.length === 0 ? (
          <Empty text="No variants yet — add capacities, speeds, finishes and lighting above." />
        ) : (
          <Table head={['SKU', 'Attributes', 'Price', 'Stock', 'Status', '']}>
            {items.map((v) => (
              <tr key={v.id}>
                <td style={td}><b>{v.sku}</b></td>
                <td style={td}>
                  <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
                    {[v.attrs.capacity, v.attrs.speed, v.attrs.finish, v.attrs.lighting].filter(Boolean).map((a, i) => (
                      <span key={i} style={{ fontSize: 11, background: '#F1F4F8', color: '#475467', borderRadius: 5, padding: '1px 7px' }}>{a}</span>
                    ))}
                  </span>
                </td>
                <td style={td}>{v.attrs.priceUsd != null ? <b>${Number(v.attrs.priceUsd).toFixed(2)}</b> : <span style={{ color: '#93A0B4' }}>—</span>}</td>
                <td style={td}>{v.attrs.stock ?? 0}</td>
                <td style={td}><Badge value={v.attrs.status ?? 'active'} /></td>
                <td style={{ ...td, width: 110 }}>
                  {canWrite && <>
                    <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12, marginRight: 4 }} onClick={() => loadForEdit(v)}>Edit</button>
                    <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12 }} disabled={busy} onClick={() => remove(v)}>✕</button>
                  </>}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </SectionCard>
    </div>
  );
}

// ---- Phase 3.3: bulk CSV import / export modal ---------------------------
type ImportReport = {
  dryRun: boolean; committed: boolean; total: number; validCount: number; createCount: number; updateCount: number;
  rows: Array<{ line: number; action: 'create' | 'update'; sku: string; name: string }>;
  errors: Array<{ line: number; sku?: string; message: string }>;
};

/** P2.2: one-click content-bridge refresh — POST /admin/content/export
 * regenerates cms-content.js from the API's own DB handle (safe while the
 * API is live; the CLI exporter needs the API stopped). */
function RefreshBridgeButton() {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  async function refresh() {
    setBusy(true); setNote(null);
    try {
      const r = await apiSend<{ counts: { products: number; compatRules: number; distributors: number; jobs: number } }>('POST', '/admin/content/export', {});
      setNote(`Bridge refreshed — ${r.counts.products} products, ${r.counts.compatRules} compat rules`);
    } catch (e) {
      setNote(e instanceof ApiError ? `Refresh failed — ${e.message}` : 'Refresh failed.');
    } finally { setBusy(false); }
  }
  return (
    <button style={btnGhost} onClick={refresh} disabled={busy} title="Regenerate the public site's cms-content.js from the live database (editor+)">
      {busy ? 'Refreshing…' : 'Refresh site content'}{note ? ` · ${note}` : ''}
    </button>
  );
}

function BulkModal({ canImport, onClose, onDone }: { canImport: boolean; onClose: () => void; onDone: () => void }) {
  const [csv, setCsv] = useState('');
  const [report, setReport] = useState<ImportReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function download(path: string, fallbackName: string) {
    fetch(API + path, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
      .then((b) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b); a.download = fallbackName; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      })
      .catch(() => setErr('Download failed — is the API running?'));
  }

  async function run(dryRun: boolean) {
    setErr(null); setBusy(true);
    try {
      const res = await apiSend<ImportReport>('POST', '/admin/products/import', { csv, dryRun });
      setReport(res);
      if (!dryRun) onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Import failed.');
    } finally { setBusy(false); }
  }

  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(10,22,40,.45)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 20 };
  const card: React.CSSProperties = { width: 'min(760px, 94vw)', maxHeight: '84vh', overflowY: 'auto', background: '#fff', borderRadius: 14, boxShadow: '0 30px 80px rgba(2,12,28,.5)', padding: 18 };
  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Bulk import and export">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <b style={{ fontSize: 15, color: '#1F2A37', flex: 1 }}>Bulk import &amp; export</b>
          <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={onClose}>✕</button>
        </div>
        {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 12px', whiteSpace: 'pre-wrap' }}>{err}</p>}

        <div style={{ border: '1px solid #E6EBF1', borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <b style={{ fontSize: 13 }}>1 · Get the data</b>
          <p style={{ margin: '6px 0 10px', fontSize: 12.5, color: '#66748A' }}>
            Download the template to see the exact columns (sku, slug, name, brand, category, status, currency, priceUsd, description —
            brand and category are slugs, currency must be one of the authorized six), or export the full catalog.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={btnGhost} onClick={() => download('/admin/products/import-template.csv', 'twinmos-products-template.csv')}>⬇ CSV template</button>
            <button style={btnGhost} onClick={() => download('/admin/products/export.csv', 'twinmos-products.csv')}>⬇ Export catalog CSV</button>
          </div>
        </div>

        <div style={{ border: '1px solid #E6EBF1', borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <b style={{ fontSize: 13 }}>2 · Upload your CSV</b>
          <p style={{ margin: '6px 0 10px', fontSize: 12.5, color: '#66748A' }}>Choose a .csv file, then validate it first — nothing is written during a dry-run.</p>
          <input type="file" accept=".csv,text/csv" style={input} disabled={!canImport}
            onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              f.text().then((t) => { setCsv(t); setReport(null); setErr(null); });
            }} />
          {csv && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#0E9F7E', fontWeight: 700 }}>✓ Loaded {csv.split(/\r?\n/).filter((l) => l.trim()).length - 1} data row(s)</p>}
        </div>

        <div style={{ border: '1px solid #E6EBF1', borderRadius: 10, padding: 12 }}>
          <b style={{ fontSize: 13 }}>3 · Validate, then import</b>
          <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
            <button style={btnGhost} disabled={!canImport || !csv || busy} onClick={() => run(true)}>{busy ? 'Working…' : 'Validate (dry-run)'}</button>
            <button style={btn} disabled={!canImport || !csv || busy || !report || report.errors.length > 0 || report.validCount === 0} onClick={() => run(false)}>
              Import {report ? `${report.validCount} row(s)` : ''}
            </button>
          </div>

          {report && (
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: report.committed ? '#E7F6EE' : '#F1F4F8', color: report.committed ? '#1F9D62' : '#475467' }}>
                  {report.committed ? `✓ Committed — ${report.createCount} created, ${report.updateCount} updated` : `Dry-run — ${report.validCount}/${report.total} valid (${report.createCount} new, ${report.updateCount} updates)`}
                </span>
                {report.errors.length > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#FCECEB', color: '#C2453C' }}>{report.errors.length} error(s)</span>
                )}
              </div>
              {report.errors.length > 0 && (
                <div style={{ border: '1px solid #F5D5D2', background: '#FDF6F5', borderRadius: 8, padding: 8, marginBottom: 8, maxHeight: 140, overflowY: 'auto' }}>
                  {report.errors.map((e, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#C2453C', padding: '2px 0' }}>
                      <b>Line {e.line}{e.sku ? ` (${e.sku})` : ''}:</b> {e.message}
                    </div>
                  ))}
                </div>
              )}
              {report.rows.length > 0 && (
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  <Table head={['Line', 'Action', 'SKU', 'Name']}>
                    {report.rows.map((r) => (
                      <tr key={r.line}>
                        <td style={td}>{r.line}</td>
                        <td style={td}>{r.action === 'create'
                          ? <span style={{ fontSize: 11, background: '#E7F7F2', color: '#0E9F7E', borderRadius: 5, padding: '1px 7px', fontWeight: 700 }}>create</span>
                          : <span style={{ fontSize: 11, background: '#FBF3E2', color: '#8A6420', borderRadius: 5, padding: '1px 7px', fontWeight: 700 }}>update</span>}</td>
                        <td style={td}><b>{r.sku}</b></td>
                        <td style={td}>{r.name}</td>
                      </tr>
                    ))}
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
