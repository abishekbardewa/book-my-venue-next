import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { env } from '@/data/env/server';
import {
	applyPaymentFailure,
	applyPaymentSuccess,
	BookingDomainError,
} from '@/features/bookings/domain';

export const runtime = 'nodejs';

type RazorpayPaymentEntity = {
	id: string;
	order_id: string;
	amount: number;
};

type RazorpayWebhookPayload = {
	event?: string;
	payload?: {
		payment?: {
			entity?: RazorpayPaymentEntity;
		};
	};
};

function validSignature(body: string, signature: string, secret: string) {
	const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
	const expectedBuffer = Buffer.from(expected);
	const signatureBuffer = Buffer.from(signature);
	return (
		expectedBuffer.length === signatureBuffer.length &&
		crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
	);
}

export async function POST(request: Request) {
	if (!env.RAZORPAY_WEBHOOK_SECRET) {
		return NextResponse.json(
			{ error: 'Razorpay webhook secret is not configured' },
			{ status: 503 }
		);
	}

	const rawBody = await request.text();
	const signature = request.headers.get('x-razorpay-signature');
	if (!signature || !validSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET)) {
		return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
	}

	let body: RazorpayWebhookPayload;
	try {
		body = JSON.parse(rawBody) as RazorpayWebhookPayload;
	} catch {
		return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
	}

	const payment = body.payload?.payment?.entity;
	if (!payment?.id || !payment.order_id) {
		// Acknowledge events that are not used by this booking flow.
		return NextResponse.json({ received: true });
	}

	try {
		if (body.event === 'payment.captured' || body.event === 'order.paid') {
			await applyPaymentSuccess({
				orderId: payment.order_id,
				paymentId: payment.id,
				amountInPaise: payment.amount,
			});
		} else if (body.event === 'payment.failed') {
			await applyPaymentFailure({
				orderId: payment.order_id,
				paymentId: payment.id,
				amountInPaise: payment.amount,
			});
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		if (error instanceof BookingDomainError && error.statusCode < 500) {
			console.error('Rejected Razorpay webhook:', error.message);
			return NextResponse.json({ error: error.message }, { status: error.statusCode });
		}
		console.error('Razorpay webhook processing failed:', error);
		return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
	}
}
