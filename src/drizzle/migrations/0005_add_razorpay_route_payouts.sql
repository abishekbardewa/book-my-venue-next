CREATE TYPE "public"."payout_onboarding_status" AS ENUM('NOT_STARTED', 'PENDING', 'ACTIVE', 'NEEDS_DETAILS');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "razorpayLinkedAccountId" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "payoutOnboardingStatus" "payout_onboarding_status" DEFAULT 'NOT_STARTED' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "platformFee" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "ownerShare" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "razorpayTransferId" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_razorpayLinkedAccountId_unique" UNIQUE("razorpayLinkedAccountId");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_razorpayTransferId_unique" UNIQUE("razorpayTransferId");