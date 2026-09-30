// Phase 7.1 chart primitives — zero-dependency inline SVG, matching the
// console's existing architecture decision (dashboard.tsx hand-builds its
// area/donut/bars the same way; the plan's Recharts option was declined to
// keep the Phase 6 code-split entry small). All charts draw from the ui.tsx
// token palette so they sit inside the navy/teal reference theme.
import React from 'react';
import { FAINT, GOLD, GREEN, INK, LINE, MUTED, RED, TEAL } from './ui';

/** §7.1 lead funnel — horizontal bars whose width encodes cumulative stage
 *  reach, with stage-to-stage conversion percentages between rows. */
export function Funnel({ data }: { data: Array<{ stage: string; count: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (!data.length) return null;
  return (
    <div>
      {data.map((d, i) => {
        const prev = i > 0 ? data[i - 1].count : null;
        const conv = prev && prev > 0 ? Math.round((d.count / prev) * 100) : null;
        return (
          <div key={d.stage} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 76px', alignItems: 'center', gap: 10, padding: '5px 0' }}>
            <span style={{ fontSize: 12.5, color: MUTED, textTransform: 'capitalize' }}>{d.stage.replace(/_/g, ' ')}</span>
            <span style={{ background: '#F1F4F8', borderRadius: 6, height: 18, overflow: 'hidden' }}>
              <span style={{ display: 'block', width: `${Math.max((d.count / max) * 100, d.count ? 4 : 0)}%`, height: '100%', background: `linear-gradient(90deg,${TEAL},${TEAL}C9)`, borderRadius: 6 }} />
            </span>
            <span style={{ fontSize: 12.5, textAlign: 'right' }}>
              <b style={{ color: INK }}>{d.count}</b>
              {conv !== null && <span style={{ color: FAINT, fontSize: 10.5, display: 'block' }}>{conv}% of prev</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** §7.1 SLA gauge — a semicircular arc whose filled sweep encodes the share
 *  of open leads still inside their SLA window (healthyPct 0..100). */
export function Gauge({ value, label, sub }: { value: number; label: string; sub?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const R = 52; const CX = 64; const CY = 62;
  const angle = Math.PI * (1 - v / 100); // 180°..0°
  const EX = CX + R * Math.cos(angle); const EY = CY - R * Math.sin(angle);
  const largeArc = v > 50 ? 1 : 0;
  const tone = v >= 80 ? GREEN : v >= 50 ? GOLD : RED;
  return (
    <div style={{ textAlign: 'center', minWidth: 128 }}>
      <svg viewBox="0 0 128 74" width="128" height="74" role="img" aria-label={`${label}: ${v}%`}>
        <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke="#EDF1F5" strokeWidth="11" strokeLinecap="round" />
        {v > 0 && (
          <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 ${largeArc} 1 ${EX} ${EY}`} fill="none" stroke={tone} strokeWidth="11" strokeLinecap="round" />
        )}
        <text x={CX} y={CY - 12} textAnchor="middle" fontSize="21" fontWeight="800" fill={INK}>{v}%</text>
      </svg>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/** §7.1 translation coverage heatmap — locales × namespaces cells tinted by
 *  key-exact coverage; the exact shape CAT vendors and §5.1 progress feed. */
export function Heatmap({ namespaces, coverage, locales }: {
  namespaces: string[];
  coverage: Record<string, Record<string, number>>;
  locales: readonly string[];
}) {
  if (!namespaces.length) return null;
  const cellColor = (pct: number): string => {
    if (pct >= 100) return GREEN;
    if (pct >= 75) return TEAL;
    if (pct >= 50) return GOLD;
    if (pct > 0) return '#D98E3B';
    return '#EDF1F5';
  };
  const textColor = (pct: number): string => (pct > 0 ? '#fff' : FAINT);
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 11.5 }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 8px', borderBottom: `1px solid ${LINE}`, color: FAINT, fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'left' }}>locale</th>
            {namespaces.map((ns) => (
              <th key={ns} style={{ padding: '4px 6px', borderBottom: `1px solid ${LINE}`, color: FAINT, fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>{ns}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {locales.map((l) => (
            <tr key={l}>
              <td style={{ padding: '3px 8px', color: INK, fontWeight: 700, whiteSpace: 'nowrap' }}>{l}</td>
              {namespaces.map((ns) => {
                const pct = coverage[l]?.[ns] ?? 0;
                return (
                  <td key={ns} style={{ padding: 2 }}>
                    <span title={`${l}/${ns}: ${pct}%`} style={{ display: 'grid', placeItems: 'center', minWidth: 40, padding: '3px 4px', borderRadius: 5, background: cellColor(pct), color: textColor(pct), fontWeight: 700, fontSize: 10.5 }}>
                      {pct}%
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
/** §7.1 grouped weekly bars — publish velocity: article/news series per week. */
export function WeeklyBars({ weeks, series }: {
  weeks: string[];
  series: Array<{ key: string; color: string; values: number[] }>;
}) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 11.5, color: MUTED, fontWeight: 700, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />{s.key}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 108, borderBottom: `1px solid ${LINE}`, paddingBottom: 0 }}>
        {weeks.map((w, i) => (
          <div key={w} title={`${w}: ${series.map((s) => `${s.key}=${s.values[i] ?? 0}`).join(', ')}`}
            style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, height: '100%' }}>
            {series.map((s) => (
              <span key={s.key} style={{ width: 7, borderRadius: '3px 3px 0 0', background: s.color, height: `${Math.max(((s.values[i] ?? 0) / max) * 100, (s.values[i] ?? 0) ? 3 : 0)}%` }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
        {weeks.map((w, i) => (
          <span key={w} style={{ flex: 1, textAlign: 'center', fontSize: 8.5, color: FAINT }}>{i % 2 === 0 ? w.slice(5) : ''}</span>
        ))}
      </div>
    </div>
  );
}
