import { getSuccessfulPaymentForBooking } from '@/features/bookings/domain';
import { razorpay } from '@/features/payments/razorpay';

export async function refundSuccessfulBookingPayment(bookingId: string) {
	const payment = await getSuccessfulPaymentForBooking(bookingId);
	if (!payment?.transactionId) {
		throw new Error('No successful payment is available to refund');
	}

	return razorpay.payments.refund(payment.transactionId, {
		amount: Math.round(Number(payment.amount) * 100),
		speed: 'normal',
		notes: { bookingId },
	});
}
