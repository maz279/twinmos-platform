// Leads & quotes board (P6 ADR-009 + 0018 speed-to-lead) — the P2 submissions
// inbox with the lead-handling workflow: 5-state machine (server-enforced),
// priority, SLA due-dates/badges, internal notes, filtered CSV export, and:
//   • ownership routing — Anyone / Unassigned queue / Mine / specific staff
//   • free-text search across email, refCode and payload
//   • age column + waiting-for-reply state (the 5-minute rule made visible)
//   • one-click customer reply (mailer → stamps first_responded_at, logs a note)
//   • pipeline strip so the lead's stage is always visible
import React, { useEffect, useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, useAsync, usePanelScroll } from '../ui';
import { Funnel, Gauge } from '../charts';
import { SUBMISSION_STATUS, SUBMISSION_TRANSITIONS, SUBMISSION_PRIORITY, FORM_TYPES } from '@twinmos/shared';
import type { TabCtx } from '../nav';

type Submission = {
  id: number; type: string; email: string; payload: Record<string, unknown>;
  status: (typeof SUBMISSION_STATUS)[number]; assigneeId: string | null; assigneeEmail?: string | null;
  refCode: string; ip: string | null; ua: string | null; createdAt: string;
  priority: (typeof SUBMISSION_PRIORITY)[number]; dueAt: string | null;
  firstRespondedAt: string | null;
  slaState?: 'overdue' | 'due_soon' | 'on_track' | null;
  notes?: Note[];
};
type Note = { id: number; body: string; createdAt: string; author: string | null };
type StaffOpt = { id: string; email: string; role: string };

const SLA_LABEL: Record<string, string> = { overdue: '⚠ overdue', due_soon: 'due soon', on_track: 'on track' };
const SLA_COLOR: Record<string, string> = { overdue: '#C2453C', due_soon: '#B45309', on_track: '#1F9D62' };
const STAGES = ['new', 'assigned', 'in_progress', 'resolved', 'closed'] as const;

/** Compact "3h ago" / "2d ago" age — the speed-to-lead signal in the list. */
function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'just now';
  const h = ms / 3600_000;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60_000))}m ago`;
  if (h < 48) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
function ageColor(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3600_000;
  if (h > 24) return '#C2453C';
  if (h > 4) return '#B45309';
  return '#66748A';
}
function waitHours(sub: { createdAt: string; firstRespondedAt: string | null }): number {
  return Math.round(((sub.firstRespondedAt ? new Date(sub.firstRespondedAt).getTime() : Date.now()) - new Date(sub.createdAt).getTime()) / 3600_000);
}

export default function Submissions({ canWrite, myId, ctx }: { canWrite: boolean; myId?: string; ctx?: TabCtx }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sla, setSla] = useState('');
  const [assignee, setAssignee] = useState('');
  const [cursor, setCursor] = useState<number | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);

  // staff options power the assignment dropdown (editor+ roles only, minimal fields)
  const staff = useAsync<{ items: StaffOpt[] }>(() => apiGet('/admin/staff-options'), []);

  // deep link: a tab focused on one lead (from ⌘K search, dashboard SLA queue or
  // audit cross-nav) opens that lead's detail immediately
  const focusId = ctx?.kind === 'lead' && ctx.id ? Number(ctx.id) : null;
  useEffect(() => {
    if (focusId != null && Number.isFinite(focusId)) setSelected((s) => (s?.id === focusId ? s : { ...s, id: focusId } as Submission));
  }, [focusId]);

  const qs = new URLSearchParams();
  if (q.trim()) qs.set('q', q.trim());
  if (type) qs.set('type', type);
  if (status) qs.set('status', status);
  if (priority) qs.set('priority', priority);
  if (sla) qs.set('sla', sla);
  if (assignee) qs.set('assignee', assignee);
  if (cursor) qs.set('cursor', String(cursor));
  const { data, error, loading, reload } = useAsync<{ items: Submission[]; nextCursor: number | null; total?: number }>(
    () => apiGet('/admin/submissions?' + qs.toString()), [q, type, status, priority, sla, assignee, cursor]);
  // CSV exports respect the FILTERS but never the pagination cursor (paging
  // then exporting would download only the current older page).
  const csvQs = new URLSearchParams();
  if (q.trim()) csvQs.set('q', q.trim());
  if (type) csvQs.set('type', type);
  if (status) csvQs.set('status', status);
  if (priority) csvQs.set('priority', priority);
  if (sla) csvQs.set('sla', sla);
  if (assignee) csvQs.set('assignee', assignee);

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Leads &amp; quotes{selected ? <span style={{ color: '#66748A', fontSize: 15 }}> — {selected.refCode ?? ctx?.label ?? `#${selected.id}`}</span> : null}</h1>
      <LeadsAnalyticsStrip />
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...input, width: 210 }} placeholder="Search email, ref, content…" value={q}
          onChange={(e) => { setQ(e.target.value); setCursor(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') setCursor(null); }} />
        <select style={input} value={type} onChange={(e) => { setType(e.target.value); setCursor(null); }} title="Form type">
          <option value="">All types</option>
          {FORM_TYPES.map((t) => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
        </select>
        <select style={input} value={status} onChange={(e) => { setStatus(e.target.value); setCursor(null); }}>
          <option value="">All statuses</option>
          {SUBMISSION_STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select style={input} value={priority} onChange={(e) => { setPriority(e.target.value); setCursor(null); }}>
          <option value="">Any priority</option>
          {SUBMISSION_PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select style={input} value={sla} onChange={(e) => { setSla(e.target.value); setCursor(null); }}>
          <option value="">Any SLA</option>
          <option value="overdue">overdue</option>
          <option value="due_soon">due soon</option>
        </select>
        <select style={input} value={assignee} onChange={(e) => { setAssignee(e.target.value); setCursor(null); }} title="Ownership">
          <option value="">Anyone</option>
          <option value="unassigned">Unassigned queue</option>
          {myId && <option value={myId}>Mine</option>}
          {(staff.data?.items ?? []).filter((s) => s.id !== myId).map((s) => (
            <option key={s.id} value={s.id}>{s.email}</option>
          ))}
        </select>
        <button style={btnGhost} onClick={() => { setQ(''); setType(''); setStatus(''); setPriority(''); setSla(''); setAssignee(''); setCursor(null); setSelected(null); }}>Reset</button>
        <a
          style={{ ...btnGhost, textDecoration: 'none', display: 'inline-block' }}
          href={(import.meta.env.VITE_API_URL ?? '/api/v1') + '/admin/submissions.csv?' + csvQs.toString()}
          target="_blank" rel="noopener">Export CSV</a>
      </div>
      {data?.total != null && (
        <div style={{ fontSize: 12.5, color: '#66748A', margin: '0 0 8px' }}>
          {data.total} lead{data.total === 1 ? '' : 's'} matching the current filters
        </div>
      )}
      {error ? <Err error={error} /> : null}
      {loading ? <p>Loading…</p> : data ? (
        <>
          <Table head={['Ref', 'Type', 'From', 'Priority', 'SLA', 'Reply', 'Status', 'Age', '']}>
            {data.items.map((s) => {
              const replied = !!s.firstRespondedAt;
              const waiting = !replied && ['new', 'assigned', 'in_progress'].includes(s.status);
              return (
                <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: 'pointer', background: selected?.id === s.id ? '#F0F9FF' : undefined }}>
                  <td style={td}>{s.refCode}</td>
                  <td style={td}>{s.type.replace(/-/g, ' ')}</td>
                  <td style={td}>{s.email}</td>
                  <td style={td}><Badge value={s.priority} /></td>
                  <td style={{ ...td, color: SLA_COLOR[s.slaState ?? ''] ?? '#66748A' }}>{s.slaState ? SLA_LABEL[s.slaState] : '—'}</td>
                  <td style={{ ...td, color: replied ? '#1F9D62' : waiting ? '#B45309' : '#93A0B4', fontWeight: waiting ? 700 : 400 }}>
                    {replied ? `↩ ${waitHours(s)}h` : waiting ? `waiting ${waitHours(s)}h` : '—'}
                  </td>
                  <td style={td}><Badge value={s.status} /></td>
                  <td style={{ ...td, color: ageColor(s.createdAt) }}>{timeAgo(s.createdAt)}</td>
                  <td style={td}>{s.assigneeEmail ? <span style={{ fontSize: 11.5, color: '#93A0B4' }}>{s.assigneeEmail.split('@')[0]}</span> : <span style={{ fontSize: 11, color: '#B45309' }}>unassigned</span>}</td>
                </tr>
              );
            })}
          </Table>
          {data.items.length === 0 && <Empty text="No submissions match." />}
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button style={btnGhost} disabled={!cursor} onClick={() => setCursor(null)}>« Latest</button>
            <button style={btnGhost} disabled={data.nextCursor == null} onClick={() => setCursor(data.nextCursor)}>Older »</button>
          </div>
        </>
      ) : null}
      {selected && <Detail id={selected.id} canWrite={canWrite} myId={myId} staff={staff.data?.items ?? []} onSaved={() => reload()} />}
    </div>
  );
}

function Detail({ id, canWrite, myId, staff, onSaved }: { id: number; canWrite: boolean; myId?: string; staff: StaffOpt[]; onSaved: () => void }) {
  const { data: sub, error, loading, reload } = useAsync<Submission>(() => apiGet(`/admin/submissions/${id}`), [id]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const [note, setNote] = useState('');
  const [reply, setReply] = useState('');
  const [replySent, setReplySent] = useState<string | null>(null);
  const panelRef = usePanelScroll<HTMLDivElement>();

  async function patch(body: Record<string, unknown>) {
    setBusy(true); setErr(null);
    try { await apiSend('PATCH', `/admin/submissions/${id}`, body); reload(); onSaved(); }
    catch (e) { setErr(e); } finally { setBusy(false); }
  }
  async function addNote() {
    if (!note.trim()) return;
    setBusy(true); setErr(null);
    try { await apiSend('POST', `/admin/submissions/${id}/notes`, { body: note.trim() }); setNote(''); reload(); }
    catch (e) { setErr(e); } finally { setBusy(false); }
  }
  async function sendReply() {
    if (!reply.trim()) return;
    setBusy(true); setErr(null); setReplySent(null);
    try {
      const res = await apiSend<{ sent: boolean }>('POST', `/admin/submissions/${id}/reply`, { text: reply.trim() });
      setReply('');
      setReplySent(res.sent ? 'Reply sent to the customer and logged as a note.' : 'Reply recorded, but mail delivery failed — check mailer logs.');
      reload(); onSaved();
    } catch (e) { setErr(e); } finally { setBusy(false); }
  }

  if (loading) return <p style={{ marginTop: 16 }}>Loading…</p>;
  if (error) return <Err error={error} />;
  if (!sub) return null;
  const legal = (SUBMISSION_TRANSITIONS as Record<string, readonly string[]>)[sub.status] ?? [];
  const stageIdx = STAGES.indexOf(sub.status as (typeof STAGES)[number]);
  const replied = !!sub.firstRespondedAt;
  const waiting = !replied && ['new', 'assigned', 'in_progress'].includes(sub.status);

  return (
    <div ref={panelRef} style={{ marginTop: 16, border: '1px solid #E6EBF1', borderRadius: 10, padding: 16, background: '#F8FAFC' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <b>{sub.refCode} — {sub.type.replace(/-/g, ' ')}</b>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge value={sub.priority} />
          {sub.slaState && <span style={{ color: SLA_COLOR[sub.slaState], fontSize: 13 }}>{SLA_LABEL[sub.slaState]}{sub.dueAt ? ` · due ${fmtDate(sub.dueAt)}` : ''}</span>}
          <Badge value={sub.status} />
        </span>
      </div>

      {/* pipeline strip — where this lead is, and what's next */}
      <div style={{ display: 'flex', gap: 4, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {STAGES.map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <span style={{ color: i <= stageIdx ? '#1DBF9F' : '#D5DDE7' }}>→</span>}
            <span style={{
              fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
              background: i === stageIdx ? '#1DBF9F' : i < stageIdx ? '#E4F8F2' : '#F1F4F8',
              color: i === stageIdx ? '#fff' : i < stageIdx ? '#0F6B54' : '#93A0B4',
            }}>{s.replace('_', ' ')}</span>
          </React.Fragment>
        ))}
        <span style={{ marginLeft: 8, fontSize: 12.5, color: waiting ? '#B45309' : replied ? '#1F9D62' : '#66748A', fontWeight: waiting ? 700 : 400 }}>
          {replied ? `first reply sent after ${waitHours(sub)}h` : waiting ? `⚠ no reply yet — customer waiting ${waitHours(sub)}h` : 'no reply sent (lead not open)'}
        </span>
      </div>

      {err ? <Err error={err} /> : null}
      {replySent && <div role="status" style={{ margin: '10px 0', padding: '7px 12px', borderRadius: 8, background: '#EDFAF6', border: '1px solid #BFE8DC', color: '#0F6B54', fontSize: 13 }}>{replySent}</div>}
      <Table head={['Field', 'Value']}>
        {Object.entries({ email: sub.email, received: `${fmtDate(sub.createdAt)} (${timeAgo(sub.createdAt)})`, ip: sub.ip ?? '—', assignee: sub.assigneeEmail ?? sub.assigneeId ?? '—', ...sub.payload }).map(([k, v]) => (
          <tr key={k}><td style={{ ...td, width: 160, color: '#66748A' }}>{k}</td><td style={td}>{String(v)}</td></tr>
        ))}
      </Table>

      {canWrite && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#66748A', fontSize: 13 }}>Move to:</span>
          {legal.length === 0 && <span style={{ color: '#66748A', fontSize: 13 }}>terminal state</span>}
          {legal.map((s) => (
            <button key={s} style={s === 'spam' ? btnGhost : btn} disabled={busy} onClick={() => patch({ status: s })}>
              {s.replace('_', ' ')}
            </button>
          ))}
          <select style={{ ...input, width: 150 }} value={sub.assigneeId ?? ''} disabled={busy}
            onChange={(e) => patch({ assigneeId: e.target.value || null })} title="Owner">
            <option value="">— unassigned —</option>
            {sub.assigneeId && !staff.some((s) => s.id === sub.assigneeId) && sub.assigneeEmail && (
              <option value={sub.assigneeId}>{sub.assigneeEmail} (current)</option>
            )}
            {staff.map((s) => <option key={s.id} value={s.id}>{s.email}</option>)}
          </select>
          {myId && sub.assigneeId !== myId && <button style={btnGhost} disabled={busy} onClick={() => patch({ assigneeId: myId })}>Assign to me</button>}
          <select style={{ ...input, width: 110 }} value={sub.priority} disabled={busy} onChange={(e) => patch({ priority: e.target.value })} title="Priority">
            {SUBMISSION_PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      <h3 style={{ margin: '16px 0 6px' }}>Reply to customer</h3>
      {canWrite ? (
        <div>
          <textarea style={{ ...input, width: '100%', minHeight: 90, fontFamily: 'inherit' }}
            placeholder={`Hi — thanks for your ${sub.type.replace(/-/g, ' ')} request (${sub.refCode})…`}
            value={reply} onChange={(e) => setReply(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <button style={btn} disabled={busy || !reply.trim()} onClick={sendReply}>Send reply</button>
            <span style={{ color: '#93A0B4', fontSize: 11.5 }}>Sent from the mailer to {sub.email} · logged as an internal note · stamps first-response time</span>
          </div>
        </div>
      ) : <p style={{ color: '#66748A', fontSize: 13 }}>Editor role required to reply.</p>}

      <h3 style={{ margin: '16px 0 6px' }}>Internal notes</h3>
      {(sub.notes ?? []).length === 0 && <p style={{ color: '#66748A', fontSize: 13 }}>No notes yet.</p>}
      {(sub.notes ?? []).map((n) => (
        <div key={n.id} style={{ borderTop: '1px solid #E6EBF1', padding: '6px 0', fontSize: 13.5, whiteSpace: 'pre-wrap' }}>
          <span style={{ color: '#66748A' }}>{n.author ?? 'unknown'} · {fmtDate(n.createdAt)}</span>
          <div>{n.body}</div>
        </div>
      ))}
      {canWrite && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input style={{ ...input, flex: 1 }} placeholder="Add an internal note (visible to staff only)…" value={note}
            onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }} />
          <button style={btn} disabled={busy || !note.trim()} onClick={addNote}>Add note</button>
        </div>
      )}
    </div>
  );
}

// ---- Phase 7.1: leads analytics strip ---------------------------------------
type LeadsAnalytics = {
  total: number; spam: number;
  funnel: Array<{ stage: string; count: number }>;
  sla: { open: number; overdue: number; dueSoon: number; onTrack: number; noSla: number; avgAgeDays: number; healthyPct: number };
  response?: { replied: number; openNotReplied: number; avgFirstResponseHours: number | null; withinOneHour: number | null };
  byType: Array<{ type: string; n: number }>;
};

/** §7.1 Sales/Leads dashboard above the inbox: the cumulative funnel, the SLA
 * gauge and the type split, from /admin/analytics/leads. Collapsible; never
 * blocks the inbox on failure. */
function LeadsAnalyticsStrip() {
  const { data, error, loading } = useAsync<LeadsAnalytics>(() => apiGet('/admin/analytics/leads'), []);
  if (loading) return null;
  if (error || !data) return null;
  return (
    <details style={{ border: '1px solid #E6EBF1', borderRadius: 12, background: '#fff', padding: '10px 16px', marginTop: 12 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 800, color: '#1F2A37', userSelect: 'none' }}>
        Analytics — <span style={{ color: '#66748A', fontWeight: 400 }}>
          {data.total} leads ({data.spam} spam) · {data.sla.open} open · {data.sla.overdue} overdue SLA
          {data.response ? ` · avg first reply ${data.response.avgFirstResponseHours ?? '—'}h · ${data.response.openNotReplied} awaiting reply` : ''}
        </span>
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 6 }}>Funnel — cumulative reach</div>
          <Funnel data={data.funnel} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
          <Gauge value={data.sla.healthyPct} label="SLA healthy" sub={`${data.sla.overdue} overdue · ${data.sla.dueSoon} due soon`} />
          <Gauge value={data.sla.open ? Math.round(((data.sla.onTrack + data.sla.dueSoon) / data.sla.open) * 100) : 100} label="Open leads" sub={`${data.sla.open} open · avg age ${data.sla.avgAgeDays}d`} />
          {data.response && (
            <Gauge value={data.response.withinOneHour ?? 0} label="Replies ≤ 1h" sub={`${data.response.replied} replied · ${data.response.openNotReplied} waiting`} />
          )}
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 6 }}>By type</div>
          {data.byType.slice(0, 6).map((x) => (
            <div key={x.type} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 30px', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <span style={{ fontSize: 12.5, color: '#66748A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.type}</span>
              <span style={{ background: '#F1F4F8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${(x.n / Math.max(1, data.total - data.spam)) * 100}%`, height: '100%', background: '#1DBF9F', borderRadius: 999 }} />
              </span>
              <b style={{ fontSize: 12.5, color: '#1F2A37', textAlign: 'right' }}>{x.n}</b>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
