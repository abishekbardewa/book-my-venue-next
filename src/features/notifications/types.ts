export const NOTIFICATION_TYPES = [
	'BOOKING_REQUEST',
	'BOOKING_CONFIRMED',
	'BOOKING_REJECTED',
	'BOOKING_CANCELLED_BY_GUEST',
	'BOOKING_AUTO_CANCELLED',
	'BOOKING_COMPLETED',
	'LISTING_APPROVED',
	'LISTING_REJECTED',
	'LISTING_PENDING_REVIEW',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationItem = {
	id: string;
	type: NotificationType;
	title: string;
	body: string;
	href: string | null;
	readAt: string | null;
	createdAt: string;
};
