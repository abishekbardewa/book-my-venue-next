import { and, eq, gt, gte, inArray, lte, sql } from 'drizzle-orm';
import { env } from '@/data/env/server';
import { db } from '@/drizzle/db';
import { BookingTable, PaymentTable, PropertyTable } from '@/drizzle/schema';

const ACTIVE_BOOKING_STATUSES = [
	'PENDING',
	'AWAITING_OWNER_APPROVAL',
	'CONFIRMED',
] as const;

export class BookingDomainError extends Error {
	constructor(
		message: string,
		public readonly statusCode = 400
	) {
		super(message);
		this.name = 'BookingDomainError';
	}
}

function parseDateOnly(value: string) {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
	if (!match) throw new BookingDomainError('Invalid booking dates');

	const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
	if (Number.isNaN(date.getTime())) {
		throw new BookingDomainError('Invalid booking dates');
	}
	return date;
}

function parsePropertyPrice(value: string) {
	const price = Number(value.replace(/[^\d.]/g, ''));
	if (!Number.isFinite(price) || price <= 0) {
		throw new BookingDomainError('Property price is invalid');
	}
	return price;
}

function inclusiveDays(startDate: Date, endDate: Date) {
	return Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
}

function nextHoldExpiry() {
	return new Date(
		Date.now() + env.BOOKING_PENDING_HOLD_MINUTES * 60 * 1000
	);
}

export async function createPendingBooking(input: {
	startDate: string;
	endDate: string;
	userId: string;
	propertyId: string;
}) {
	const startDate = parseDateOnly(input.startDate);
	const endDate = parseDateOnly(input.endDate);
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);

	if (startDate < today || endDate < startDate) {
		throw new BookingDomainError('Choose a valid future date range');
	}

	const days = inclusiveDays(startDate, endDate);
	if (days > 90) {
		throw new BookingDomainError('A booking cannot be longer than 90 days');
	}

	return db.transaction(async (tx) => {
		// Serializes reservation attempts per property, preventing check-then-insert races.
		await tx.execute(
			sql`select pg_advisory_xact_lock(hashtext(${input.propertyId}))`
		);

		const [property] = await tx
			.select({
				id: PropertyTable.id,
				price: PropertyTable.price,
				ownerId: PropertyTable.ownerId,
			})
			.from(PropertyTable)
			.where(
				and(
					eq(PropertyTable.id, input.propertyId),
					eq(PropertyTable.isDeleted, false),
					eq(PropertyTable.isDraft, false),
					eq(PropertyTable.listingStatus, 'APPROVED')
				)
			)
			.limit(1);

		if (!property) {
			throw new BookingDomainError('Property not found', 404);
		}
		if (property.ownerId === input.userId) {
			throw new BookingDomainError('You cannot book your own property', 403);
		}

		const now = new Date();
		const expired = await tx
			.update(BookingTable)
			.set({ bookingStatus: 'FAILED', statusReason: 'hold_expired' })
			.where(
				and(
					eq(BookingTable.propertyId, input.propertyId),
					eq(BookingTable.bookingStatus, 'PENDING'),
					lte(BookingTable.holdExpiresAt, now)
				)
			)
			.returning({ id: BookingTable.id });

		if (expired.length > 0) {
			await tx
				.update(PaymentTable)
				.set({ status: 'FAILED' })
				.where(
					and(
						inArray(
							PaymentTable.bookingId,
							expired.map((booking) => booking.id)
						),
						eq(PaymentTable.status, 'PENDING')
					)
				);
		}

		const [overlap] = await tx
			.select({ id: BookingTable.id })
			.from(BookingTable)
			.where(
				and(
					eq(BookingTable.propertyId, input.propertyId),
					inArray(BookingTable.bookingStatus, [...ACTIVE_BOOKING_STATUSES]),
					lte(BookingTable.startDate, endDate),
					gte(BookingTable.endDate, startDate)
				)
			)
			.limit(1);

		if (overlap) {
			throw new BookingDomainError(
				'Already booked or temporarily held for the selected date range.',
				409
			);
		}

		const totalAmount = parsePropertyPrice(property.price) * days;
		const [booking] = await tx
			.insert(BookingTable)
			.values({
				startDate,
				endDate,
				bookingStatus: 'PENDING',
				totalAmount: String(totalAmount),
				currency: 'INR',
				holdExpiresAt: nextHoldExpiry(),
				userId: input.userId,
				propertyId: input.propertyId,
			})
			.returning();

		if (!booking) {
			throw new BookingDomainError('Could not create booking', 500);
		}
		return booking;
	});
}

export async function expirePendingBooking(bookingId: string) {
	return db.transaction(async (tx) => {
		const [expired] = await tx
			.update(BookingTable)
			.set({ bookingStatus: 'FAILED', statusReason: 'hold_expired' })
			.where(
				and(
					eq(BookingTable.id, bookingId),
					eq(BookingTable.bookingStatus, 'PENDING'),
					lte(BookingTable.holdExpiresAt, new Date())
				)
			)
			.returning({ id: BookingTable.id });

		if (expired) {
			await tx
				.update(PaymentTable)
				.set({ status: 'FAILED' })
				.where(
					and(
						eq(PaymentTable.bookingId, bookingId),
						eq(PaymentTable.status, 'PENDING')
					)
				);
		}
		return Boolean(expired);
	});
}

export async function releasePendingBooking(bookingId: string, userId: string) {
	return db.transaction(async (tx) => {
		const [released] = await tx
			.update(BookingTable)
			.set({ bookingStatus: 'FAILED', statusReason: 'released_by_user' })
			.where(
				and(
					eq(BookingTable.id, bookingId),
					eq(BookingTable.userId, userId),
					eq(BookingTable.bookingStatus, 'PENDING')
				)
			)
			.returning({ id: BookingTable.id });

		if (released) {
			await tx
				.update(PaymentTable)
				.set({ status: 'FAILED' })
				.where(
					and(
						eq(PaymentTable.bookingId, bookingId),
						eq(PaymentTable.status, 'PENDING')
					)
				);
		}
		return Boolean(released);
	});
}

export async function createPendingPayment(input: {
	bookingId: string;
	userId: string;
	razorpayOrderId: string;
	amount: number;
}) {
	const [payment] = await db
		.insert(PaymentTable)
		.values({
			bookingId: input.bookingId,
			userId: input.userId,
			razorpayOrderId: input.razorpayOrderId,
			amount: String(input.amount),
			currency: 'INR',
			status: 'PENDING',
		})
		.returning();
	return payment ?? null;
}

export async function getPaymentOrderForBooking(bookingId: string) {
	const [payment] = await db
		.select()
		.from(PaymentTable)
		.where(eq(PaymentTable.bookingId, bookingId))
		.limit(1);
	return payment ?? null;
}

export async function extendPendingHold(bookingId: string) {
	const [booking] = await db
		.update(BookingTable)
		.set({ holdExpiresAt: nextHoldExpiry() })
		.where(
			and(
				eq(BookingTable.id, bookingId),
				eq(BookingTable.bookingStatus, 'PENDING'),
				gt(BookingTable.holdExpiresAt, new Date())
			)
		)
		.returning();
	return booking ?? null;
}

export async function applyPaymentSuccess(input: {
	orderId: string;
	paymentId: string;
	amountInPaise?: number;
}) {
	return db.transaction(async (tx) => {
		const [payment] = await tx
			.select()
			.from(PaymentTable)
			.where(eq(PaymentTable.razorpayOrderId, input.orderId))
			.limit(1);

		if (!payment) {
			throw new BookingDomainError('Payment order not found', 404);
		}
		if (input.amountInPaise !== undefined) {
			const expected = Math.round(Number(payment.amount) * 100);
			if (expected !== input.amountInPaise) {
				throw new BookingDomainError('Payment amount mismatch', 400);
			}
		}
		if (payment.status === 'SUCCESS' && payment.transactionId === input.paymentId) {
			return payment;
		}
		if (payment.status === 'REFUNDED') {
			return payment;
		}

		const [updatedPayment] = await tx
			.update(PaymentTable)
			.set({
				status: 'SUCCESS',
				transactionId: input.paymentId,
			})
			.where(eq(PaymentTable.id, payment.id))
			.returning();

		await tx
			.update(BookingTable)
			.set({ bookingStatus: 'AWAITING_OWNER_APPROVAL', statusReason: null })
			.where(
				and(
					eq(BookingTable.id, payment.bookingId),
					inArray(BookingTable.bookingStatus, ['PENDING', 'FAILED'])
				)
			);

		return updatedPayment ?? payment;
	});
}

export async function applyPaymentFailure(input: {
	orderId: string;
	paymentId?: string;
	amountInPaise?: number;
}) {
	return db.transaction(async (tx) => {
		const [payment] = await tx
			.select()
			.from(PaymentTable)
			.where(eq(PaymentTable.razorpayOrderId, input.orderId))
			.limit(1);

		if (!payment || payment.status !== 'PENDING') {
			return payment ?? null;
		}
		if (input.amountInPaise !== undefined) {
			const expected = Math.round(Number(payment.amount) * 100);
			if (expected !== input.amountInPaise) {
				throw new BookingDomainError('Payment amount mismatch', 400);
			}
		}

		const [updatedPayment] = await tx
			.update(PaymentTable)
			.set({
				status: 'FAILED',
				transactionId: input.paymentId ?? null,
			})
			.where(eq(PaymentTable.id, payment.id))
			.returning();

		await tx
			.update(BookingTable)
			.set({ bookingStatus: 'FAILED', statusReason: 'payment_failed' })
			.where(
				and(
					eq(BookingTable.id, payment.bookingId),
					eq(BookingTable.bookingStatus, 'PENDING')
				)
			);

		return updatedPayment ?? payment;
	});
}

export async function getSuccessfulPaymentForBooking(bookingId: string) {
	const [payment] = await db
		.select()
		.from(PaymentTable)
		.where(
			and(
				eq(PaymentTable.bookingId, bookingId),
				eq(PaymentTable.status, 'SUCCESS')
			)
		)
		.limit(1);
	return payment ?? null;
}
