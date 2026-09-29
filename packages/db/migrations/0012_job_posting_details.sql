ALTER TABLE "job_posting" ADD COLUMN "salary_band" varchar(80);--> statement-breakpoint
ALTER TABLE "job_posting" ADD COLUMN "equal_opportunity" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX "job_posting_status_idx" ON "job_posting" ("status");
