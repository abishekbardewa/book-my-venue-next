import { and, eq, inArray, lt } from 'drizzle-orm';
import { env } from '@/data/env/server';
import { db } from '@/drizzle/db';
import { BookingTable, PaymentTable } from '@/drizzle/schema';
import { refundSuccessfulBookingPayment } from '@/features/payments/refund';

/** Release expired server-side payment holds while preserving an audit row. */
export async function deleteExpiredPendingBookings(now = new Date()) {
	const expired = await db
		.select({ id: BookingTable.id })
		.from(BookingTable)
		.where(
			and(
				eq(BookingTable.bookingStatus, 'PENDING'),
				lt(BookingTable.holdExpiresAt, now)
			)
		);

	if (expired.length > 0) {
		const bookingIds = expired.map((booking) => booking.id);
		await db
			.update(BookingTable)
			.set({ bookingStatus: 'FAILED', statusReason: 'hold_expired' })
			.where(inArray(BookingTable.id, bookingIds));
		await db
			.update(PaymentTable)
			.set({ status: 'FAILED' })
			.where(
				and(
					inArray(PaymentTable.bookingId, bookingIds),
					eq(PaymentTable.status, 'PENDING')
				)
			);
	}

	return expired.length;
}

/** Cancel + refund AWAITING bookings past BOOKING_AWAITING_TIMEOUT_MINUTES. */
export async function cancelStaleAwaitingOwnerBookings(
	cutoff = new Date(
		Date.now() - env.BOOKING_AWAITING_TIMEOUT_MINUTES * 60 * 1000
	)
) {
	const pending = await db
		.select({ id: BookingTable.id })
		.from(BookingTable)
		.where(
			and(
				eq(BookingTable.bookingStatus, 'AWAITING_OWNER_APPROVAL'),
				lt(BookingTable.updatedAt, cutoff)
			)
		);

	for (const booking of pending) {
		try {
			await refundSuccessfulBookingPayment(booking.id);
			await db.transaction(async (tx) => {
				await tx
					.update(BookingTable)
					.set({
						bookingStatus: 'CANCELLED',
						statusReason: 'awaiting_timeout',
					})
					.where(eq(BookingTable.id, booking.id));
				await tx
					.update(PaymentTable)
					.set({ status: 'REFUNDED', refundedAt: new Date() })
					.where(
						and(
							eq(PaymentTable.bookingId, booking.id),
							eq(PaymentTable.status, 'SUCCESS')
						)
					);
			});
		} catch (error) {
			console.error(`Could not auto-refund booking ${booking.id}:`, error);
		}
	}

	return pending.length;
}

/** Old app: CONFIRMED + SUCCESS payment + endDate < now → COMPLETED. */
export async function markCompletedBookings(now = new Date()) {
	const confirmed = await db
		.select({ id: BookingTable.id })
		.from(BookingTable)
		.where(
			and(
				eq(BookingTable.bookingStatus, 'CONFIRMED'),
				lt(BookingTable.endDate, now)
			)
		);

	if (confirmed.length === 0) {
		return 0;
	}

	const successfulPayments = await db
		.select({ bookingId: PaymentTable.bookingId })
		.from(PaymentTable)
		.where(
			and(
				inArray(
					PaymentTable.bookingId,
					confirmed.map((booking) => booking.id)
				),
				eq(PaymentTable.status, 'SUCCESS')
			)
		);

	const completableIds = [
		...new Set(successfulPayments.map((payment) => payment.bookingId)),
	];
	if (completableIds.length === 0) {
		return 0;
	}

	await db
		.update(BookingTable)
		.set({ bookingStatus: 'COMPLETED' })
		.where(inArray(BookingTable.id, completableIds));

	return completableIds.length;
}

export async function runBookingCronJobs() {
	const deletedPending = await deleteExpiredPendingBookings();
	const cancelledAwaiting = await cancelStaleAwaitingOwnerBookings();
	const completed = await markCompletedBookings();

	return { deletedPending, cancelledAwaiting, completed };
}
