'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRazorpay } from 'react-razorpay';
import { toast } from 'sonner';
import { env } from '@/data/env/client';
import type { BookingDetail } from '@/features/bookings/types';
import { formatInr } from '@/lib/format';
import { Button } from '@/components/ui/button';

type CreateOrderResponse = {
	success: boolean;
	data: {
		bookingId: string;
		order: {
			id: string;
			amount: number | string;
			currency: string;
		};
	};
	error?: string;
};

function formatDateRange(startDate: string, endDate: string) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const formatter = new Intl.DateTimeFormat('en-IN', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	return start.toDateString() === end.toDateString()
		? formatter.format(start)
		: `${formatter.format(start)} - ${formatter.format(end)}`;
}

function getInclusiveDays(startDate: string, endDate: string) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

type PaymentViewProps = {
	booking: BookingDetail;
	currentUser: {
		firstName: string | null;
		lastName: string | null;
		email: string;
	};
};

export function PaymentView({ booking, currentUser }: PaymentViewProps) {
	const router = useRouter();
	const { Razorpay } = useRazorpay();
	const [processing, setProcessing] = useState(false);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [termsChecked, setTermsChecked] = useState(false);

	const days = useMemo(
		() => getInclusiveDays(booking.startDate, booking.endDate),
		[booking]
	);

	const removePendingBooking = useCallback(async (bookingId: string) => {
		await fetch(`/api/booking/remove-booking/${bookingId}`, { method: 'PUT' });
		setProcessing(false);
	}, []);

	const handlePayment = useCallback(async () => {
		if (!booking) return;
		if (!termsChecked) {
			toast.error('You must agree to the terms and conditions before proceeding.');
			return;
		}

		setProcessing(true);
		try {
			const response = await fetch('/api/payment/create-payment-order', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bookingId: booking.id,
				}),
			});
			const orderResponse = (await response.json()) as CreateOrderResponse;
			if (!response.ok || !orderResponse.success) {
				throw new Error(orderResponse.error ?? 'Could not create payment order');
			}

			const { bookingId, order } = orderResponse.data;
			const amount = Number(order.amount);
			const razorpay = new Razorpay({
				key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
				amount,
				currency: 'INR',
				name: 'Book My Venue',
				description: 'Order Payment',
				order_id: order.id,
				prefill: {
					name: `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim(),
					email: currentUser.email,
				},
				handler: async (paymentResponse) => {
					setPaymentLoading(true);
					try {
						const confirmResponse = await fetch('/api/payment/confirm-payment', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								bookingId,
								orderId: paymentResponse.razorpay_order_id,
								paymentId: paymentResponse.razorpay_payment_id,
								signature: paymentResponse.razorpay_signature,
							}),
						});
						if (!confirmResponse.ok) {
							const result = (await confirmResponse.json()) as { error?: string };
							throw new Error(result.error ?? 'Could not confirm payment');
						}
						router.push(`/payment-success?id=${bookingId}&fromPayment=1`);
					} catch (error) {
						toast.error(error instanceof Error ? error.message : 'Payment confirmation failed');
						setPaymentLoading(false);
						setProcessing(false);
					}
				},
				modal: {
					ondismiss: () => {
						void removePendingBooking(bookingId);
					},
				},
				timeout: 15 * 60,
			});

			razorpay.on('payment.failed', (failure) => {
				void fetch('/api/payment/confirm-payment', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						bookingId,
						orderId: order.id,
						paymentId: failure.error.metadata.payment_id ?? crypto.randomUUID(),
						signature: '',
						status: 'FAILED',
					}),
				});
				toast.error('Payment failed, please try again');
				setProcessing(false);
			});

			razorpay.open();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Booking unsuccessful');
			setProcessing(false);
		}
	}, [Razorpay, booking, currentUser, removePendingBooking, router, termsChecked]);

	if (paymentLoading) {
		return (
			<div className="page-container flex min-h-[55vh] flex-col items-center justify-center gap-3">
				<div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
				<p className="text-sm text-muted-foreground">Confirming payment…</p>
			</div>
		);
	}

	return (
		<main className="page-container py-10">
			<h1 className="text-3xl font-semibold tracking-tight">Confirm and Pay</h1>
			<p className="mt-1 text-sm text-muted-foreground">
				Review your property and booking information before making your payment.
			</p>

			<div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start">
				<section className="space-y-8 lg:col-span-7">
					<div className="flex gap-5 border-y border-border py-6">
						{/* Server-owned booking preview, matching the old payment summary. */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={booking.property.image}
							alt={booking.property.propertyName}
							className="size-28 rounded-xl object-cover sm:size-40"
						/>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap justify-between gap-3">
								<div>
									<h2 className="font-medium text-foreground">
										{booking.property.propertyName}
									</h2>
									<p className="mt-1 text-sm text-muted-foreground">
										{booking.property.address}
									</p>
									<p className="text-sm text-muted-foreground">
										{booking.property.city}, {booking.property.country}
									</p>
								</div>
								<p className="text-sm font-medium">
									{formatInr(booking.property.price)} per day
								</p>
							</div>
							<div className="mt-4 flex flex-wrap gap-2 text-xs">
								<span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
									Check-in: {booking.property.checkInTime}
								</span>
								<span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
									Check-out: {booking.property.checkOutTime}
								</span>
							</div>
						</div>
					</div>

					<section>
						<h2 className="text-lg font-medium">Owner Information</h2>
						<p className="mt-1 text-sm text-muted-foreground">Contact details for the owner</p>
						<div className="mt-4 text-sm">
							<p className="font-medium">
								{booking.owner.firstName} {booking.owner.lastName}
							</p>
							<p className="text-muted-foreground">{booking.owner.email}</p>
							<p className="text-muted-foreground">{booking.owner.phone}</p>
						</div>
					</section>

					<section>
						<h2 className="text-lg font-medium">Cancellation and refund policy</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Free cancellation before 48 hours of the event date. Cancellations after
							that may be for a partial refund.
						</p>
					</section>
				</section>

				<aside className="rounded-xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24 lg:col-span-5">
					<h2 className="text-lg font-medium">Booking summary</h2>
					<dl className="mt-6 space-y-4 text-sm">
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Booking dates</dt>
							<dd className="text-right font-medium">
								{formatDateRange(booking.startDate, booking.endDate)}
							</dd>
						</div>
						<div className="flex justify-between gap-4 border-t border-border pt-4">
							<dt className="text-muted-foreground">Booking cost</dt>
							<dd className="font-medium">
								{formatInr(booking.property.price)} × {days}{' '}
								{days > 1 ? 'days' : 'day'}
							</dd>
						</div>
						<div className="flex justify-between gap-4 border-t border-border pt-4 text-base">
							<dt className="font-medium">Total cost</dt>
							<dd className="font-semibold">{formatInr(booking.totalAmount)}</dd>
						</div>
					</dl>

					<label className="mt-6 flex items-start gap-2 text-sm">
						<input
							type="checkbox"
							checked={termsChecked}
							onChange={(event) => setTermsChecked(event.target.checked)}
							className="mt-0.5 size-4 accent-primary"
						/>
						<span>
							I have read and understood the{' '}
							<Link href="/privacy-policy" className="underline">
								privacy policy
							</Link>{' '}
							and the{' '}
							<Link href="/terms-of-service" className="underline">
								terms of service
							</Link>
							.
						</span>
					</label>

					<div className="mt-6 grid gap-2 sm:grid-cols-2">
						<Button
							type="button"
							variant="outline"
							onClick={async () => {
								await removePendingBooking(booking.id);
								router.back();
							}}
						>
							Go back
						</Button>
						<Button type="button" onClick={handlePayment} disabled={processing}>
							{processing ? 'Processing' : 'Pay now'}
						</Button>
					</div>
				</aside>
			</div>
		</main>
	);
}
