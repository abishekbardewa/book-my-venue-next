import { numeric, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '../schemaHelpers';
import { PropertyTable } from './property';
import { UserTable } from './user';

export const bookingStatusEnum = pgEnum('booking_status', [
	'PENDING',
	'AWAITING_OWNER_APPROVAL',
	'FAILED',
	'CONFIRMED',
	'CANCELLED',
	'COMPLETED',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
	'PENDING',
	'SUCCESS',
	'FAILED',
	'REFUNDED',
]);

export const BookingTable = pgTable('bookings', {
	id,
	startDate: timestamp({ withTimezone: true }).notNull(),
	endDate: timestamp({ withTimezone: true }).notNull(),
	bookingStatus: bookingStatusEnum().notNull().default('PENDING'),
	/** Short code for fail/cancel cause; null on happy-path statuses. */
	statusReason: varchar({ length: 64 }),
	totalAmount: numeric({ precision: 12, scale: 2 }).notNull().default('0'),
	currency: varchar({ length: 3 }).notNull().default('INR'),
	holdExpiresAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	userId: uuid()
		.notNull()
		.references(() => UserTable.id),
	propertyId: uuid()
		.notNull()
		.references(() => PropertyTable.id),
	bookingDate: timestamp({ withTimezone: true }).notNull().defaultNow(),
	createdAt,
	updatedAt,
});

export const PaymentTable = pgTable('payments', {
	id,
	amount: numeric({ precision: 12, scale: 2 }).notNull(),
	currency: varchar({ length: 3 }).notNull().default('INR'),
	status: paymentStatusEnum().notNull().default('PENDING'),
	// Nullable only so existing parity payment rows can migrate; all new rows set it.
	razorpayOrderId: varchar().unique(),
	transactionId: varchar().unique(),
	bookingId: uuid()
		.notNull()
		.unique()
		.references(() => BookingTable.id, { onDelete: 'cascade' }),
	userId: uuid()
		.notNull()
		.references(() => UserTable.id),
	refundedAt: timestamp({ withTimezone: true }),
	createdAt,
	updatedAt,
});
