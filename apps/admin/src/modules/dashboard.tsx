// Dashboard (P3) — information-dense overview: KPI cards with 14-day sparklines
// and 7-day deltas, leads-by-type bars, RMA pipeline funnel, SLA-risk queue
// (cross-nav into the lead tab), media alt-compliance and an audit activity feed.
// All data from the extended GET /admin/stats (P8); charts are inline SVG — no
// chart library in the bundle.
import { apiGet, fmtDate } from '../api';
import { Empty, Err, useAsync, Badge } from '../ui';
import { Icon } from '../icons';
import type { ModProps } from '../nav';

const NAVY = '#0A2540'; const CYAN = '#00A3E0'; const GOLD = '#D9A441'; const RED = '#C2410C';

type Stats = {
  submissions: { total: number; open?: number; overdue?: number; byStatus: Record<string, number>; byType: Record<string, number> };
  rma: { total: number; open: number; byStatus: Record<string, number> };
  jobApplications: number; jobsNew: number; products: number;
  series: Array<{ d: string; subs: number; rmas: number }>;
  slaRisk: Array<{ id: number; refCode: string; type: string; status: string; dueAt: string | null; email: string; slaState: 'overdue' | 'due_soon' | 'on_track' | null }>;
  content: { articles: number; news: number; pages: number; faqs: number };
  media: { total: number; missingAlt: number };
  activity: Array<{ id: number; action: string; entity: string; entityId: string; at: string; actor: string | null }>;
};

function Spark({ points, color }: { points: number[]; color: string }) {
  const w = 96, hgt = 26, max = Math.max(1, ...points);
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const y = (v: number) => hgt - (v / max) * (hgt - 3) - 1.5;
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  // area fill keeps the spark visible even when the series is all-zero
  // (a bare zero line hugs the bottom edge and reads as missing)
  const area = points.length ? `${path} L${w},${hgt} L0,${hgt} Z` : '';
  return (
    <svg width={w} height={hgt} viewBox={`0 0 ${w} ${hgt}`} style={{ display: 'block' }}>
      {area && <path d={area} fill={color} fillOpacity="0.14" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && <circle cx={w} cy={y(points[points.length - 1])} r="2.2" fill={color} />}
    </svg>
  );
}

function KpiCard({ label, value, hint, spark, color, delta }: {
  label: string; value: React.ReactNode; hint?: string; spark?: number[]; color?: string; delta?: number;
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E3EBF3', borderRadius: 12, padding: '14px 16px', minWidth: 0 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8CA3BA' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 27, fontWeight: 800, color: NAVY, lineHeight: 1 }}>{value}</span>
        {spark && <Spark points={spark} color={color ?? CYAN} />}
        {typeof delta === 'number' && delta !== 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 800, color: delta > 0 ? '#15803D' : RED, background: delta > 0 ? '#EAF7EF' : '#FDEEE6', borderRadius: 999, padding: '2px 8px', marginBottom: 3 }}>
            {delta > 0 ? '+' : ''}{delta} / 7d
          </span>
        )}
      </div>
      {hint && <div style={{ marginTop: 5, fontSize: 12, color: '#5E7691' }}>{hint}</div>}
    </div>
  );
}

function Bars({ data, color }: { data: Array<[string, number]>; color: string }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  if (!data.length) return <Empty text="No submissions yet." />;
  return (
    <div>
      {data.map(([k, n]) => (
        <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 34px', alignItems: 'center', gap: 10, padding: '5px 0' }}>
          <span style={{ fontSize: 12.5, color: '#33475C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k}</span>
          <span style={{ background: '#EFF4F9', borderRadius: 6, height: 16, overflow: 'hidden' }}>
            <span style={{ display: 'block', width: `${(n / max) * 100}%`, height: '100%', background: `linear-gradient(90deg,${color},${color}bb)`, borderRadius: 6 }} />
          </span>
          <b style={{ fontSize: 12.5, color: NAVY, textAlign: 'right' }}>{n}</b>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ nav }: ModProps) {
  const { data, error, loading } = useAsync<Stats>(() => apiGet('/admin/stats'), []);
  if (loading) return <p>Loading…</p>;
  if (error) return <Err error={error} />;
  if (!data) return <Empty text="No stats yet." />;

  const s = data.series ?? [];
  const sum = (a: number[], from: number, to: number) => a.slice(from, to).reduce((x, y) => x + y, 0);
  const subsSeries = s.map((x) => x.subs); const rmaSeries = s.map((x) => x.rmas);
  const subsDelta = subsSeries.length === 14 ? sum(subsSeries, 7, 14) - sum(subsSeries, 0, 7) : undefined;
  const rmaDelta = rmaSeries.length === 14 ? sum(rmaSeries, 7, 14) - sum(rmaSeries, 0, 7) : undefined;
  const contentTotal = data.content ? data.content.articles + data.content.news + data.content.pages + data.content.faqs : 0;
  const mediaPct = data.media?.total ? Math.round(((data.media.total - data.media.missingAlt) / data.media.total) * 100) : 100;
  const rmaEntries = Object.entries(data.rma.byStatus ?? {});
  const rmaMax = Math.max(1, ...rmaEntries.map(([, n]) => n));

  const quick: Array<[string, Parameters<typeof nav>[0], string]> = [
    ['New article', 'content', 'doc'], ['Add product', 'products', 'box'],
    ['Review leads', 'submissions', 'inbox'], ['Media library', 'media', 'image'],
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Operations overview</h1>
          <p style={{ margin: '2px 0 0', color: '#5E7691', fontSize: 13 }}>Live across leads, RMA, catalog, content and media · 14-day trends</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {quick.map(([label, mod, icon]) => (
            <button key={label} onClick={() => nav(mod, undefined, { newTab: true })}
              style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid #D9E4EF', background: '#fff', borderRadius: 8, padding: '7px 12px', fontSize: 12.5, fontWeight: 700, color: NAVY, cursor: 'pointer' }}>
              <Icon name={icon as 'doc'} size={14} style={{ color: CYAN }} />{label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(196px,1fr))', gap: 12, marginBottom: 14 }}>
        <KpiCard label="New leads" value={data.submissions.byStatus.new ?? 0} hint={`${data.submissions.open ?? 0} open · ${data.submissions.total} total`} spark={subsSeries} delta={subsDelta} color={CYAN} />
        <KpiCard label="Overdue SLA" value={<span style={{ color: (data.submissions.overdue ?? 0) > 0 ? RED : '#15803D' }}>{data.submissions.overdue ?? 0}</span>} hint="open leads past dueAt" color={RED} />
        <KpiCard label="Open RMAs" value={data.rma.open} hint={`${data.rma.total} total`} spark={rmaSeries} delta={rmaDelta} color={GOLD} />
        <KpiCard label="Published content" value={contentTotal} hint={`${data.content?.articles ?? 0} articles · ${data.content?.news ?? 0} news · ${data.content?.pages ?? 0} pages · ${data.content?.faqs ?? 0} FAQ`} />
        <KpiCard label="Catalog" value={data.products} hint="products" />
        <KpiCard label="Applications" value={data.jobApplications ?? 0} hint={`${data.jobsNew ?? 0} new`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12 }}>
        <Card title="Leads by type">
          <Bars data={Object.entries(data.submissions.byType ?? {})} color={CYAN} />
        </Card>

        <Card title="RMA pipeline">
          {rmaEntries.length === 0 && <Empty text="No RMAs yet." />}
          {rmaEntries.map(([st, n]) => (
            <button key={st} onClick={() => nav('rma', undefined, { newTab: true })}
              style={{ display: 'grid', gridTemplateColumns: '110px 1fr 34px', alignItems: 'center', gap: 10, width: '100%', padding: '5px 0', border: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <Badge value={st} />
              <span style={{ background: '#EFF4F9', borderRadius: 6, height: 16, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${(n / rmaMax) * 100}%`, height: '100%', background: `linear-gradient(90deg,${GOLD},${GOLD}bb)`, borderRadius: 6 }} />
              </span>
              <b style={{ fontSize: 12.5, color: NAVY, textAlign: 'right' }}>{n}</b>
            </button>
          ))}
        </Card>

        <Card title="SLA risk queue" subtitle="oldest due first — click to open the lead">
          {(data.slaRisk ?? []).length === 0 && <Empty text="No open lead is carrying an SLA clock." />}
          {(data.slaRisk ?? []).map((l) => (
            <button key={l.id} onClick={() => nav('submissions', { kind: 'lead', id: String(l.id), label: l.refCode }, { newTab: true })}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '7px 8px', border: 0, borderRadius: 8, background: l.slaState === 'overdue' ? '#FDF3EC' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
              <Icon name="clock" size={14} style={{ color: l.slaState === 'overdue' ? RED : GOLD, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 12.5, color: NAVY }}>{l.refCode}</b>
                <span style={{ color: '#8CA3BA', fontSize: 11.5 }}> · {l.type} · {l.email}</span>
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: l.slaState === 'overdue' ? RED : '#8A6420' }}>
                {l.slaState === 'overdue' ? 'overdue' : l.slaState === 'due_soon' ? 'due <4h' : 'on track'} · {fmtDate(l.dueAt ?? '')}
              </span>
            </button>
          ))}
        </Card>

        <Card title="Media alt-text compliance" subtitle="accessibility of uploaded assets">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: mediaPct >= 90 ? '#15803D' : mediaPct >= 70 ? GOLD : RED }}>{mediaPct}%</span>
            <span style={{ flex: 1, background: '#EFF4F9', borderRadius: 6, height: 12, overflow: 'hidden' }}>
              <span style={{ display: 'block', width: `${mediaPct}%`, height: '100%', background: mediaPct >= 90 ? '#15803D' : GOLD }} />
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#5E7691' }}>
            {data.media?.missingAlt ?? 0} of {data.media?.total ?? 0} assets missing alt text —{' '}
            <button onClick={() => nav('media', undefined, { newTab: true })} style={{ border: 0, background: 'none', color: '#0E7FB8', cursor: 'pointer', fontSize: 12.5, textDecoration: 'underline', padding: 0 }}>fix in media library</button>
          </p>
        </Card>

        <Card title="Activity" subtitle="latest audited mutations">
          {(data.activity ?? []).length === 0 && <Empty text="No audit rows yet." />}
          {(data.activity ?? []).map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid #EEF2F6', fontSize: 12.5 }}>
              <Icon name="zap" size={13} style={{ color: CYAN, marginTop: 2, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ color: NAVY }}>{a.action}</b>
                <span style={{ color: '#8CA3BA' }}> · {a.entity} #{a.entityId} · {a.actor ?? 'system'}</span>
              </span>
              <span style={{ color: '#8CA3BA', fontSize: 11.5, whiteSpace: 'nowrap' }}>{fmtDate(a.at)}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E3EBF3', borderRadius: 12, padding: '14px 16px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14 }}>{title}</h3>
        {subtitle && <span style={{ fontSize: 11.5, color: '#8CA3BA' }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
