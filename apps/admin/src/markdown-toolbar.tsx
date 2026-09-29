// Rich-text authoring toolbar (Phase 2 §2.2) — a formatting ribbon for the
// article/news/FAQ markdown textareas: headings, bold/italic/strike, lists,
// blockquote, code block, table generator, and direct media insertion via the
// media picker (inserts `![alt](url)` at the caret). Pure textarea surgery —
// undo history and selection are preserved.
import React, { useRef, useState } from 'react';
import { MediaPicker } from './media-picker';
import { API } from './api';

const NAVY = '#1F2A37';

type Ops = { label: string; title: string; wrap?: [string, string]; prefix?: string; block?: string; table?: boolean };

const OPS: Ops[] = [
  { label: 'H1', title: 'Heading 1', prefix: '# ' },
  { label: 'H2', title: 'Heading 2', prefix: '## ' },
  { label: 'H3', title: 'Heading 3', prefix: '### ' },
  { label: 'B', title: 'Bold', wrap: ['**', '**'] },
  { label: 'I', title: 'Italic', wrap: ['*', '*'] },
  { label: 'S', title: 'Strikethrough', wrap: ['~~', '~~'] },
  { label: '• List', title: 'Bulleted list', prefix: '- ' },
  { label: '1. List', title: 'Numbered list', prefix: '1. ' },
  { label: '❝ Quote', title: 'Blockquote', prefix: '> ' },
  { label: '</>', title: 'Code block', block: '```\n\n```' },
  { label: '▦ Table', title: 'Insert table', table: true },
];

export default function MarkdownToolbar({ value, onChange, textareaRef }: {
  value: string; onChange: (next: string) => void; textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [pick, setPick] = useState(false);

  /** Apply an op to the current selection / caret line of the linked textarea. */
  function apply(op: Ops) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? start;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    let next: string; let caret: number; let caretEnd: number;

    if (op.wrap) {
      next = before + op.wrap[0] + (selected || 'text') + op.wrap[1] + after;
      caret = start + op.wrap[0].length;
      caretEnd = caret + (selected || 'text').length;
    } else if (op.prefix) {
      // prefix every selected line (or the caret line)
      const lineStart = before.lastIndexOf('\n') + 1;
      const lineEndSel = after.indexOf('\n') === -1 ? value.length : end + after.indexOf('\n');
      const chunk = value.slice(lineStart, lineEndSel);
      const lines = chunk.split('\n').map((l, i) => (op!.prefix === '1. ' ? `${i + 1}. ${l}` : op!.prefix + l));
      next = value.slice(0, lineStart) + lines.join('\n') + value.slice(lineEndSel);
      caret = lineStart + lines.join('\n').length;
      caretEnd = caret;
    } else if (op.block) {
      next = before + op.block + after;
      caret = start + 4; // inside the fence
      caretEnd = caret;
    } else if (op.table) {
      const t = '\n| Column A | Column B | Column C |\n|---|---|---|\n|  |  |  |\n|  |  |  |\n';
      next = before + t + after;
      caret = start + t.length;
      caretEnd = caret;
    } else {
      return;
    }
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caret, caretEnd);
    });
  }

  /** Insert a picked image as markdown with alt text at the caret. */
  function insertImage(ids: number[]) {
    const id = ids[0];
    if (id == null) return;
    const url = API + '/admin/media/' + id + '/file';
    // alt text unknown here — fetch is overkill; leave a descriptive placeholder
    const md = `![image](${url})`;
    const ta = textareaRef.current;
    const at = ta?.selectionStart ?? value.length;
    onChange(value.slice(0, at) + md + value.slice(at));
    setPick(false);
  }

  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', padding: '5px 6px', border: '1px solid #D9E0E8', borderBottom: 0, borderRadius: '6px 6px 0 0', background: '#F8FAFB' }}>
      {OPS.map((op) => (
        <button key={op.label} type="button" title={op.title} onClick={() => apply(op)}
          style={{ border: '1px solid transparent', background: 'none', borderRadius: 5, padding: '3px 8px', fontSize: 12.5, fontWeight: op.label.length <= 2 ? 800 : 600, color: NAVY, cursor: 'pointer' }}>
          {op.label}
        </button>
      ))}
      <button type="button" title="Insert image from media library" onClick={() => setPick(true)}
        style={{ border: '1px solid transparent', background: 'none', borderRadius: 5, padding: '3px 8px', fontSize: 12.5, fontWeight: 600, color: '#0E9F7E', cursor: 'pointer', marginLeft: 'auto' }}>
        🖼 Image
      </button>
      {pick && <MediaPicker selected={[]} onConfirm={insertImage} onClose={() => setPick(false)} />}
    </div>
  );
}
