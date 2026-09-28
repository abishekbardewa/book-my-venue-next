import { z } from 'zod';
import {
	REVIEW_BODY_MAX,
	REVIEW_RATING_MAX,
	REVIEW_RATING_MIN,
} from '@/features/reviews/constants';

export const reviewSchema = z.object({
	bookingId: z.string().uuid(),
	rating: z.coerce
		.number()
		.int()
		.min(REVIEW_RATING_MIN, 'Rating is required')
		.max(REVIEW_RATING_MAX, 'Rating is required'),
	body: z
		.string()
		.trim()
		.min(1, 'Review is required')
		.max(REVIEW_BODY_MAX, `Review must be ${REVIEW_BODY_MAX} characters or less`),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
