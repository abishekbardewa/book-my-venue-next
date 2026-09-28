import { env } from '@/data/env/server';

export function getReviewWindowDays() {
	return env.REVIEW_WINDOW_DAYS;
}

export function isReviewWindowOpen(endDate: Date, now = new Date()) {
	const days = getReviewWindowDays();
	if (days <= 0) return true;
	const closesAt = endDate.getTime() + days * 24 * 60 * 60 * 1000;
	return now.getTime() <= closesAt;
}
