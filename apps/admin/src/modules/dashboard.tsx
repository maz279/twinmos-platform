// Dashboard — live KPIs from GET /admin/stats.
import { apiGet } from '../api';
import { Empty, Err, Kpi, useAsync, Badge } from '../ui';

type Stats = {
  submissions: { total: number; open?: number; overdue?: number; byStatus: Record<string, number>; byType: Record<string, number> };
  rma: { total: number; open: number; byStatus: Record<string, number> };
  jobApplications: number;
  products: number;
};

export default function Dashboard() {
  const { data, error, loading } = useAsync<Stats>(() => apiGet('/admin/stats'), []);
  if (loading) return <p>Loading…</p>;
  if (error) return <Err error={error} />;
  if (!data) return <Empty text="No stats yet." />;
  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, margin: '16px 0' }}>
        <Kpi label="New submissions" value={data.submissions.byStatus.new ?? 0} hint={`${data.submissions.total} total`} />
        {typeof data.submissions.overdue === 'number' && (
          <Kpi label="Overdue leads" value={data.submissions.overdue} hint={`${data.submissions.open ?? 0} open · SLA past due`} />
        )}
        <Kpi label="Open RMAs" value={data.rma.open} hint={`${data.rma.total} total`} />
        <Kpi label="Job applications" value={data.jobApplications} />
        <Kpi label="Products" value={data.products} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <h3 style={{ marginBottom: 8 }}>Submissions by type</h3>
          {Object.entries(data.submissions.byType).length === 0 && <Empty text="No submissions yet." />}
          {Object.entries(data.submissions.byType).map(([t, n]) => (
            <div key={t} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EEF2F6', padding: '6px 2px', fontSize: 13.5 }}>
              <span>{t}</span><b>{n}</b>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ marginBottom: 8 }}>RMA pipeline</h3>
          {Object.entries(data.rma.byStatus).map(([s, n]) => (
            <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EEF2F6', padding: '6px 2px', fontSize: 13.5 }}>
              <Badge value={s} /><b>{n}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
