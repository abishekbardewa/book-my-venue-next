CREATE TYPE "public"."Roles" AS ENUM('CUSTOMER', 'OWNER', 'PLATFORM_ADMIN');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar,
	"firstName" varchar,
	"lastName" varchar,
	"phone" varchar,
	"role" "Roles" DEFAULT 'CUSTOMER' NOT NULL,
	"avatar" varchar,
	"isOnboarded" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
