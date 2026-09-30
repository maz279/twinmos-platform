// Audit log — read-only, deep-filterable trail (admin role required server-side).
// Phase 1: Interactive filter bar (Entity selector, Actor dropdown, Action type, Date picker, Reset, Export CSV).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { API, apiGet, fmtDate } from '../api';
import { btn, btnGhost, card, Empty, Err, input, Table, td, useAsync } from '../ui';
import { useToast } from '../toast';
import type { ModProps } from '../nav';

type AuditRow = {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  actorId: string | null;
  actorEmail?: string | null;
  requestId: string | null;
  ip: string | null;
  at: string;
};

type UserOption = { id: string; email: string; name: string };

const ENTITY_MODULE: Record<string, string> = {
  product: 'products',
  submission: 'submissions',
  form_submission: 'submissions',
  rma: 'rma',
  rma_request: 'rma',
  article: 'content',
  news_post: 'content',
  page: 'content',
  faq: 'content',
  job_application: 'jobs',
  job_posting: 'jobs',
  media_asset: 'media',
  media_folder: 'media',
  product_variant: 'products',
  compatibility_rule: 'compatibility',
  serial_registry: 'partners',
  partner_org: 'partners',
  translation: 'translations',
  setting: 'settings',
  redirect: 'settings',
  user: 'users',
};

const ENTITIES = [
  { value: '', label: 'All Entities' },
  { value: 'product', label: 'Products' },
  { value: 'article', label: 'Articles' },
  { value: 'news_post', label: 'News Posts' },
  { value: 'page', label: 'Pages' },
  { value: 'faq', label: 'FAQ' },
  { value: 'form_submission', label: 'Submissions / Leads' },
  { value: 'rma_request', label: 'RMA Requests' },
  { value: 'job_application', label: 'Job Applications' },
  { value: 'job_posting', label: 'Job Postings' },
  { value: 'media_asset', label: 'Media Assets' },
  { value: 'media_folder', label: 'Media Folders' },
  { value: 'product_variant', label: 'Product Variants' },
  { value: 'compatibility_rule', label: 'Compatibility Rules' },
  { value: 'serial_registry', label: 'Serial Registry' },
  { value: 'partner_org', label: 'Partner Orgs' },
  { value: 'translation', label: 'Translations' },
  { value: 'setting', label: 'Settings' },
  { value: 'redirect', label: 'Redirects' },
  { value: 'user', label: 'Users & Roles' },
];

export default function AuditLog({ nav, me }: ModProps) {
  const toast = useToast();
  const [entity, setEntity] = useState('');
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load known actors from audit history for all audit readers (editor+)
  const { data: actorsData } = useAsync<{ items: UserOption[] }>(
    () => apiGet<{ items: UserOption[] }>('/admin/audit/actors').catch(() => ({ items: [] })),
    [],
  );
  // Also load full users directory if caller is super_admin
  const { data: usersData } = useAsync<{ items: UserOption[] }>(
    () => me?.user?.role === 'super_admin' ? apiGet<{ items: UserOption[] }>('/admin/users').catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
    [me?.user?.role],
  );

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (entity) p.set('entity', entity);
    if (actorId) p.set('actorId', actorId);
    if (action) p.set('action', action);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    const qs = p.toString();
    return qs ? `?${qs}` : '';
  }, [entity, actorId, action, from, to]);

  const { data, error, loading, reload } = useAsync<{ items: AuditRow[]; cursor: number | null }>(
    () => apiGet('/admin/audit' + query),
    [query],
  );

  // Mirror the first page into rows. A background refetch of the SAME query
  // (TanStack refetchOnWindowFocus) must not collapse accumulated "Load More"
  // pages back to page one — same query merges by id (new audit rows appear,
  // loaded history survives); a CHANGED query resets to the fresh first page.
  const lastQuery = useRef(query);
  useEffect(() => {
    if (!data?.items) return;
    const changed = lastQuery.current !== query;
    lastQuery.current = query;
    setRows((prev) => {
      if (changed || prev.length === 0) return data.items;
      const seen = new Set(data.items.map((r: AuditRow) => r.id));
      const older = prev.filter((r) => !seen.has(r.id));
      return [...data.items, ...older];
    });
    setCursor(data.cursor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, data]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const sep = query ? '&' : '?';
      const res = await apiGet<{ items: AuditRow[]; cursor: number | null }>(
        `/admin/audit${query}${sep}cursor=${cursor}`
      );
      setRows((prev) => [...prev, ...(res.items || [])]);
      setCursor(res.cursor);
    } catch (e) {
      toast.error('Failed to load older records: ' + String(e), { action: { label: 'Retry', run: () => void loadMore() } });
    } finally {
      setLoadingMore(false);
    }
  }

  function reset() {
    setEntity('');
    setActorId('');
    setAction('');
    setFrom('');
    setTo('');
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const res = await fetch(API + '/admin/audit.csv' + query, { credentials: 'include' });
      if (!res.ok) {
        const problemBody = await res.json().catch(() => null);
        throw new Error(problemBody?.detail || problemBody?.title || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `twinmos-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error('Failed to export CSV: ' + (e?.message ?? String(e)), { action: { label: 'Retry', run: () => void exportCsv() } });
    } finally {
      setExporting(false);
    }
  }

  const usersList = useMemo(() => {
    const map = new Map<string, UserOption>();
    for (const u of usersData?.items ?? []) map.set(u.id, u);
    for (const a of actorsData?.items ?? []) {
      if (!map.has(a.id)) map.set(a.id, a);
    }
    return Array.from(map.values());
  }, [usersData, actorsData]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F2A37', letterSpacing: -0.2 }}>Audit log</h1>
          <p style={{ color: '#66748A', margin: '4px 0 0' }}>Comprehensive chronological trail of mutations across all platform surfaces.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnGhost} onClick={reload}>Refresh</button>
          <button style={btn} disabled={exporting} onClick={exportCsv}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Entity</label>
          <select
            style={{ ...input, minWidth: 160 }}
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
          >
            {ENTITIES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Actor</label>
          {usersList.length > 0 ? (
            <select
              style={{ ...input, minWidth: 160 }}
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
            >
              <option value="">All Actors</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
              ))}
            </select>
          ) : (
            <input
              style={{ ...input, width: 140 }}
              placeholder="Actor ID"
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Action</label>
          <input
            style={{ ...input, width: 140 }}
            placeholder="e.g. create, update"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>From Date</label>
          <input
            type="date"
            style={input}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>To Date</label>
          <input
            type="date"
            style={input}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <button style={btnGhost} onClick={reset}>Reset</button>
      </div>

      {error ? <Err error={error} /> : null}

      {loading && rows.length === 0 ? (
        <p style={{ color: '#66748A', padding: '16px 0' }}>Loading audit records…</p>
      ) : rows.length > 0 ? (
        <>
          <Table head={['When', 'Action', 'Entity', 'Actor', 'IP & Request', '']}>
            {rows.map((row) => {
              const target = ENTITY_MODULE[row.entity];
              return (
                <tr key={row.id}>
                  <td style={td}>{fmtDate(row.at)}</td>
                  <td style={td}><b>{row.action}</b></td>
                  <td style={td}>{row.entity} #{row.entityId}</td>
                  <td style={td}>
                    {row.actorEmail ? (
                      <div>
                        <div>{row.actorEmail}</div>
                        <span style={{ fontSize: 11, color: '#64748B' }}>{row.actorId}</span>
                      </div>
                    ) : (
                      row.actorId ?? '—'
                    )}
                  </td>
                  <td style={{ ...td, color: '#66748A', fontSize: 12 }}>
                    <div>{row.ip ?? <span style={{ color: '#93A0B4' }}>no IP on record</span>}</div>
                    {row.requestId && <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#93A0B4' }}>{row.requestId}</div>}
                  </td>
                  <td style={{ ...td, width: 90 }}>
                    {target && (
                      <button
                        onClick={() => nav(target, { kind: row.entity, id: row.entityId, label: `${row.entity} #${row.entityId}` }, { newTab: true })}
                        style={{ fontSize: 12, padding: '3px 8px', cursor: 'pointer', border: '1px solid #D9E0E8', borderRadius: 6, background: '#fff' }}>
                        Open ↗
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
          {cursor && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button style={btnGhost} disabled={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Loading older records…' : 'Load More Older Records ↓'}
              </button>
            </div>
          )}
        </>
      ) : null}

      {!loading && rows.length === 0 && <Empty text="No audit records match the selected filters." />}
    </div>
  );
}
