'use server';

import { revalidatePath } from 'next/cache';
import { BookingTable } from '@/drizzle/schema';
import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { reviewSchema } from '@/features/reviews/schemas';
import { isReviewWindowOpen } from '@/features/reviews/window';
import {
	createReview,
	getReviewByBookingId,
	updateReview,
} from '@/features/reviews/db';

export type ReviewActionState = {
	error?: string;
	fieldErrors?: Partial<Record<string, string>>;
	success?: boolean;
};

export async function saveReviewAction(
	_prev: ReviewActionState,
	formData: FormData
): Promise<ReviewActionState> {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return { error: 'Sign in to continue' };
	}
	if (user.role !== 'CUSTOMER') {
		return { error: 'Only customers can write reviews' };
	}

	const parsed = reviewSchema.safeParse({
		bookingId: formData.get('bookingId'),
		rating: formData.get('rating'),
		body: formData.get('body'),
	});
	if (!parsed.success) {
		const fieldErrors: Partial<Record<string, string>> = {};
		for (const issue of parsed.error.issues) {
			const field = issue.path[0];
			if (typeof field === 'string' && !fieldErrors[field]) {
				fieldErrors[field] = issue.message;
			}
		}
		return { fieldErrors };
	}

	const [booking] = await db
		.select()
		.from(BookingTable)
		.where(eq(BookingTable.id, parsed.data.bookingId))
		.limit(1);

	if (!booking || booking.userId !== userId) {
		return { error: 'Booking not found' };
	}
	if (booking.bookingStatus !== 'COMPLETED') {
		return { error: 'You can review after the booking is completed' };
	}
	if (!isReviewWindowOpen(booking.endDate)) {
		return { error: 'The review window has closed' };
	}

	const existing = await getReviewByBookingId(booking.id);
	try {
		if (existing) {
			if (existing.userId !== userId) {
				return { error: 'You can only edit your own review' };
			}
			const updated = await updateReview(existing.id, userId, {
				rating: parsed.data.rating,
				body: parsed.data.body,
			});
			if (!updated) {
				return { error: 'Could not update your review' };
			}
		} else {
			const created = await createReview({
				userId,
				propertyId: booking.propertyId,
				bookingId: booking.id,
				rating: parsed.data.rating,
				body: parsed.data.body,
			});
			if (!created) {
				return { error: 'Could not save your review' };
			}
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : '';
		if (message.toLowerCase().includes('unique') || message.toLowerCase().includes('duplicate')) {
			return { error: 'This booking already has a review' };
		}
		return { error: 'Could not save your review' };
	}

	revalidatePath('/bookings');
	revalidatePath(`/listings/${booking.propertyId}`);
	return { success: true };
}
