// Phase 4 truth contract (T4.7.2 / E9): every published content row records
// where it came from and who approved it. Reused by content, catalogue,
// policy and entity routes so the rule cannot drift.
export type ProvenanceIssue = { path: string[]; message: string };

export function provenanceIssue(
  data: Record<string, any> | null | undefined,
  effectiveStatus?: string,
): ProvenanceIssue | null {
  const status = effectiveStatus ?? data?.status;
  // Scheduled rows auto-publish later, so they must be provenance-complete now.
  if (status !== 'published' && status !== 'scheduled') return null;
  const source = String(data?.source ?? '').trim();
  const approver = String(data?.approver ?? '').trim();
  if (!source || !approver) {
    return {
      path: ['source'],
      message: 'Published records require both a source and an approver (T4.7.2).',
    };
  }
  return null;
}

export function touchesProvenance(raw: Record<string, any>): boolean {
  return ['status', 'source', 'approver'].some((k) => Object.prototype.hasOwnProperty.call(raw ?? {}, k));
}
