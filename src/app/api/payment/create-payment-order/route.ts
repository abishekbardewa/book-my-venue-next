import { NextResponse } from 'next/server';
import { getBookingById } from '@/features/bookings/db';
import {
	createPendingPayment,
	expirePendingBooking,
	extendPendingHold,
	getPaymentOrderForBooking,
} from '@/features/bookings/domain';
import { razorpay } from '@/features/payments/razorpay';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export async function POST(request: Request) {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
	}
	if (user.role !== 'CUSTOMER') {
		return NextResponse.json(
			{ error: 'Only customers can create bookings' },
			{ status: 403 }
		);
	}

	const body = (await request.json()) as { bookingId?: string };

	if (!body.bookingId) {
		return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });
	}

	await expirePendingBooking(body.bookingId);
	const booking = await getBookingById(body.bookingId);
	if (
		!booking ||
		booking.user.id !== userId ||
		booking.bookingStatus !== 'PENDING'
	) {
		return NextResponse.json(
			{ error: 'Booking hold is invalid or expired' },
			{ status: 409 }
		);
	}

	try {
		const existingPayment = await getPaymentOrderForBooking(booking.id);
		if (existingPayment?.status === 'PENDING' && existingPayment.razorpayOrderId) {
			await extendPendingHold(booking.id);
			return NextResponse.json({
				message: 'success',
				data: {
					bookingId: booking.id,
					order: {
						id: existingPayment.razorpayOrderId,
						amount: Math.round(Number(existingPayment.amount) * 100),
						currency: existingPayment.currency,
					},
				},
				status: 200,
				success: true,
			});
		}

		const heldBooking = await extendPendingHold(booking.id);
		if (!heldBooking) {
			return NextResponse.json(
				{ error: 'Booking hold expired. Select your dates again.' },
				{ status: 409 }
			);
		}

		const order = await razorpay.orders.create({
			amount: Math.round(booking.totalAmount * 100),
			currency: 'INR',
			receipt: `booking_${booking.id.slice(0, 24)}`,
			payment_capture: true,
			notes: {
				bookingId: booking.id,
				userId,
			},
		});
		await createPendingPayment({
			bookingId: booking.id,
			userId,
			razorpayOrderId: order.id,
			amount: booking.totalAmount,
		});

		return NextResponse.json({
			message: 'success',
			data: { bookingId: booking.id, order },
			status: 200,
			success: true,
		});
	} catch (error) {
		console.error('Error creating Razorpay order:', error);
		return NextResponse.json(
			{ success: false, status: 500, error: 'Could not create payment order' },
			{ status: 500 }
		);
	}
}
