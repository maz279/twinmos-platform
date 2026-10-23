// CMS Content module — Phase 2 authoring studio:
//   • Pages compose via the visual page-builder (13 block types, drag reorder,
//     live responsive preview) — no raw JSON anywhere.
//   • Articles/News/FAQ write markdown through a formatting toolbar with direct
//     media-library image insertion.
//   • Two-person review: prominent Submit-for-Review, a Review Queue tab for
//     editors, editorial comments, and a visual diff against the published
//     revision before approving.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ApiError, apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, CommandBar, Empty, Err, input, PageHeader, Table, td, Toolbar, useAsync, usePanelScroll, FAINT, INK, LINE, MUTED, TEAL } from '../ui';
import { Heatmap, WeeklyBars } from '../charts';
import { CONTENT_STATUS, LOCALES } from '@twinmos/shared';
import PageBuilder from './page-builder/PageBuilder';
import { BlockPreview, PreviewModal } from './page-builder/preview';
import type { PageBlock } from './page-builder/blocks';
import MarkdownToolbar from '../markdown-toolbar';
import { DiffView } from '../diff';

type Row = {
  id: number; slug?: string; title: string; status: string; category?: string; tag?: string;
  groupKey?: string; question?: string; publishAt: string | null; updatedAt: string;
  authorId: string | null; deck?: string | null; body?: string; blocks?: PageBlock[];
};
type Revision = { id: number; actorId: string | null; createdAt: string; snapshot: Record<string, unknown> };
type Comment = { id: number; body: string; createdAt: string; authorId: string | null; authorEmail: string | null; authorName: string | null };

const ENTITIES = [
  { key: 'article', label: 'Articles' },
  { key: 'news', label: 'News & Events' },
  { key: 'page', label: 'Pages' },
  { key: 'faq', label: 'FAQ' },
] as const;

function legalNext(status: string): string[] {
  const M: Record<string, string[]> = {
    draft: ['in_review', 'published', 'archived'],
    in_review: ['scheduled', 'published', 'draft', 'archived'],
    scheduled: ['published', 'draft', 'archived'],
    published: ['archived'],
    archived: ['draft'],
  };
  return M[status] ?? [];
}

const PAGE_SIZE = 25;

/** Items whose workflow allows a direct jump to published (bulk-publish scope). */
function canDirectPublish(status: string): boolean {
  return legalNext(status).includes('published');
}

export default function Content({ canPublish, canWrite }: { canPublish: boolean; canWrite?: boolean }) {
  const [entity, setEntity] = useState<string>('article');
  const [status, setStatus] = useState('');
  const [view, setView] = useState<'library' | 'review'>('library');
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  // Library ergonomics for large draft backlogs (the corpus import leaves ~400 drafts):
  // title search (server-side ilike), pagination (server offset + total), bulk publish.
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  const qs = new URLSearchParams();
  if (status) qs.set('status', qs_status(view));
  if (view === 'library') {
    qs.set('limit', String(PAGE_SIZE));
    qs.set('offset', String(page * PAGE_SIZE));
    if (q) qs.set('q', q);
  }
  const { data, error, loading, reload } = useAsync<{ items: Row[]; total?: number }>(
    () => apiGet(`/admin/content/${entity}?` + qs.toString()), [entity, status, view, q, page]);
  // Review queue spans every content entity
  const queue = useAsync<{ items: Row[] }[]>(
    async () => Promise.all(['article', 'news', 'page'].map((e) => apiGet<{ items: Row[] }>(`/admin/content/${e}?status=in_review`))), [view]);

  function qs_status(v: string): string {
    if (v === 'review') return 'in_review';
    return status;
  }

  function switchEntity(e: string) {
    setEntity(e); setEditing(null); setPage(0); setQ(''); setQInput(''); setSel(new Set()); setBulkMsg(null);
  }

  const total: number = data?.total ?? data?.items.length ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const publishable = (data?.items ?? []).filter((r) => canDirectPublish(r.status));
  const selPublishable = publishable.filter((r) => sel.has(r.id));

  async function movePage(row: Row, delta: 1 | -1) {
    // Swap the sort value with the adjacent page in the loaded list.
    const items = data?.items ?? [];
    const idx = items.findIndex((r) => r.id === row.id);
    const other = items[idx + delta];
    if (!other || idx < 0) return;
    const a = (row as any).sort ?? 0;
    const b = (other as any).sort ?? 0;
    try {
      await Promise.all([
        apiSend('PATCH', `/admin/content/page/${row.id}`, { sort: b === a ? a + delta : b }),
        apiSend('PATCH', `/admin/content/page/${other.id}`, { sort: a === b ? a : a }),
      ]);
      reload();
    } catch { /* surfaced by the next reload */ }
  }

  async function bulkPublish() {
    if (!confirmBulk) { setConfirmBulk(true); return; } // two-step inline confirm
    setBulkBusy(true); setBulkMsg(null);
    let ok = 0; const failed: string[] = [];
    for (const row of selPublishable) {
      try { await apiSend('POST', `/admin/content/${entity}/${row.id}/transition`, { to: 'published' }); ok++; }
      catch { failed.push(row.title ?? row.question ?? String(row.id)); }
    }
    setBulkBusy(false); setConfirmBulk(false); setSel(new Set());
    setBulkMsg(failed.length ? `Published ${ok}; ${failed.length} failed (in-review/editor permission or transition rules): ${failed.slice(0, 3).join(', ')}${failed.length > 3 ? '…' : ''}` : `Published ${ok} item(s).`);
    reload();
  }

  function openFromQueue(row: Row, rowEntity: string) {
    setEntity(rowEntity);
    setView('library');
    setEditing(row);
  }

  const queueRows = useMemo(() => {
    if (view !== 'review') return [];
    const labels = ['article', 'news', 'page'] as const;
    return (queue.data ?? []).flatMap((d, i) => (d.items ?? []).map((row) => ({ row, entity: labels[i] })));
  }, [view, queue.data]);

  return (
    <div>
      <PageHeader title="Content studio" />
      <ContentAnalyticsStrip />
      <Toolbar style={{ margin: '12px 0' }}>
        <button style={view === 'library' ? btn : btnGhost} onClick={() => { setView('library'); setEditing(null); }}>Library</button>
        <button style={view === 'review' ? btn : btnGhost} onClick={() => { setView('review'); setEditing(null); }}>
          Review queue {queueRows.length ? <span style={{ background: '#1DBF9F', color: '#fff', borderRadius: 999, fontSize: 10.5, padding: '1px 7px', marginLeft: 6 }}>{queueRows.length}</span> : null}
        </button>
        <span style={{ flex: 1 }} />
        {view === 'library' && <>
          {ENTITIES.map((e) => (
            <button key={e.key} style={entity === e.key ? btn : btnGhost} onClick={() => switchEntity(e.key)}>{e.label}</button>
          ))}
          <select style={input} value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            <option value="">All statuses</option>
            {CONTENT_STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <button style={btn} onClick={() => setEditing('new')}>+ New {entity}</button>
        </>}
      </Toolbar>

      {view === 'review' ? (
        queue.error ? <Err error={queue.error} /> : queue.loading ? <p>Loading…</p> : (
          <>
            <p style={{ color: '#66748A', fontSize: 13, margin: '0 0 10px' }}>Items submitted for review across articles, news and pages — open one to diff it against the live version, leave feedback, then publish or send back.</p>
            <Table head={['Title', 'Type', 'Submitted', '']}>
              {queueRows.map(({ row, entity: e }) => (
                <tr key={`${e}-${row.id}`}>
                  <td style={td}><b>{row.title ?? row.question}</b></td>
                  <td style={td}>{e}</td>
                  <td style={{ ...td, color: '#66748A' }}>{fmtDate(row.updatedAt)}</td>
                  <td style={td}><button style={btnGhost} onClick={() => openFromQueue(row, e)}>Review</button></td>
                </tr>
              ))}
            </Table>
            {queueRows.length === 0 && <Empty text="Nothing waiting for review. 🎉" />}
          </>
        )
      ) : (
        <>
          <Toolbar style={{ margin: '0 0 10px' }}>
            <input style={{ ...input, width: 280 }} placeholder={`Search ${entity} title…`}
              value={qInput} onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setQ(qInput.trim()); setPage(0); setSel(new Set()); } }} />
            <button style={btnGhost} onClick={() => { setQ(qInput.trim()); setPage(0); setSel(new Set()); }}>Search</button>
            {(q || qInput) && <button style={btnGhost} onClick={() => { setQ(''); setQInput(''); setPage(0); setSel(new Set()); }}>Clear</button>}
            <span style={{ flex: 1 }} />
            {canPublish && publishable.length > 0 && (
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 12.5, color: '#66748A', display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selPublishable.length === publishable.length && publishable.length > 0}
                    onChange={(e) => setSel(e.target.checked ? new Set(publishable.map((r) => r.id)) : new Set())} />
                  Select page ({publishable.length} publishable)
                </label>
                {selPublishable.length > 0 && (
                  <button style={confirmBulk ? btn : btnGhost} disabled={bulkBusy} onClick={bulkPublish}
                    title="Publishes each selected draft straight to the live site (audited per item)">
                    {bulkBusy ? 'Publishing…' : confirmBulk ? `Confirm — publish ${selPublishable.length}` : `Publish ${selPublishable.length} selected`}
                  </button>
                )}
                {confirmBulk && !bulkBusy && <button style={btnGhost} onClick={() => setConfirmBulk(false)}>Cancel</button>}
              </span>
            )}
          </Toolbar>
          {bulkMsg && (
            <div role="status" style={{ margin: '0 0 10px', padding: '8px 12px', borderRadius: 8, background: '#EDFAF6', border: '1px solid #BFE8DC', color: '#0F6B54', fontSize: 13 }}>
              {bulkMsg}
            </div>
          )}
          {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
            <Table head={[...(canPublish ? [''] : []), 'Title', 'Slug / Group', 'Status', 'Updated', '']}>
              {data.items.map((row) => {
                const selectable = canPublish && canDirectPublish(row.status);
                return (
                  <tr key={row.id}>
                    {canPublish && (
                      <td style={{ ...td, width: 30 }}>
                        {selectable && (
                          <input type="checkbox" checked={sel.has(row.id)}
                            onChange={(e) => setSel((prev) => { const next = new Set(prev); e.target.checked ? next.add(row.id) : next.delete(row.id); return next; })} />
                        )}
                      </td>
                    )}
                    <td style={td}><b>{row.title ?? row.question}</b></td>
                    <td style={{ ...td, color: '#66748A' }}>{row.slug ?? row.groupKey}</td>
                    <td style={td}><Badge value={row.status} /></td>
                    <td style={td}>{fmtDate(row.updatedAt ?? row.publishAt)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      {/* T4.6.4: page-tree reorder — keyboard-reachable buttons, no drag required (WCAG 2.5.7). */}
                      {entity === 'page' && (
                        <>
                          <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} aria-label={`Move ${row.title} up`}
                            onClick={() => void movePage(row, -1)}>▲</button>{' '}
                          <button style={{ ...btnGhost, padding: '2px 7px', fontSize: 11 }} aria-label={`Move ${row.title} down`}
                            onClick={() => void movePage(row, 1)}>▼</button>{' '}
                        </>
                      )}
                      <button style={btnGhost} onClick={() => setEditing(row)}>Edit</button></td>
                  </tr>
                );
              })}
            </Table>
          ) : null}
          {data && data.items.length === 0 && <Empty text={q ? `No ${entity} matches “${q}”.` : 'No content — create the first item.'} />}
          {view === 'library' && total != null && total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 12.5, color: '#66748A' }}>
              <button style={{ ...btnGhost, padding: '4px 10px' }} disabled={page === 0} onClick={() => { setPage((p) => Math.max(0, p - 1)); setSel(new Set()); }}>← Prev</button>
              <span>Page {page + 1} of {pages} · {total} item{total === 1 ? '' : 's'}{q ? ` matching “${q}”` : ''}</span>
              <button style={{ ...btnGhost, padding: '4px 10px' }} disabled={page + 1 >= pages} onClick={() => { setPage((p) => p + 1); setSel(new Set()); }}>Next →</button>
            </div>
          )}
        </>
      )}

      {editing && (
        <Editor
          key={editing === 'new' ? 'new' : `row-${(editing as Row).id}-${(editing as Row).status ?? ''}`}
          entity={entity}
          row={editing === 'new' ? null : editing}
          canPublish={canPublish}
          canWrite={canWrite ?? canPublish}
          onClose={() => { setEditing(null); queue.reload(); }}
          onSaved={reload}
          onCreated={(fresh) => setEditing(fresh)}
        />
      )}
    </div>
  );
}

function Editor({ entity, row: initialRow, canPublish, canWrite, onClose, onSaved, onCreated }: {
  entity: string; row: Row | null; canPublish: boolean; canWrite: boolean; onClose: () => void; onSaved: () => void; onCreated: (row: Row) => void;
}) {
  const [row, setRow] = useState<Row | null>(initialRow); // becomes the created item after save
  const isNew = !row;
  const [title, setTitle] = useState(row?.title ?? '');
  const [slug, setSlug] = useState(row?.slug ?? '');
  const [deck, setDeck] = useState(row?.deck ?? '');
  const [body, setBody] = useState(row?.body ?? '');
  const [tag, setTag] = useState((row as any)?.tag ?? '');
  const [eventDate, setEventDate] = useState('');
  const [blocks, setBlocks] = useState<PageBlock[]>(
    row && Array.isArray((row as any).blocks) ? (row as any).blocks as PageBlock[] : []
  );
  const [rawBlocks, setRawBlocks] = useState(false); // JSON escape hatch (power users)
  const [rawBlocksText, setRawBlocksText] = useState(
    row && Array.isArray((row as any).blocks) ? JSON.stringify((row as any).blocks, null, 2) : '[]'
  );
  // Pages module metadata (T4.6.4 / C3b)
  const [locale, setLocale] = useState<string>((row as any)?.locale ?? 'en');
  const [path, setPath] = useState<string>((row as any)?.path ?? '');
  const [template, setTemplate] = useState<string>((row as any)?.template ?? 'default');
  const [seoTitle, setSeoTitle] = useState<string>((row as any)?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState<string>((row as any)?.seoDescription ?? '');
  const [ogMediaId, setOgMediaId] = useState<string>((row as any)?.ogMediaId ? String((row as any).ogMediaId) : '');
  const [noindex, setNoindex] = useState<boolean>((row as any)?.noindex ?? false);
  const [parentId, setParentId] = useState<string>((row as any)?.parentId ? String((row as any).parentId) : '');
  const [pageOptions, setPageOptions] = useState<Row[]>([]);
  useEffect(() => {
    if (entity !== 'page') return;
    let alive = true;
    apiGet<{ items: Row[] }>('/admin/content/page?limit=200')
      .then((res) => alive && setPageOptions(res.items ?? []))
      .catch(() => undefined);
    return () => { alive = false; };
  }, [entity]);
  const [canonicalOverride, setCanonicalOverride] = useState<string>((row as any)?.seo?.canonical ?? '');
  const [showSeoPanel, setShowSeoPanel] = useState(false);

  const [faqLabel, setFaqLabel] = useState<string>((row as any)?.label ?? '');
  const [articleCategory, setArticleCategory] = useState<string>((row as any)?.category ?? 'Guide');
  const [articleTags, setArticleTags] = useState<string>(((row as any)?.tags ?? []).join(', '));
  const [articleHero, setArticleHero] = useState<string>((row as any)?.heroMediaId ? String((row as any).heroMediaId) : '');
  const [articleSeoTitle, setArticleSeoTitle] = useState<string>((row as any)?.seo?.title ?? '');
  const [articleSeoDescription, setArticleSeoDescription] = useState<string>((row as any)?.seo?.description ?? '');
  const [pageSort, setPageSort] = useState<string>((row as any)?.sort != null ? String((row as any).sort) : '0');
  const [source, setSource] = useState<string>((row as any)?.source ?? '');
  const [approver, setApprover] = useState<string>((row as any)?.approver ?? '');
  const [question, setQuestion] = useState(row?.question ?? '');
  const [answer, setAnswer] = useState(row && 'answer' in row ? String((row as any).answer ?? '') : '');
  const [groupKey, setGroupKey] = useState(row?.groupKey ?? 'support');
  const [status, setStatus] = useState(row?.status ?? 'draft');
  const [publishAt, setPublishAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [conflict, setConflict] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [diffRev, setDiffRev] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const answerRef = useRef<HTMLTextAreaElement | null>(null);
  const [tab, setTab] = useState<'edit' | 'preview' | 'revisions' | 'comments'>(isNew ? 'edit' : 'edit');
  const panelRef = usePanelScroll<HTMLDivElement>();

  useEffect(() => {
    if (!isNew && row) {
      apiGet<{ items: Revision[] }>(`/admin/content/${entity}/${row.id}/revisions`)
        .then((d) => setRevisions(d.items ?? [])).catch(() => {});
      apiGet<{ items: Comment[] }>(`/admin/content/${entity}/${row.id}/comments`)
        .then((d) => setComments(d.items ?? [])).catch(() => {});
    }
  }, [isNew, row, entity]);

  function payload() {
    if (entity === 'faq') return { question, answer, groupKey, label: faqLabel.trim() || null, source: source.trim() || null, approver: approver.trim() || null };
    if (entity === 'news') {
      const out: Record<string, unknown> = { ...(slug ? { slug } : {}), title, body: body || '(draft)' };
      if (tag.trim()) out.tag = tag.trim();
      if (eventDate) out.eventDate = new Date(eventDate).toISOString();
      out.source = source.trim() || null;
      out.approver = approver.trim() || null;
      return out;
    }
    if (entity === 'page') {
      let parsed: unknown = blocks;
      if (rawBlocks) {
        try { parsed = JSON.parse(rawBlocksText || '[]'); } catch { throw new Error('Blocks JSON is invalid'); }
      }
      return {
        ...(slug ? { slug } : {}),
        title,
        blocks: parsed,
        path: path.trim() || null,
        template: template || 'default',
        locale,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        parentId: parentId ? Number(parentId) : null,
        ogMediaId: ogMediaId ? Number(ogMediaId) : null,
        noindex: Boolean(noindex),
        seo: canonicalOverride.trim() ? { canonical: canonicalOverride.trim() } : {},
        sort: pageSort ? Number(pageSort) : 0,
        source: source.trim() || null, approver: approver.trim() || null,
      };
    }
    // article (default entity)
    const seo: Record<string, string> = {};
    if (articleSeoTitle.trim()) seo.title = articleSeoTitle.trim();
    if (articleSeoDescription.trim()) seo.description = articleSeoDescription.trim();
    return {
      ...(slug ? { slug } : {}), title, deck: deck || undefined, body: body || '(draft)',
      category: articleCategory.trim() || 'Guide',
      tags: articleTags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12),
      ...(articleHero.trim() ? { heroMediaId: Number(articleHero) } : {}),
      seo,
      source: source.trim() || null, approver: approver.trim() || null,
    };
  }

  async function save() {
    setBusy(true); setError(null);
    try {
      if (isNew) {
        const created = await apiSend<Row>('POST', `/admin/content/${entity}`, payload());
        if (entity === 'page' && Array.isArray((created as any).blocks)) setBlocks((created as any).blocks);
        setRow(created);
        onCreated(created); // parent remounts the editor on the real row → workflow buttons appear
        onSaved();
      } else {
        // Phase 3.4 & MS4.6 (T4.6.3 / WF-01): send the loaded revision — the API refuses with 409 when
        // someone else saved first. Refresh local row with the saved result so subsequent saves do not false 409!
        const updated = await apiSend<Row>('PATCH', `/admin/content/${entity}/${(row as Row).id}`, payload(),
          { 'If-Match': new Date((row as Row).updatedAt).toISOString() });
        if (updated) {
          setRow(updated);
        }
        onSaved();
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setConflict(true);
      else setError(e);
    } finally { setBusy(false); }
  }

  async function transition(to: string) {
    if (!row) return;
    setBusy(true); setError(null);
    try {
      const reqBody: Record<string, unknown> = { to };
      if (to === 'scheduled' && publishAt) reqBody.publishAt = new Date(publishAt).toISOString();
      const updated = await apiSend<Row>('POST', `/admin/content/${entity}/${row.id}/transition`, reqBody);
      if (updated) {
        setRow(updated);
        setStatus(updated.status);
      }
      onSaved();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function openPreview() {
    if (!row) return;
    setBusy(true); setError(null);
    try {
      const res = await apiSend<{ previewUrl: string }>('POST', `/admin/content/${entity}/${row.id}/preview`, {});
      setPreviewUrl(res.previewUrl);
      window.open(res.previewUrl, '_blank', 'noopener,noreferrer');
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function revert(revisionId: number) {
    if (!row) return;
    setBusy(true); setError(null);
    try {
      await apiSend('POST', `/admin/content/${entity}/${row.id}/revert`, { revisionId });
      onSaved();
      const fresh = await apiGet<Row>(`/admin/content/${entity}/${row.id}`);
      setTitle(fresh.title); setBody(fresh.body ?? ''); setStatus(fresh.status);
      if (Array.isArray((fresh as any).blocks)) { setBlocks((fresh as any).blocks); setRawBlocksText(JSON.stringify((fresh as any).blocks, null, 2)); }
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function addComment() {
    if (!row || !comment.trim()) return;
    setBusy(true); setError(null);
    try {
      await apiSend('POST', `/admin/content/${entity}/${row.id}/comments`, { body: comment.trim() });
      setComment('');
      const d = await apiGet<{ items: Comment[] }>(`/admin/content/${entity}/${row.id}/comments`);
      setComments(d.items ?? []);
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  const nextStates = legalNext(status);
  /** Draft vs a revision snapshot — bodies for text entities, pretty JSON for pages. */
  const currentDoc = useMemo(() => {
    if (entity === 'page') return JSON.stringify(blocks, null, 2);
    if (entity === 'faq') return answer;
    return body;
  }, [entity, blocks, answer, body]);
  const revDoc = (snap: Record<string, unknown>): string => {
    if (entity === 'page') return JSON.stringify(snap.blocks ?? [], null, 2);
    if (entity === 'faq') return String(snap.answer ?? '');
    return String(snap.body ?? '');
  };

  return (
    <div ref={panelRef} style={{ marginTop: 16, border: '1px solid #E6EBF1', borderRadius: 10, padding: 16, background: '#fff' }}>
      {/* §6.4 command bar — workflow transitions (Publish / Submit for review)
          stay pinned under the tab strip while the long editor body scrolls */}
      <CommandBar style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <b>{isNew ? 'New ' + entity : 'Edit ' + entity}</b>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Badge value={status} />
          {!isNew && nextStates.map((s) => {
            const needsPublish = s === 'published' || s === 'scheduled';
            const allowed = !needsPublish || canPublish;
            const primary = s === 'in_review' || s === 'published';
            return (
              <button key={s} style={primary ? btn : btnGhost} disabled={busy || !allowed}
                title={needsPublish && !canPublish ? 'Editor role required to publish' : undefined}
                onClick={() => transition(s)}>
                {s === 'in_review' ? 'Submit for review' : s === 'published' ? 'Publish' : '→ ' + s.replace(/_/g, ' ')}
              </button>
            );
          })}
          {!isNew && entity === 'page' && <button style={btnGhost} disabled={busy} onClick={() => setShowModal(true)}>👁 Live preview</button>}
          {!isNew && <button style={btnGhost} disabled={busy} onClick={openPreview}>Preview URL</button>}
          <button style={btnGhost} onClick={onClose}>Close</button>
        </div>
      </CommandBar>
      {error ? <Err error={error} /> : null}
      {conflict && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '10px 0', color: '#8A5A00', background: '#FBF3E2', border: '1px solid #E8CE9A', borderRadius: 8, padding: '8px 12px' }}>
          <b>Conflict:</b>
          <span style={{ flex: 1, minWidth: 200 }}>this item was saved by someone else while you were editing — your changes were NOT applied.</span>
          <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={() => { setConflict(false); onSaved(); }}>Reload fresh</button>
          <button style={{ ...btnGhost, padding: '4px 10px' }} onClick={() => setConflict(false)}>Keep mine on screen</button>
        </div>
      )}
      {status === 'in_review' && (
        <div style={{ margin: '10px 0', background: '#FFF7E6', border: '1px solid #F1DCA8', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#8A6420' }}>
          In review — editors see this item in their <b>Review queue</b>. Use the Comments tab for feedback.
        </div>
      )}
      {scheduling(status) && (
        <div style={{ margin: '10px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <span><label style={{ display: 'block', fontSize: 11.5, color: '#66748A', marginBottom: 2 }}>Source (provenance — required to publish)</label>
              <input style={input} placeholder="e.g. Content ownership matrix (PROC-05)" value={source} onChange={(e) => setSource(e.target.value)} /></span>
            <span><label style={{ display: 'block', fontSize: 11.5, color: '#66748A', marginBottom: 2 }}>Approver (provenance — required to publish)</label>
              <input style={input} placeholder="e.g. Victoria Sterling" value={approver} onChange={(e) => setApprover(e.target.value)} /></span>
          </div>
          <label style={{ fontSize: 13 }}>Publish at: </label>
          <input type="datetime-local" style={input} value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
          <span style={{ color: '#66748A', fontSize: 12 }}> (then → published)</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, margin: '12px 0 0' }}>
        {([['edit', 'Edit'], ['preview', 'Preview'], ['revisions', `Revisions (${revisions.length})`], ['comments', `Comments (${comments.length})`]] as const).map(([k, label]) => (
          <button key={k} style={tab === k ? btn : btnGhost} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === 'edit' && (
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {entity === 'faq' ? (
            <>
              <input style={input} placeholder="Group (e.g. support)" value={groupKey} onChange={(e) => setGroupKey(e.target.value)} />
              <input style={input} placeholder="Short display label (T4.5.5)" value={faqLabel} onChange={(e) => setFaqLabel(e.target.value)} aria-label="FAQ display label" />
              <input style={input} placeholder="Question" value={question} onChange={(e) => { setQuestion(e.target.value); setTitle(e.target.value); }} />
              <MarkdownToolbar value={answer} onChange={setAnswer} textareaRef={answerRef} />
              <textarea ref={answerRef} style={{ ...input, minHeight: 120, borderRadius: '0 6px 6px 6px' }} placeholder="Answer (markdown)" value={answer} onChange={(e) => setAnswer(e.target.value)} />
              <WordCount text={answer} />
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...input, flex: 2 }} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input style={{ ...input, flex: 1 }} placeholder={isNew ? 'slug (auto from title)' : 'slug'} value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!isNew} />
              </div>
              {entity === 'article' && <input style={input} placeholder="Deck / summary" value={deck} onChange={(e) => setDeck(e.target.value)} />}
              {entity === 'article' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8, marginTop: 8 }}>
                  <span><label style={{ display: 'block', fontSize: 11.5, color: '#66748A', marginBottom: 2 }}>Category (hub)</label>
                    <input style={input} placeholder="Guides / Explainers / Benchmarks" value={articleCategory} onChange={(e) => setArticleCategory(e.target.value)} /></span>
                  <span><label style={{ display: 'block', fontSize: 11.5, color: '#66748A', marginBottom: 2 }}>Tags (comma-separated)</label>
                    <input style={input} placeholder="ddr5, gaming" value={articleTags} onChange={(e) => setArticleTags(e.target.value)} /></span>
                  <span><label style={{ display: 'block', fontSize: 11.5, color: '#66748A', marginBottom: 2 }}>Hero media #</label>
                    <input style={input} placeholder="Media Asset #" value={articleHero} onChange={(e) => setArticleHero(e.target.value)} /></span>
                  <span><label style={{ display: 'block', fontSize: 11.5, color: '#66748A', marginBottom: 2 }}>SEO title ({articleSeoTitle.length}/60)</label>
                    <input style={input} value={articleSeoTitle} onChange={(e) => setArticleSeoTitle(e.target.value)} /></span>
                  <span style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: 11.5, color: '#66748A', marginBottom: 2 }}>SEO description ({articleSeoDescription.length}/160)</label>
                    <input style={input} value={articleSeoDescription} onChange={(e) => setArticleSeoDescription(e.target.value)} /></span>
                </div>
              )}
              {entity === 'news' && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input style={{ ...input, flex: '1 1 160px' }} placeholder="Tag (e.g. Press release / Event)" value={tag} onChange={(e) => setTag(e.target.value)} />
                  <input style={{ ...input, flex: '1 1 200px' }} type="datetime-local" title="Event date (leave empty for a plain news post)" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
              )}
              {entity === 'page' && (
                <>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', marginRight: 4 }}>Locale:</span>
                    {(['en', 'de', 'ar', 'zh', 'fr', 'es'] as const).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        style={{
                          padding: '3px 10px',
                          borderRadius: 6,
                          border: '1px solid',
                          borderColor: locale === loc ? '#0A2540' : '#D9E0E8',
                          background: locale === loc ? '#0A2540' : '#fff',
                          color: locale === loc ? '#fff' : '#4A5568',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontWeight: locale === loc ? 600 : 400,
                        }}
                        onClick={() => setLocale(loc)}
                      >
                        {loc.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ flex: '2 1 200px' }}>
                      <label style={{ display: 'block', fontSize: 11.5, color: '#66748A', marginBottom: 2 }}>Page Path (e.g. /about or /solutions/gaming)</label>
                      <input
                        style={{ ...input, width: '100%' }}
                        placeholder="/custom-path"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: '1 1 180px' }}>
                      <label style={{ display: 'block', fontSize: 11.5, color: '#66748A', marginBottom: 2 }}>Template</label>
                      <select
                        style={{ ...input, width: '100%' }}
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                      >
                        <option value="default">Default</option>
                        <option value="landing">Landing</option>
                        <option value="full_width">Full Width</option>
                        <option value="legal">Legal</option>
                        <option value="category">Category</option>
                        <option value="product_detail">Product Detail</option>
                        <option value="support_portal">Support Portal</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #E6EBF1', borderRadius: 8, padding: '10px 14px', background: '#F8FAFB', marginBottom: 12 }}>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => setShowSeoPanel(!showSeoPanel)}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2A37' }}>🔍 SEO & Meta Configuration</span>
                      <button type="button" style={{ ...btnGhost, fontSize: 11, padding: '2px 8px' }}>
                        {showSeoPanel ? 'Hide ▲' : 'Show ▼'}
                      </button>
                    </div>

                    {showSeoPanel && (
                      <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                            <label style={{ color: '#4A5568' }}>SEO Title</label>
                            <span style={{ color: seoTitle.length > 60 ? '#D9534F' : seoTitle.length >= 30 ? '#2E7D32' : '#8A6420' }}>
                              {seoTitle.length} / 60 chars {seoTitle.length > 60 ? '(Too long)' : seoTitle.length >= 30 ? '(Ideal)' : '(Short)'}
                            </span>
                          </div>
                          <input
                            style={input}
                            placeholder="Page title for search engines (50-60 characters ideal)"
                            value={seoTitle}
                            onChange={(e) => setSeoTitle(e.target.value)}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                            <label style={{ color: '#4A5568' }}>SEO Meta Description</label>
                            <span style={{ color: seoDescription.length > 160 ? '#D9534F' : seoDescription.length >= 100 ? '#2E7D32' : '#8A6420' }}>
                              {seoDescription.length} / 160 chars {seoDescription.length > 160 ? '(Too long)' : seoDescription.length >= 100 ? '(Ideal)' : '(Short)'}
                            </span>
                          </div>
                          <textarea
                            style={{ ...input, minHeight: 60, fontSize: 12.5 }}
                            placeholder="Summary snippet displayed in search results (150-160 characters ideal)"
                            value={seoDescription}
                            onChange={(e) => setSeoDescription(e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ flex: '1 1 220px' }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5568', marginBottom: 2 }}>Parent page (page tree)</label>
                            <select
                              style={input}
                              value={parentId}
                              onChange={(e) => setParentId(e.target.value)}
                            >
                              <option value="">— Root level —</option>
                              {pageOptions
                                .filter((p) => String(p.id) !== String((row as any)?.id))
                                .map((p) => (
                                  <option key={p.id} value={String(p.id)}>
                                    {(p as any).path || `/${(p as any).slug}`} — {p.title}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div style={{ flex: '0 0 120px' }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5568', marginBottom: 2 }}>Tree order</label>
                            <input
                              type="number" style={input} value={pageSort}
                              onChange={(e) => setPageSort(e.target.value)}
                              aria-label="Page order within its parent (page tree reorder)"
                            />
                          </div>
                          <div style={{ flex: '1 1 180px' }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5568', marginBottom: 2 }}>Open Graph Media ID</label>
                            <input
                              type="number"
                              style={input}
                              placeholder="Media Asset # (e.g. 42)"
                              value={ogMediaId}
                              onChange={(e) => setOgMediaId(e.target.value)}
                            />
                          </div>
                          <div style={{ flex: '2 1 240px' }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5568', marginBottom: 2 }}>Canonical Override (True duplicates only)</label>
                            <input
                              style={input}
                              placeholder="https://twinmos.com/original-url"
                              value={canonicalOverride}
                              onChange={(e) => setCanonicalOverride(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: 4 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1F2A37', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={noindex}
                              onChange={(e) => setNoindex(e.target.checked)}
                            />
                            <span>Discourage search engines from indexing this page (<code>noindex</code>)</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {entity === 'page' ? (
                rawBlocks ? (
                  <div>
                    <textarea
                      style={{ ...input, minHeight: 220, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
                      placeholder='Blocks JSON (power-user escape hatch — prefer the visual builder)'
                      value={rawBlocksText}
                      onChange={(e) => setRawBlocksText(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button style={btnGhost} onClick={() => { try { setBlocks(JSON.parse(rawBlocksText || '[]')); setRawBlocks(false); } catch { /* keep editing */ } }}>Apply JSON → visual</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <button style={{ ...btnGhost, fontSize: 12 }} onClick={() => { setRawBlocksText(JSON.stringify(blocks, null, 2)); setRawBlocks(true); }}>{'{ } JSON'}</button>
                      <span style={{ color: '#93A0B4', fontSize: 11.5, alignSelf: 'center' }}>escape hatch for power users</span>
                    </div>
                    <PageBuilder blocks={blocks} onChange={setBlocks} />
                  </div>
                )
              ) : (
                <div>
                  <MarkdownToolbar value={body} onChange={setBody} textareaRef={bodyRef} />
                  <textarea ref={bodyRef} style={{ ...input, minHeight: 260, borderRadius: '0 6px 6px 6px', fontFamily: 'ui-monospace, monospace', fontSize: 13 }} placeholder="Body (markdown)" value={body} onChange={(e) => setBody(e.target.value)} />
                  <WordCount text={body} />
                </div>
              )}
            </>
          )}
          <div>
            <button style={btn} disabled={busy || !canWrite} onClick={save}>{isNew ? 'Create draft' : 'Save'}</button>
            {!isNew && (
              <button
                type="button"
                style={{ ...btnGhost, marginLeft: 8 }}
                disabled={busy}
                onClick={openPreview}
                title="Open public preview with signed HMAC token (noindex, uncached)"
              >
                🌐 Open Public Preview
              </button>
            )}
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 10, fontSize: 12.5, color: '#0066CC', textDecoration: 'underline' }}
              >
                Preview: {previewUrl}
              </a>
            )}
          </div>
        </div>
      )}

      {tab === 'preview' && (
        <div style={{ border: '1px solid #E6EBF1', borderRadius: 8, padding: 14, marginTop: 12, background: '#F8FAFC' }}>
          {entity === 'page' ? (
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, display: 'grid', gap: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ marginTop: 0, color: '#1F2A37', flex: 1 }}>{title || '(title)'}</h2>
                <button style={btnGhost} onClick={() => setShowModal(true)} title="Open the responsive preview (desktop 1200 / tablet 768 / mobile 375)">
                  🖥 Responsive preview
                </button>
              </div>
              <BlockPreview blocks={blocks} />
            </div>
          ) : (
            <>
              <h2 style={{ marginTop: 0 }}>{entity === 'faq' ? question || '(question)' : title || '(title)'}</h2>
              <MarkdownPreview text={entity === 'faq' ? answer : body} />
            </>
          )}
        </div>
      )}

      {tab === 'revisions' && (
        <div style={{ marginTop: 12 }}>
          {revisions.length === 0 && <Empty text="No revisions yet — every publish snapshots the prior version." />}
          {revisions.map((rev) => (
            <div key={rev.id} style={{ borderBottom: '1px solid #F0F3F7', padding: '8px 2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13.5 }}>#{rev.id} · {fmtDate(rev.createdAt)} · by {rev.actorId ?? 'system'}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <button style={btnGhost} onClick={() => setDiffRev(diffRev === rev.id ? null : rev.id)}>{diffRev === rev.id ? 'Hide diff' : 'Diff vs draft'}</button>
                  <button style={btnGhost} disabled={busy || !canPublish} onClick={() => revert(rev.id)}>Rollback</button>
                </span>
              </div>
              {diffRev === rev.id && (
                <div style={{ marginTop: 8 }}>
                  <DiffView oldText={revDoc(rev.snapshot)} newText={currentDoc} labelOld={`Revision #${rev.id}`} labelNew="Current draft" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'comments' && (
        <div style={{ marginTop: 12 }}>
          {comments.length === 0 && <Empty text="No review comments yet — coordinate editorial feedback here." />}
          {comments.map((cm) => (
            <div key={cm.id} style={{ borderTop: '1px solid #F0F3F7', padding: '7px 0' }}>
              <span style={{ color: '#66748A', fontSize: 12.5 }}>{cm.authorName ?? cm.authorEmail ?? cm.authorId ?? 'staff'} · {fmtDate(cm.createdAt)}</span>
              <div style={{ fontSize: 13.5 }}>{cm.body}</div>
            </div>
          ))}
          {canWrite && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input style={{ ...input, flex: 1 }} placeholder="Add review feedback (visible to staff)…" value={comment}
                onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }} />
              <button style={btn} disabled={busy || !comment.trim()} onClick={addComment}>Comment</button>
            </div>
          )}
        </div>
      )}

      {showModal && <PreviewModal blocks={blocks} title={title} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function scheduling(status: string): boolean {
  return status === 'in_review'; // offer publishAt when moving toward scheduled
}

/** Live editorial metrics under the body — word count + ~220 wpm reading time. */
function WordCount({ text }: { text: string }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  if (!words) return null;
  return (
    <div style={{ marginTop: 4, fontSize: 11.5, color: '#93A0B4' }}>
      {words.toLocaleString()} words · ~{Math.max(1, Math.round(words / 220))} min read
    </div>
  );
}

/** Client-side markdown preview (same marked pipeline as the server render).
 * P1.2: marked performs no sanitization — raw output once carried hostile
 * markdown straight into dangerouslySetInnerHTML (audit finding U-2,
 * live-proven). DOMPurify strips script/event-handler payloads while
 * preserving legitimate markdown-generated markup. */
export function MarkdownPreview({ text }: { text: string }) {
  const html = useMemo(() => DOMPurify.sanitize(String(marked.parse(text || '', { async: false }))), [text]);
  return <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />;
}

// ---- Phase 7.1: content analytics strip --------------------------------------
type ContentAnalytics = {
  weeks: string[];
  velocity: Array<{ w: string; article: number; news: number; page: number; faq: number }>;
  velocityEntities: string[];
  pipeline: Array<{ entity: string; byStatus: Record<string, number> }>;
  translationCoverage: { namespaces: string[]; coverage: Record<string, Record<string, number>> };
};

/** §7.1 Content dashboard above the studio: 12-week publish velocity (the
 *  dated entities), pipeline census and the translation coverage heatmap —
 *  all from /admin/analytics/content. Collapsible; never blocks the studio. */
function ContentAnalyticsStrip() {
  const { data, error, loading } = useAsync<ContentAnalytics>(() => apiGet('/admin/analytics/content'), []);
  if (loading) return null;
  if (error || !data) return null;
  const pipelineTotal = (e: string) => {
    const p = data.pipeline.find((x) => x.entity === e);
    return p ? Object.values(p.byStatus).reduce((a, b) => a + b, 0) : 0;
  };
  return (
    <details style={{ border: `1px solid ${LINE}`, borderRadius: 12, background: '#fff', padding: '10px 16px', marginTop: 12 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 800, color: INK, userSelect: 'none' }}>
        Analytics — <span style={{ color: MUTED, fontWeight: 400 }}>
          {pipelineTotal('article')} articles · {pipelineTotal('news')} news · {pipelineTotal('page')} pages · {pipelineTotal('faq')} FAQ
        </span>
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, marginBottom: 6 }}>Publish velocity — 12 weeks</div>
          <WeeklyBars weeks={data.weeks} series={[
            { key: 'articles', color: TEAL, values: data.velocity.map((v) => v.article) },
            { key: 'news', color: '#7C5CDB', values: data.velocity.map((v) => v.news) },
          ]} />
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, marginBottom: 6 }}>Translation coverage — key-exact vs EN</div>
          <Heatmap namespaces={data.translationCoverage.namespaces} coverage={data.translationCoverage.coverage} locales={LOCALES} />
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: 'uppercase', color: FAINT, marginBottom: 6 }}>Pipeline</div>
          {data.pipeline.map((p) => (
            <div key={p.entity} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', flexWrap: 'wrap' }}>
              <b style={{ width: 64, fontSize: 12.5, color: MUTED }}>{p.entity}</b>
              {Object.entries(p.byStatus).map(([st, n]) => <Badge key={st} value={`${st}: ${n}`} />)}
              {Object.keys(p.byStatus).length === 0 && <span style={{ fontSize: 12, color: FAINT }}>none yet</span>}
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
