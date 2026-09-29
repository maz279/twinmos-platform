// Job applications (HR module) — list + status workflow (PATCH /admin/job-applications).
import React, { useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';

type JobApp = {
  id: number; postingId: number | null; postingTitle: string | null; email: string;
  payload: Record<string, unknown>; status: 'new' | 'assigned' | 'resolved' | 'spam';
  refCode: string; createdAt: string;
};
const STATUSES = ['new', 'assigned', 'resolved', 'spam'] as const;

export default function Jobs({ canWrite }: { canWrite: boolean }) {
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
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Job applications</h1>
      <div style={{ margin: '12px 0' }}>
        <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
