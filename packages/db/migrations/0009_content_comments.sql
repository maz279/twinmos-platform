-- 0009: editorial review comments (Phase 2 §2.3 — two-person review workflow).
-- Threaded staff feedback on content entities while in review; the content
-- workflow itself (in_review transition) already lives in the status machine.
CREATE TABLE IF NOT EXISTS "content_comment" (
  id serial PRIMARY KEY,
  entity varchar(20) NOT NULL,
  entity_id integer NOT NULL,
  author_id text REFERENCES "user"(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS content_comment_target_idx ON "content_comment" (entity, entity_id);
