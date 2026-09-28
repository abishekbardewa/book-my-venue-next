ALTER TABLE "properties" ADD COLUMN "listingSubmissionCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "listingRejectionReasonCode" varchar(40);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "listingAllowsResubmit" boolean;
