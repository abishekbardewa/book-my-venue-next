import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '../schemaHelpers';
import { UserTable } from './user';

export const notificationTypeEnum = pgEnum('notification_type', [
	'BOOKING_REQUEST',
	'BOOKING_CONFIRMED',
	'BOOKING_REJECTED',
	'BOOKING_CANCELLED_BY_GUEST',
	'BOOKING_AUTO_CANCELLED',
	'BOOKING_COMPLETED',
	'LISTING_APPROVED',
	'LISTING_REJECTED',
	'LISTING_PENDING_REVIEW',
]);

export const NotificationTable = pgTable('notifications', {
	id,
	userId: uuid()
		.notNull()
		.references(() => UserTable.id, { onDelete: 'cascade' }),
	type: notificationTypeEnum().notNull(),
	title: varchar({ length: 120 }).notNull(),
	body: varchar({ length: 500 }).notNull(),
	href: varchar({ length: 260 }),
	readAt: timestamp({ withTimezone: true }),
	createdAt,
	updatedAt,
});
