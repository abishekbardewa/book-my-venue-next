import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { BookingTable, PropertyTable } from '@/drizzle/schema';
import {
	createNotification,
	createNotifications,
	listPlatformAdminIds,
} from '@/features/notifications/db';

function formatStayRange(start: Date, end: Date) {
	const formatter = new Intl.DateTimeFormat('en-IN', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
	const startLabel = formatter.format(start);
	const endLabel = formatter.format(end);
	return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

async function getBookingNotifyContext(bookingId: string) {
	const [row] = await db
		.select({
			bookingId: BookingTable.id,
			userId: BookingTable.userId,
			propertyId: BookingTable.propertyId,
			startDate: BookingTable.startDate,
			endDate: BookingTable.endDate,
			propertyName: PropertyTable.propertyName,
			ownerId: PropertyTable.ownerId,
		})
		.from(BookingTable)
		.innerJoin(PropertyTable, eq(PropertyTable.id, BookingTable.propertyId))
		.where(eq(BookingTable.id, bookingId))
		.limit(1);
	return row ?? null;
}

export async function notifyBookingRequest(bookingId: string) {
	const ctx = await getBookingNotifyContext(bookingId);
	if (!ctx) return;
	const dates = formatStayRange(ctx.startDate, ctx.endDate);
	await createNotification({
		userId: ctx.ownerId,
		type: 'BOOKING_REQUEST',
		title: 'New booking request',
		body: `New booking request for ${ctx.propertyName} (${dates}).`,
		href: `/owner/bookings/${ctx.bookingId}`,
	});
}

export async function notifyBookingConfirmed(bookingId: string) {
	const ctx = await getBookingNotifyContext(bookingId);
	if (!ctx) return;
	const dates = formatStayRange(ctx.startDate, ctx.endDate);
	await createNotification({
		userId: ctx.userId,
		type: 'BOOKING_CONFIRMED',
		title: 'Booking confirmed',
		body: `Your booking at ${ctx.propertyName} for ${dates} was confirmed.`,
		href: '/bookings',
	});
}

export async function notifyBookingRejected(bookingId: string) {
	const ctx = await getBookingNotifyContext(bookingId);
	if (!ctx) return;
	const dates = formatStayRange(ctx.startDate, ctx.endDate);
	await createNotification({
		userId: ctx.userId,
		type: 'BOOKING_REJECTED',
		title: 'Booking declined',
		body: `Your booking at ${ctx.propertyName} for ${dates} was declined. Any payment will be refunded.`,
		href: '/bookings',
	});
}

export async function notifyBookingCancelledByGuest(bookingId: string) {
	const ctx = await getBookingNotifyContext(bookingId);
	if (!ctx) return;
	const dates = formatStayRange(ctx.startDate, ctx.endDate);
	await createNotification({
		userId: ctx.ownerId,
		type: 'BOOKING_CANCELLED_BY_GUEST',
		title: 'Customer cancelled booking',
		body: `A customer cancelled their booking at ${ctx.propertyName} for ${dates}.`,
		href: `/owner/bookings/${ctx.bookingId}`,
	});
}

export async function notifyBookingAutoCancelled(bookingIds: string[]) {
	if (bookingIds.length === 0) return;
	const rows = await db
		.select({
			bookingId: BookingTable.id,
			userId: BookingTable.userId,
			ownerId: PropertyTable.ownerId,
			propertyName: PropertyTable.propertyName,
			startDate: BookingTable.startDate,
			endDate: BookingTable.endDate,
		})
		.from(BookingTable)
		.innerJoin(PropertyTable, eq(PropertyTable.id, BookingTable.propertyId))
		.where(inArray(BookingTable.id, bookingIds));

	const payloads = rows.flatMap((row) => {
		const dates = formatStayRange(row.startDate, row.endDate);
		const body = `Booking at ${row.propertyName} for ${dates} was cancelled after the approval window expired.`;
		return [
			{
				userId: row.userId,
				type: 'BOOKING_AUTO_CANCELLED' as const,
				title: 'Booking auto-cancelled',
				body,
				href: '/bookings',
			},
			{
				userId: row.ownerId,
				type: 'BOOKING_AUTO_CANCELLED' as const,
				title: 'Booking auto-cancelled',
				body,
				href: `/owner/bookings/${row.bookingId}`,
			},
		];
	});

	await createNotifications(payloads);
}

export async function notifyBookingsCompleted(bookingIds: string[]) {
	if (bookingIds.length === 0) return;
	const rows = await db
		.select({
			bookingId: BookingTable.id,
			userId: BookingTable.userId,
			propertyName: PropertyTable.propertyName,
		})
		.from(BookingTable)
		.innerJoin(PropertyTable, eq(PropertyTable.id, BookingTable.propertyId))
		.where(inArray(BookingTable.id, bookingIds));

	await createNotifications(
		rows.map((row) => ({
			userId: row.userId,
			type: 'BOOKING_COMPLETED' as const,
			title: 'Booking completed',
			body: `Your booking at ${row.propertyName} is complete. You can leave a review from My bookings.`,
			href: '/bookings',
		}))
	);
}

export async function notifyListingApproved(propertyId: string) {
	const [property] = await db
		.select({
			id: PropertyTable.id,
			ownerId: PropertyTable.ownerId,
			propertyName: PropertyTable.propertyName,
		})
		.from(PropertyTable)
		.where(eq(PropertyTable.id, propertyId))
		.limit(1);
	if (!property) return;

	await createNotification({
		userId: property.ownerId,
		type: 'LISTING_APPROVED',
		title: 'Listing approved',
		body: `Your listing for ${property.propertyName} was approved and is now live.`,
		href: `/owner/properties/${property.id}/edit`,
	});
}

export async function notifyListingRejected(propertyId: string, reason: string) {
	const [property] = await db
		.select({
			id: PropertyTable.id,
			ownerId: PropertyTable.ownerId,
			propertyName: PropertyTable.propertyName,
		})
		.from(PropertyTable)
		.where(eq(PropertyTable.id, propertyId))
		.limit(1);
	if (!property) return;

	const trimmed = reason.trim();
	await createNotification({
		userId: property.ownerId,
		type: 'LISTING_REJECTED',
		title: 'Listing rejected',
		body: trimmed
			? `Your listing for ${property.propertyName} was rejected. Reason: ${trimmed}`
			: `Your listing for ${property.propertyName} was rejected.`,
		href: `/owner/properties/${property.id}/edit`,
	});
}

export async function notifyListingPendingReview(propertyId: string) {
	const [property] = await db
		.select({
			id: PropertyTable.id,
			propertyName: PropertyTable.propertyName,
		})
		.from(PropertyTable)
		.where(and(eq(PropertyTable.id, propertyId), eq(PropertyTable.isDeleted, false)))
		.limit(1);
	if (!property) return;

	const adminIds = await listPlatformAdminIds();
	if (adminIds.length === 0) return;

	await createNotifications(
		adminIds.map((userId) => ({
			userId,
			type: 'LISTING_PENDING_REVIEW' as const,
			title: 'Listing pending review',
			body: `${property.propertyName} was submitted and is waiting for review.`,
			href: `/admin/listings/${property.id}`,
		}))
	);
}
