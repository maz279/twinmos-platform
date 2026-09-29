// Phase 3.2 — Compatibility Matrix (QVL): validated motherboard / laptop
// compatibility rules backing the public compatibility-finder widgets.
// CRUD over GET/POST/PATCH/DELETE /admin/compatibility; every mutation is
// editor-guarded and audited server-side. Rules are matched by device brand
// + model, memory generation (DDR4/DDR5), form factor and max capacity.
import { useMemo, useState } from 'react';
import { apiSend, apiGet } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';
import { COMPAT_MEMORY_GENS, COMPAT_FORM_FACTORS } from '@twinmos/shared';

type Rule = {
  id: number; deviceBrand: string; deviceModel: string;
  memoryGen: string | null; formFactor: string | null; maxGb: number | null; notes: string | null;
};

export default function Compatibility({ canWrite }: { canWrite: boolean }) {
  const [q, setQ] = useState('');
  const [gen, setGen] = useState('');
  const query = useMemo(() => {
    const qs = new URLSearchParams();
    if (q.trim()) qs.set('q', q.trim());
    if (gen) qs.set('memoryGen', gen);
    return qs.toString();
  }, [q, gen]);
  const { data, error, loading, reload } = useAsync<{ items: Rule[] }>(() => apiGet('/admin/compatibility' + (query ? '?' + query : '')), [query]);

  // add / edit form state
  const [editId, setEditId] = useState<number | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [memoryGen, setMemoryGen] = useState('');
  const [formFactor, setFormFactor] = useState('');
  const [maxGb, setMaxGb] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function reset() {
    setEditId(null); setBrand(''); setModel(''); setMemoryGen(''); setFormFactor(''); setMaxGb(''); setNotes(''); setErr(null);
  }

  function loadForEdit(r: Rule) {
    setEditId(r.id); setBrand(r.deviceBrand); setModel(r.deviceModel);
    setMemoryGen(r.memoryGen ?? ''); setFormFactor(r.formFactor ?? '');
    setMaxGb(r.maxGb != null ? String(r.maxGb) : ''); setNotes(r.notes ?? ''); setErr(null);
  }

  async function submit() {
    if (!canWrite) return;
    setErr(null);
    if (!brand.trim() || !model.trim()) { setErr('Device brand and model are required.'); return; }
    const gb = maxGb.trim() === '' ? null : Number(maxGb);
    if (gb != null && (!Number.isInteger(gb) || gb < 1 || gb > 1024)) { setErr('Max RAM must be a whole number of GB between 1 and 1024 (or empty).'); return; }
    const body = {
      deviceBrand: brand.trim(), deviceModel: model.trim(),
      memoryGen: memoryGen || null, formFactor: formFactor || null,
      maxGb: gb, notes: notes.trim() || null,
    };
    setBusy(true);
    try {
      if (editId != null) await apiSend('PATCH', '/admin/compatibility/' + editId, body);
      else await apiSend('POST', '/admin/compatibility', body);
      reset(); reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed.');
    } finally { setBusy(false); }
  }

  async function remove(r: Rule) {
    setErr(null); setBusy(true);
    try { await apiSend('DELETE', '/admin/compatibility/' + r.id); reload(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Delete failed.'); }
    finally { setBusy(false); }
  }

  const label: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#93A0B4', display: 'block', margin: '10px 0 4px' };
  const card: React.CSSProperties = { border: '1px solid #E6EBF1', borderRadius: 12, padding: '4px 16px 16px', background: '#fff' };
  const items = data?.items ?? [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Compatibility Matrix</h1>
      </div>
      <p style={{ margin: '2px 0 12px', color: '#66748A', fontSize: 13 }}>
        QVL rules powering the public compatibility finder — validated motherboards and laptops per memory generation, form factor and maximum capacity.
      </p>

      <div style={{ display: 'flex', gap: 8, margin: '0 0 12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...input, width: 240 }} placeholder="Search brand or model (e.g. ASUS, Z790)…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select style={input} value={gen} onChange={(e) => setGen(e.target.value)}>
          <option value="">All generations</option>
          {COMPAT_MEMORY_GENS.map((g) => <option key={g}>{g}</option>)}
        </select>
        {(q || gen) && <button style={btnGhost} onClick={() => { setQ(''); setGen(''); }}>Reset</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,2fr) 3fr', gap: 12, alignItems: 'start' }}>
        <div style={card}>
          <h3 style={{ marginTop: 12 }}>{editId != null ? 'Edit rule' : 'Add rule'}</h3>
          {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px' }}>{err}</p>}
          <label style={label}>Device brand *</label>
          <input style={{ ...input, width: '100%' }} placeholder="ASUS / MSI / Dell / Lenovo…" value={brand} onChange={(e) => setBrand(e.target.value)} />
          <label style={label}>Model / chipset *</label>
          <input style={{ ...input, width: '100%' }} placeholder="ROG STRIX Z790-E / Latitude 5540…" value={model} onChange={(e) => setModel(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <span><label style={label}>Memory gen</label>
              <select style={{ ...input, width: '100%' }} value={memoryGen} onChange={(e) => setMemoryGen(e.target.value)}>
                <option value="">—</option>
                {COMPAT_MEMORY_GENS.map((g) => <option key={g}>{g}</option>)}
              </select></span>
            <span><label style={label}>Form factor</label>
              <select style={{ ...input, width: '100%' }} value={formFactor} onChange={(e) => setFormFactor(e.target.value)}>
                <option value="">—</option>
                {COMPAT_FORM_FACTORS.map((f) => <option key={f}>{f}</option>)}
              </select></span>
          </div>
          <label style={label}>Max RAM (GB)</label>
          <input style={{ ...input, width: '100%' }} placeholder="e.g. 128" inputMode="numeric" value={maxGb} onChange={(e) => setMaxGb(e.target.value)} />
          <label style={label}>Notes</label>
          <textarea style={{ ...input, width: '100%', minHeight: 64, fontFamily: 'inherit' }} placeholder="Validated speed profiles, slot layout, caveats…"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {canWrite && <button style={btn} disabled={busy} onClick={submit}>{busy ? 'Saving…' : editId != null ? 'Save rule' : 'Add rule'}</button>}
            {editId != null && <button style={btnGhost} onClick={reset}>Cancel edit</button>}
            {!canWrite && <span style={{ color: '#93A0B4', fontSize: 12.5, alignSelf: 'center' }}>Read-only — editor role required.</span>}
          </div>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 12 }}>Rules ({items.length})</h3>
          {error ? <Err error={error} /> : loading ? <p>Loading…</p> : items.length === 0 ? (
            <Empty text="No compatibility rules match — add the first QVL entry on the left." />
          ) : (
            <Table head={['Device', 'Gen', 'Form factor', 'Max RAM', 'Notes', '']}>
              {items.map((r) => (
                <tr key={r.id}>
                  <td style={td}>
                    <b style={{ color: '#1F2A37' }}>{r.deviceBrand}</b>
                    <div style={{ color: '#93A0B4', fontSize: 11.5 }}>{r.deviceModel}</div>
                  </td>
                  <td style={td}>{r.memoryGen ? <Badge value={r.memoryGen.toLowerCase()} /> : <span style={{ color: '#93A0B4' }}>—</span>}</td>
                  <td style={td}>{r.formFactor ?? <span style={{ color: '#93A0B4' }}>—</span>}</td>
                  <td style={td}>{r.maxGb != null ? <b>{r.maxGb} GB</b> : <span style={{ color: '#93A0B4' }}>—</span>}</td>
                  <td style={{ ...td, color: '#66748A', fontSize: 12, maxWidth: 220 }}>{r.notes ?? ''}</td>
                  <td style={{ ...td, width: 110 }}>
                    {canWrite && <>
                      <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12, marginRight: 4 }} onClick={() => loadForEdit(r)}>Edit</button>
                      <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12 }} disabled={busy} onClick={() => remove(r)}>✕</button>
                    </>}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
