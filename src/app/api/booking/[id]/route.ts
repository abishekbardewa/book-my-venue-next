import { NextResponse } from 'next/server';
import {
	getBookingById,
	updateBookingAndPaymentStatus,
} from '@/features/bookings/db';
import type { BookingStatus, PaymentStatus } from '@/features/bookings/constants';
import { getSuccessfulPaymentForBooking } from '@/features/bookings/domain';
import {
	notifyBookingCancelledByGuest,
	notifyBookingConfirmed,
	notifyBookingRejected,
} from '@/features/notifications/emit';
import {
	arePayoutsEnabled,
	transferOwnerShareForBooking,
} from '@/features/payments/payouts';
import { getUserById } from '@/features/users/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
	}

	const { id } = await params;
	const booking = await getBookingById(id);
	if (!booking) {
		return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
	}

	const canRead =
		booking.user.id === userId ||
		booking.property.ownerId === userId ||
		user.role === 'PLATFORM_ADMIN';
	if (!canRead) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	return NextResponse.json(booking);
}

export async function PUT(request: Request, { params }: RouteContext) {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
	}

	const { id } = await params;
	const body = (await request.json()) as {
		bookingStatus?: BookingStatus;
		paymentStatus?: PaymentStatus;
		role?: 'OWNER' | 'CUSTOMER';
	};
	const booking = await getBookingById(id);
	if (!booking) {
		return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
	}
	if (booking.bookingStatus === 'CANCELLED') {
		return NextResponse.json(
			{ message: 'Booking is already canceled and cannot be updated', success: false },
			{ status: 400 }
		);
	}

	if (body.role === 'OWNER') {
		if (user.role !== 'OWNER' || booking.property.ownerId !== userId) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}
		if (booking.bookingStatus !== 'AWAITING_OWNER_APPROVAL') {
			return NextResponse.json(
				{
					message: 'Owner can only update bookings in AWAITING_OWNER_APPROVAL status',
					success: false,
				},
				{ status: 400 }
			);
		}
		if (!body.bookingStatus || !['CONFIRMED', 'CANCELLED'].includes(body.bookingStatus)) {
			return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
		}

		if (body.bookingStatus === 'CONFIRMED' && arePayoutsEnabled()) {
			const owner = await getUserById(userId);
			if (!owner?.razorpayLinkedAccountId || owner.payoutOnboardingStatus !== 'ACTIVE') {
				return NextResponse.json(
					{
						message: 'Set up payouts before confirming a booking',
						success: false,
					},
					{ status: 400 }
				);
			}

			const payment = await getSuccessfulPaymentForBooking(id);
			if (!payment?.transactionId) {
				return NextResponse.json(
					{ message: 'No successful payment found for this booking', success: false },
					{ status: 400 }
				);
			}

			try {
				await transferOwnerShareForBooking({
					bookingId: id,
					paymentId: payment.id,
					razorpayPaymentId: payment.transactionId,
					amount: payment.amount,
					currency: payment.currency,
					linkedAccountId: owner.razorpayLinkedAccountId,
				});
			} catch (error) {
				console.error('Owner confirm transfer failed:', error);
				return NextResponse.json(
					{
						message:
							error instanceof Error
								? error.message
								: 'Could not transfer owner share',
						success: false,
					},
					{ status: 502 }
				);
			}
		}

		const updated = await updateBookingAndPaymentStatus({
			bookingId: id,
			bookingStatus: body.bookingStatus,
			paymentStatus: body.bookingStatus === 'CANCELLED' ? 'REFUNDED' : 'SUCCESS',
			statusReason:
				body.bookingStatus === 'CANCELLED' ? 'owner_rejected' : null,
		});

		try {
			if (body.bookingStatus === 'CONFIRMED') {
				await notifyBookingConfirmed(id);
			} else {
				await notifyBookingRejected(id);
			}
		} catch (error) {
			console.error('Could not notify booking owner decision:', error);
		}

		return NextResponse.json({
			message:
				body.bookingStatus === 'CONFIRMED'
					? 'Booking confirmed successfully'
					: 'Booking canceled successfully',
			status: 200,
			success: true,
			booking: updated,
		});
	}

	if (body.role === 'CUSTOMER') {
		if (user.role !== 'CUSTOMER' || booking.user.id !== userId) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}
		const cancellable =
			['AWAITING_OWNER_APPROVAL', 'CONFIRMED'].includes(booking.bookingStatus) &&
			body.bookingStatus === 'CANCELLED';
		if (!cancellable) {
			return NextResponse.json(
				{
					message:
						'Customer can only cancel bookings in AWAITING_OWNER_APPROVAL or CONFIRMED status',
					success: false,
				},
				{ status: 400 }
			);
		}

		const updated = await updateBookingAndPaymentStatus({
			bookingId: id,
			bookingStatus: 'CANCELLED',
			paymentStatus: 'REFUNDED',
			statusReason: 'customer_cancelled',
		});

		try {
			await notifyBookingCancelledByGuest(id);
		} catch (error) {
			console.error('Could not notify guest cancellation:', error);
		}

		return NextResponse.json({
			message: 'Booking canceled successfully',
			status: 200,
			success: true,
			booking: updated,
		});
	}

	return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
}
