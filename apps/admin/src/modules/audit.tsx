// Audit log — read-only, filterable trail (admin role required server-side).
// P1: adopted to the ModProps contract; rows offer cross-nav to the touched entity.
import { apiGet, fmtDate } from '../api';
import { Empty, Err, Table, td, useAsync } from '../ui';
import type { ModProps } from '../nav';

type AuditRow = { id: number; action: string; entity: string; entityId: string; actorId: string | null; requestId: string | null; ip: string | null; at: string };

const ENTITY_MODULE: Record<string, string> = {
  product: 'products', submission: 'submissions', rma: 'rma',
  article: 'content', news_post: 'content', page: 'content', faq: 'content',
  job_application: 'jobs', job_posting: 'jobs', media_asset: 'media',
  partner_org: 'partners', translation: 'translations', setting: 'settings', redirect: 'settings',
};

export default function AuditLog({ nav }: ModProps) {
  const { data, error, loading } = useAsync<{ items: AuditRow[] }>(() => apiGet('/admin/audit'), []);
  return (
    <div>
      <h1>Audit log</h1>
      <p style={{ color: '#5E7691' }}>Last 100 mutations across all modules (admin role required).</p>
      {error ? <Err error={error} /> : null}
      {loading ? <p>Loading…</p> : data ? (
        <Table head={['When', 'Action', 'Entity', 'Actor', 'Request', '']}>
          {data.items.map((row) => {
            const target = ENTITY_MODULE[row.entity];
            return (
              <tr key={row.id}>
                <td style={td}>{fmtDate(row.at)}</td>
                <td style={td}><b>{row.action}</b></td>
                <td style={td}>{row.entity} #{row.entityId}</td>
                <td style={td}>{row.actorId ?? '—'}</td>
                <td style={{ ...td, color: '#5E7691', fontSize: 12 }}>{row.requestId ?? '—'}</td>
                <td style={{ ...td, width: 90 }}>
                  {target && (
                    <button
                      onClick={() => nav(target, { kind: row.entity, id: row.entityId, label: `${row.entity} #${row.entityId}` }, { newTab: true })}
                      style={{ fontSize: 12, padding: '3px 8px', cursor: 'pointer', border: '1px solid #CBD5E1', borderRadius: 6, background: '#fff' }}>
                      Open ↗
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No audit rows yet." />}
    </div>
  );
}
