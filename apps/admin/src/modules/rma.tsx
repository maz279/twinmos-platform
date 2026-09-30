// RMA board — Kanban-first case management (TASK 6.6) + dense table.
// Default view is a 7-column board, one column per RMA_STATUS in pipeline
// order, horizontally scrollable, sticky per-column headers with live counts.
// Cards carry number / customer+contact / SKU chip / age chip and ONE
// quick-action button per legal next state from the shared RMA_TRANSITIONS
// matrix — click-to-transition only (no drag-and-drop) so the state machine
// stays explicit and identical to the server's (POST /admin/rma/:id/transition,
// apps/api/src/routes/admin.ts). The dense table is retained behind a
// Board | Table toggle for administrative export.
import React, { useMemo, useState } from 'react';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, card, Empty, Err, input, Table, td, useAsync, FAINT, GOLD, INK, LINE, MUTED, PAGE, PURPLE, TEAL } from '../ui';
import { useToast } from '../toast';
import { RMA_TRANSITIONS, RMA_STATUS } from '@twinmos/shared';

type RmaStatus = (typeof RMA_STATUS)[number];
type RmaRow = {
  id: number; number: string; productSku: string | null; serial: string | null; issue: string;
  status: RmaStatus; customer: Record<string, unknown>; warrantyTier: string | null;
  createdAt: string; updatedAt: string;
};
type RmaDetail = RmaRow & { timeline: Array<{ id: number; fromStatus: string; toStatus: string; actorId: string | null; note: string | null; at: string }> };

/** Inverse of from→to is to→from; it is only legal when the shared matrix
 *  allows the way back, so this single lookup checks BOTH directions.
 *  Today's pipeline is forward-only (… → closed, closed: []) so no transition
 *  has a legal inverse and UNDO is omitted — the check stays matrix-driven,
 *  so a reopen path added to RMA_TRANSITIONS lights UNDO up automatically. */
function inverseOf(from: RmaStatus, to: RmaStatus): RmaStatus | null {
  return (RMA_TRANSITIONS[to] ?? []).includes(from) ? from : null;
}

/** API problem surface (title + detail) flattened for a toast line — same
 *  composition the <Err/> atom renders inline. */
function errText(e: unknown): string {
  const err = e as { message?: string; detail?: string };
  return err?.message ? `${err.message}${err.detail ? ` — ${err.detail}` : ''}` : String(e);
}

/** Age chip label from createdAt: minutes under an hour, hours under a day,
 *  days after. Turns GOLD from 7 days — GOLD is the RMA/warning token. */
function ageChip(iso: string): { label: string; tone: string } {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  const label = mins < 60 ? `${mins}m` : mins < 1440 ? `${Math.floor(mins / 60)}h` : `${Math.floor(mins / 1440)}d`;
  return { label: `${label} old`, tone: mins >= 7 * 1440 ? GOLD : FAINT };
}

// Compact card quick-actions — same btn/btnGhost token styles, smaller metrics.
const btnSm: React.CSSProperties = { ...btn, padding: '5px 9px', fontSize: 11.5, borderRadius: 7 };
const btnSmGhost: React.CSSProperties = { ...btnGhost, padding: '5px 9px', fontSize: 11.5, borderRadius: 7 };

export default function RmaBoard({ canWrite }: { canWrite: boolean }) {
  const toast = useToast();
  const [view, setView] = useState<'board' | 'table'>('board');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [pending, setPending] = useState<string | null>(null); // `${id}:${to}` while a card transition is in flight
  const qs = new URLSearchParams();
  // limit=100 (the API cap, apps/api/src/routes/admin.ts) so the later
  // pipeline columns are not starved by the newest-first default of 50.
  qs.set('limit', '100');
  if (status) qs.set('status', status);
  if (q) qs.set('q', q);
  const { data, error, loading, reload } = useAsync<{ items: RmaRow[] }>(() => apiGet('/admin/rma?' + qs.toString()), [status, q]);

  // Columns are exactly RMA_STATUS (pipeline order) — every status always has
  // a column even when empty; counts are live off the current fetch.
  const columns = useMemo(() => {
    const by = new Map<RmaStatus, RmaRow[]>(RMA_STATUS.map((s) => [s, []]));
    for (const rma of data?.items ?? []) by.get(rma.status)?.push(rma);
    for (const rows of by.values()) rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); // oldest (most urgent) on top
    return by;
  }, [data]);

  /** Card quick-action: same endpoint+payload shape as the detail panel, plus
   *  the toast contract — success `RMA-xxx -> <state>` with UNDO when the
   *  inverse transition is legal, error carrying the API message. */
  async function move(rma: RmaRow, to: RmaStatus) {
    const from = rma.status;
    const key = `${rma.id}:${to}`;
    setPending(key);
    try {
      await apiSend('POST', `/admin/rma/${rma.id}/transition`, { to });
      const back = inverseOf(from, to);
      toast.success(`${rma.number} -> ${to}`, back
        ? { action: { label: 'Undo', run: () => { void move({ ...rma, status: to }, back); } } }
        : undefined);
      reload();
    } catch (e) {
      toast.error(`${rma.number}: ${errText(e)}`);
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: INK, letterSpacing: -0.2 }}>RMA board</h1>
      <RmaAnalyticsStrip />
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All states</option>
          {RMA_STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <input style={input} placeholder="Search RMA number" value={q} onChange={(e) => setQ(e.target.value.trim())} />
        <div role="group" aria-label="View" style={{ marginLeft: 'auto', display: 'inline-flex', border: `1px solid ${LINE}`, borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
          {(['board', 'table'] as const).map((v) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)}
              style={view === v
                ? { ...btnSm, borderRadius: 0, boxShadow: 'none' }
                : { ...btnSmGhost, borderRadius: 0, border: 0, color: MUTED }}>
              {v === 'board' ? 'Board' : 'Table'}
            </button>
          ))}
        </div>
      </div>
      {error ? <Err error={error} /> : null}
      {loading ? <p>Loading…</p> : data ? (
        data.items.length === 0 ? <Empty text="No RMA requests match." /> :
        view === 'board' ? (
          <div className="tm-scroll-light" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', overflowX: 'auto', maxHeight: '72vh', padding: '2px 2px 10px' }}>
            {RMA_STATUS.map((s) => (
              <BoardColumn key={s} status={s} rows={columns.get(s) ?? []} canWrite={canWrite}
                pending={pending} onMove={move} onOpen={(id) => setOpenId(openId === id ? null : id)} />
            ))}
          </div>
        ) : (
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
        )
      ) : null}
      {openId != null && <RmaDetailPanel id={openId} canWrite={canWrite} onChanged={reload} />}
    </div>
  );
}

// ---- Kanban -------------------------------------------------------------------------------------------------

function BoardColumn({ status, rows, canWrite, pending, onMove, onOpen }: {
  status: RmaStatus; rows: RmaRow[]; canWrite: boolean; pending: string | null;
  onMove: (rma: RmaRow, to: RmaStatus) => void; onOpen: (id: number) => void;
}) {
  return (
    <section style={{ flex: '0 0 252px', width: 252, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* sticky within the board's scroll box; tinted by the existing Badge tones */}
      <header style={{ ...card, position: 'sticky', top: 0, zIndex: 2, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge value={status} />
        <span title={`${rows.length} case${rows.length === 1 ? '' : 's'}`}
          style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: MUTED, background: PAGE, border: `1px solid ${LINE}`, borderRadius: 99, padding: '1px 9px' }}>{rows.length}</span>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 4 }}>
        {rows.length === 0 && (
          <div style={{ border: `1px dashed ${LINE}`, borderRadius: 10, padding: '14px 10px', textAlign: 'center', color: FAINT, fontSize: 12 }}>No cases</div>
        )}
        {rows.map((rma) => (
          <RmaCard key={rma.id} rma={rma} canWrite={canWrite} pending={pending} onMove={onMove} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

function RmaCard({ rma, canWrite, pending, onMove, onOpen }: {
  rma: RmaRow; canWrite: boolean; pending: string | null;
  onMove: (rma: RmaRow, to: RmaStatus) => void; onOpen: (id: number) => void;
}) {
  const legal = RMA_TRANSITIONS[rma.status] ?? [];
  const age = ageChip(rma.createdAt);
  const sku = String(rma.customer?.product ?? rma.productSku ?? '');
  const contact = String(rma.customer?.email ?? rma.customer?.phone ?? '');
  return (
    <article className="tm-card-hover" style={{ ...card, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => onOpen(rma.id)} title="Open case detail"
          style={{ border: 0, background: 'none', padding: 0, font: 'inherit', color: INK, fontWeight: 800, fontSize: 13, cursor: 'pointer', textAlign: 'left', overflowWrap: 'anywhere' }}>
          {rma.number}
        </button>
        <span title={`Created ${fmtDate(rma.createdAt)}`}
          style={{ marginLeft: 'auto', flexShrink: 0, color: age.tone, background: age.tone + '1C', border: `1px solid ${age.tone}44`, borderRadius: 99, padding: '1px 8px', fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {age.label}
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: INK, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(rma.customer?.name ?? '—')}</span>
        {contact && <span style={{ color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact}</span>}
      </div>
      {sku && (
        <span title="Product SKU" style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 700, color: MUTED, background: PAGE, border: `1px solid ${LINE}`, borderRadius: 6, padding: '2px 7px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
          {sku}
        </span>
      )}
      {canWrite && legal.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: `1px solid ${LINE}`, paddingTop: 8 }}>
          {legal.map((s) => (
            <button key={s} style={s === 'closed' ? btnSmGhost : btnSm} disabled={pending !== null}
              title={`Move to ${s.replace(/_/g, ' ')}`} onClick={() => onMove(rma, s)}>
              → {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}
      {canWrite && legal.length === 0 && (
        <span style={{ fontSize: 11.5, color: FAINT, borderTop: `1px solid ${LINE}`, paddingTop: 8 }}>Closed — no further transitions</span>
      )}
    </article>
  );
}

// ---- detail drawer (timeline + note + customer email), retained; toasts added (TASK 6.6 §3) ------------------

function RmaDetailPanel({ id, canWrite, onChanged }: { id: number; canWrite: boolean; onChanged: () => void }) {
  const toast = useToast();
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { data, error: loadError, loading, reload } = useAsync<RmaDetail>(() => apiGet(`/admin/rma/${id}`), [id]);
  async function transition(to: RmaStatus) {
    setBusy(true); setError(null);
    const from = data?.status;
    const number = data?.number;
    try {
      await apiSend('POST', `/admin/rma/${id}/transition`, { to, note: note || undefined, notifyCustomer: notify });
      setNote('');
      const back = from ? inverseOf(from, to) : null;
      toast.success(`${number ?? `RMA #${id}`} -> ${to}`, back
        ? { action: { label: 'Undo', run: () => {
            void apiSend('POST', `/admin/rma/${id}/transition`, { to: back })
              .then(() => { reload(); onChanged(); })
              .catch((e2) => toast.error(`${number ?? `RMA #${id}`}: ${errText(e2)}`));
          } } }
        : undefined);
      reload(); onChanged();
    } catch (e) {
      setError(e);
      toast.error(`${number ?? `RMA #${id}`}: ${errText(e)}`);
    } finally { setBusy(false); }
  }
  if (loading) return <p style={{ marginTop: 14 }}>Loading case…</p>;
  if (loadError) return <div style={{ marginTop: 14 }}><Err error={loadError} /></div>;
  if (!data) return null;
  const legal = RMA_TRANSITIONS[data.status] ?? [];
  return (
    <div style={{ marginTop: 16, border: `1px solid ${LINE}`, borderRadius: 10, padding: 16, background: '#F8FAFC' }}>
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
            <span style={{ color: MUTED }}> · {fmtDate(ev.at)}{ev.note ? ` · ${ev.note}` : ''}</span>
          </li>
        ))}
      </ol>
      {canWrite && (
        <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input style={{ ...input, flex: '1 1 240px' }} placeholder="Note (optional, included in customer email)" value={note} onChange={(e) => setNote(e.target.value)} />
            <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email customer
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {legal.length === 0 && <span style={{ color: MUTED }}>Case is closed — no further transitions.</span>}
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

// ---- Phase 7.1: RMA analytics strip ----------------------------------------
type RmaAnalytics = {
  total: number; open: number;
  byStatus: Array<{ status: string; n: number }>;
  reasons: Array<{ category: string; n: number }>;
  avgResolutionDays: number | null;
  trend: Array<{ m: string; n: number }>;
};

/** Compact §7.1 dashboard above the board: status distribution bars,
 *  return-reason bars, avg resolution and the 6-month trend. Collapsible so
 *  board-first operators can fold it away. */
function RmaAnalyticsStrip() {
  const { data, error, loading } = useAsync<RmaAnalytics>(() => apiGet('/admin/analytics/rma'), []);
  if (loading) return null;
  if (error || !data) return null; // analytics are additive — never block the board
  const maxReason = Math.max(1, ...data.reasons.map((x) => x.n));
  const maxTrend = Math.max(1, ...data.trend.map((x) => x.n));
  return (
    <details style={{ border: `1px solid ${LINE}`, borderRadius: 12, background: '#fff', padding: '10px 16px', marginTop: 12 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 800, color: INK, userSelect: 'none' }}>
        Analytics — <span style={{ color: MUTED, fontWeight: 400 }}>{data.total} cases · {data.open} open{data.avgResolutionDays != null ? ` · avg resolution ${data.avgResolutionDays}d` : ''}</span>
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, marginBottom: 6 }}>Status distribution</div>
          {data.byStatus.map((x) => (
            <div key={x.status} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 30px', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <Badge value={x.status} />
              <span style={{ background: '#F1F4F8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${(x.n / Math.max(1, data.total)) * 100}%`, height: '100%', background: GOLD, borderRadius: 999 }} />
              </span>
              <b style={{ fontSize: 12.5, color: INK, textAlign: 'right' }}>{x.n}</b>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, marginBottom: 6 }}>Return reasons by category</div>
          {data.reasons.map((x) => (
            <div key={x.category} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 30px', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <span style={{ fontSize: 12.5, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.category}</span>
              <span style={{ background: '#F1F4F8', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${(x.n / maxReason) * 100}%`, height: '100%', background: TEAL, borderRadius: 999 }} />
              </span>
              <b style={{ fontSize: 12.5, color: INK, textAlign: 'right' }}>{x.n}</b>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, marginBottom: 6 }}>Volume — last 6 months</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 84, borderBottom: `1px solid ${LINE}` }}>
            {data.trend.map((x) => (
              <div key={x.m} title={`${x.m}: ${x.n}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <span style={{ width: '70%', borderRadius: '3px 3px 0 0', background: PURPLE, height: `${Math.max((x.n / maxTrend) * 100, x.n ? 4 : 0)}%` }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
            {data.trend.map((x) => (
              <span key={x.m} style={{ flex: 1, textAlign: 'center', fontSize: 8.5, color: FAINT }}>{x.m.slice(5)}</span>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}
