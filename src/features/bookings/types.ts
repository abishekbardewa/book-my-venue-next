import type { BookingStatus, BookingStatusReason, PaymentStatus } from '@/features/bookings/constants';

export type BookingListItem = {
	id: string;
	startDate: string;
	endDate: string;
	bookingDate: string;
	createdAt: string;
	bookingStatus: BookingStatus;
	statusReason: BookingStatusReason | null;
	totalAmount: number;
	currency: string;
	holdExpiresAt: string;
	property: {
		id: string;
		propertyName: string;
		price: number;
		image: string;
		ownerId: string;
	};
	user: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string;
		phone: string | null;
	};
	payments: {
		id: string;
		amount: number;
		status: PaymentStatus;
		transactionId: string | null;
		razorpayOrderId: string | null;
	}[];
};

export type BookingDetail = BookingListItem & {
	property: BookingListItem['property'] & {
		address: string;
		city: string;
		country: string;
		checkInTime: string;
		checkOutTime: string;
	};
	owner: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string;
		phone: string | null;
		avatar: string | null;
	};
};
