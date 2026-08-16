ALTER TABLE "booking_payments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "booking_payments" CASCADE;--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_bookingId_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "bookingStatus" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "transactionId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "totalAmount" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "currency" varchar(3) DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "holdExpiresAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "currency" varchar(3) DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "razorpayOrderId" varchar;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refundedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_razorpayOrderId_unique" UNIQUE("razorpayOrderId");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_transactionId_unique" UNIQUE("transactionId");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_unique" UNIQUE("bookingId");