export const BOOKING_STATUSES = [
	'PENDING',
	'AWAITING_OWNER_APPROVAL',
	'FAILED',
	'CONFIRMED',
	'CANCELLED',
	'COMPLETED',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Why a booking left the happy path (set on fail/cancel only). */
export const BOOKING_STATUS_REASONS = [
	'hold_expired',
	'payment_failed',
	'customer_cancelled',
	'owner_rejected',
	'awaiting_timeout',
	'released_by_user',
] as const;

export type BookingStatusReason = (typeof BOOKING_STATUS_REASONS)[number];

export const PAYMENT_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const BOOKING_STATUS_MESSAGES: Record<
	Exclude<BookingStatus, 'PENDING' | 'FAILED'>,
	{ title: string; description: string }
> = {
	AWAITING_OWNER_APPROVAL: {
		title: 'No bookings awaiting approval',
		description: 'There are no bookings awaiting approval at the moment.',
	},
	CONFIRMED: {
		title: 'No confirmed bookings',
		description: 'There are no confirmed bookings at the moment.',
	},
	CANCELLED: {
		title: 'No cancelled bookings',
		description: 'There are no cancelled bookings at the moment.',
	},
	COMPLETED: {
		title: 'No completed bookings',
		description: 'There are no completed bookings at the moment.',
	},
};
