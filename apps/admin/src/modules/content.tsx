// CMS Content module — tabs for Articles/News/Pages/FAQ, list + editor with
// markdown preview, workflow buttons (role-aware), revisions with one-click
// rollback, and draft preview links. Exit criterion surface: "editor can
// create → publish → see live".
import React, { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import { apiGet, apiSend, fmtDate } from '../api';
import { Badge, btn, btnGhost, Empty, Err, input, Table, td, useAsync } from '../ui';
import { CONTENT_STATUS } from '@twinmos/shared';

type Row = {
  id: number; slug?: string; title: string; status: string; category?: string; tag?: string;
  groupKey?: string; question?: string; publishAt: string | null; updatedAt: string;
  authorId: string | null; deck?: string | null; body?: string;
};
type Revision = { id: number; actorId: string | null; createdAt: string; snapshot: Record<string, unknown> };

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

export default function Content({ canPublish }: { canPublish: boolean }) {
  const [entity, setEntity] = useState<string>('article');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<Row | 'new' | null>(null);

  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  const { data, error, loading, reload } = useAsync<{ items: Row[] }>(
    () => apiGet(`/admin/content/${entity}?` + qs.toString()), [entity, status]);

  return (
    <div>
      <h1>Content</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        {ENTITIES.map((e) => (
          <button key={e.key} style={entity === e.key ? btn : btnGhost} onClick={() => { setEntity(e.key); setEditing(null); }}>{e.label}</button>
        ))}
        <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {CONTENT_STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <button style={btn} onClick={() => setEditing('new')}>+ New {entity}</button>
      </div>
      {error ? <Err error={error} /> : loading ? <p>Loading…</p> : data ? (
        <Table head={['Title', 'Slug / Group', 'Status', 'Updated', '']}>
          {data.items.map((row) => (
            <tr key={row.id}>
              <td style={td}><b>{row.title ?? row.question}</b></td>
              <td style={{ ...td, color: '#5E7691' }}>{row.slug ?? row.groupKey}</td>
              <td style={td}><Badge value={row.status} /></td>
              <td style={td}>{fmtDate(row.updatedAt ?? row.publishAt)}</td>
              <td style={td}><button style={btnGhost} onClick={() => setEditing(row)}>Edit</button></td>
            </tr>
          ))}
        </Table>
      ) : null}
      {data && data.items.length === 0 && <Empty text="No content — create the first item." />}
      {editing && (
        <Editor
          key={editing === 'new' ? 'new' : `row-${(editing as Row).id}-${(editing as Row).status ?? ''}`}
          entity={entity}
          row={editing === 'new' ? null : editing}
          canPublish={canPublish}
          onClose={() => setEditing(null)}
          onSaved={reload}
          onCreated={(fresh) => setEditing(fresh)}
        />
      )}
    </div>
  );
}

function Editor({ entity, row: initialRow, canPublish, onClose, onSaved, onCreated }: {
  entity: string; row: Row | null; canPublish: boolean; onClose: () => void; onSaved: () => void; onCreated: (row: Row) => void;
}) {
  const [row, setRow] = useState<Row | null>(initialRow); // becomes the created item after save
  const isNew = !row;
  const [title, setTitle] = useState(row?.title ?? '');
  const [slug, setSlug] = useState(row?.slug ?? '');
  const [deck, setDeck] = useState(row?.deck ?? '');
  const [body, setBody] = useState(row?.body ?? '');
  const [question, setQuestion] = useState(row?.question ?? '');
  const [answer, setAnswer] = useState(row && 'answer' in row ? String((row as any).answer ?? '') : '');
  const [groupKey, setGroupKey] = useState(row?.groupKey ?? 'support');
  const [status, setStatus] = useState(row?.status ?? 'draft');
  const [publishAt, setPublishAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [tab, setTab] = useState<'edit' | 'preview' | 'revisions'>(isNew ? 'edit' : 'edit');

  useEffect(() => {
    if (!isNew && row) {
      apiGet<{ items: Revision[] }>(`/admin/content/${entity}/${row.id}/revisions`)
        .then((d) => setRevisions(d.items ?? [])).catch(() => {});
    }
  }, [isNew, row, entity]);

  function payload() {
    if (entity === 'faq') return { question, answer, groupKey };
    if (entity === 'news') return { ...(slug ? { slug } : {}), title, body: body || '(draft)' };
    if (entity === 'page') return { ...(slug ? { slug } : {}), title };
    return { ...(slug ? { slug } : {}), title, deck: deck || undefined, body: body || '(draft)' };
  }

  async function save() {
    setBusy(true); setError(null);
    try {
      if (isNew) {
        const created = await apiSend<Row>('POST', `/admin/content/${entity}`, payload());
        onCreated(created); // parent remounts the editor on the real row → workflow buttons appear
        onSaved();
      } else {
        await apiSend('PATCH', `/admin/content/${entity}/${(row as Row).id}`, payload());
      }
      onSaved();
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  async function transition(to: string) {
    if (!row) return;
    setBusy(true); setError(null);
    try {
      const body: Record<string, unknown> = { to };
      if (to === 'scheduled' && publishAt) body.publishAt = new Date(publishAt).toISOString();
      const updated = await apiSend<Row>('POST', `/admin/content/${entity}/${row.id}/transition`, body);
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
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  const nextStates = legalNext(status);

  return (
    <div style={{ marginTop: 16, border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <b>{isNew ? 'New ' + entity : 'Edit ' + entity}</b>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge value={status} />
          {!isNew && nextStates.length > 0 && nextStates.map((s) => {
            const needsPublish = s === 'published' || s === 'scheduled';
            const allowed = !needsPublish || canPublish;
            return (
              <button key={s} style={s === 'published' ? btn : btnGhost} disabled={busy || !allowed}
                title={needsPublish && !canPublish ? 'Editor role required to publish' : undefined}
                onClick={() => transition(s)}>
                {s === 'published' ? 'Publish' : '→ ' + s.replace(/_/g, ' ')}
              </button>
            );
          })}
          {!isNew && <button style={btnGhost} disabled={busy} onClick={openPreview}>Preview URL</button>}
          <button style={btnGhost} onClick={onClose}>Close</button>
        </div>
      </div>
      {error ? <Err error={error} /> : null}
      {scheduling(status) && (
        <div style={{ margin: '10px 0' }}>
          <label style={{ fontSize: 13 }}>Publish at: </label>
          <input type="datetime-local" style={input} value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
          <span style={{ color: '#5E7691', fontSize: 12 }}> (then → published)</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, margin: '12px 0 0' }}>
        {[['edit', 'Edit'], ['preview', 'Preview'], ['revisions', `Revisions (${revisions.length})`]].map(([k, label]) => (
          <button key={k} style={tab === k ? btn : btnGhost} onClick={() => setTab(k as any)}>{label}</button>
        ))}
      </div>

      {tab === 'edit' && (
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {entity === 'faq' ? (
            <>
              <input style={input} placeholder="Group (e.g. support)" value={groupKey} onChange={(e) => setGroupKey(e.target.value)} />
              <input style={input} placeholder="Question" value={question} onChange={(e) => { setQuestion(e.target.value); setTitle(e.target.value); }} />
              <textarea style={{ ...input, minHeight: 120 }} placeholder="Answer (markdown)" value={answer} onChange={(e) => setAnswer(e.target.value)} />
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...input, flex: 2 }} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input style={{ ...input, flex: 1 }} placeholder={isNew ? 'slug (auto from title)' : 'slug'} value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!isNew} />
              </div>
              {entity === 'article' && <input style={input} placeholder="Deck / summary" value={deck} onChange={(e) => setDeck(e.target.value)} />}
              <textarea style={{ ...input, minHeight: 260, fontFamily: 'ui-monospace, monospace', fontSize: 13 }} placeholder="Body (markdown)" value={body} onChange={(e) => setBody(e.target.value)} />
            </>
          )}
          <div>
            <button style={btn} disabled={busy} onClick={save}>{isNew ? 'Create draft' : 'Save'}</button>
            {previewUrl && <span style={{ marginLeft: 10, fontSize: 12.5, color: '#5E7691' }}>Preview: {previewUrl}</span>}
          </div>
        </div>
      )}

      {tab === 'preview' && (
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 14, marginTop: 12, background: '#F8FAFC' }}>
          <h2 style={{ marginTop: 0 }}>{entity === 'faq' ? question || '(question)' : title || '(title)'}</h2>
          <MarkdownPreview text={entity === 'faq' ? answer : body} />
        </div>
      )}

      {tab === 'revisions' && (
        <div style={{ marginTop: 12 }}>
          {revisions.length === 0 && <Empty text="No revisions yet — every publish snapshots the prior version." />}
          {revisions.map((rev) => (
            <div key={rev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EEF2F6', padding: '8px 2px' }}>
              <span style={{ fontSize: 13.5 }}>#{rev.id} · {fmtDate(rev.createdAt)} · by {rev.actorId ?? 'system'}</span>
              <button style={btnGhost} disabled={busy || !canPublish} onClick={() => revert(rev.id)}>Rollback</button>
            </div>
          ))}
        </div>
      )}
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
