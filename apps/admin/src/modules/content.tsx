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
import { ApiError, apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, PageHeader, Table, td, Toolbar, useAsync } from '../ui';
import { CONTENT_STATUS } from '@twinmos/shared';
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

export default function Content({ canPublish, canWrite }: { canPublish: boolean; canWrite?: boolean }) {
  const [entity, setEntity] = useState<string>('article');
  const [status, setStatus] = useState('');
  const [view, setView] = useState<'library' | 'review'>('library');
  const [editing, setEditing] = useState<Row | 'new' | null>(null);

  const qs = new URLSearchParams();
  if (status) qs.set('status', qs_status(view));
  const { data, error, loading, reload } = useAsync<{ items: Row[] }>(
    () => apiGet(`/admin/content/${entity}?` + qs.toString()), [entity, status, view]);
  // Review queue spans every content entity
  const queue = useAsync<{ items: Row[] }[]>(
    async () => Promise.all(['article', 'news', 'page'].map((e) => apiGet<{ items: Row[] }>(`/admin/content/${e}?status=in_review`))), [view]);

  function qs_status(v: string): string {
    if (v === 'review') return 'in_review';
    return status;
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
      <Toolbar style={{ margin: '12px 0' }}>
        <button style={view === 'library' ? btn : btnGhost} onClick={() => { setView('library'); setEditing(null); }}>Library</button>
        <button style={view === 'review' ? btn : btnGhost} onClick={() => { setView('review'); setEditing(null); }}>
          Review queue {queueRows.length ? <span style={{ background: '#1DBF9F', color: '#fff', borderRadius: 999, fontSize: 10.5, padding: '1px 7px', marginLeft: 6 }}>{queueRows.length}</span> : null}
        </button>
        <span style={{ flex: 1 }} />
        {view === 'library' && <>
          {ENTITIES.map((e) => (
            <button key={e.key} style={entity === e.key ? btn : btnGhost} onClick={() => { setEntity(e.key); setEditing(null); }}>{e.label}</button>
          ))}
          <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
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
          {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
            <Table head={['Title', 'Slug / Group', 'Status', 'Updated', '']}>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td style={td}><b>{row.title ?? row.question}</b></td>
                  <td style={{ ...td, color: '#66748A' }}>{row.slug ?? row.groupKey}</td>
                  <td style={td}><Badge value={row.status} /></td>
                  <td style={td}>{fmtDate(row.updatedAt ?? row.publishAt)}</td>
                  <td style={td}><button style={btnGhost} onClick={() => setEditing(row)}>Edit</button></td>
                </tr>
              ))}
            </Table>
          ) : null}
          {data && data.items.length === 0 && <Empty text="No content — create the first item." />}
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

  useEffect(() => {
    if (!isNew && row) {
      apiGet<{ items: Revision[] }>(`/admin/content/${entity}/${row.id}/revisions`)
        .then((d) => setRevisions(d.items ?? [])).catch(() => {});
      apiGet<{ items: Comment[] }>(`/admin/content/${entity}/${row.id}/comments`)
        .then((d) => setComments(d.items ?? [])).catch(() => {});
    }
  }, [isNew, row, entity]);

  function payload() {
    if (entity === 'faq') return { question, answer, groupKey };
    if (entity === 'news') {
      const out: Record<string, unknown> = { ...(slug ? { slug } : {}), title, body: body || '(draft)' };
      if (tag.trim()) out.tag = tag.trim();
      if (eventDate) out.eventDate = new Date(eventDate).toISOString();
      return out;
    }
    if (entity === 'page') {
      let parsed: unknown = blocks;
      if (rawBlocks) {
        try { parsed = JSON.parse(rawBlocksText || '[]'); } catch { throw new Error('Blocks JSON is invalid'); }
      }
      return { ...(slug ? { slug } : {}), title, blocks: parsed };
    }
    return { ...(slug ? { slug } : {}), title, deck: deck || undefined, body: body || '(draft)' };
  }

  async function save() {
    setBusy(true); setError(null);
    try {
      if (isNew) {
        const created = await apiSend<Row>('POST', `/admin/content/${entity}`, payload());
        if (entity === 'page' && Array.isArray((created as any).blocks)) setBlocks((created as any).blocks);
        onCreated(created); // parent remounts the editor on the real row → workflow buttons appear
        onSaved();
      } else {
        // Phase 3.4: send the loaded revision — the API refuses with 409 when
        // someone else saved first (no silent overwrites).
        await apiSend('PATCH', `/admin/content/${entity}/${(row as Row).id}`, payload(),
          { 'If-Match': new Date((row as Row).updatedAt).toISOString() });
      }
      onSaved();
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
      setStatus(updated.status);
      onSaved();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function openPreview() {
    if (!row) return;
    setBusy(true); setError(null);
    try {
      const res = await apiSend<{ previewUrl: string }>('POST', `/admin/content/${entity}/${row.id}/preview`, {});
      setPreviewUrl(res.previewUrl);
      window.open(res.previewUrl, '_blank', 'noopener');
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
    <div style={{ marginTop: 16, border: '1px solid #E6EBF1', borderRadius: 10, padding: 16, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
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
      </div>
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
              <input style={input} placeholder="Question" value={question} onChange={(e) => { setQuestion(e.target.value); setTitle(e.target.value); }} />
              <MarkdownToolbar value={answer} onChange={setAnswer} textareaRef={answerRef} />
              <textarea ref={answerRef} style={{ ...input, minHeight: 120, borderRadius: '0 6px 6px 6px' }} placeholder="Answer (markdown)" value={answer} onChange={(e) => setAnswer(e.target.value)} />
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...input, flex: 2 }} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input style={{ ...input, flex: 1 }} placeholder={isNew ? 'slug (auto from title)' : 'slug'} value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!isNew} />
              </div>
              {entity === 'article' && <input style={input} placeholder="Deck / summary" value={deck} onChange={(e) => setDeck(e.target.value)} />}
              {entity === 'news' && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input style={{ ...input, flex: '1 1 160px' }} placeholder="Tag (e.g. Press release / Event)" value={tag} onChange={(e) => setTag(e.target.value)} />
                  <input style={{ ...input, flex: '1 1 200px' }} type="datetime-local" title="Event date (leave empty for a plain news post)" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
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
                </div>
              )}
            </>
          )}
          <div>
            <button style={btn} disabled={busy || !canWrite} onClick={save}>{isNew ? 'Create draft' : 'Save'}</button>
            {previewUrl && <span style={{ marginLeft: 10, fontSize: 12.5, color: '#66748A' }}>Preview: {previewUrl}</span>}
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

/** Client-side markdown preview (same marked pipeline as the server render). */
export function MarkdownPreview({ text }: { text: string }) {
  const html = useMemo(() => String(marked.parse(text || '', { async: false })), [text]);
  return <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />;
}
