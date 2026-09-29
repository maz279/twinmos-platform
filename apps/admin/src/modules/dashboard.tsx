// Dashboard — information-dense overview in the 2026 reference style:
// icon-chip KPI tiles with 14-day sparklines and 7-day deltas, a dual-series
// teal/gold area chart, a lead-status donut, rounded bar breakdowns, the SLA
// risk queue (cross-nav into the lead tab), media alt-compliance and an audit
// activity timeline. All data from GET /admin/stats; charts are inline SVG —
// no chart library in the bundle.
import { apiGet, fmtDate } from '../api';
import { Empty, Err, useAsync, Badge, BLUE, card, FAINT, GOLD, GREEN, INK, LINE, MUTED, PURPLE, RED, TEAL } from '../ui';
import { Icon } from '../icons';
import type { ModProps } from '../nav';

type Stats = {
  submissions: { total: number; open?: number; overdue?: number; byStatus: Record<string, number>; byType: Record<string, number> };
  rma: { total: number; open: number; byStatus: Record<string, number> };
  jobApplications: number; jobsNew: number; products: number; variants: number;
  series: Array<{ d: string; subs: number; rmas: number }>;
  slaRisk: Array<{ id: number; refCode: string; type: string; status: string; dueAt: string | null; email: string; slaState: 'overdue' | 'due_soon' | 'on_track' | null }>;
  content: { articles: number; news: number; pages: number; faqs: number };
  media: { total: number; missingAlt: number };
  activity: Array<{ id: number; action: string; entity: string; entityId: string; at: string; actor: string | null }>;
};

function Spark({ points, color }: { points: number[]; color: string }) {
  const w = 92, hgt = 28, max = Math.max(1, ...points);
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const y = (v: number) => hgt - (v / max) * (hgt - 4) - 2;
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  // area fill keeps the spark visible even when the series is all-zero
  // (a bare zero line hugs the bottom edge and reads as missing)
  const area = points.length ? `${path} L${w},${hgt} L0,${hgt} Z` : '';
  return (
    <svg width={w} height={hgt} viewBox={`0 0 ${w} ${hgt}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sp-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill={`url(#sp-${color.slice(1)})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && <circle cx={w} cy={y(points[points.length - 1])} r="2.3" fill={color} />}
    </svg>
  );
}

function Delta({ v }: { v: number }) {
  if (!v) return null;
  const up = v > 0;
  return (
    <span style={{ fontSize: 11, fontWeight: 800, color: up ? GREEN : RED, background: up ? GREEN + '1C' : RED + '1C', borderRadius: 999, padding: '2px 8px', marginBottom: 3, whiteSpace: 'nowrap' }}>
      {up ? '▲' : '▼'} {up ? '+' : ''}{v}
    </span>
  );
}

function KpiCard({ label, value, hint, spark, color, delta, icon }: {
  label: string; value: React.ReactNode; hint?: string; spark?: number[]; color?: string; delta?: number; icon?: string;
}) {
  return (
    <div style={{ ...card, padding: '14px 16px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {icon && (
          <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 9, background: (color ?? TEAL) + '1C', color: color ?? TEAL, flexShrink: 0 }}>
            <Icon name={icon as 'inbox'} size={15} />
          </span>
        )}
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: FAINT }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <span style={{ fontSize: 27, fontWeight: 800, color: INK, lineHeight: 1 }}>{value}</span>
        {spark && <Spark points={spark} color={color ?? TEAL} />}
        {typeof delta === 'number' && <span style={{ marginLeft: 'auto' }}><Delta v={delta} /></span>}
      </div>
      {hint && <div style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hint}</div>}
    </div>
  );
}

/** Dual-series area chart (teal = submissions, gold dashed = RMA) with grid
 *  lines and date ticks — the hero chart on the reference boards. */
function AreaChart({ series }: { series: Array<{ d: string; subs: number; rmas: number }> }) {
  const W = 680, H = 190, PL = 30, PB = 20, PT = 8;
  const iw = W - PL - 8, ih = H - PT - PB;
  const max = Math.max(4, ...series.map((x) => Math.max(x.subs, x.rmas)));
  const step = series.length > 1 ? iw / (series.length - 1) : iw;
  const x = (i: number) => PL + i * step;
  const y = (v: number) => PT + ih - (v / max) * ih;
  const line = (sel: (p: { subs: number; rmas: number }) => number) =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(sel(p)).toFixed(1)}`).join(' ');
  const subsPath = line((p) => p.subs);
  const subsArea = series.length ? `${subsPath} L${x(series.length - 1).toFixed(1)},${PT + ih} L${PL},${PT + ih} Z` : '';
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: MUTED, fontWeight: 700, marginBottom: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: TEAL }} />Leads</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: GOLD }} />RMA</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="areaTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0.26" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PL} x2={W - 8} y1={y(t)} y2={y(t)} stroke="#EDF1F5" strokeWidth="1" />
            <text x={PL - 7} y={y(t) + 3.5} textAnchor="end" fontSize="9.5" fill={FAINT}>{t}</text>
          </g>
        ))}
        {subsArea && <path d={subsArea} fill="url(#areaTeal)" />}
        <path d={subsPath} fill="none" stroke={TEAL} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line((p) => p.rmas)} fill="none" stroke={GOLD} strokeWidth="1.8" strokeDasharray="5 4" strokeLinecap="round" />
        {series.length > 0 && <circle cx={x(series.length - 1)} cy={y(series[series.length - 1].subs)} r="3" fill={TEAL} stroke="#fff" strokeWidth="1.5" />}
        {series.map((p, i) => (i % 3 === 0 || i === series.length - 1) && (
          <text key={p.d + i} x={x(i)} y={H - 5} textAnchor="middle" fontSize="9" fill={FAINT}>{p.d.slice(5).replace('-', '/')}</text>
        ))}
      </svg>
    </div>
  );
}

/** Donut of lead statuses with a total in the center + legend. */
function Donut({ data }: { data: Array<[string, number]> }) {
  const total = data.reduce((a, [, n]) => a + n, 0);
  const COLORS = [TEAL, GOLD, PURPLE, BLUE, GREEN, '#94A3B8'];
  const R = 15.915; // radius that makes circumference exactly 100
  if (!total) return <Empty text="No leads yet." />;
  let acc = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 132, height: 132, flexShrink: 0 }}>
        <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%' }}>
          <circle cx="21" cy="21" r={R} fill="none" stroke="#EFF2F6" strokeWidth="5" />
          {data.map(([k, n], i) => {
            const frac = (n / total) * 100;
            const el = <circle key={k} cx="21" cy="21" r={R} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="5"
              strokeDasharray={`${frac.toFixed(2)} ${(100 - frac).toFixed(2)}`} strokeDashoffset={`${(25 - acc).toFixed(2)}`} strokeLinecap="butt" />;
            acc += frac;
            return el;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: INK, lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, color: FAINT, textTransform: 'uppercase' }}>leads</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 130 }}>
        {data.map(([k, n], i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 12.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
            <span style={{ flex: 1, color: MUTED, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
            <b style={{ color: INK }}>{n}</b>
            <span style={{ color: FAINT, fontSize: 11, width: 38, textAlign: 'right' }}>{Math.round((n / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bars({ data, color }: { data: Array<[string, number]>; color: string }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  if (!data.length) return <Empty text="No submissions yet." />;
  return (
    <div>
      {data.map(([k, n]) => (
        <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 30px', alignItems: 'center', gap: 10, padding: '5px 0' }}>
          <span style={{ fontSize: 12.5, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k}</span>
          <span style={{ background: '#F1F4F8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
            <span style={{ display: 'block', width: `${Math.max((n / max) * 100, n ? 4 : 0)}%`, height: '100%', background: `linear-gradient(90deg,${color},${color}C9)`, borderRadius: 999 }} />
          </span>
          <b style={{ fontSize: 12.5, color: INK, textAlign: 'right' }}>{n}</b>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ nav }: ModProps) {
  const { data, error, loading } = useAsync<Stats>(() => apiGet('/admin/stats'), []);
  if (loading) return <p style={{ color: MUTED }}>Loading…</p>;
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
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: INK, letterSpacing: -0.2 }}>Dashboard</h1>
          <p style={{ margin: '3px 0 0', color: MUTED, fontSize: 13 }}>Live across leads, RMA, catalog, content and media · 14-day trends</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {quick.map(([label, mod, icon]) => (
            <button key={label} onClick={() => nav(mod, undefined, { newTab: true })}
              style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${LINE}`, background: '#fff', borderRadius: 8, padding: '7px 12px', fontSize: 12.5, fontWeight: 700, color: INK, cursor: 'pointer', boxShadow: '0 1px 2px rgba(16,24,40,.04)', transition: 'border-color .12s, transform .12s' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 7, background: TEAL + '1C', color: TEAL }}>
                <Icon name={icon as 'doc'} size={12} />
              </span>{label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(196px,1fr))', gap: 12, marginBottom: 14 }}>
        <KpiCard icon="inbox" label="New leads" value={data.submissions.byStatus.new ?? 0} hint={`${data.submissions.open ?? 0} open · ${data.submissions.total} total`} spark={subsSeries} delta={subsDelta} color={TEAL} />
        <KpiCard icon="clock" label="Overdue SLA" value={<span style={{ color: (data.submissions.overdue ?? 0) > 0 ? RED : GREEN }}>{data.submissions.overdue ?? 0}</span>} hint="open leads past dueAt" color={RED} />
        <KpiCard icon="tool" label="Open RMAs" value={data.rma.open} hint={`${data.rma.total} total`} spark={rmaSeries} delta={rmaDelta} color={GOLD} />
        <KpiCard icon="doc" label="Published content" value={contentTotal} hint={`${data.content?.articles ?? 0} articles · ${data.content?.news ?? 0} news · ${data.content?.pages ?? 0} pages · ${data.content?.faqs ?? 0} FAQ`} color={PURPLE} />
        <KpiCard icon="box" label="Catalog" value={data.products} hint={`${data.variants ?? 0} variants · ${data.products} products`} color={BLUE} />
        <KpiCard icon="users" label="Applications" value={data.jobApplications ?? 0} hint={`${data.jobsNew ?? 0} new`} color={GREEN} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(330px,1fr))', gap: 12 }}>
        <Card title="Leads & RMA — last 14 days" subtitle="daily arrivals">
          {s.length ? <AreaChart series={s} /> : <Empty text="No trend data yet." />}
        </Card>

        <Card title="Lead status mix" subtitle="share of all submissions">
          <Donut data={Object.entries(data.submissions.byStatus ?? {})} />
        </Card>

        <Card title="Leads by type">
          <Bars data={Object.entries(data.submissions.byType ?? {})} color={TEAL} />
        </Card>

        <Card title="RMA pipeline">
          {rmaEntries.length === 0 && <Empty text="No RMAs yet." />}
          {rmaEntries.map(([st, n]) => (
            <button key={st} onClick={() => nav('rma', undefined, { newTab: true })}
              style={{ display: 'grid', gridTemplateColumns: '110px 1fr 30px', alignItems: 'center', gap: 10, width: '100%', padding: '5px 0', border: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <Badge value={st} />
              <span style={{ background: '#F1F4F8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${(n / rmaMax) * 100}%`, height: '100%', background: `linear-gradient(90deg,${GOLD},${GOLD}C9)`, borderRadius: 999 }} />
              </span>
              <b style={{ fontSize: 12.5, color: INK, textAlign: 'right' }}>{n}</b>
            </button>
          ))}
        </Card>

        <Card title="SLA risk queue" subtitle="oldest due first — click to open the lead">
          {(data.slaRisk ?? []).length === 0 && <Empty text="No open lead is carrying an SLA clock." />}
          {(data.slaRisk ?? []).map((l) => (
            <button key={l.id} onClick={() => nav('submissions', { kind: 'lead', id: String(l.id), label: l.refCode }, { newTab: true })}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 9px', border: 0, borderRadius: 8, background: l.slaState === 'overdue' ? RED + '0D' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 8, background: (l.slaState === 'overdue' ? RED : GOLD) + '1C', color: l.slaState === 'overdue' ? RED : GOLD, flexShrink: 0 }}>
                <Icon name="clock" size={13} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 12.5, color: INK }}>{l.refCode}</b>
                <span style={{ color: FAINT, fontSize: 11.5 }}> · {l.type} · {l.email}</span>
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: l.slaState === 'overdue' ? RED : '#8A6420', whiteSpace: 'nowrap' }}>
                {l.slaState === 'overdue' ? 'overdue' : l.slaState === 'due_soon' ? 'due <4h' : 'on track'} · {fmtDate(l.dueAt ?? '')}
              </span>
            </button>
          ))}
        </Card>

        <Card title="Media alt-text compliance" subtitle="accessibility of uploaded assets">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: mediaPct >= 90 ? GREEN : mediaPct >= 70 ? GOLD : RED }}>{mediaPct}%</span>
            <span style={{ flex: 1, background: '#F1F4F8', borderRadius: 999, height: 9, overflow: 'hidden' }}>
              <span style={{ display: 'block', width: `${mediaPct}%`, height: '100%', background: mediaPct >= 90 ? GREEN : GOLD, borderRadius: 999, transition: 'width .3s' }} />
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12.5, color: MUTED }}>
            {data.media?.missingAlt ?? 0} of {data.media?.total ?? 0} assets missing alt text —{' '}
            <button onClick={() => nav('media', undefined, { newTab: true })} style={{ border: 0, background: 'none', color: TEAL, cursor: 'pointer', fontSize: 12.5, textDecoration: 'underline', padding: 0, fontWeight: 700 }}>fix in media library</button>
          </p>
        </Card>

        <Card title="Activity" subtitle="latest audited mutations">
          {(data.activity ?? []).length === 0 && <Empty text="No audit rows yet." />}
          {(data.activity ?? []).map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #F0F3F7', fontSize: 12.5, alignItems: 'flex-start' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 7, background: TEAL + '1C', color: TEAL, flexShrink: 0, marginTop: 1 }}>
                <Icon name="zap" size={11} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ color: INK }}>{a.action}</b>
                <span style={{ color: FAINT }}> · {a.entity} #{a.entityId} · {a.actor ?? 'system'}</span>
              </span>
              <span style={{ color: FAINT, fontSize: 11.5, whiteSpace: 'nowrap' }}>{fmtDate(a.at)}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ ...card, padding: '14px 16px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 10, paddingBottom: 9, borderBottom: `1px solid #F0F3F7` }}>
        <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: INK }}>{title}</h3>
        {subtitle && <span style={{ fontSize: 11.5, color: FAINT }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
