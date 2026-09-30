ALTER TABLE "rma_request" ADD COLUMN "assignee_id" text REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
CREATE INDEX "rma_assignee_idx" ON "rma_request" ("assignee_id");
