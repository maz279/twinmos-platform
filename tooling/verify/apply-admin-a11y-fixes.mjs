import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(process.cwd());

function patchFile(relPath, transform) {
  const fullPath = resolve(repoRoot, relPath);
  const src = readFileSync(fullPath, 'utf8');
  const updated = transform(src);
  if (src !== updated) {
    writeFileSync(fullPath, updated, 'utf8');
    console.log(`[PATCHED] ${relPath}`);
  } else {
    console.log(`[NO CHANGE] ${relPath}`);
  }
}

// 1. submissions.tsx
patchFile('apps/admin/src/modules/submissions.tsx', (src) => {
  let s = src;
  if (!s.includes('MUTED,')) {
    s = s.replace(/import\s*\{\s*Badge,\s*btn,\s*btnGhost,\s*Empty,\s*Err,\s*input,/, 'import { Badge, btn, btnGhost, Empty, Err, input, MUTED,');
  }
  // Title / subtitle
  s = s.replace(/<span style=\{\{ color: '#66748A', fontSize: 15 \}\}>/g, '<span style={{ color: MUTED, fontSize: 15 }}>');
  s = s.replace(/<div style=\{\{ fontSize: 12\.5, color: '#66748A', margin: '0 0 8px' \}\}>/g, '<div style={{ fontSize: 12.5, color: MUTED, margin: "0 0 8px" }}>');
  s = s.replace(/<span style=\{\{ color: '#66748A', fontWeight: 400 \}\}>/g, '<span style={{ color: MUTED, fontWeight: 400 }}>');
  s = s.replace(/<div style=\{\{ fontSize: 10\.5, fontWeight: 800, letterSpacing: 0\.9, textTransform: 'uppercase', color: '#93A0B4', marginBottom: 6 \}\}>/g, '<div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>');
  s = s.replace(/<span style=\{\{ fontSize: 12\.5, color: '#66748A', whiteSpace: 'nowrap'/g, '<span style={{ fontSize: 12.5, color: MUTED, whiteSpace: "nowrap"');
  s = s.replace(/<p style=\{\{ color: '#66748A', fontSize: 13 \}\}>/g, '<p style={{ color: MUTED, fontSize: 13 }}>');
  s = s.replace(/<span style=\{\{ color: '#66748A' \}\}>\{n\.author/g, '<span style={{ color: MUTED }}>{n.author');
  s = s.replace(/<td style=\{\{ \.\.\.td, width: 160, color: '#66748A' \}\}>/g, '<td style={{ ...td, width: 160, color: MUTED }}>');
  s = s.replace(/<span style=\{\{ color: '#66748A', fontSize: 13 \}\}>/g, '<span style={{ color: MUTED, fontSize: 13 }}>');
  s = s.replace(/<span style=\{\{ color: '#93A0B4', fontSize: 11\.5 \}\}>Sent from the mailer/g, '<span style={{ color: MUTED, fontSize: 11.5 }}>Sent from the mailer');

  // Input & Selects
  s = s.replace(/placeholder="Search email, ref, content…"\s+value=\{q\}/, 'placeholder="Search email, ref, content…" aria-label="Search email, ref, content" value={q}');
  s = s.replace(/<select style=\{input\} value=\{type\} onChange=\{\(e\) => \{ setType\(e\.target\.value\); setCursor\(null\); \}\} title="Form type">/, '<select style={input} value={type} onChange={(e) => { setType(e.target.value); setCursor(null); }} aria-label="Filter by form type" title="Form type">');
  s = s.replace(/<select style=\{input\} value=\{status\} onChange=\{\(e\) => \{ setStatus\(e\.target\.value\); setCursor\(null\); \}\}>/, '<select style={input} value={status} onChange={(e) => { setStatus(e.target.value); setCursor(null); }} aria-label="Filter by status">');
  s = s.replace(/<select style=\{input\} value=\{priority\} onChange=\{\(e\) => \{ setPriority\(e\.target\.value\); setCursor\(null\); \}\}>/, '<select style={input} value={priority} onChange={(e) => { setPriority(e.target.value); setCursor(null); }} aria-label="Filter by priority">');
  s = s.replace(/<select style=\{input\} value=\{sla\} onChange=\{\(e\) => \{ setSla\(e\.target\.value\); setCursor\(null\); \}\}>/, '<select style={input} value={sla} onChange={(e) => { setSla(e.target.value); setCursor(null); }} aria-label="Filter by SLA">');
  s = s.replace(/<select style=\{input\} value=\{assignee\} onChange=\{\(e\) => \{ setAssignee\(e\.target\.value\); setCursor\(null\); \}\} title="Ownership">/, '<select style={input} value={assignee} onChange={(e) => { setAssignee(e.target.value); setCursor(null); }} aria-label="Filter by assignee" title="Ownership">');
  s = s.replace(/<select style=\{\{ \.\.\.input, width: 150 \}\} value=\{sub\.assigneeId \?\? ''\} disabled=\{busy\}\s+onChange=\{\(e\) => patch\(\{ assigneeId: e\.target\.value \|\| null \}\)\} title="Owner">/, '<select style={{ ...input, width: 150 }} value={sub.assigneeId ?? ""} disabled={busy} onChange={(e) => patch({ assigneeId: e.target.value || null })} aria-label="Assignee" title="Owner">');
  s = s.replace(/<select style=\{\{ \.\.\.input, width: 110 \}\} value=\{sub\.priority\} disabled=\{busy\} onChange=\{\(e\) => patch\(\{ priority: e\.target\.value \}\)\} title="Priority">/, '<select style={{ ...input, width: 110 }} value={sub.priority} disabled={busy} onChange={(e) => patch({ priority: e.target.value })} aria-label="Priority" title="Priority">');

  return s;
});

// 2. rma.tsx
patchFile('apps/admin/src/modules/rma.tsx', (src) => {
  let s = src;
  s = s.replace(/<select style=\{input\} value=\{status\} onChange=\{\(e\) => setStatus\(e\.target\.value\)\}>/, '<select style={input} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">');
  s = s.replace(/placeholder="Search number, SKU, serial, customer…"\s+value=\{q\}/, 'placeholder="Search number, SKU, serial, customer…" aria-label="Search number, SKU, serial, customer" value={q}');
  s = s.replace(/<select style=\{input\} value=\{assignee\} onChange=\{\(e\) => setAssignee\(e\.target\.value\)\} title="Technician">/, '<select style={input} value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="Filter by technician" title="Technician">');
  return s;
});

// 3. partners.tsx
patchFile('apps/admin/src/modules/partners.tsx', (src) => {
  let s = src;
  if (!s.includes('MUTED,')) {
    s = s.replace(/import\s*\{\s*Badge,\s*btn,\s*btnGhost,\s*Empty,\s*Err,\s*input,/, 'import { Badge, btn, btnGhost, Empty, Err, input, MUTED,');
  }
  s = s.replace(/<p style=\{\{ color: '#66748A', fontSize: 13, margin: '4px 0 0' \}\}>/g, '<p style={{ color: MUTED, fontSize: 13, margin: "4px 0 0" }}>');
  s = s.replace(/<p style=\{\{ color: '#66748A', fontSize: 13, margin: '0 0 10px' \}\}>/g, '<p style={{ color: MUTED, fontSize: 13, margin: "0 0 10px" }}>');
  s = s.replace(/<div style=\{\{ color: '#66748A', fontSize: 12 \}\}>\{o\.country/g, '<div style={{ color: MUTED, fontSize: 12 }}>{o.country');
  s = s.replace(/<div style=\{\{ color: '#66748A', fontSize: 12 \}\}>\{d\.name\}/g, '<div style={{ color: MUTED, fontSize: 12 }}>{d.name}</div>');
  s = s.replace(/<td style=\{\{ \.\.\.td, fontSize: 12, color: '#66748A', maxWidth: 180 \}\}>/g, '<td style={{ ...td, fontSize: 12, color: MUTED, maxWidth: 180 }}>');

  s = s.replace(/<select style=\{input\} value=\{newType\} onChange=\{\(e\) => setNewType\(e\.target\.value\)\}>/, '<select style={input} value={newType} onChange={(e) => setNewType(e.target.value)} aria-label="New organization type">');
  s = s.replace(/placeholder="Search name…"\s+value=\{q\}/, 'placeholder="Search name…" aria-label="Search organization name" value={q}');
  s = s.replace(/<select style=\{input\} value=\{type\} onChange=\{\(e\) => \{ setType\(e\.target\.value\); setQuery\(\{ q, type: e\.target\.value, status \}\); \}\}>/, '<select style={input} value={type} onChange={(e) => { setType(e.target.value); setQuery({ q, type: e.target.value, status }); }} aria-label="Filter by organization type">');
  s = s.replace(/<select style=\{input\} value=\{status\} onChange=\{\(e\) => \{ setStatus\(e\.target\.value\); setQuery\(\{ q, type: e\.target\.value, status \}\); \}\}>/, '<select style={input} value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ q, type: status, status: e.target.value }); }} aria-label="Filter by organization status">');

  s = s.replace(/placeholder="Search country, name, city…"\s+value=\{q\}/, 'placeholder="Search country, name, city…" aria-label="Search country, name, city" value={q}');
  s = s.replace(/<select style=\{input\} value=\{region\} onChange=\{\(e\) => \{ setRegion\(e\.target\.value\); setQuery\(\{ q, region: e\.target\.value, status \}\); \}\}>/, '<select style={input} value={region} onChange={(e) => { setRegion(e.target.value); setQuery({ q, region: e.target.value, status }); }} aria-label="Filter by region">');
  s = s.replace(/<select style=\{input\} value=\{status\} onChange=\{\(e\) => \{ setStatus\(e\.target\.value\); setQuery\(\{ q, region, status: e\.target\.value \}\); \}\}>/, '<select style={input} value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ q, region, status: e.target.value }); }} aria-label="Filter by distributor status">');

  return s;
});

// 4. jobs.tsx
patchFile('apps/admin/src/modules/jobs.tsx', (src) => {
  let s = src;
  if (!s.includes('MUTED,')) {
    s = s.replace(/import\s*\{\s*Badge,\s*btn,\s*btnGhost,\s*CommandBar,\s*Empty,\s*Err,\s*input,/, 'import { Badge, btn, btnGhost, CommandBar, Empty, Err, input, MUTED,');
  }
  s = s.replace(/color: '#93A0B4'/g, 'color: MUTED');
  s = s.replace(/color: '#66748A'/g, 'color: MUTED');

  s = s.replace(/placeholder="Search title, location, body…"\s+value=\{q\}/, 'placeholder="Search title, location, body…" aria-label="Search title, location, body" value={q}');
  s = s.replace(/<select style=\{input\} value=\{dept\} onChange=\{\(e\) => setDept\(e\.target\.value\)\}>/, '<select style={input} value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department">');
  s = s.replace(/<select style=\{input\} value=\{status\} onChange=\{\(e\) => setStatus\(e\.target\.value\)\}>/, '<select style={input} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">');

  s = s.replace(/placeholder="Search candidate, email, ref, content…"\s+value=\{q\}/, 'placeholder="Search candidate, email, ref, content…" aria-label="Search candidate, email, ref, content" value={q}');
  s = s.replace(/<select style=\{input\} value=\{status\} onChange=\{\(e\) => setStatus\(e\.target\.value\)\}>/, '<select style={input} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by application status">');
  s = s.replace(/<select style=\{input\} value=\{postingId\} onChange=\{\(e\) => setPostingId\(e\.target\.value\)\} title="Posting">/, '<select style={input} value={postingId} onChange={(e) => setPostingId(e.target.value)} aria-label="Filter by posting role" title="Posting">');
  s = s.replace(/<select style=\{input\} value=\{app\.status\} disabled=\{busyId === app\.id\} onClick=\{\(e\) => e\.stopPropagation\(\)\} onChange=\{\(e\) => setStatusFor\(app\.id, e\.target\.value\)\}>/, '<select style={input} value={app.status} disabled={busyId === app.id} onClick={(e) => e.stopPropagation()} onChange={(e) => setStatusFor(app.id, e.target.value)} aria-label={`Change status for application ${app.refCode}`}>');

  return s;
});

// 5. media.tsx
patchFile('apps/admin/src/modules/media.tsx', (src) => {
  let s = src;
  if (!s.includes('MUTED,')) {
    s = s.replace(/import\s*\{\s*Badge,\s*btn,\s*btnGhost,\s*Empty,\s*Err,\s*input,/, 'import { Badge, btn, btnGhost, Empty, Err, input, MUTED,');
  }
  s = s.replace(/<input ref=\{fileRef\} type="file" style=\{input\} accept="\.png,\.jpg,\.jpeg,\.webp,\.gif,\.svg,\.avif,\.pdf,\.webm,\.mp4" \/>/, '<input ref={fileRef} type="file" style={input} accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.pdf,.webm,.mp4" aria-label="Upload media file" />');
  s = s.replace(/<input ref=\{bulkRef\} type="file" multiple style=\{\{ \.\.\.input, maxWidth: 240 \}\} accept="\.png,\.jpg,\.jpeg,\.webp,\.gif,\.avif,\.pdf" title="Bulk upload — alt is derived from each filename" \/>/, '<input ref={bulkRef} type="file" multiple style={{ ...input, maxWidth: 240 }} accept=".png,.jpg,.jpeg,.webp,.gif,.avif,.pdf" aria-label="Bulk upload media files" title="Bulk upload — alt is derived from each filename" />');
  s = s.replace(/<select style={input} value={kind} onChange={(e) => setKind(e.target.value)} title="Kind">/, '<select style={input} value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Filter by media kind" title="Kind">');
  s = s.replace(/placeholder="Search key or alt text…"\s+value=\{q\}/, 'placeholder="Search key or alt text…" aria-label="Search key or alt text" value={q}');

  // Rename & Delete folder buttons target-size
  s = s.replace(/<button title="Rename" style=\{\{ border: 0, background: 'none', color: '#93A0B4', cursor: 'pointer', padding: '2px 4px', fontSize: 11 \}\} onClick=\{\(\) => \{ setRenaming\(f\.id\); setRenameVal\(f\.name\); \}\}>✎<\/button>/g, '<button title="Rename" aria-label="Rename folder" style={{ border: 0, background: "none", color: MUTED, cursor: "pointer", padding: "6px 8px", fontSize: 13, minWidth: 26, minHeight: 26 }} onClick={() => { setRenaming(f.id); setRenameVal(f.name); }}>✎</button>');
  s = s.replace(/<button title="Delete \(must be empty\)" style=\{\{ border: 0, background: 'none', color: '#93A0B4', cursor: 'pointer', padding: '2px 4px', fontSize: 11 \}\} disabled=\{busy\} onClick=\{\(\) => deleteFolder\(f\.id\)\}>✕<\/button>/g, '<button title="Delete (must be empty)" aria-label="Delete folder" style={{ border: 0, background: "none", color: MUTED, cursor: "pointer", padding: "6px 8px", fontSize: 13, minWidth: 26, minHeight: 26 }} disabled={busy} onClick={() => deleteFolder(f.id)}>✕</button>');

  // Folder aside colors
  s = s.replace(/color: '#93A0B4'/g, 'color: MUTED');
  s = s.replace(/color: '#66748A'/g, 'color: MUTED');

  return s;
});

// 6. users.tsx
patchFile('apps/admin/src/modules/users.tsx', (src) => {
  let s = src;
  if (!s.includes('MUTED,')) {
    s = s.replace(/import\s*\{\s*Badge,\s*btn,\s*btnGhost,\s*card,\s*Empty,\s*Err,\s*input,/, 'import { Badge, btn, btnGhost, card, Empty, Err, input, MUTED,');
  }
  s = s.replace(/<p style=\{\{ color: '#66748A', margin: '4px 0 0' \}\}>/g, '<p style={{ color: MUTED, margin: "4px 0 0" }}>');
  s = s.replace(/<p style=\{\{ color: '#66748A', padding: '16px 0' \}\}>Loading user directory…<\/p>/g, '<p style={{ color: MUTED, padding: "16px 0" }}>Loading user directory…</p>');
  s = s.replace(/<div style=\{\{ fontSize: 12, color: '#64748B' \}\}>\{u\.email\}<\/div>/g, '<div style={{ fontSize: 12, color: MUTED }}>{u.email}</div>');
  s = s.replace(/color: '#66748A'/g, 'color: MUTED');

  s = s.replace(/placeholder="Search by name or email…"\s+value=\{q\}/, 'placeholder="Search by name or email…" aria-label="Search staff by name or email" value={q}');
  s = s.replace(/<select\s+style=\{\{ \.\.\.input, width: 160 \}\}\s+value=\{roleFilter\}/, '<select style={{ ...input, width: 160 }} aria-label="Filter by staff role" value={roleFilter}');
  s = s.replace(/<select\s+disabled=\{isMe\}\s+value=\{u\.role\}/, '<select disabled={isMe} value={u.role} aria-label={`Change role for ${u.name || u.email}`}');

  return s;
});

// 7. audit.tsx
patchFile('apps/admin/src/modules/audit.tsx', (src) => {
  let s = src;
  if (!s.includes('MUTED,')) {
    s = s.replace(/import\s*\{\s*Badge,\s*btn,\s*btnGhost,\s*card,\s*Empty,\s*Err,\s*input,/, 'import { Badge, btn, btnGhost, card, Empty, Err, input, MUTED,');
  }
  s = s.replace(/color: '#66748A'/g, 'color: MUTED');
  s = s.replace(/color: '#93A0B4'/g, 'color: MUTED');
  s = s.replace(/color: '#64748B'/g, 'color: MUTED');

  // Input & Select labels & ids
  s = s.replace(/<label style=\{\{ fontSize: 12, fontWeight: 600, color: '#475569' \}\}>Entity<\/label>\s*<select\s+style=\{\{ \.\.\.input, minWidth: 160 \}\}\s+value=\{entity\}/, '<label htmlFor="audit-entity-select" style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>Entity</label><select id="audit-entity-select" aria-label="Filter by entity" style={{ ...input, minWidth: 160 }} value={entity}');
  s = s.replace(/<label style=\{\{ fontSize: 12, fontWeight: 600, color: '#475569' \}\}>Actor<\/label>\s*\{usersList\.length > 0 \? \(\s*<select\s+style=\{\{ \.\.\.input, minWidth: 160 \}\}\s+value=\{actorId\}/, '<label htmlFor="audit-actor-select" style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>Actor</label>{usersList.length > 0 ? (<select id="audit-actor-select" aria-label="Filter by actor" style={{ ...input, minWidth: 160 }} value={actorId}');
  s = s.replace(/<label style=\{\{ fontSize: 12, fontWeight: 600, color: '#475569' \}\}>Action<\/label>\s*<input\s+style=\{\{ \.\.\.input, width: 140 \}\}/, '<label htmlFor="audit-action-input" style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>Action</label><input id="audit-action-input" aria-label="Filter by action" style={{ ...input, width: 140 }}');
  s = s.replace(/<label style=\{\{ fontSize: 12, fontWeight: 600, color: '#475569' \}\}>From Date<\/label>\s*<input\s+type="date"\s+style=\{input\}/, '<label htmlFor="audit-from-date" style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>From Date</label><input id="audit-from-date" type="date" aria-label="From date" style={input}');
  s = s.replace(/<label style=\{\{ fontSize: 12, fontWeight: 600, color: '#475569' \}\}>To Date<\/label>\s*<input\s+type="date"\s+style=\{input\}/, '<label htmlFor="audit-to-date" style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>To Date</label><input id="audit-to-date" type="date" aria-label="To date" style={input}');

  return s;
});

// 8. privacy.tsx
patchFile('apps/admin/src/modules/privacy.tsx', (src) => {
  let s = src;
  if (!s.includes('useDialogA11y')) {
    s = s.replace(/import\s*\{\s*Badge,\s*btn,\s*btnGhost,\s*card,\s*Err,\s*input,\s*Table,\s*td,\s*GREEN,\s*RED,\s*INK,\s*MUTED,\s*PAGE,\s*LINE\s*\}\s*from\s*'\.\.\/ui';/, "import { Badge, btn, btnGhost, card, Err, input, Table, td, GREEN, RED, INK, MUTED, PAGE, LINE } from '../ui';\nimport { useDialogA11y } from '../dialog-a11y';");
  }
  if (!s.includes('const eraseDialogRef = useDialogA11y')) {
    s = s.replace(/const\s+\[showEraseModal,\s*setShowEraseModal\]\s*=\s*useState\(false\);/, "const [showEraseModal, setShowEraseModal] = useState(false);\n  const eraseDialogRef = useDialogA11y({ isOpen: showEraseModal, onClose: () => setShowEraseModal(false) });");
  }
  // Wrap modal in accessibility attributes
  s = s.replace(/<div style=\{\{\s*\.\.\.card,\s*maxWidth:\s*480,\s*width:\s*'90%',\s*padding:\s*24,\s*boxShadow:\s*'0 20px 25px -5px rgba\(0,0,0,0\.1\)'\s*\}\}>/, '<div ref={eraseDialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-erase-title" style={{ ...card, maxWidth: 480, width: \'90%\', padding: 24, boxShadow: \'0 20px 25px -5px rgba(0,0,0,0.1)\' }}>');
  s = s.replace(/<h3 style=\{\{\s*margin:\s*'0 0 10px 0',\s*fontSize:\s*18,\s*color:\s*RED,\s*fontWeight:\s*700\s*\}\}>/, '<h3 id="confirm-erase-title" style={{ margin: \'0 0 10px 0\', fontSize: 18, color: RED, fontWeight: 700 }}>');

  return s;
});

console.log('[apply-admin-a11y-fixes] Done.');
