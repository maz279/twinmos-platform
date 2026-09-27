// RMA board — list + detail with timeline + server-enforced state transitions
// (POST /admin/rma/:id/transition). Legal next states come from the shared
// RMA_TRANSITIONS matrix so the UI never offers an illegal move.
import React, { useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';
import { RMA_TRANSITIONS, RMA_STATUS } from '@twinmos/shared';

type RmaRow = {
  id: number; number: string; productSku: string | null; serial: string | null; issue: string;
  status: typeof RMA_STATUS[number]; customer: Record<string, unknown>; warrantyTier: string | null;
  createdAt: string; updatedAt: string;
};
type RmaDetail = RmaRow & { timeline: Array<{ id: number; fromStatus: string; toStatus: string; actorId: string | null; note: string | null; at: string }> };

export default function RmaBoard({ canWrite }: { canWrite: boolean }) {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  if (q) qs.set('q', q);
  const { data, error, loading, reload } = useAsync<{ items: RmaRow[] }>(() => apiGet('/admin/rma?' + qs.toString()), [status, q]);

  return (
    <div>
      <h1>RMA board</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All states</option>
          {RMA_STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <input style={input} placeholder="Search RMA number" value={q} onChange={(e) => setQ(e.target.value.trim())} />
      </div>
      {error ? <Err error={error} /> : null}
      {loading ? <p>Loading…</p> : data ? (
        <Table head={['RMA #', 'Customer', 'Product', 'Status', 'Updated']}>
          {data.items.map((rma) => (
            <tr key={rma.id} onClick={() => setOpenId(openId === rma.id ? null : rma.id)} style={{ cursor: 'pointer', background: openId === rma.id ? '#F0F9FF' : undefined }}>
              <td style={td}><b>{rma.number}</b></td>
              <td style={td}>{String(rma.customer?.name ?? '—')}</td>
              <td style={td}>{String(rma.customer?.product ?? rma.productSku ?? '—')}</td>
              <td style={td}><Badge value={rma.status} /></td>
              <td style={td}>{fmtDate(rma.updatedAt)}</td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No RMA requests match." />}
      {openId != null && <RmaDetailPanel id={openId} canWrite={canWrite} onChanged={reload} />}
    </div>
  );
}

function RmaDetailPanel({ id, canWrite, onChanged }: { id: number; canWrite: boolean; onChanged: () => void }) {
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { data, error: loadError, loading, reload } = useAsync<RmaDetail>(() => apiGet(`/admin/rma/${id}`), [id]);
  async function transition(to: string) {
    setBusy(true); setError(null);
    try {
      await apiSend('POST', `/admin/rma/${id}/transition`, { to, note: note || undefined, notifyCustomer: notify });
      setNote('');
      reload(); onChanged();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }
  if (loading) return <p style={{ marginTop: 14 }}>Loading case…</p>;
  if (loadError) return <div style={{ marginTop: 14 }}><Err error={loadError} /></div>;
  if (!data) return null;
  const legal = RMA_TRANSITIONS[data.status] ?? [];
  return (
    <div style={{ marginTop: 16, border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, background: '#F8FAFC' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b>{data.number}</b>
        <Badge value={data.status} />
      </div>
      {error ? <Err error={error} /> : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 6, margin: '10px 0', fontSize: 13.5 }}>
        <span><b>Customer:</b> {String(data.customer?.name ?? '—')} · {String(data.customer?.email ?? '—')}</span>
        <span><b>Product:</b> {String(data.customer?.product ?? data.productSku ?? '—')}</span>
        <span><b>Serial:</b> {data.serial ?? '—'}</span>
        <span><b>Warranty:</b> {data.warrantyTier ?? '—'}</span>
        <span><b>Created:</b> {fmtDate(data.createdAt)}</span>
      </div>
      <p style={{ fontSize: 13.5 }}><b>Reported issue:</b> {data.issue}</p>
      <h4>Timeline</h4>
      <ol style={{ margin: '6px 0 12px', paddingLeft: 18, fontSize: 13.5 }}>
        {data.timeline.map((ev) => (
          <li key={ev.id} style={{ marginBottom: 4 }}>
            {ev.fromStatus === ev.toStatus
              ? <span>Case created — <b>{ev.toStatus.replace(/_/g, ' ')}</b></span>
              : <span><b>{ev.fromStatus.replace(/_/g, ' ')}</b> → <b>{ev.toStatus.replace(/_/g, ' ')}</b></span>}
            <span style={{ color: '#5E7691' }}> · {fmtDate(ev.at)}{ev.note ? ` · ${ev.note}` : ''}</span>
          </li>
        ))}
      </ol>
      {canWrite && (
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input style={{ ...input, flex: '1 1 240px' }} placeholder="Note (optional, included in customer email)" value={note} onChange={(e) => setNote(e.target.value)} />
            <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email customer
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {legal.length === 0 && <span style={{ color: '#5E7691' }}>Case is closed — no further transitions.</span>}
            {legal.map((s) => (
              <button key={s} style={s === 'closed' ? btnGhost : btn} disabled={busy} onClick={() => transition(s)}>
                Move to {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
