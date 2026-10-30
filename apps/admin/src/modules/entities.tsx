// Truth & Entities module (Phase 4 completion):
//   • Policies — versioned rows, version compare (T4.3.3), publish only with
//     legal approval recorded (T4.3.4).
//   • Offices / Testimonials — provenance-backed editors (T4.7.3).
//   • Form definitions — labels, help text, order, options, success/error and
//     privacy copy (T4.7.4); routing email stays internal.
import React, { useEffect, useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, CommandBar, Empty, Err, input, MUTED, PageHeader, Table, td, useAsync, usePanelScroll } from '../ui';
import type { ModProps } from '../nav';

const label: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, display: 'block', margin: '10px 0 4px' };
const card: React.CSSProperties = { border: '1px solid #E6EBF1', borderRadius: 12, padding: '4px 16px 16px', background: '#fff' };

type Policy = { id: number; slug: string; title: string; version: string; status: string; effectiveDate: string | null; publishedAt: string | null; legalApproved: boolean; approvedBy: string | null; changeSummary: string | null; summary: string | null; body: string; cookieCategories: unknown; locale: string; source: string | null; approver: string | null };
type Office = { id: number; role: string; title: string; entity: string; address: string; flag: string | null; note: string | null; status: string; sort: number; source: string | null; approver: string | null };
type Testimonial = { id: number; quote: string; author: string; role: string | null; context: string | null; sort: number; permissionFlag: boolean; permissionEvidence: string | null; status: string; locale: string; source: string | null; approver: string | null };
type FormDef = { id: number; type: string; title: string; description: string | null; successMessage: string | null; errorMessage: string | null; routingEmail: string | null; privacyNotice: string | null; isActive: boolean };
type FormFieldRow = { id: number; formId: number; name: string; label: string; type: string; placeholder: string | null; helpText: string | null; required: boolean; options: unknown; sort: number };

export default function Entities({ canWrite }: ModProps) {
  const [tab, setTab] = useState<'policies' | 'glossary' | 'offices' | 'testimonials' | 'forms'>('policies');
  return (
    <div style={{ padding: '18px 22px', maxWidth: 1100 }}>
      <PageHeader title="Truth & Entities" subtitle="Versioned policies, the technical glossary, the approved office registry, permission-backed testimonials and form definitions." />
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {([['policies', 'Policies'], ['glossary', 'Glossary'], ['offices', 'Offices'], ['testimonials', 'Testimonials'], ['forms', 'Form definitions']] as const).map(([k, l]) => (
          <button key={k} style={tab === k ? btn : btnGhost} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'policies' && <Policies canWrite={canWrite} />}
      {tab === 'glossary' && <Glossary canWrite={canWrite} />}
      {tab === 'offices' && <Offices canWrite={canWrite} />}
      {tab === 'testimonials' && <Testimonials canWrite={canWrite} />}
      {tab === 'forms' && <Forms canWrite={canWrite} />}
    </div>
  );
}

// ---------------- Glossary (CRUD /admin/entities/glossary) ----------------

type GlossaryRow = {
  id: number; term: string; definition: string; letter: string | null;
  explainerSlug: string | null; status: string; locale: string;
  translationGroup: string | null; source: string | null; approver: string | null;
};

/** Technical glossary feeding the public glossary index and term lookups
 *  (GET /delivery/glossary). Definition text is engineering-approved copy. */
function Glossary({ canWrite }: { canWrite: boolean }) {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<GlossaryRow | 'new' | null>(null);
  const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  const { data, error, loading, reload } = useAsync<{ items: GlossaryRow[] }>(() => apiGet(`/admin/entities/glossary${qs}`), [q]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  async function remove(row: GlossaryRow) {
    if (!window.confirm(`Delete glossary term “${row.term}”?`)) return;
    setBusy(true); setErr(null);
    try { await apiSend('DELETE', `/admin/entities/glossary/${row.id}`); reload(); }
    catch (e) { setErr(e); } finally { setBusy(false); }
  }

  if (editing) return <GlossaryEditor row={editing === 'new' ? null : editing} canWrite={canWrite}
    onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <CommandBar style={{ gap: 10 }}>
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ New term</button>}
        <span style={{ flex: 1 }} />
        <input style={{ ...input, width: 220 }} placeholder="Search term or definition…" aria-label="Search glossary" value={q} onChange={(e) => setQ(e.target.value)} />
        <span style={{ color: MUTED, fontSize: 12 }}>{data?.items?.length ?? 0} terms</span>
      </CommandBar>
      {err ? <Err error={err} /> : null}
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : (
        <Table head={['Term', 'Status', 'Locale', 'Explainer', '']}>
          {(data?.items ?? []).map((g) => (
            <tr key={g.id}>
              <td style={td}><b>{g.term}</b> <span style={{ color: MUTED, fontSize: 11 }}>({g.letter})</span>
                <div style={{ color: MUTED, fontSize: 11.5, maxWidth: 480 }}>{g.definition.slice(0, 140)}{g.definition.length > 140 ? '…' : ''}</div>
              </td>
              <td style={td}><Badge value={g.status} /></td>
              <td style={td}>{g.locale}</td>
              <td style={td}>{g.explainerSlug ?? '—'}</td>
              <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {canWrite && <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setEditing(g)}>Edit</button>}{' '}
                {canWrite && <button style={{ ...btnGhost, fontSize: 12 }} disabled={busy} onClick={() => remove(g)}>Delete</button>}
              </td>
            </tr>
          ))}
          {(data?.items ?? []).length === 0 && <tr><td style={td} colSpan={5}><Empty text="No glossary terms match." /></td></tr>}
        </Table>
      )}
    </div>
  );
}

function GlossaryEditor({ row, canWrite, onDone, onCancel }: { row: GlossaryRow | null; canWrite: boolean; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    term: row?.term ?? '',
    definition: row?.definition ?? '',
    letter: row?.letter ?? '',
    explainerSlug: row?.explainerSlug ?? '',
    status: row?.status ?? 'published',
    locale: row?.locale ?? 'en',
    source: row?.source ?? 'Engineering datasheets',
    approver: row?.approver ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setErr(null);
    if (!form.term.trim() || !form.definition.trim()) { setErr('Term and definition are required.'); return; }
    setBusy(true);
    const body: Record<string, unknown> = {
      term: form.term.trim(),
      definition: form.definition.trim(),
      status: form.status,
      locale: form.locale,
      source: form.source.trim() || null,
      approver: form.approver.trim() || null,
    };
    if (form.letter.trim()) body.letter = form.letter.trim().toUpperCase().slice(0, 2);
    if (form.explainerSlug.trim()) body.explainerSlug = form.explainerSlug.trim();
    try {
      if (row) await apiSend('PATCH', `/admin/entities/glossary/${row.id}`, body);
      else await apiSend('POST', '/admin/entities/glossary', body);
      onDone();
    } catch (e) {
      const problem = e as { message?: string; detail?: string };
      setErr(problem?.message ? `${problem.message}${problem.detail ? ` — ${problem.detail}` : ''}` : String(e));
    } finally { setBusy(false); }
  }

  return (
    <div style={card}>
      <h3 style={{ fontSize: 15 }}>{row ? `Edit — ${row.term}` : 'New glossary term'}</h3>
      {err && <p style={{ color: '#C2453C', fontSize: 12.5 }}>{err}</p>}
      <label style={label} htmlFor="g-term">Term</label>
      <input id="g-term" style={input} value={form.term} onChange={(e) => set('term', e.target.value)} placeholder="e.g. CAS Latency (CL)" />
      <label style={label} htmlFor="g-def">Definition</label>
      <textarea id="g-def" style={{ ...input, width: '100%', minHeight: 100, fontFamily: 'inherit' }} value={form.definition} onChange={(e) => set('definition', e.target.value)} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 120px' }}>
          <label style={label} htmlFor="g-letter">Letter</label>
          <input id="g-letter" style={input} maxLength={2} value={form.letter} onChange={(e) => set('letter', e.target.value)} placeholder="C" />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={label} htmlFor="g-slug">Explainer article slug</label>
          <input id="g-slug" style={input} value={form.explainerSlug} onChange={(e) => set('explainerSlug', e.target.value)} placeholder="cas-latency-explained" />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={label} htmlFor="g-status">Status</label>
          <select id="g-status" style={input} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {['draft', 'in_review', 'published', 'archived'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 90px' }}>
          <label style={label} htmlFor="g-locale">Locale</label>
          <input id="g-locale" style={input} value={form.locale} onChange={(e) => set('locale', e.target.value)} />
        </div>
      </div>
      <label style={label} htmlFor="g-source">Source</label>
      <input id="g-source" style={input} value={form.source} onChange={(e) => set('source', e.target.value)} />
      <label style={label} htmlFor="g-approver">Approver</label>
      <input id="g-approver" style={input} value={form.approver} onChange={(e) => set('approver', e.target.value)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={btn} disabled={busy || !canWrite} onClick={save}>{row ? 'Save changes' : 'Create term'}</button>
        <button style={btnGhost} onClick={onCancel}>Cancel</button>
        {!canWrite && <span style={{ color: MUTED, fontSize: 12.5, alignSelf: 'center' }}>Editor role required to save.</span>}
      </div>
    </div>
  );
}

// ---------------- Policies (T4.3.3 / T4.3.4) ----------------

function Policies({ canWrite }: { canWrite: boolean }) {
  const { data, error, loading, reload } = useAsync<{ items: Policy[] }>(() => apiGet('/admin/entities/policies'), []);
  const [editing, setEditing] = useState<Policy | 'new' | null>(null);
  const [versions, setVersions] = useState<{ slug: string; rows: Policy[] } | null>(null);
  const [compare, setCompare] = useState<{ from: string; to: string; changes: Array<{ field: string; from: unknown; to: unknown }> } | null>(null);
  if (loading) return <p>Loading…</p>;
  if (error) return <Err error={error} />;
  const items = data?.items ?? [];

  async function openVersions(slug: string) {
    const d = await apiGet<{ items: Policy[] }>(`/admin/entities/policies/${slug}/versions`);
    setVersions({ slug, rows: d.items ?? [] });
    setCompare(null);
  }

  async function runCompare(slug: string, from: string, to: string) {
    const d = await apiGet<{ changes: Array<{ field: string; from: unknown; to: unknown }> }>(`/admin/entities/policies/${slug}/versions/compare?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    setCompare({ from, to, changes: d.changes ?? [] });
  }

  if (editing) return <PolicyEditor row={editing === 'new' ? null : editing} canWrite={canWrite} onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <CommandBar style={{ gap: 10 }}>
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ New policy version</button>}
        {versions && <button style={btnGhost} onClick={() => { setVersions(null); setCompare(null); }}>← All policies</button>}
        <span style={{ flex: 1 }} />
        <span style={{ color: MUTED, fontSize: 12 }}>{versions ? `Version history — ${versions.slug}` : `${items.length} policy rows`}</span>
      </CommandBar>
      {!versions && (
        <Table head={['Policy', 'Version', 'Status', 'Legal', 'Effective', '']}>
          {items.map((p) => (
            <tr key={p.id}>
              <td style={td}><b>{p.title}</b><div style={{ color: MUTED, fontSize: 11.5 }}>{p.slug} · {p.locale}</div></td>
              <td style={td}>v{p.version}</td>
              <td style={td}><Badge value={p.status} /></td>
              <td style={td}>{p.legalApproved ? `✓ ${p.approvedBy ?? 'approved'}` : '—'}</td>
              <td style={td}>{p.effectiveDate ? fmtDate(p.effectiveDate) : '—'}</td>
              <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => openVersions(p.slug)}>Versions</button>{' '}
                {canWrite && <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setEditing(p)}>Edit</button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td style={td} colSpan={6}><Empty text="No policies yet." /></td></tr>}
        </Table>
      )}
      {versions && (
        <div style={card}>
          <h3 style={{ fontSize: 15 }}>Version history — {versions.slug}</h3>
          <p style={{ color: MUTED, fontSize: 12.5, margin: '4px 0 10px' }}>Publishing a new version archives the previous one — rows are never overwritten (T4.3.3).</p>
          <Table head={['Version', 'Status', 'Effective', 'Published', 'Change summary', 'Compare']}>
            {versions.rows.map((v) => (
              <tr key={v.id}>
                <td style={td}>v{v.version}</td>
                <td style={td}><Badge value={v.status} /></td>
                <td style={td}>{v.effectiveDate ? fmtDate(v.effectiveDate) : '—'}</td>
                <td style={td}>{v.publishedAt ? fmtDate(v.publishedAt) : '—'}</td>
                <td style={td}>{v.changeSummary ?? '—'}</td>
                <td style={td}>
                  <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => {
                    const other = versions.rows.find((o) => o.version !== v.version);
                    if (other) void runCompare(versions.slug, other.version, v.version);
                  }}>vs {versions.rows.find((o) => o.version !== v.version)?.version ?? '?'}</button>
                </td>
              </tr>
            ))}
          </Table>
          {compare && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ fontSize: 13 }}>Compare v{compare.from} → v{compare.to}</h4>
              {compare.changes.length === 0 && <p style={{ color: '#08705C', fontSize: 12.5 }}>No differences in tracked fields.</p>}
              {compare.changes.map((c) => (
                <div key={c.field} style={{ borderTop: '1px solid #E6EBF1', padding: '8px 0' }}>
                  <b style={{ fontSize: 12 }}>{c.field}</b>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5, color: '#4A5568' }}>
                    <div><span style={{ color: '#93A0B4' }}>v{compare.from}:</span> {typeof c.from === 'string' ? c.from.slice(0, 160) : JSON.stringify(c.from)}</div>
                    <div><span style={{ color: '#93A0B4' }}>v{compare.to}:</span> {typeof c.to === 'string' ? c.to.slice(0, 160) : JSON.stringify(c.to)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PolicyEditor({ row, canWrite, onDone, onCancel }: { row: Policy | null; canWrite: boolean; onDone: () => void; onCancel: () => void }) {
  const panelRef = usePanelScroll<HTMLDivElement>();
  const [form, setForm] = useState({
    slug: row?.slug ?? '', title: row?.title ?? '', version: row?.version ?? '',
    status: row?.status ?? 'draft', legalApproved: row?.legalApproved ?? false,
    approvedBy: row?.approvedBy ?? 'Arthur Pendelton', changeSummary: row?.changeSummary ?? '',
    summary: row?.summary ?? '', body: row?.body ?? '', effectiveDate: row?.effectiveDate ? row.effectiveDate.slice(0, 10) : '',
    source: row?.source ?? 'docs/BUSINESS_DECISION_LOG.md §3 (legal sign-off)', approver: row?.approver ?? 'Arthur Pendelton',
    locale: row?.locale ?? 'en',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setErr(null);
    if (!form.slug.trim() || !form.version.trim()) { setErr('Slug and version are required.'); return; }
    if (form.status === 'published' && !form.legalApproved) { setErr('T4.3.4: publishing requires recorded legal approval.'); return; }
    setBusy(true);
    const body = {
      slug: form.slug.trim(), title: form.title.trim(), version: form.version.trim(), status: form.status,
      legalApproved: form.legalApproved, approvedBy: form.approvedBy || null,
      changeSummary: form.changeSummary || null, summary: form.summary || null, body: form.body,
      effectiveDate: form.effectiveDate ? new Date(form.effectiveDate).toISOString() : null,
      source: form.source || null, approver: form.approver || null, locale: form.locale,
    };
    try {
      if (row) await apiSend('PATCH', `/admin/entities/policies/${row.id}`, body);
      else await apiSend('POST', '/admin/entities/policies', body);
      onDone();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  }

  return (
    <div ref={panelRef} style={{ display: 'grid', gap: 12, maxWidth: 860 }}>
      <CommandBar style={{ gap: 10 }}>
        <button style={btnGhost} onClick={onCancel}>← Back to policies</button>
        <h2 style={{ margin: 0, fontSize: 18 }}>{row ? `Edit ${row.slug} v${row.version}` : 'New policy version'}</h2>
        <span style={{ flex: 1 }} />
        {canWrite && <button style={btn} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>}
      </CommandBar>
      {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 12px' }}>{err}</p>}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
          <span><label style={label}>Slug *</label><input style={{ ...input, width: '100%' }} value={form.slug} onChange={(e) => set('slug', e.target.value)} disabled={Boolean(row)} /></span>
          <span><label style={label}>Version *</label><input style={{ ...input, width: '100%' }} placeholder="e.g. 3.6" value={form.version} onChange={(e) => set('version', e.target.value)} /></span>
          <span><label style={label}>Locale</label><input style={{ ...input, width: '100%' }} value={form.locale} onChange={(e) => set('locale', e.target.value)} /></span>
          <span><label style={label}>Effective date</label><input style={{ ...input, width: '100%' }} type="date" value={form.effectiveDate} onChange={(e) => set('effectiveDate', e.target.value)} /></span>
        </div>
        <label style={label}>Title</label>
        <input style={{ ...input, width: '100%' }} value={form.title} onChange={(e) => set('title', e.target.value)} />
        <label style={label}>Summary</label>
        <input style={{ ...input, width: '100%' }} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
        <label style={label}>Change summary (this version)</label>
        <input style={{ ...input, width: '100%' }} value={form.changeSummary} onChange={(e) => set('changeSummary', e.target.value)} />
        <label style={label}>Body (markdown)</label>
        <textarea style={{ ...input, width: '100%', minHeight: 200, fontFamily: 'inherit' }} value={form.body} onChange={(e) => set('body', e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
          <span><label style={label}>Status</label>
            <select style={{ ...input, width: '100%' }} value={form.status} onChange={(e) => set('status', e.target.value)}>
              {['draft', 'in_review', 'scheduled', 'published', 'archived'].map((s) => <option key={s}>{s}</option>)}
            </select></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <input id="legal" type="checkbox" checked={form.legalApproved} onChange={(e) => set('legalApproved', e.target.checked)} />
            <label htmlFor="legal" style={{ fontSize: 13 }}>Legal approved (PRIV-01)</label>
          </span>
          <span><label style={label}>Approved by</label><input style={{ ...input, width: '100%' }} value={form.approvedBy} onChange={(e) => set('approvedBy', e.target.value)} /></span>
          <span><label style={label}>Source (provenance)</label><input style={{ ...input, width: '100%' }} value={form.source} onChange={(e) => set('source', e.target.value)} /></span>
          <span><label style={label}>Approver (provenance)</label><input style={{ ...input, width: '100%' }} value={form.approver} onChange={(e) => set('approver', e.target.value)} /></span>
        </div>
      </div>
    </div>
  );
}

// ---------------- Offices (T4.7.3) ----------------

function Offices({ canWrite }: { canWrite: boolean }) {
  const { data, error, loading, reload } = useAsync<{ items: Office[] }>(() => apiGet('/admin/entities/offices'), []);
  const [editing, setEditing] = useState<Office | 'new' | null>(null);
  if (loading) return <p>Loading…</p>;
  if (error) return <Err error={error} />;
  if (editing) {
    return <SimpleEditor
      title={editing === 'new' ? 'New office' : `Edit ${editing.title}`}
      fields={[
        { k: 'title', l: 'Title *', t: 'text' }, { k: 'role', l: 'Role', t: 'text' }, { k: 'entity', l: 'Legal entity', t: 'text' },
        { k: 'address', l: 'Address *', t: 'text', full: true }, { k: 'flag', l: 'ISO flag', t: 'text' }, { k: 'note', l: 'Note', t: 'text', full: true },
        { k: 'sort', l: 'Sort', t: 'number' },
        { k: 'source', l: 'Source (provenance) *', t: 'text', full: true }, { k: 'approver', l: 'Approver (provenance) *', t: 'text' },
      ]}
      initial={editing === 'new' ? { status: 'draft', source: '', approver: '', title: '', role: '', entity: '', address: '', flag: '', note: '', sort: 99 } : editing as unknown as Record<string, unknown>}
      statusOptions={['draft', 'published']}
      canWrite={canWrite}
      save={(id, body) => apiSend('PATCH', `/admin/entities/offices/${id}`, body)}
      onDone={reload} onCancel={() => setEditing(null)}
    />;
  }
  const items = data?.items ?? [];
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <CommandBar style={{ gap: 10 }}>
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ New office</button>}
        <span style={{ flex: 1 }} /><span style={{ color: MUTED, fontSize: 12 }}>{items.length} offices · BD-03 approved registry</span>
      </CommandBar>
      <Table head={['Title', 'Role', 'Address', 'Status', 'Provenance', '']}>
        {items.map((o) => (
          <tr key={o.id}>
            <td style={td}><b>{o.title}</b>{o.flag ? ` ${o.flag}` : ''}</td>
            <td style={td}>{o.role}</td>
            <td style={td}>{o.address}</td>
            <td style={td}><Badge value={o.status} /></td>
            <td style={{ ...td, fontSize: 11.5, color: MUTED }}>{o.source ? `${o.source} · ${o.approver}` : '—'}</td>
            <td style={{ ...td, textAlign: 'right' }}>{canWrite && <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setEditing(o)}>Edit</button>}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ---------------- Testimonials (T4.7.3) ----------------

function Testimonials({ canWrite }: { canWrite: boolean }) {
  const { data, error, loading, reload } = useAsync<{ items: Testimonial[] }>(() => apiGet('/admin/entities/testimonials'), []);
  const [editing, setEditing] = useState<Testimonial | 'new' | null>(null);
  if (loading) return <p>Loading…</p>;
  if (error) return <Err error={error} />;
  if (editing) {
    return <SimpleEditor
      title={editing === 'new' ? 'New testimonial' : `Edit ${editing.author}`}
      fields={[
        { k: 'quote', l: 'Quote *', t: 'textarea', full: true }, { k: 'author', l: 'Author *', t: 'text' },
        { k: 'role', l: 'Role', t: 'text' }, { k: 'context', l: 'Context', t: 'text' }, { k: 'sort', l: 'Sort', t: 'number' },
        { k: 'permissionEvidence', l: 'Permission evidence (required to publish) *', t: 'text', full: true },
        { k: 'source', l: 'Source (provenance) *', t: 'text', full: true }, { k: 'approver', l: 'Approver (provenance) *', t: 'text' },
      ]}
      toggles={[{ k: 'permissionFlag', l: 'Written release on file' }]}
      initial={editing === 'new' ? { status: 'draft', quote: '', author: '', role: '', context: '', sort: 0, permissionFlag: false, permissionEvidence: '', source: '', approver: '' } : editing as unknown as Record<string, unknown>}
      statusOptions={['draft', 'in_review', 'published', 'archived']}
      canWrite={canWrite}
      save={(id, body) => apiSend('PATCH', `/admin/entities/testimonials/${id}`, body)}
      onDone={reload} onCancel={() => setEditing(null)}
    />;
  }
  const items = data?.items ?? [];
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <CommandBar style={{ gap: 10 }}>
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ New testimonial</button>}
        <span style={{ flex: 1 }} /><span style={{ color: MUTED, fontSize: 12 }}>{items.length} testimonials</span>
      </CommandBar>
      <Table head={['Author', 'Quote', 'Status', 'Release', 'Provenance', '']}>
        {items.map((t) => (
          <tr key={t.id}>
            <td style={td}><b>{t.author}</b><div style={{ color: MUTED, fontSize: 11.5 }}>{t.role ?? ''}</div></td>
            <td style={{ ...td, maxWidth: 320 }}>{t.quote.slice(0, 110)}…</td>
            <td style={td}><Badge value={t.status} /></td>
            <td style={td}>{t.permissionFlag ? '✓ written' : '—'}</td>
            <td style={{ ...td, fontSize: 11.5, color: MUTED }}>{t.source ? `${t.source} · ${t.approver}` : '—'}</td>
            <td style={{ ...td, textAlign: 'right' }}>{canWrite && <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setEditing(t)}>Edit</button>}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ---------------- Form definitions (T4.7.4) ----------------

function Forms({ canWrite }: { canWrite: boolean }) {
  const { data, error, loading, reload } = useAsync<{ items: FormDef[] }>(() => apiGet('/admin/entities/forms'), []);
  const [editing, setEditing] = useState<FormDef | null>(null);
  const [fields, setFields] = useState<FormFieldRow[] | null>(null);
  useEffect(() => {
    if (!editing) { setFields(null); return; }
    let alive = true;
    apiGet<FormDef & { fields: FormFieldRow[] }>(`/admin/entities/forms/${editing.id}`)
      .then((d) => alive && setFields(d.fields ?? []))
      .catch(() => alive && setFields([]));
    return () => { alive = false; };
  }, [editing]);
  if (loading) return <p>Loading…</p>;
  if (error) return <Err error={error} />;
  const items = data?.items ?? [];

  async function saveDef() {
    if (!editing) return;
    await apiSend('PATCH', `/admin/entities/forms/${editing.id}`, {
      title: editing.title, description: editing.description || null,
      successMessage: editing.successMessage || null, errorMessage: editing.errorMessage || null,
      routingEmail: editing.routingEmail || null, privacyNotice: editing.privacyNotice || null,
      isActive: editing.isActive,
    });
    reload();
  }
  async function saveField(f: FormFieldRow) {
    await apiSend('PATCH', `/admin/entities/forms/${editing!.id}/fields/${f.id}`, {
      label: f.label, placeholder: f.placeholder || null, helpText: f.helpText || null,
      required: f.required, sort: f.sort, options: f.options,
    });
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <CommandBar style={{ gap: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{editing ? `${editing.type} definition` : 'Form definitions'}</span>
        {editing && <button style={btnGhost} onClick={() => setEditing(null)}>← All forms</button>}
        <span style={{ flex: 1 }} />
        <span style={{ color: MUTED, fontSize: 12 }}>routing email is internal-only (C6b)</span>
      </CommandBar>
      {!editing && (
        <Table head={['Type', 'Title', 'Active', '']}>
          {items.map((f) => (
            <tr key={f.id}>
              <td style={td}><b>{f.type}</b></td>
              <td style={td}>{f.title}</td>
              <td style={td}><Badge value={f.isActive ? 'active' : 'off'} /></td>
              <td style={{ ...td, textAlign: 'right' }}>{canWrite && <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => setEditing(f)}>Edit</button>}</td>
            </tr>
          ))}
        </Table>
      )}
      {editing && (
        <div style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
            <span><label style={label}>Title</label><input style={{ ...input, width: '100%' }} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></span>
            <span><label style={label}>Success message</label><input style={{ ...input, width: '100%' }} value={editing.successMessage ?? ''} onChange={(e) => setEditing({ ...editing, successMessage: e.target.value })} /></span>
            <span><label style={label}>Error message</label><input style={{ ...input, width: '100%' }} value={editing.errorMessage ?? ''} onChange={(e) => setEditing({ ...editing, errorMessage: e.target.value })} /></span>
            <span><label style={label}>Routing email (internal)</label><input style={{ ...input, width: '100%' }} value={editing.routingEmail ?? ''} onChange={(e) => setEditing({ ...editing, routingEmail: e.target.value })} /></span>
            <span style={{ gridColumn: '1 / -1' }}><label style={label}>Just-in-time privacy notice</label><input style={{ ...input, width: '100%' }} value={editing.privacyNotice ?? ''} onChange={(e) => setEditing({ ...editing, privacyNotice: e.target.value })} /></span>
            <span style={{ gridColumn: '1 / -1' }}><label style={label}>Description</label><input style={{ ...input, width: '100%' }} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="fa" type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
              <label htmlFor="fa" style={{ fontSize: 13 }}>Active</label>
            </span>
          </div>
          {canWrite && <button style={{ ...btn, marginTop: 12 }} onClick={() => void saveDef()}>Save definition</button>}
          <h4 style={{ fontSize: 13, marginTop: 16 }}>Fields (label, help text, order, options)</h4>
          {fields === null && <p style={{ color: MUTED, fontSize: 12 }}>Loading fields…</p>}
          {fields?.map((f, i) => (
            <div key={f.id} style={{ borderTop: '1px solid #E6EBF1', padding: '8px 0', display: 'grid', gridTemplateColumns: 'minmax(120px,1fr) minmax(120px,1fr) 60px 70px minmax(140px,1.4fr)', gap: 8, alignItems: 'center' }}>
              <input style={{ ...input, width: '100%' }} aria-label="Field label" value={f.label} onChange={(e) => { const next = [...fields!]; next[i] = { ...f, label: e.target.value }; setFields(next); }} />
              <input style={{ ...input, width: '100%' }} aria-label="Field help text" placeholder="help text" value={f.helpText ?? ''} onChange={(e) => { const next = [...fields!]; next[i] = { ...f, helpText: e.target.value }; setFields(next); }} />
              <input style={{ ...input, width: '100%' }} aria-label="Sort order" type="number" value={f.sort} onChange={(e) => { const next = [...fields!]; next[i] = { ...f, sort: Number(e.target.value) }; setFields(next); }} />
              <label style={{ fontSize: 12, display: 'flex', gap: 4, alignItems: 'center' }}>
                <input type="checkbox" aria-label="Required" checked={f.required} onChange={(e) => { const next = [...fields!]; next[i] = { ...f, required: e.target.checked }; setFields(next); }} /> req
              </label>
              <input style={{ ...input, width: '100%' }} aria-label="Field options" placeholder="options (comma-separated)" value={Array.isArray(f.options) ? f.options.join(', ') : ''} onChange={(e) => { const next = [...fields!]; next[i] = { ...f, options: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) }; setFields(next); }} />
              {canWrite && <button style={{ ...btnGhost, fontSize: 11 }} onClick={() => void saveField(fields![i])}>Save</button>}
            </div>
          ))}
          <p style={{ color: MUTED, fontSize: 11.5 }}>Product options come from the catalogue at render time — leave the productInterest options empty to stay data-bound.</p>
        </div>
      )}
    </div>
  );
}

// ---------------- shared simple editor ----------------

type SimpleEditorProps = {
  title: string;
  fields: Array<{ k: string; l: string; t: 'text' | 'number' | 'textarea'; full?: boolean }>;
  toggles?: Array<{ k: string; l: string }>;
  initial: Record<string, unknown>;
  statusOptions: string[];
  canWrite: boolean;
  save: (id: number, body: Record<string, unknown>) => Promise<unknown>;
  onDone: () => void;
  onCancel: () => void;
};

function SimpleEditor({ title, fields, toggles = [], initial, statusOptions, canWrite, save, onDone, onCancel }: SimpleEditorProps): React.ReactElement {
  const panelRef = usePanelScroll<HTMLDivElement>();
  const [form, setForm] = useState<Record<string, any>>({ ...initial });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isNew = form.id == null;
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  async function submit() {
    setErr(null);
    if (form.status === 'published') {
      if (!String(form.source ?? '').trim() || !String(form.approver ?? '').trim()) { setErr('T4.7.2: publishing requires a source and an approver.'); return; }
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = {};
      for (const f of fields) {
        body[f.k] = f.t === 'number' ? Number(form[f.k] ?? 0) : (form[f.k] ?? null);
      }
      for (const t of toggles) body[t.k] = Boolean(form[t.k]);
      body.status = form.status;
      if (isNew) {
        setErr('Create happens through the API with full fields; use the seed or API for new rows, then edit here.');
        return;
      }
      await save(Number(form.id), body);
      onDone();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  }
  void canWrite;
  return (
    <div ref={panelRef} style={{ display: 'grid', gap: 12, maxWidth: 860 }}>
      <CommandBar style={{ gap: 10 }}>
        <button style={btnGhost} onClick={onCancel}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
        <span style={{ flex: 1 }} />
        <button style={btn} disabled={busy} onClick={() => void submit()}>{busy ? 'Saving…' : 'Save'}</button>
      </CommandBar>
      {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 12px' }}>{err}</p>}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
          {fields.map((f) => (
            <span key={f.k} style={f.full ? { gridColumn: '1 / -1' } : undefined}>
              <label style={label}>{f.l}</label>
              {f.t === 'textarea'
                ? <textarea style={{ ...input, width: '100%', minHeight: 90, fontFamily: 'inherit' }} value={form[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)} />
                : <input style={{ ...input, width: '100%' }} type={f.t} value={form[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)} />}
            </span>
          ))}
          {toggles.map((t) => (
            <span key={t.k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
              <input id={t.k} type="checkbox" checked={Boolean(form[t.k])} onChange={(e) => set(t.k, e.target.checked)} />
              <label htmlFor={t.k} style={{ fontSize: 13 }}>{t.l}</label>
            </span>
          ))}
          <span><label style={label}>Status</label>
            <select style={{ ...input, width: '100%' }} value={form.status ?? 'draft'} onChange={(e) => set('status', e.target.value)}>
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select></span>
        </div>
      </div>
    </div>
  );
}
