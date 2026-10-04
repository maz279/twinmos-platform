// Careers (Phase 5.2 + 0022) — two tabs plus the ATS-grade upgrades:
//   • Analytics — postings by status, applications by status, top roles by
//     application count, 14-day arrivals
//   • Postings — search + department/status filters, apply-by deadline
//     warnings (overdue = red, closing soon = amber), full CRUD editor
//     (salary band BR-14.1, EO statement, markdown), live application counts
//   • Applications — pipeline (new → assigned → resolved/spam), free-text
//     search, per-posting filter, candidate drill-down with the full payload
//     and a one-click reply (mailer; replying moves new → in review)
// Every mutation is audited server-side; postings link to their applications
// via postingId, and published postings flow to the public careers page
// openings table through the export/merge bridge.
import React, { useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, CommandBar, Empty, Err, input, Table, td, Toolbar, useAsync, usePanelScroll } from '../ui';
import { JOB_DEPARTMENTS, JOB_LOCATIONS, JOB_TYPES, JOB_LEVELS, JOB_POSTING_STATUSES } from '@twinmos/shared';
import type { ModProps } from '../nav';

type JobApp = {
  id: number; postingId: number | null; postingTitle: string | null; email: string;
  payload: Record<string, unknown>; status: string;
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
      <AnalyticsStrip />
      <div style={{ display: 'flex', gap: 6, margin: '12px 0' }}>
        <button style={tab === 'postings' ? btn : btnGhost} onClick={() => setTab('postings')}>Postings</button>
        <button style={tab === 'applications' ? btn : btnGhost} onClick={() => setTab('applications')}>Applications</button>
      </div>
      {tab === 'postings' ? <Postings canWrite={canWrite} /> : <Applications canWrite={canWrite} />}
    </div>
  );
}

// ---- analytics strip ----------------------------------------------------------

type CareersAnalytics = {
  postings: Array<{ status: string; n: number }>;
  applications: Array<{ status: string; n: number }>;
  topPostings: Array<{ id: number; title: string; n: number }>;
  series: Array<{ d: string; n: number }>;
};

function AnalyticsStrip() {
  const { data, error, loading } = useAsync<CareersAnalytics>(() => apiGet('/admin/job-analytics'), []);
  if (loading) return null;
  if (error || !data) return null;
  const byStatus = (list: Array<{ status: string; n: number }>, s: string) => list.find((x) => x.status === s)?.n ?? 0;
  const published = byStatus(data.postings, 'published');
  const newApps = byStatus(data.applications, 'new');
  const totalApps = data.applications.reduce((s, x) => s + x.n, 0);
  const maxArrivals = Math.max(1, ...data.series.map((x) => x.n));
  const kpi = (label: string, value: string, sub: string) => (
    <div style={{ border: '1px solid #E6EBF1', borderRadius: 10, background: '#fff', padding: '10px 14px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1F2A37', marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: '#66748A' }}>{sub}</div>
    </div>
  );
  return (
    <details style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: '10px 16px', marginTop: 12 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 800, color: '#1F2A37', userSelect: 'none' }}>
        Analytics — <span style={{ color: '#66748A', fontWeight: 400 }}>{published} live postings · {newApps} new applications · {totalApps} total</span>
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginTop: 12 }}>
        {kpi('Live postings', String(published), data.postings.reduce((s, x) => s + x.n, 0) + ' total')}
        {kpi('New applications', String(newApps), 'awaiting first response')}
        {kpi('In review', String(byStatus(data.applications, 'assigned')), 'pipeline moving')}
        {kpi('Resolved', String(byStatus(data.applications, 'resolved')), 'hired / closed out')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginTop: 14 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 6 }}>Top roles by applications</div>
          {data.topPostings.length === 0 && <span style={{ fontSize: 12.5, color: '#93A0B4' }}>no published postings yet</span>}
          {data.topPostings.map((x) => (
            <div key={x.id} style={{ display: 'grid', gridTemplateColumns: '1fr 34px', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <span style={{ fontSize: 12.5, color: '#66748A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.title}</span>
              <b style={{ fontSize: 12.5, color: '#1F2A37', textAlign: 'right' }}>{x.n}</b>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 6 }}>Applications — last 14 days</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 70, borderBottom: '1px solid #E6EBF1' }}>
            {data.series.map((x) => (
              <div key={x.d} title={x.d + ': ' + x.n} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                <span style={{ width: '70%', borderRadius: '3px 3px 0 0', background: '#1DBF9F', height: Math.max((x.n / maxArrivals) * 100, x.n ? 6 : 0) + '%', display: 'block', margin: '0 auto' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

// ---- postings tab -----------------------------------------------------------

function Postings({ canWrite }: { canWrite: boolean }) {
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [delErr, setDelErr] = useState<string | null>(null);
  const qs = new URLSearchParams();
  if (q.trim()) qs.set('q', q.trim());
  if (dept) qs.set('dept', dept);
  if (status) qs.set('status', status);
  const { data, error, loading, reload } = useAsync<{ items: Posting[] }>(() => apiGet('/admin/job-postings?' + qs.toString()), [q, dept, status]);

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
  /** Deadline tone: red past due, amber within 7 days. */
  function deadline(applyBy: string | null): { text: string; color: string } | null {
    if (!applyBy) return null;
    const days = Math.ceil((new Date(applyBy).getTime() - Date.now()) / 86400_000);
    if (days < 0) return { text: `closed ${-days}d ago`, color: '#C2453C' };
    if (days <= 7) return { text: `closes in ${days}d`, color: '#B45309' };
    return { text: `closes in ${days}d`, color: '#66748A' };
  }

  return (
    <div>
      <Toolbar style={{ marginBottom: 10 }}>
        <input style={{ ...input, width: 220 }} placeholder="Search title, location, body…" value={q}
          onChange={(e) => setQ(e.target.value)} />
        <select style={input} value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {JOB_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {JOB_POSTING_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(q || dept || status) && <button style={btnGhost} onClick={() => { setQ(''); setDept(''); setStatus(''); }}>Reset</button>}
        <span style={{ flex: 1 }} />
        {canWrite && <button style={btn} onClick={() => setEditing('new')}>+ New posting</button>}
      </Toolbar>
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
        <>
          {delErr && <p role="alert" style={{ color: '#C2453C', background: '#FDECEA', borderRadius: 8, padding: '8px 12px' }}>{delErr}</p>}
          {data.items.length === 0 ? <Empty text="No postings match — create the first role." /> : (
          <Table head={['Role', 'Department', 'Location', 'Type', 'Level', 'Status', 'Applications', '']}>
            {data.items.map((p) => {
              const dl = deadline(p.applyBy);
              return (
                <tr key={p.id}>
                  <td style={td}><b style={{ color: '#1F2A37' }}>{p.title}</b>
                    {p.salaryBand && <div style={{ color: '#66748A', fontSize: 11.5 }}>{p.salaryBand}</div>}
                    {dl && <div style={{ color: dl.color, fontSize: 11.5, fontWeight: dl.color !== '#66748A' ? 700 : 400 }}>{dl.text}</div>}
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
              );
            })}
          </Table>
        )}
        </>
      ) : null}
      {!canWrite && <p style={{ color: '#93A0B4', fontSize: 12.5 }}>Read-only — editor role required to manage postings.</p>}
    </div>
  );
}

function PostingEditor({ id, canWrite, onDone, onCancel }: {
  id: number | null; canWrite: boolean; onDone: () => void; onCancel: () => void;
}) {
  const isNew = id == null;
  const panelRef = usePanelScroll<HTMLDivElement>();
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
    <div ref={panelRef} style={{ display: 'grid', gap: 12, maxWidth: 860 }}>
      {/* §6.4 command bar — pins under the tab strip while the posting form scrolls */}
      <CommandBar style={{ gap: 10 }}>
        <button style={btnGhost} onClick={onCancel}>← Back to postings</button>
        <h2 style={{ margin: 0, fontSize: 18, color: '#1F2A37' }}>{isNew ? 'New job posting' : `Edit: ${existing?.title ?? ''}`}</h2>
        <span style={{ flex: 1 }} />
        {canWrite && !isNew && form.status !== 'published' && (
          <button style={btnGhost} disabled={busy} onClick={() => save(true)}>Publish</button>
        )}
        {canWrite && <button style={btn} disabled={busy} onClick={() => save(false)}>{busy ? 'Saving…' : isNew ? 'Create posting' : 'Save changes'}</button>}
      </CommandBar>
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
        <div style={{ color: '#93A0B4', fontSize: 11.5, marginTop: 4 }}>
          {form.body.trim() ? `${form.body.trim().split(/\s+/).length} words — the first paragraph ships to the public careers page as the role summary` : 'The first non-heading paragraph becomes the public careers page summary'}
        </div>
        <label style={{ ...label, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0, fontSize: 12.5, color: '#475467' }}>
          <input type="checkbox" checked={form.equalOpportunity} onChange={(e) => set('equalOpportunity', e.target.checked)} />
          Append the Equal Opportunity statement to this posting (BR-14.1)
        </label>
      </div>
    </div>
  );
}

// ---- applications tab -----------------------------------------------------------

function Applications({ canWrite }: { canWrite: boolean }) {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [postingId, setPostingId] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  if (q.trim()) qs.set('q', q.trim());
  if (postingId) qs.set('postingId', postingId);
  const { data, error, loading, reload } = useAsync<{ items: JobApp[]; total?: number }>(
    () => apiGet('/admin/job-applications?' + qs.toString()), [status, q, postingId]);
  const postings = useAsync<{ items: Posting[] }>(() => apiGet('/admin/job-postings'), []);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  async function setStatusFor(id: number, next: string) {
    setBusyId(id); setActionError(null);
    try { await apiSend('PATCH', `/admin/job-applications/${id}`, { status: next }); reload(); }
    catch (e) { setActionError(e); } finally { setBusyId(null); }
  }

  return (
    <div>
      <Toolbar style={{ marginBottom: 10 }}>
        <input style={{ ...input, width: 210 }} placeholder="Search candidate, email, ref, content…" value={q}
          onChange={(e) => setQ(e.target.value)} />
        <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select style={input} value={postingId} onChange={(e) => setPostingId(e.target.value)} title="Posting">
          <option value="">All roles</option>
          {(postings.data?.items ?? []).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        {(status || q || postingId) && <button style={btnGhost} onClick={() => { setStatus(''); setQ(''); setPostingId(''); }}>Reset</button>}
        {data?.total != null && <span style={{ fontSize: 12.5, color: '#66748A', alignSelf: 'center' }}>{data.total} application{data.total === 1 ? '' : 's'}</span>}
      </Toolbar>
      {error ? <Err error={error} /> : null}
      {actionError ? <Err error={actionError} /> : null}
      {loading ? <p>Loading…</p> : data ? (
        <Table head={['Ref', 'Candidate', 'Role', 'Received', 'Status', '']}>
          {data.items.map((app) => (
            <tr key={app.id} onClick={() => setOpenId(openId === app.id ? null : app.id)} style={{ cursor: 'pointer', background: openId === app.id ? '#F0F9FF' : undefined }}>
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
                  <select style={input} value={app.status} disabled={busyId === app.id} onClick={(e) => e.stopPropagation()} onChange={(e) => setStatusFor(app.id, e.target.value)}>
                    {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No applications match." />}
      {openId != null && <AppDetail id={openId} canWrite={canWrite} onChanged={reload} />}
    </div>
  );
}

function AppDetail({ id, canWrite, onChanged }: { id: number; canWrite: boolean; onChanged: () => void }) {
  const panelRef = usePanelScroll<HTMLDivElement>();
  const { data, error, loading, reload } = useAsync<JobApp | null>(() => apiGet<{ items: JobApp[] }>('/admin/job-applications').then((d) => d.items.find((a) => a.id === id) ?? null), [id]);
  const [reply, setReply] = useState('');
  const [replyMsg, setReplyMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  async function sendReply() {
    if (!reply.trim() || !data) return;
    setBusy(true); setErr(null); setReplyMsg(null);
    try {
      const res = await apiSend<{ sent: boolean }>('POST', `/admin/job-applications/${id}/reply`, { text: reply.trim() });
      setReply('');
      setReplyMsg(res.sent ? 'Reply sent to the candidate.' : 'Reply recorded, but mail delivery failed — check mailer logs.');
      reload(); onChanged();
    } catch (e) { setErr(e); } finally { setBusy(false); }
  }

  if (loading) return <p style={{ marginTop: 14 }}>Loading…</p>;
  if (error) return <div style={{ marginTop: 14 }}><Err error={error} /></div>;
  if (!data) return null;

  return (
    <div ref={panelRef} style={{ marginTop: 14, border: '1px solid #E6EBF1', borderRadius: 10, padding: 16, background: '#F8FAFC' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <b>{data.refCode} — {String(data.payload?.name ?? data.email)}</b>
        <Badge value={data.status} />
        <span style={{ color: '#66748A', fontSize: 13 }}>{data.postingTitle ?? 'General application'} · received {fmtDate(data.createdAt)}</span>
      </div>
      {err ? <Err error={err} /> : null}
      {replyMsg && <div role="status" style={{ margin: '10px 0', padding: '7px 12px', borderRadius: 8, background: '#EDFAF6', border: '1px solid #BFE8DC', color: '#0F6B54', fontSize: 13 }}>{replyMsg}</div>}
      <Table head={['Field', 'Value']}>
        {Object.entries({ email: data.email, ...data.payload }).map(([k, v]) => (
          <tr key={k}><td style={{ ...td, width: 160, color: '#66748A' }}>{k}</td><td style={td}>{String(v)}</td></tr>
        ))}
      </Table>
      {canWrite && (
        <div style={{ marginTop: 10 }}>
          <textarea style={{ ...input, width: '100%', minHeight: 84, fontFamily: 'inherit' }}
            placeholder={`Thanks for your application to ${data.postingTitle ?? 'TwinMOS'} — we received it and will review within…`}
            value={reply} onChange={(e) => setReply(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <button style={btn} disabled={busy || !reply.trim()} onClick={sendReply}>Reply to candidate</button>
            <span style={{ color: '#93A0B4', fontSize: 11.5 }}>Emailed to {data.email} · moves a new application into review · audited</span>
          </div>
        </div>
      )}
    </div>
  );
}
