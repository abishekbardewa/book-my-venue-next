import { boolean, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '../schemaHelpers';

export const rolesEnum = pgEnum('roles', ['CUSTOMER', 'OWNER', 'PLATFORM_ADMIN']);

export const payoutOnboardingStatusEnum = pgEnum('payout_onboarding_status', [
	'NOT_STARTED',
	'PENDING',
	'ACTIVE',
	'NEEDS_DETAILS',
]);

export const UserTable = pgTable('users', {
	id,
	email: varchar().notNull().unique(),
	password: varchar(),
	firstName: varchar(),
	lastName: varchar(),
	phone: varchar().unique(),
	role: rolesEnum().notNull().default('CUSTOMER'),
	avatar: varchar(),
	avatarImagekitFileId: varchar(),
	isOnboarded: boolean().notNull().default(false),
	razorpayLinkedAccountId: varchar().unique(),
	payoutOnboardingStatus: payoutOnboardingStatusEnum().notNull().default('NOT_STARTED'),
	createdAt,
	updatedAt,
	isDeleted: boolean().notNull().default(false),
});
