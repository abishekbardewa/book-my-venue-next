import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { ReviewTable, UserTable } from '@/drizzle/schema';
import type { ListingReview } from '@/features/reviews/types';

export type ReviewRow = typeof ReviewTable.$inferSelect;

function reviewerDisplayName(
	firstName: string | null,
	lastName: string | null,
	email: string
) {
	const name = [firstName, lastName].filter(Boolean).join(' ').trim();
	return name || email.split('@')[0] || 'Customer';
}

export async function getReviewByBookingId(bookingId: string) {
	const [review] = await db
		.select()
		.from(ReviewTable)
		.where(eq(ReviewTable.bookingId, bookingId))
		.limit(1);
	return review ?? null;
}

export async function listReviewsByBookingIds(bookingIds: string[]) {
	if (bookingIds.length === 0) return [];
	return db.select().from(ReviewTable).where(inArray(ReviewTable.bookingId, bookingIds));
}

export async function listReviewsForProperty(propertyId: string): Promise<ListingReview[]> {
	const rows = await db
		.select({
			id: ReviewTable.id,
			rating: ReviewTable.rating,
			body: ReviewTable.body,
			createdAt: ReviewTable.createdAt,
			firstName: UserTable.firstName,
			lastName: UserTable.lastName,
			email: UserTable.email,
			avatar: UserTable.avatar,
		})
		.from(ReviewTable)
		.innerJoin(UserTable, eq(ReviewTable.userId, UserTable.id))
		.where(eq(ReviewTable.propertyId, propertyId))
		.orderBy(desc(ReviewTable.createdAt));

	return rows.map((row) => ({
		id: row.id,
		fullName: reviewerDisplayName(row.firstName, row.lastName, row.email),
		avatar: row.avatar,
		rating: row.rating,
		review: row.body,
		createdAt: row.createdAt.toISOString(),
	}));
}

export async function createReview(input: {
	userId: string;
	propertyId: string;
	bookingId: string;
	rating: number;
	body: string;
}) {
	const [review] = await db.insert(ReviewTable).values(input).returning();
	return review ?? null;
}

export async function updateReview(
	reviewId: string,
	userId: string,
	input: { rating: number; body: string }
) {
	const [review] = await db
		.update(ReviewTable)
		.set(input)
		.where(and(eq(ReviewTable.id, reviewId), eq(ReviewTable.userId, userId)))
		.returning();
	return review ?? null;
}

export async function deleteReviewsForProperty(propertyId: string) {
	await db.delete(ReviewTable).where(eq(ReviewTable.propertyId, propertyId));
}
