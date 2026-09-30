// Careers (Phase 5.2) — two tabs: Postings (full CRUD editor: department,
// location, type, seniority, status draft→published→closed/archived, salary
// band per BR-14.1, EO statement, markdown description, live application
// count) and Applications (status workflow). Every mutation is audited
// server-side; postings link to their applications via postingId.
import React, { useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';
import { JOB_DEPARTMENTS, JOB_LOCATIONS, JOB_TYPES, JOB_LEVELS, JOB_POSTING_STATUSES } from '@twinmos/shared';
import type { ModProps } from '../nav';

type JobApp = {
  id: number; postingId: number | null; postingTitle: string | null; email: string;
  payload: Record<string, unknown>; status: 'new' | 'assigned' | 'resolved' | 'spam';
  refCode: string; createdAt: string;
};
type Posting = {
  id: number; title: string; dept: string; location: string; type: string; level: string;
  status: 'draft' | 'published' | 'closed' | 'archived'; body: string;
  applyBy: string | null; salaryBand: string | null; equalOpportunity: boolean;
  createdAt: string; applicationCount: number;
};
const APP_STATUSES = ['new', 'assigned', 'resolved', 'spam'] as const;

export default function Jobs({ canWrite }: ModProps) {
  const [tab, setTab] = useState<'postings' | 'applications'>('postings');
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Careers</h1>
      <div style={{ display: 'flex', gap: 6, margin: '12px 0' }}>
        <button style={tab === 'postings' ? btn : btnGhost} onClick={() => setTab('postings')}>Postings</button>
        <button style={tab === 'applications' ? btn : btnGhost} onClick={() => setTab('applications')}>Applications</button>
      </div>
      {tab === 'postings' ? <Postings canWrite={canWrite} /> : <Applications canWrite={canWrite} />}
    </div>
  );
}

function Postings({ canWrite }: { canWrite: boolean }) {
  const { data, error, loading, reload } = useAsync<{ items: Posting[] }>(() => apiGet('/admin/job-postings'), []);
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [delErr, setDelErr] = useState<string | null>(null);
  async function remove(id: number) {
    if (!canWrite) return;
    setDelErr(null);
    try { await apiSend('DELETE', '/admin/job-postings/' + id, {}); reload(); }
    catch (e) { setDelErr(e instanceof Error ? e.message : 'Delete failed'); }
  }
  if (editing !== null) {
    return <PostingEditor id={editing === 'new' ? null : editing} canWrite={canWrite}
      onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />;
  }
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#93A0B4' };
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <b style={{ ...label, fontSize: 12 }}>Job postings</b>
        <span style={{ flex: 1 }} />
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ New posting</button>}
      </div>
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
        <>
          {delErr && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 12px' }}>{delErr}</p>}
          {data.items.length === 0 ? <Empty text="No postings yet — create the first role." /> : (
          <Table head={['Role', 'Department', 'Location', 'Type', 'Level', 'Status', 'Applications', '']}>
            {data.items.map((p) => (
              <tr key={p.id}>
                <td style={td}><b style={{ color: '#1F2A37' }}>{p.title}</b>
                  {p.salaryBand && <div style={{ color: '#66748A', fontSize: 11.5 }}>{p.salaryBand}</div>}
                </td>
                <td style={td}>{p.dept}</td>
                <td style={td}>{p.location}</td>
                <td style={td}>{p.type}</td>
                <td style={td}>{p.level}</td>
                <td style={td}><Badge value={p.status} /></td>
                <td style={td}><b>{p.applicationCount}</b></td>
                <td style={{ ...td, width: 110 }}>
                  {canWrite && <>
                    <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12, marginRight: 4 }} onClick={() => setEditing(p.id)}>Edit</button>
                    <button style={{ ...btnGhost, padding: '3px 8px', fontSize: 12 }} onClick={() => remove(p.id)}>✕</button>
                  </>}
                </td>
              </tr>
            ))}
          </Table>
        )}
        </>
      ) : null}

      {canWrite && data?.items.length ? null : !canWrite && <p style={{ color: '#93A0B4', fontSize: 12.5 }}>Read-only — editor role required to manage postings.</p>}
    </div>
  );
}

function PostingEditor({ id, canWrite, onDone, onCancel }: {
  id: number | null; canWrite: boolean; onDone: () => void; onCancel: () => void;
}) {
  const isNew = id == null;
  const { data: existing, error, loading } = useAsync<Posting | null>(() => (isNew ? Promise.resolve(null) : apiGet<{ items: Posting[] }>('/admin/job-postings').then((d) => d.items.find((p) => p.id === id) ?? null)), [id]);
  const [form, setForm] = useState({ title: '', dept: 'R&D', location: 'Taipei', type: 'full-time', level: 'mid', status: 'draft', body: '', applyBy: '', salaryBand: '', equalOpportunity: true });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Hydrate once per posting (deps: id) — background refetches must never
  // clobber unsaved edits (same fix as the products editor).
  React.useEffect(() => {
    if (!existing) return;
    setForm({
      title: existing.title, dept: existing.dept, location: existing.location, type: existing.type,
      level: existing.level, status: existing.status, body: existing.body,
      applyBy: existing.applyBy ? existing.applyBy.slice(0, 10) : '',
      salaryBand: existing.salaryBand ?? '', equalOpportunity: existing.equalOpportunity,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);
  if (!isNew && loading) return <p>Loading…</p>;
  if (!isNew && error) return <Err error={error} />;
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#93A0B4', display: 'block', margin: '10px 0 4px' };
  const card: React.CSSProperties = { border: '1px solid #E6EBF1', borderRadius: 12, padding: '4px 16px 16px', background: '#fff' };

  async function save(publish?: boolean) {
    if (!canWrite) return;
    setErr(null);
    if (form.title.trim().length < 2) { setErr('Title is required (2+ characters).'); return; }
    const status = publish ? 'published' : form.status;
    const body = {
      title: form.title.trim(), dept: form.dept, location: form.location, type: form.type,
      level: form.level, status, body: form.body,
      applyBy: form.applyBy ? new Date(form.applyBy).toISOString() : null,
      salaryBand: form.salaryBand.trim() || null, equalOpportunity: form.equalOpportunity,
    };
    setBusy(true);
    try {
      if (isNew) await apiSend('POST', '/admin/job-postings', body);
      else await apiSend('PATCH', '/admin/job-postings/' + id, body);
      onDone();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 860 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={btnGhost} onClick={onCancel}>← Back to postings</button>
        <h2 style={{ margin: 0, fontSize: 18, color: '#1F2A37' }}>{isNew ? 'New job posting' : `Edit: ${existing?.title ?? ''}`}</h2>
        <span style={{ flex: 1 }} />
        {canWrite && !isNew && form.status !== 'published' && (
          <button style={btnGhost} disabled={busy} onClick={() => save(true)}>Publish</button>
        )}
        {canWrite && <button style={btn} disabled={busy} onClick={() => save(false)}>{busy ? 'Saving…' : isNew ? 'Create posting' : 'Save changes'}</button>}
      </div>
      {err && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 12px' }}>{err}</p>}

      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
          <span style={{ gridColumn: '1 / -1' }}><label style={label}>Role title *</label>
            <input style={{ ...input, width: '100%' }} placeholder="e.g. Senior Firmware Engineer" value={form.title} onChange={(e) => set('title', e.target.value)} /></span>
          <span><label style={label}>Department</label>
            <select style={{ ...input, width: '100%' }} value={form.dept} onChange={(e) => set('dept', e.target.value)}>
              {JOB_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select></span>
          <span><label style={label}>Location</label>
            <select style={{ ...input, width: '100%' }} value={form.location} onChange={(e) => set('location', e.target.value)}>
              {JOB_LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select></span>
          <span><label style={label}>Employment type</label>
            <select style={{ ...input, width: '100%' }} value={form.type} onChange={(e) => set('type', e.target.value)}>
              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select></span>
          <span><label style={label}>Seniority</label>
            <select style={{ ...input, width: '100%' }} value={form.level} onChange={(e) => set('level', e.target.value)}>
              {JOB_LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select></span>
          <span><label style={label}>Status</label>
            <select style={{ ...input, width: '100%' }} value={form.status} onChange={(e) => set('status', e.target.value)}>
              {JOB_POSTING_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select></span>
          <span><label style={label}>Apply by</label>
            <input style={{ ...input, width: '100%' }} type="date" value={form.applyBy} onChange={(e) => set('applyBy', e.target.value)} /></span>
          <span><label style={label}>Salary band <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(where legally required)</span></label>
            <input style={{ ...input, width: '100%' }} placeholder="e.g. NT$1.4–2.0M / year" value={form.salaryBand} onChange={(e) => set('salaryBand', e.target.value)} /></span>
        </div>
        <label style={label}>Role description (markdown)</label>
        <textarea style={{ ...input, width: '100%', minHeight: 180, fontFamily: 'inherit' }}
          placeholder={'## Responsibilities\n- …\n\n## Qualifications\n- …'}
          value={form.body} onChange={(e) => set('body', e.target.value)} />
        <label style={{ ...label, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0, fontSize: 12.5, color: '#475467' }}>
          <input type="checkbox" checked={form.equalOpportunity} onChange={(e) => set('equalOpportunity', e.target.checked)} />
          Append the Equal Opportunity statement to this posting (BR-14.1)
        </label>
      </div>
    </div>
  );
}

function Applications({ canWrite }: { canWrite: boolean }) {
  const [status, setStatus] = useState('');
  const { data, error, loading, reload } = useAsync<{ items: JobApp[] }>(
    () => apiGet('/admin/job-applications' + (status ? `?status=${status}` : '')), [status]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  async function setStatusFor(id: number, next: string) {
    setBusyId(id); setActionError(null);
    try { await apiSend('PATCH', `/admin/job-applications/${id}`, { status: next }); reload(); }
    catch (e) { setActionError(e); } finally { setBusyId(null); }
  }

  return (
    <div>
      <div style={{ margin: '0 0 12px' }}>
        <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {error ? <Err error={error} /> : null}
      {actionError ? <Err error={actionError} /> : null}
      {loading ? <p>Loading…</p> : data ? (
        <Table head={['Ref', 'Candidate', 'Role', 'Received', 'Status', '']}>
          {data.items.map((app) => (
            <tr key={app.id}>
              <td style={td}>{app.refCode}</td>
              <td style={td}>
                <b>{String(app.payload?.name ?? app.email)}</b>
                <div style={{ color: '#66748A', fontSize: 12.5 }}>{app.email}</div>
                {typeof app.payload?.portfolio === 'string' && (
                  <div style={{ fontSize: 12.5 }}>Portfolio: {String(app.payload.portfolio).slice(0, 80)}</div>
                )}
              </td>
              <td style={td}>{app.postingTitle ?? (app.postingId ? `#${app.postingId}` : 'General application')}</td>
              <td style={td}>{fmtDate(app.createdAt)}</td>
              <td style={td}><Badge value={app.status} /></td>
              <td style={td}>
                {canWrite && (
                  <select style={input} value={app.status} disabled={busyId === app.id} onChange={(e) => setStatusFor(app.id, e.target.value)}>
                    {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No applications yet." />}
      {data && data.items.length > 0 && (
        <p style={{ color: '#66748A', fontSize: 12.5, marginTop: 8 }}>
          Full application payloads (cover letter links, documents) are in the submissions inbox under type “job-application”.
        </p>
      )}
    </div>
  );
}
