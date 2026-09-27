-- P6 (ADR-009): lead/quote hardening.
-- 1) Extend the P2 submission_status enum with in_progress + closed (APPEND-only;
--    existing rows keep their states). PG allows ADD VALUE inside the migration
--    transaction as long as the new values are not USED in the same transaction.
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'in_progress';
--> statement-breakpoint
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'closed';
--> statement-breakpoint

-- 2) Lead-handling columns: intake priority + first-response SLA deadline.
ALTER TABLE form_submission
  ADD COLUMN IF NOT EXISTS priority varchar(12) NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS due_at timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS submission_due_idx ON form_submission (due_at)
  WHERE status IN ('new', 'assigned', 'in_progress');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS submission_priority_idx ON form_submission (priority);
--> statement-breakpoint

-- 3) Internal collaboration notes (audited trail per lead).
CREATE TABLE IF NOT EXISTS form_note (
  id serial PRIMARY KEY,
  submission_id integer NOT NULL REFERENCES form_submission(id) ON DELETE CASCADE,
  author_id text REFERENCES "user"(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS form_note_submission_idx ON form_note (submission_id);
