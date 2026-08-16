import { and, count, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import {
	BookingTable,
	PaymentTable,
	PropertyImageTable,
	PropertyTable,
	UserTable,
} from '@/drizzle/schema';
import type {
	BookingStatus,
	BookingStatusReason,
	PaymentStatus,
} from '@/features/bookings/constants';
import type { BookingDetail, BookingListItem } from '@/features/bookings/types';
import { LISTING_IMAGE_PLACEHOLDER } from '@/features/properties/types';

async function attachBookingRelations(
	bookings: (typeof BookingTable.$inferSelect)[]
): Promise<BookingListItem[]> {
	if (bookings.length === 0) return [];

	const bookingIds = bookings.map((booking) => booking.id);
	const propertyIds = [...new Set(bookings.map((booking) => booking.propertyId))];
	const userIds = [...new Set(bookings.map((booking) => booking.userId))];

	const [properties, users, payments, images] = await Promise.all([
		db.select().from(PropertyTable).where(inArray(PropertyTable.id, propertyIds)),
		db.select().from(UserTable).where(inArray(UserTable.id, userIds)),
		db
			.select()
			.from(PaymentTable)
			.where(
				and(
					inArray(PaymentTable.bookingId, bookingIds),
					inArray(PaymentTable.status, ['SUCCESS', 'REFUNDED'])
				)
			),
		db
			.select()
			.from(PropertyImageTable)
			.where(inArray(PropertyImageTable.propertyId, propertyIds)),
	]);

	const propertyById = new Map(properties.map((property) => [property.id, property]));
	const userById = new Map(users.map((user) => [user.id, user]));
	const paymentsByBooking = new Map<string, typeof payments>();
	for (const payment of payments) {
		const rows = paymentsByBooking.get(payment.bookingId) ?? [];
		rows.push(payment);
		paymentsByBooking.set(payment.bookingId, rows);
	}
	const imageByProperty = new Map<string, string>();
	for (const image of images) {
		if (!imageByProperty.has(image.propertyId)) {
			imageByProperty.set(image.propertyId, image.imgUrl);
		}
	}

	return bookings.flatMap((booking) => {
		const property = propertyById.get(booking.propertyId);
		const user = userById.get(booking.userId);
		if (!property || !user) return [];

		return [{
			id: booking.id,
			startDate: booking.startDate.toISOString(),
			endDate: booking.endDate.toISOString(),
			bookingDate: booking.bookingDate.toISOString(),
			createdAt: booking.createdAt.toISOString(),
			bookingStatus: booking.bookingStatus,
			statusReason: booking.statusReason as BookingStatusReason | null,
			totalAmount: Number(booking.totalAmount),
			currency: booking.currency,
			holdExpiresAt: booking.holdExpiresAt.toISOString(),
			property: {
				id: property.id,
				propertyName: property.propertyName,
				price: Number.parseInt(property.price.replace(/[^\d]/g, ''), 10) || 0,
				image: imageByProperty.get(property.id) ?? LISTING_IMAGE_PLACEHOLDER,
				ownerId: property.ownerId,
			},
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
			},
			payments: (paymentsByBooking.get(booking.id) ?? []).map((payment) => ({
				id: payment.id,
				amount: Number(payment.amount),
				status: payment.status,
				transactionId: payment.transactionId,
				razorpayOrderId: payment.razorpayOrderId,
			})),
		}];
	});
}

export async function listCustomerBookings(input: {
	userId: string;
	status: BookingStatus;
	page: number;
	limit: number;
}) {
	const offset = (input.page - 1) * input.limit;
	const where = and(
		eq(BookingTable.userId, input.userId),
		eq(BookingTable.bookingStatus, input.status)
	);
	const [[total], bookings] = await Promise.all([
		db.select({ value: count() }).from(BookingTable).where(where),
		db
			.select()
			.from(BookingTable)
			.where(where)
			.orderBy(desc(BookingTable.updatedAt))
			.limit(input.limit)
			.offset(offset),
	]);

	return {
		bookings: await attachBookingRelations(bookings),
		totalCount: total?.value ?? 0,
		page: input.page,
		limit: input.limit,
	};
}

export async function listOwnerBookings(input: {
	ownerId: string;
	status: BookingStatus;
	page: number;
	limit: number;
}) {
	const offset = (input.page - 1) * input.limit;
	const where = and(
		eq(PropertyTable.ownerId, input.ownerId),
		eq(BookingTable.bookingStatus, input.status)
	);
	const [[total], rows] = await Promise.all([
		db
			.select({ value: count() })
			.from(BookingTable)
			.innerJoin(PropertyTable, eq(BookingTable.propertyId, PropertyTable.id))
			.where(where),
		db
			.select({ booking: BookingTable })
			.from(BookingTable)
			.innerJoin(PropertyTable, eq(BookingTable.propertyId, PropertyTable.id))
			.where(where)
			.orderBy(desc(BookingTable.updatedAt))
			.limit(input.limit)
			.offset(offset),
	]);

	return {
		bookings: await attachBookingRelations(rows.map((row) => row.booking)),
		totalCount: total?.value ?? 0,
		page: input.page,
		limit: input.limit,
	};
}

export async function getBookingById(id: string): Promise<BookingDetail | null> {
	const [booking] = await db
		.select()
		.from(BookingTable)
		.where(eq(BookingTable.id, id))
		.limit(1);
	if (!booking) return null;

	const [base] = await attachBookingRelations([booking]);
	if (!base) return null;

	const [property] = await db
		.select()
		.from(PropertyTable)
		.where(eq(PropertyTable.id, booking.propertyId))
		.limit(1);
	if (!property) return null;

	const [owner] = await db
		.select()
		.from(UserTable)
		.where(eq(UserTable.id, property.ownerId))
		.limit(1);
	if (!owner) return null;

	const payments = await db
		.select()
		.from(PaymentTable)
		.where(eq(PaymentTable.bookingId, booking.id));

	return {
		...base,
		property: {
			...base.property,
			address: property.address,
			city: property.city,
			country: property.country,
			checkInTime: property.checkInTime,
			checkOutTime: property.checkOutTime,
		},
		owner: {
			id: owner.id,
			firstName: owner.firstName,
			lastName: owner.lastName,
			email: owner.email,
			phone: owner.phone,
			avatar: owner.avatar,
		},
		payments: payments.map((payment) => ({
			id: payment.id,
			amount: Number(payment.amount),
			status: payment.status,
			transactionId: payment.transactionId,
			razorpayOrderId: payment.razorpayOrderId,
		})),
	};
}

export async function updateBookingAndPaymentStatus(input: {
	bookingId: string;
	bookingStatus: BookingStatus;
	paymentStatus: PaymentStatus;
	statusReason?: BookingStatusReason | null;
}) {
	return db.transaction(async (tx) => {
		const [booking] = await tx
			.update(BookingTable)
			.set({
				bookingStatus: input.bookingStatus,
				...(input.statusReason !== undefined
					? { statusReason: input.statusReason }
					: {}),
			})
			.where(eq(BookingTable.id, input.bookingId))
			.returning();

		if (input.paymentStatus === 'REFUNDED') {
			await tx
				.update(PaymentTable)
				.set({ status: 'REFUNDED', refundedAt: new Date() })
				.where(
					and(
						eq(PaymentTable.bookingId, input.bookingId),
						eq(PaymentTable.status, 'SUCCESS')
					)
				);
		}

		return booking ?? null;
	});
}
