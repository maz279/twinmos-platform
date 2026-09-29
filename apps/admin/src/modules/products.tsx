// Products (P8 iteration 2) — full catalog management: searchable/filterable
// list with hero thumbnails and pricing, plus a complete editor covering
// basics, pricing, marketing copy, media (hero + gallery via the media picker),
// specifications (key/value), badges and datasheets. Deep-linkable per product
// via tab ctx { kind:'product', id }.
import React, { useEffect, useMemo, useState } from 'react';
import { API, apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';
import { MediaPicker } from '../media-picker';
import { AUTHORIZED_CURRENCIES } from '@twinmos/shared';
import type { ModProps, TabCtx } from '../nav';

const NAVY = '#1F2A37'; const CYAN = '#1DBF9F';

type Product = {
  id: number; sku: string; slug: string; name: string; brandId: number; categoryId: number;
  status: string; specs: Record<string, unknown>; description: string;
  priceUsd: string | null; currency: string;
  heroMediaId: number | null; gallery: number[] | null; datasheets: Array<{ label: string; url: string }> | null;
  badges: string[] | null; releasedAt: string | null; createdAt: string; updatedAt: string;
};
type Taxonomy = { brands: Array<{ id: number; name: string; slug: string }>; categories: Array<{ id: number; name: string; slug: string }> };

export default function Products({ canWrite, ctx, nav }: ModProps) {
  const focusId = ctx?.kind === 'product' && ctx.id ? Number(ctx.id) : null;
  const [editing, setEditing] = useState<number | 'new' | null>(focusId ?? null);
  useEffect(() => { if (focusId != null && Number.isFinite(focusId)) setEditing(focusId); }, [focusId]);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const query = useMemo(() => {
    const qs = new URLSearchParams();
    if (q.trim()) qs.set('q', q.trim());
    if (status) qs.set('status', status);
    return qs.toString();
  }, [q, status]);
  const { data, error, loading, reload } = useAsync<{ items: Product[] }>(() => apiGet('/admin/products' + (query ? '?' + query : '')), [query]);
  const tax = useAsync<Taxonomy>(() => apiGet('/admin/taxonomy'), []);

  if (editing !== null) {
    return <Editor id={editing === 'new' ? null : editing} taxonomy={tax.data} canWrite={canWrite}
      onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />;
  }

  const brandName = (id: number) => tax.data?.brands.find((b) => b.id === id)?.name ?? `#${id}`;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Products</h1>
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ New product</button>}
        <span style={{ flex: 1 }} />
        <input style={{ ...input, width: 240 }} placeholder="Search name or SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['draft', 'in_review', 'scheduled', 'published', 'archived'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
        <Table head={['', 'SKU', 'Product', 'Price', 'Status', 'Updated', '']}>
          {data.items.map((p) => (
            <tr key={p.id} onClick={() => setEditing(p.id)} style={{ cursor: 'pointer' }} title="Open editor">
              <td style={{ ...td, width: 56 }}>
                <span style={{ display: 'block', width: 44, height: 33, borderRadius: 6, background: '#E7EEF5', overflow: 'hidden' }}>
                  {p.heroMediaId && <img src={API + '/admin/media/' + p.heroMediaId + '/file'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </span>
              </td>
              <td style={td}><b>{p.sku}</b></td>
              <td style={td}>
                <b style={{ color: NAVY }}>{p.name}</b>
                <div style={{ color: '#8CA3BA', fontSize: 11.5 }}>{brandName(p.brandId)} · {p.slug}</div>
                {(p.badges ?? []).slice(0, 4).map((b) => <span key={b} style={{ fontSize: 10.5, background: '#EAF6FC', color: '#0E7FB8', borderRadius: 5, padding: '1px 6px', marginRight: 4 }}>{b}</span>)}
              </td>
              <td style={td}>{p.priceUsd != null ? <b>{(p.currency || 'USD')} {Number(p.priceUsd).toFixed(2)}</b> : <span style={{ color: '#8CA3BA' }}>—</span>}</td>
              <td style={td}><Badge value={p.status} /></td>
              <td style={{ ...td, color: '#5E7691', fontSize: 12 }}>{fmtDate(p.updatedAt)}</td>
              <td style={{ ...td, width: 70 }}>
                <button style={{ ...btnGhost, padding: '4px 9px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); nav('products', { kind: 'product', id: String(p.id), label: p.sku }, { newTab: true }); }}>Tab ↗</button>
              </td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No products match — run npm run db:seed or clear the filters." />}
    </div>
  );
}

function Editor({ id, taxonomy, canWrite, onDone, onCancel }: {
  id: number | null; taxonomy: Taxonomy | null; canWrite: boolean; onDone: () => void; onCancel: () => void;
}) {
  const isNew = id == null;
  const { data: existing, error, loading } = useAsync<Product | null>(() => (isNew ? Promise.resolve(null) : apiGet('/admin/products/' + id)), [id]);
  const [form, setForm] = useState({
    sku: '', slug: '', name: '', brandId: 0, categoryId: 0, status: 'draft',
    description: '', price: '', currency: 'USD', badges: '',
  });
  const [specs, setSpecs] = useState<Array<[string, string]>>([]);
  const [hero, setHero] = useState<number | null>(null);
  const [gallery, setGallery] = useState<number[]>([]);
  const [datasheets, setDatasheets] = useState<Array<{ label: string; url: string }>>([]);
  const [picker, setPicker] = useState<null | 'hero' | 'gallery'>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    setForm({
      sku: existing.sku, slug: existing.slug, name: existing.name,
      brandId: existing.brandId ?? 0, categoryId: existing.categoryId ?? 0, status: existing.status,
      description: existing.description ?? '', price: existing.priceUsd != null ? String(Number(existing.priceUsd)) : '',
      currency: existing.currency ?? 'USD', badges: (existing.badges ?? []).join(', '),
    });
    setSpecs(Object.entries(existing.specs ?? {}).map(([k, v]) => [k, String(v)]));
    setHero(existing.heroMediaId ?? null);
    setGallery(existing.gallery ?? []);
    setDatasheets(existing.datasheets ?? []);
  }, [existing]);

  if (!isNew && loading) return <p>Loading…</p>;
  if (!isNew && error) return <Err error={error} />;

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
      specs: Object.fromEntries(specs.filter(([k]) => k.trim()).map(([k, v]) => [k.trim(), v])),
      heroMediaId: hero, gallery, datasheets: datasheets.filter((d) => d.label && d.url),
    };
    setBusy(true);
    try {
      if (isNew) {
        if (!form.sku || !form.name || !form.brandId || !form.categoryId) { setErr('SKU, name, brand and category are required for a new product.'); setBusy(false); return; }
        await apiSend('POST', '/admin/products', body);
      } else {
        await apiSend('PATCH', '/admin/products/' + id, body);
      }
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed.');
    } finally { setBusy(false); }
  }

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: NAVY, display: 'block', margin: '12px 0 4px' };
  const sectionStyle: React.CSSProperties = { border: '1px solid #E3EBF3', borderRadius: 12, padding: '4px 16px 16px', background: '#fff', minWidth: 0 };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button style={btnGhost} onClick={onCancel}>← Back to list</button>
        <h1 style={{ margin: 0, fontSize: 20 }}>{isNew ? 'New product' : `Edit ${existing?.sku ?? ''}`}</h1>
        {!isNew && existing && <Badge value={form.status} />}
        <span style={{ flex: 1 }} />
        {canWrite && !isNew && form.status !== 'published' && <button style={btnGhost} disabled={busy} onClick={() => save(true)}>Publish</button>}
        {canWrite && <button style={btn} disabled={busy} onClick={() => save(false)}>{busy ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}</button>}
      </div>
      {err && <p role="alert" style={{ color: '#B3261E', background: '#FDECEA', borderRadius: 8, padding: '8px 12px' }}>{err}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={sectionStyle}>
            <h3 style={{ marginTop: 12 }}>Basics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <span><label style={labelStyle}>Name *</label><input style={{ ...input, width: '100%' }} value={form.name} onChange={(e) => set('name', e.target.value)} /></span>
              <span><label style={labelStyle}>SKU * <span style={{ color: '#8CA3BA', fontWeight: 400 }}>(A-Z 0-9 -)</span></label><input style={{ ...input, width: '100%' }} value={form.sku} onChange={(e) => set('sku', e.target.value)} disabled={!isNew} /></span>
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
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...input, width: '100%', minHeight: 120, fontFamily: 'inherit' }} placeholder="Marketing copy shown on the product page…"
              value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div style={sectionStyle}>
            <h3 style={{ marginTop: 12 }}>Specifications</h3>
            {specs.map(([k, v], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 30px', gap: 8, marginBottom: 6 }}>
                <input style={input} placeholder="Label (e.g. Speed)" value={k} onChange={(e) => setSpecs((s) => s.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} />
                <input style={input} placeholder="Value (e.g. 6000 MT/s)" value={v} onChange={(e) => setSpecs((s) => s.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} />
                <button style={{ ...btnGhost, padding: '4px 8px' }} title="Remove" onClick={() => setSpecs((s) => s.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setSpecs((s) => [...s, ['', '']])}>+ Add specification</button>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ marginTop: 12 }}>Datasheets</h3>
            {datasheets.map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 30px', gap: 8, marginBottom: 6 }}>
                <input style={input} placeholder="Label" value={d.label} onChange={(e) => setDatasheets((s) => s.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))} />
                <input style={input} placeholder="https://… (PDF URL)" value={d.url} onChange={(e) => setDatasheets((s) => s.map((r, j) => (j === i ? { ...r, url: e.target.value } : r)))} />
                <button style={{ ...btnGhost, padding: '4px 8px' }} title="Remove" onClick={() => setDatasheets((s) => s.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            {datasheets.length < 6 && <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setDatasheets((s) => [...s, { label: '', url: '' }])}>+ Add datasheet</button>}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div style={sectionStyle}>
            <h3 style={{ marginTop: 12 }}>Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 8 }}>
              <span><label style={labelStyle}>List price</label><input style={{ ...input, width: '100%' }} placeholder="e.g. 129.99" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} /></span>
              <span><label style={labelStyle}>Cur.</label>
                <select style={{ ...input, width: '100%' }} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                  {AUTHORIZED_CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select></span>
            </div>
            <label style={labelStyle}>Badges <span style={{ color: '#8CA3BA', fontWeight: 400 }}>(comma separated, max 8)</span></label>
            <input style={{ ...input, width: '100%' }} placeholder="New, Best seller,…" value={form.badges} onChange={(e) => set('badges', e.target.value)} />
          </div>

          <div style={sectionStyle}>
            <h3 style={{ marginTop: 12 }}>Images</h3>
            <label style={labelStyle}>Hero image</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 96, height: 72, borderRadius: 8, background: '#E7EEF5', overflow: 'hidden', display: 'block', flexShrink: 0 }}>
                {hero && <img src={API + '/admin/media/' + hero + '/file'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </span>
              <button style={btnGhost} onClick={() => setPicker('hero')}>{hero ? 'Change' : 'Choose'}</button>
              {hero && <button style={{ ...btnGhost, padding: '4px 8px' }} onClick={() => setHero(null)}>✕</button>}
            </div>
            <label style={labelStyle}>Gallery ({gallery.length}/12)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {gallery.map((g) => (
                <span key={g} style={{ position: 'relative', width: 64, height: 48, borderRadius: 6, background: '#E7EEF5', overflow: 'hidden' }}>
                  <img src={API + '/admin/media/' + g + '/file'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button title="Remove" onClick={() => setGallery((s) => s.filter((x) => x !== g))}
                    style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, border: 0, borderRadius: 4, background: 'rgba(10,37,64,.75)', color: '#fff', fontSize: 10, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                </span>
              ))}
            </div>
            <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setPicker('gallery')}>+ Add gallery images</button>
          </div>

          {!isNew && existing && (
            <div style={{ ...sectionStyle, color: '#8CA3BA', fontSize: 12 }}>
              <h3 style={{ marginTop: 12, color: NAVY }}>Record</h3>
              Created {fmtDate(existing.createdAt)} · Updated {fmtDate(existing.updatedAt)} · ID #{existing.id}
            </div>
          )}
        </div>
      </div>

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
