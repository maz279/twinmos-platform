// Leads & quotes board (P6, ADR-009) — the P2 submissions inbox upgraded with
// the lead-handling workflow: 5-state machine (server-enforced), priority,
// SLA due-dates/badges, internal notes, and filtered CSV export.
import React, { useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';
import { SUBMISSION_STATUS, SUBMISSION_TRANSITIONS, SUBMISSION_PRIORITY } from '@twinmos/shared';

type Submission = {
  id: number; type: string; email: string; payload: Record<string, unknown>;
  status: (typeof SUBMISSION_STATUS)[number]; assigneeId: string | null; assigneeEmail?: string | null;
  refCode: string; ip: string | null; ua: string | null; createdAt: string;
  priority: (typeof SUBMISSION_PRIORITY)[number]; dueAt: string | null;
  slaState?: 'overdue' | 'due_soon' | 'on_track' | null;
  notes?: Note[];
};
type Note = { id: number; body: string; createdAt: string; author: string | null };

const SLA_LABEL: Record<string, string> = { overdue: '⚠ overdue', due_soon: 'due soon', on_track: 'on track' };
const SLA_COLOR: Record<string, string> = { overdue: '#B3261E', due_soon: '#B45309', on_track: '#15803D' };

export default function Submissions({ canWrite, myId }: { canWrite: boolean; myId?: string }) {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sla, setSla] = useState('');
  const [cursor, setCursor] = useState<number | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);

  const qs = new URLSearchParams();
  if (type) qs.set('type', type);
  if (status) qs.set('status', status);
  if (priority) qs.set('priority', priority);
  if (sla) qs.set('sla', sla);
  if (cursor) qs.set('cursor', String(cursor));
  const { data, error, loading, reload } = useAsync<{ items: Submission[]; nextCursor: number | null }>(
    () => apiGet('/admin/submissions?' + qs.toString()), [type, status, priority, sla, cursor]);

  return (
    <div>
      <h1>Leads & quotes</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <input style={input} placeholder="Filter by type (e.g. quote)" value={type} onChange={(e) => { setType(e.target.value.trim()); setCursor(null); }} />
        <select style={input} value={status} onChange={(e) => { setStatus(e.target.value); setCursor(null); }}>
          <option value="">All statuses</option>
          {SUBMISSION_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
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
        <button style={btnGhost} onClick={() => { setType(''); setStatus(''); setPriority(''); setSla(''); setCursor(null); setSelected(null); }}>Reset</button>
        <a
          style={{ ...btnGhost, textDecoration: 'none', display: 'inline-block' }}
          href={(import.meta.env.VITE_API_URL ?? '/api/v1') + '/admin/submissions.csv?' + qs.toString()}
          target="_blank" rel="noopener">Export CSV</a>
      </div>
      {error ? <Err error={error} /> : null}
      {loading ? <p>Loading…</p> : data ? (
        <>
          <Table head={['Ref', 'Type', 'From', 'Priority', 'SLA', 'Status', 'Received']}>
            {data.items.map((s) => (
              <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: 'pointer', background: selected?.id === s.id ? '#F0F9FF' : undefined }}>
                <td style={td}>{s.refCode}</td>
                <td style={td}>{s.type}</td>
                <td style={td}>{s.email}</td>
                <td style={td}><Badge value={s.priority} /></td>
                <td style={{ ...td, color: SLA_COLOR[s.slaState ?? ''] ?? '#5E7691' }}>{s.slaState ? SLA_LABEL[s.slaState] : '—'}</td>
                <td style={td}><Badge value={s.status} /></td>
                <td style={td}>{fmtDate(s.createdAt)}</td>
              </tr>
            ))}
          </Table>
          {data.items.length === 0 && <Empty text="No submissions match." />}
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button style={btnGhost} disabled={!cursor} onClick={() => setCursor(null)}>« Latest</button>
            <button style={btnGhost} disabled={data.nextCursor == null} onClick={() => setCursor(data.nextCursor)}>Older »</button>
          </div>
        </>
      ) : null}
      {selected && <Detail id={selected.id} canWrite={canWrite} myId={myId} onSaved={() => reload()} />}
    </div>
  );
}

function Detail({ id, canWrite, myId, onSaved }: { id: number; canWrite: boolean; myId?: string; onSaved: () => void }) {
  const { data: sub, error, loading, reload } = useAsync<Submission>(() => apiGet(`/admin/submissions/${id}`), [id]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const [note, setNote] = useState('');

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

  if (loading) return <p style={{ marginTop: 16 }}>Loading…</p>;
  if (error) return <Err error={error} />;
  if (!sub) return null;
  const legal = (SUBMISSION_TRANSITIONS as Record<string, readonly string[]>)[sub.status] ?? [];

  return (
    <div style={{ marginTop: 16, border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, background: '#F8FAFC' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <b>{sub.refCode} — {sub.type}</b>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge value={sub.priority} />
          {sub.slaState && <span style={{ color: SLA_COLOR[sub.slaState], fontSize: 13 }}>{SLA_LABEL[sub.slaState]}{sub.dueAt ? ` · due ${fmtDate(sub.dueAt)}` : ''}</span>}
          <Badge value={sub.status} />
        </span>
      </div>
      {err ? <Err error={err} /> : null}
      <Table head={['Field', 'Value']}>
        {Object.entries({ email: sub.email, received: fmtDate(sub.createdAt), ip: sub.ip ?? '—', assignee: sub.assigneeEmail ?? sub.assigneeId ?? '—', ...sub.payload }).map(([k, v]) => (
          <tr key={k}><td style={{ ...td, width: 160, color: '#5E7691' }}>{k}</td><td style={td}>{String(v)}</td></tr>
        ))}
      </Table>

      {canWrite && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#5E7691', fontSize: 13 }}>Move to:</span>
          {legal.length === 0 && <span style={{ color: '#5E7691', fontSize: 13 }}>terminal state</span>}
          {legal.map((s) => (
            <button key={s} style={s === 'spam' ? btnGhost : btn} disabled={busy} onClick={() => patch({ status: s })}>
              {s.replace('_', ' ')}
            </button>
          ))}
          <button style={btnGhost} disabled={busy || !sub.assigneeId} onClick={() => patch({ assigneeId: null })}>Unassign</button>
          <button style={btnGhost} disabled={busy || !!sub.assigneeId || !myId} onClick={() => patch({ assigneeId: myId })}>Assign to me</button>
          <select style={{ ...input, width: 110 }} value={sub.priority} disabled={busy} onChange={(e) => patch({ priority: e.target.value })}>
            {SUBMISSION_PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      <h3 style={{ margin: '16px 0 6px' }}>Internal notes</h3>
      {(sub.notes ?? []).length === 0 && <p style={{ color: '#5E7691', fontSize: 13 }}>No notes yet.</p>}
      {(sub.notes ?? []).map((n) => (
        <div key={n.id} style={{ borderTop: '1px solid #E2E8F0', padding: '6px 0', fontSize: 13.5 }}>
          <span style={{ color: '#5E7691' }}>{n.author ?? 'unknown'} · {fmtDate(n.createdAt)}</span>
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
