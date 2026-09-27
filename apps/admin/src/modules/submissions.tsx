// Submissions inbox — filter/list/detail + assign & status (PATCH /admin/submissions).
import React, { useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';

type Submission = {
  id: number; type: string; email: string; payload: Record<string, unknown>;
  status: 'new' | 'assigned' | 'resolved' | 'spam'; assigneeId: string | null;
  refCode: string; ip: string | null; ua: string | null; createdAt: string;
};

const STATUSES = ['new', 'assigned', 'resolved', 'spam'] as const;

export default function Submissions({ canWrite, myId }: { canWrite: boolean; myId?: string }) {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [cursor, setCursor] = useState<number | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);

  const qs = new URLSearchParams();
  if (type) qs.set('type', type);
  if (status) qs.set('status', status);
  if (cursor) qs.set('cursor', String(cursor));
  const { data, error, loading, reload } = useAsync<{ items: Submission[]; nextCursor: number | null }>(
    () => apiGet('/admin/submissions?' + qs.toString()), [type, status, cursor]);

  return (
    <div>
      <h1>Submissions</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <input style={input} placeholder="Filter by type (e.g. contact)" value={type} onChange={(e) => { setType(e.target.value.trim()); setCursor(null); }} />
        <select style={input} value={status} onChange={(e) => { setStatus(e.target.value); setCursor(null); }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button style={btnGhost} onClick={() => { setType(''); setStatus(''); setCursor(null); setSelected(null); }}>Reset</button>
      </div>
      {error && <Err error={error} />}
      {loading ? <p>Loading…</p> : data && (
        <>
          <Table head={['Ref', 'Type', 'From', 'Status', 'Received']}>
            {data.items.map((s) => (
              <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: 'pointer', background: selected?.id === s.id ? '#F0F9FF' : undefined }}>
                <td style={td}>{s.refCode}</td>
                <td style={td}>{s.type}</td>
                <td style={td}>{s.email}</td>
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
      )}
      {selected && <Detail sub={selected} canWrite={canWrite} myId={myId} onSaved={(s) => { setSelected(s); reload(); }} />}
    </div>
  );
}

function Detail({ sub, canWrite, myId, onSaved }: { sub: Submission; canWrite: boolean; myId?: string; onSaved: (s: Submission) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function patch(body: Record<string, unknown>) {
    setBusy(true); setError(null);
    try {
      const updated = await apiSend<Submission>('PATCH', `/admin/submissions/${sub.id}`, body);
      onSaved(updated);
    } catch (e) { setError(e); } finally { setBusy(false); }
  }
  return (
    <div style={{ marginTop: 16, border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, background: '#F8FAFC' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b>{sub.refCode} — {sub.type}</b>
        <Badge value={sub.status} />
      </div>
      {error && <Err error={error} />}
      <Table head={['Field', 'Value']}>
        {Object.entries({ email: sub.email, received: fmtDate(sub.createdAt), ip: sub.ip ?? '—', assignee: sub.assigneeId ?? '—', ...sub.payload }).map(([k, v]) => (
          <tr key={k}><td style={{ ...td, width: 160, color: '#5E7691' }}>{k}</td><td style={td}>{String(v)}</td></tr>
        ))}
      </Table>
      {canWrite && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button key={s} style={s === 'spam' || s === 'resolved' ? btnGhost : btn} disabled={busy || s === sub.status} onClick={() => patch({ status: s })}>
              Mark {s}
            </button>
          ))}
          <button style={btnGhost} disabled={busy || !sub.assigneeId} onClick={() => patch({ assigneeId: null })}>Unassign</button>
          <button style={btnGhost} disabled={busy || !!sub.assigneeId || !myId} onClick={() => patch({ assigneeId: myId })}>Assign to me</button>
        </div>
      )}
    </div>
  );
}
