import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { env } from '@/data/env/server';
import {
	getBookingById,
} from '@/features/bookings/db';
import {
	applyPaymentFailure,
	applyPaymentSuccess,
	getPaymentOrderForBooking,
} from '@/features/bookings/domain';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export async function POST(request: Request) {
	const { userId } = await getCurrentUser();
	if (!userId) {
		return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
	}

	const body = (await request.json()) as {
		bookingId?: string;
		orderId?: string;
		paymentId?: string;
		signature?: string;
		status?: 'SUCCESS' | 'FAILED';
	};

	if (!body.bookingId || !body.orderId || !body.paymentId) {
		return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
	}

	const booking = await getBookingById(body.bookingId);
	if (!booking || booking.user.id !== userId) {
		return NextResponse.json({ error: 'Invalid booking' }, { status: 400 });
	}
	const paymentOrder = await getPaymentOrderForBooking(booking.id);
	if (!paymentOrder || paymentOrder.razorpayOrderId !== body.orderId) {
		return NextResponse.json({ error: 'Invalid payment order' }, { status: 400 });
	}

	if ((body.status ?? 'SUCCESS') === 'SUCCESS') {
		if (!body.signature) {
			return NextResponse.json({ error: 'Missing payment signature' }, { status: 400 });
		}

		const generatedSignature = crypto
			.createHmac('sha256', env.RAZORPAY_KEY_SECRET)
			.update(`${body.orderId}|${body.paymentId}`)
			.digest('hex');

		const generatedBuffer = Buffer.from(generatedSignature);
		const receivedBuffer = Buffer.from(body.signature);
		if (
			generatedBuffer.length !== receivedBuffer.length ||
			!crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
		) {
			return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
		}

		const payment = await applyPaymentSuccess({
			orderId: body.orderId,
			paymentId: body.paymentId,
		});

		return NextResponse.json({
			message: 'success',
			data: payment,
			status: 200,
			success: true,
		});
	}

	const payment = await applyPaymentFailure({
		orderId: body.orderId,
		paymentId: body.paymentId,
	});

	return NextResponse.json({
		message: 'success',
		data: payment,
		status: 200,
		success: true,
	});
}
