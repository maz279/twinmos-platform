// Phase 3.2 + 0017 — Compatibility Matrix (QVL): the rules behind the public
// compatibility finder. Every field the finder renders is managed here —
// device type tab (laptop/desktop/DIY/mini-PC), brand, model, memory gen,
// form factor, max RAM, slot count, validated speed, recommended product
// categories, SSD upgrade line — plus a batch CSV import with mandatory
// dry-run for QVL lists that arrive by the hundreds. CRUD over
// GET/POST/PATCH/DELETE /admin/compatibility (+ /import); every mutation is
// editor-guarded and audited server-side.
import { useMemo, useState } from 'react';
import { apiSend, apiGet } from '../api';
import { Badge, btn, btnGhost, Empty, Err, Field, formGrid, input, PageHeader, SectionCard, Table, td, Toolbar, useAsync, usePanelScroll } from '../ui';
import { COMPAT_MEMORY_GENS, COMPAT_FORM_FACTORS, COMPAT_DEVICE_TYPES } from '@twinmos/shared';

type Rule = {
  id: number; deviceType: string; deviceBrand: string; deviceModel: string;
  memoryGen: string | null; formFactor: string | null; maxGb: number | null;
  slots: number | null; speed: string | null;
  cats: string[] | null; ssdNote: string | null; ssdCats: string[] | null;
  notes: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  laptop: 'Laptop', desktop: 'Desktop PC', diy: 'Motherboard (DIY)', minipc: 'Mini PC / NUC',
};
/** Product-category slugs the finder can recommend (mirrors the public catalog taxonomy). */
const KNOWN_CATS = ['dram-gaming', 'dram-desktop', 'dram-notebook', 'ssd-nvme', 'ssd-sata', 'portable-ssd', 'portable-hdd', 'flash', 'microsd', 'psu', 'hub'];
const CSV_TEMPLATE = 'deviceType,deviceBrand,deviceModel,memoryGen,formFactor,maxGb,slots,speed,cats,ssdNote,ssdCats,notes\n'
  + 'laptop,Lenovo,IdeaPad Slim 3 (DDR4),DDR4,SO-DIMM,16,1,DDR4-3200,dram-notebook,M.2 2280 NVMe,ssd-nvme,One SODIMM slot';

export default function Compatibility({ canWrite }: { canWrite: boolean }) {
  const [q, setQ] = useState('');
  const [gen, setGen] = useState('');
  const [type, setType] = useState('');
  const [query, setQuery] = useState({ q: '', gen: '', type: '' });
  const [editing, setEditing] = useState<Rule | 'new' | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data, error, loading, reload } = useAsync<{ items: Rule[] }>(() => {
    const qs = new URLSearchParams();
    if (query.q) qs.set('q', query.q);
    if (query.gen) qs.set('memoryGen', query.gen);
    if (query.type) qs.set('deviceType', query.type);
    return apiGet('/admin/compatibility' + (qs.toString() ? '?' + qs.toString() : ''));
  }, [query.q, query.gen, query.type]);

  const items = data?.items ?? [];
  const coverage = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const r of items) byType[r.deviceType] = (byType[r.deviceType] ?? 0) + 1;
    return byType;
  }, [items]);

  return (
    <div>
      <PageHeader
        title="Compatibility Matrix"
        subtitle="QVL rules powering the public compatibility finder — validated devices with max RAM, slots, speed, recommended categories and SSD upgrade paths."
        style={{ marginBottom: 12 }}
      />

      <Toolbar>
        <input style={{ ...input, width: 240 }} placeholder="Search brand or model (e.g. ASUS, Z790)…"
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setQuery({ q: q.trim(), gen, type }); }} />
        <select style={input} value={type} onChange={(e) => { setType(e.target.value); setQuery({ q, gen, type: e.target.value }); }} title="Device type tab in the finder">
          <option value="">All types</option>
          {COMPAT_DEVICE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
        <select style={input} value={gen} onChange={(e) => { setGen(e.target.value); setQuery({ q, gen: e.target.value, type }); }}>
          <option value="">All generations</option>
          {COMPAT_MEMORY_GENS.map((g) => <option key={g}>{g}</option>)}
        </select>
        <button style={btnGhost} onClick={() => setQuery({ q: q.trim(), gen, type })}>Search</button>
        {(query.q || query.gen || query.type) && (
          <button style={btnGhost} onClick={() => { setQ(''); setGen(''); setType(''); setQuery({ q: '', gen: '', type: '' }); }}>Reset</button>
        )}
        <span style={{ flex: 1 }} />
        {canWrite && <button style={btnGhost} onClick={() => setImportOpen(true)} title="Batch CSV import with a dry-run row report">Import CSV</button>}
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ Add rule</button>}
      </Toolbar>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '0 0 10px', fontSize: 12, color: '#66748A' }}>
        <span>{items.length} rule{items.length === 1 ? '' : 's'}</span>
        {COMPAT_DEVICE_TYPES.map((t) => (
          <span key={t} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            · {TYPE_LABEL[t]}: <b style={{ color: '#1F2A37' }}>{coverage[t] ?? 0}</b>
          </span>
        ))}
      </div>

      {importOpen && <ImportCard canWrite={canWrite} onDone={reload} onClose={() => setImportOpen(false)} />}
      {editing && (
        <Editor
          key={editing === 'new' ? 'new' : `rule-${(editing as Rule).id}`}
          rule={editing === 'new' ? null : editing}
          canWrite={canWrite}
          brands={[...new Set(items.map((r) => r.deviceBrand))]}
          onDone={() => { setEditing(null); reload(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : items.length === 0 ? (
        <Empty text="No compatibility rules match — add the first QVL entry or import a batch CSV." />
      ) : (
        <Table head={['Device', 'Type', 'Memory', 'Max / slots', 'Speed', 'Recommends', 'SSD', '']}>
          {items.map((r) => (
            <tr key={r.id} onClick={() => setEditing(r)} style={{ cursor: 'pointer' }} title="Open editor">
              <td style={td}>
                <b style={{ color: '#1F2A37' }}>{r.deviceBrand}</b>
                <div style={{ color: '#66748A', fontSize: 11.5 }}>{r.deviceModel}</div>
              </td>
              <td style={td}>{TYPE_LABEL[r.deviceType] ?? r.deviceType}</td>
              <td style={td}>
                {r.memoryGen ? <Badge value={r.memoryGen.toLowerCase()} /> : <span style={{ color: '#93A0B4' }}>—</span>}
                <div style={{ fontSize: 11.5, color: '#66748A', marginTop: 2 }}>{r.formFactor ?? ''}</div>
              </td>
              <td style={td}>
                {r.maxGb != null ? <b>{r.maxGb} GB</b> : <span style={{ color: '#93A0B4' }}>—</span>}
                <div style={{ fontSize: 11.5, color: '#66748A', marginTop: 2 }}>{r.slots != null ? r.slots + ' slot' + (r.slots > 1 ? 's' : '') : ''}</div>
              </td>
              <td style={{ ...td, fontSize: 12 }}>{r.speed ?? <span style={{ color: '#93A0B4' }}>—</span>}</td>
              <td style={{ ...td, fontSize: 11.5, color: '#66748A', maxWidth: 150 }}>{(r.cats ?? []).join(', ') || '—'}</td>
              <td style={{ ...td, fontSize: 11.5, color: '#66748A', maxWidth: 150 }}>
                {r.ssdNote ? <>{r.ssdNote}<div style={{ color: '#93A0B4' }}>{(r.ssdCats ?? []).join(', ')}</div></> : <span style={{ color: '#93A0B4' }}>—</span>}
              </td>
              <td style={{ ...td, width: 70 }}>
                {canWrite && <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); remove(r.id, reload); }}>✕</button>}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

async function remove(id: number, reload: () => void) {
  try { await apiSend('DELETE', '/admin/compatibility/' + id); reload(); }
  catch { /* the list reload surfaces state; per-row toasts live in ui.tsx callers */ }
}

function Editor({ rule, canWrite, brands, onDone, onCancel }: {
  rule: Rule | null; canWrite: boolean; brands: string[]; onDone: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    deviceType: rule?.deviceType ?? 'laptop',
    deviceBrand: rule?.deviceBrand ?? '',
    deviceModel: rule?.deviceModel ?? '',
    memoryGen: rule?.memoryGen ?? '',
    formFactor: rule?.formFactor ?? '',
    maxGb: rule?.maxGb != null ? String(rule.maxGb) : '',
    slots: rule?.slots != null ? String(rule.slots) : '',
    speed: rule?.speed ?? '',
    cats: (rule?.cats ?? []).join('; '),
    ssdNote: rule?.ssdNote ?? '',
    ssdCats: (rule?.ssdCats ?? []).join('; '),
    notes: rule?.notes ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const panelRef = usePanelScroll<HTMLDivElement>();

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#1F2A37', display: 'block', margin: '12px 0 4px' };

  async function save() {
    setErr(null);
    const gb = form.maxGb.trim() === '' ? null : Number(form.maxGb);
    if (gb != null && (!Number.isInteger(gb) || gb < 1 || gb > 1024)) { setErr('Max RAM must be a whole number of GB between 1 and 1024 (or empty).'); return; }
    const slots = form.slots.trim() === '' ? null : Number(form.slots);
    if (slots != null && (!Number.isInteger(slots) || slots < 1 || slots > 16)) { setErr('Slots must be a whole number 1-16 (or empty).'); return; }
    const body = {
      deviceType: form.deviceType,
      deviceBrand: form.deviceBrand.trim(), deviceModel: form.deviceModel.trim(),
      memoryGen: form.memoryGen || null, formFactor: form.formFactor || null,
      maxGb: gb, slots, speed: form.speed.trim() || null,
      cats: form.cats.split(';').map((s) => s.trim()).filter(Boolean).slice(0, 8),
      ssdNote: form.ssdNote.trim() || null,
      ssdCats: form.ssdCats.split(';').map((s) => s.trim()).filter(Boolean).slice(0, 8),
      notes: form.notes.trim() || null,
    };
    if (!body.deviceBrand || !body.deviceModel) { setErr('Device brand and model are required.'); return; }
    setBusy(true);
    try {
      if (rule) await apiSend('PATCH', '/admin/compatibility/' + rule.id, body);
      else await apiSend('POST', '/admin/compatibility', body);
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed.');
    } finally { setBusy(false); }
  }

  return (
    <div ref={panelRef}>
    <SectionCard title={rule ? `Edit rule — ${rule.deviceBrand} ${rule.deviceModel}` : 'Add rule'} style={{ marginBottom: 12 }}>
      {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px' }}>{err}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Field label="Device type *">
          <select style={{ ...input, width: '100%' }} value={form.deviceType} onChange={(e) => set('deviceType', e.target.value)}>
            {COMPAT_DEVICE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select></Field>
        <Field label="Device brand *">
          <input style={{ ...input, width: '100%' }} placeholder="ASUS / Lenovo / HP…" list="tm-compat-brands" value={form.deviceBrand} onChange={(e) => set('deviceBrand', e.target.value)} /></Field>
        <Field label="Model / chipset *">
          <input style={{ ...input, width: '100%' }} placeholder="ROG STRIX Z790-E / IdeaPad Slim 3…" value={form.deviceModel} onChange={(e) => set('deviceModel', e.target.value)} /></Field>
      </div>
      <datalist id="tm-compat-brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
      <div style={formGrid()}>
        <Field label="Memory gen">
          <select style={{ ...input, width: '100%' }} value={form.memoryGen} onChange={(e) => set('memoryGen', e.target.value)}>
            <option value="">—</option>
            {COMPAT_MEMORY_GENS.map((g) => <option key={g}>{g}</option>)}
          </select></Field>
        <Field label="Form factor">
          <select style={{ ...input, width: '100%' }} value={form.formFactor} onChange={(e) => set('formFactor', e.target.value)}>
            <option value="">—</option>
            {COMPAT_FORM_FACTORS.map((f) => <option key={f}>{f}</option>)}
          </select></Field>
        <Field label="Max RAM (GB)">
          <input style={{ ...input, width: '100%' }} placeholder="e.g. 64" inputMode="numeric" value={form.maxGb} onChange={(e) => set('maxGb', e.target.value)} /></Field>
        <Field label="Slots">
          <input style={{ ...input, width: '100%' }} placeholder="e.g. 2" inputMode="numeric" value={form.slots} onChange={(e) => set('slots', e.target.value)} /></Field>
      </div>
      <Field label="Validated speed">
        <input style={{ ...input, width: '100%' }} placeholder="e.g. DDR5-5600" value={form.speed} onChange={(e) => set('speed', e.target.value)} />
      </Field>
      <div style={formGrid()}>
        <Field label="Recommends (categories)" hint="; separated — product categories the finder suggests">
          <input style={{ ...input, width: '100%' }} placeholder="dram-notebook; dram-gaming" list="tm-compat-cats" value={form.cats} onChange={(e) => set('cats', e.target.value)} /></Field>
        <Field label="SSD upgrade note">
          <input style={{ ...input, width: '100%' }} placeholder="e.g. M.2 2280 NVMe + 2.5″ bay" value={form.ssdNote} onChange={(e) => set('ssdNote', e.target.value)} /></Field>
      </div>
      <datalist id="tm-compat-cats">{KNOWN_CATS.map((c) => <option key={c} value={c} />)}</datalist>
      <Field label="SSD categories" hint="; separated">
        <input style={{ ...input, width: '100%' }} placeholder="ssd-nvme; ssd-sata" list="tm-compat-cats" value={form.ssdCats} onChange={(e) => set('ssdCats', e.target.value)} />
      </Field>
      <Field label="Notes">
        <textarea style={{ ...input, width: '100%', minHeight: 64, fontFamily: 'inherit' }} placeholder="Validated speed profiles, slot layout, caveats…"
          value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {canWrite && <button style={btn} disabled={busy} onClick={save}>{busy ? 'Saving…' : rule ? 'Save rule' : 'Add rule'}</button>}
        <button style={btnGhost} onClick={onCancel}>Cancel</button>
        {!canWrite && <span style={{ color: '#93A0B4', fontSize: 12.5, alignSelf: 'center' }}>Read-only — editor role required.</span>}
      </div>
    </SectionCard>
    </div>
  );
}

type ImportReport = {
  dryRun: boolean; wouldCreate?: number; wouldUpdate?: number; imported?: number; updated?: number;
  errors?: Array<{ line: number; message: string }>;
};

function ImportCard({ canWrite, onDone, onClose }: { canWrite: boolean; onDone: () => void; onClose: () => void }) {
  const [csv, setCsv] = useState('');
  const [report, setReport] = useState<ImportReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run(dryRun: boolean) {
    setErr(null); setBusy(true);
    try {
      const res = await apiSend<ImportReport>('POST', '/admin/compatibility/import', { csv, dryRun });
      setReport(res);
      if (!dryRun) onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Import failed.');
    } finally { setBusy(false); }
  }

  return (
    <SectionCard title="Batch CSV import" style={{ marginBottom: 12 }}>
      {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '6px 10px' }}>{err}</p>}
      <p style={{ color: '#66748A', fontSize: 12.5, marginTop: 0 }}>
        Header: <code>deviceType,deviceBrand,deviceModel,memoryGen,formFactor,maxGb,slots,speed,cats,ssdNote,ssdCats,notes</code> —
        cats/ssdCats are <b>;</b>-separated inside the cell. Rows upsert by type + brand + model + gen + form factor.
      </p>
      <textarea style={{ ...input, width: '100%', minHeight: 140, fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}
        placeholder={CSV_TEMPLATE} value={csv} onChange={(e) => { setCsv(e.target.value); setReport(null); }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button style={btnGhost} onClick={() => setCsv(CSV_TEMPLATE)}>Insert sample</button>
        {canWrite ? <>
          <button style={btnGhost} disabled={busy || !csv.trim()} onClick={() => run(true)}>Validate (dry run)</button>
          <button style={btn} disabled={busy || !csv.trim()} onClick={() => run(false)} title="Validates first; any row error aborts with no changes">
            {busy ? 'Working…' : 'Import batch'}
          </button>
        </> : <span style={{ color: '#93A0B4', fontSize: 12.5, alignSelf: 'center' }}>Read-only — editor role required.</span>}
        <span style={{ flex: 1 }} />
        <button style={btnGhost} onClick={onClose}>Close</button>
      </div>
      {report && (
        <div style={{ marginTop: 10, fontSize: 13 }}>
          {report.dryRun ? (
            <span>Would create <b>{report.wouldCreate ?? 0}</b>, update <b>{report.wouldUpdate ?? 0}</b>. {report.errors?.length ? 'Fix the errors below.' : 'No row errors — safe to import.'}</span>
          ) : (
            <span>Imported <b>{report.imported ?? 0}</b>, updated <b>{report.updated ?? 0}</b> — audited.</span>
          )}
          {!!report.errors?.length && (
            <div style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, marginTop: 8, maxHeight: 200, overflow: 'auto' }}>
              {report.errors.map((e) => <div key={e.line}>Line {e.line}: {e.message}</div>)}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
