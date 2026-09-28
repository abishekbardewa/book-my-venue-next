'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft,
	ArrowRight,
	CalendarDays,
	Clock,
	MapPin,
	Users,
} from 'lucide-react';
import { useRazorpay } from 'react-razorpay';
import { toast } from 'sonner';
import { env } from '@/data/env/client';
import type { BookingDetail } from '@/features/bookings/types';
import { formatInr } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
		month: 'short',
		year: 'numeric',
	});
	return start.toDateString() === end.toDateString()
		? formatter.format(start)
		: `${formatter.format(start)} – ${formatter.format(end)}`;
}

function getInclusiveDays(startDate: string, endDate: string) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function initials(firstName: string | null, lastName: string | null) {
	const first = firstName?.trim()?.[0] ?? '';
	const last = lastName?.trim()?.[0] ?? '';
	return (first + last).toUpperCase() || '?';
}

type PaymentViewProps = {
	booking: BookingDetail;
	currentUser: {
		firstName: string | null;
		lastName: string | null;
		email: string;
		phone: string | null;
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

	const guestName = useMemo(() => {
		const name = `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim();
		return name || '—';
	}, [currentUser.firstName, currentUser.lastName]);

	const ownerName = useMemo(() => {
		const name = `${booking.owner.firstName ?? ''} ${booking.owner.lastName ?? ''}`.trim();
		return name || 'Owner';
	}, [booking.owner.firstName, booking.owner.lastName]);

	const removePendingBooking = useCallback(async (bookingId: string) => {
		await fetch(`/api/booking/remove-booking/${bookingId}`, { method: 'PUT' });
		setProcessing(false);
	}, []);

	const handleBack = useCallback(async () => {
		await removePendingBooking(booking.id);
		router.back();
	}, [booking.id, removePendingBooking, router]);

	const handlePayment = useCallback(async () => {
		if (!booking) return;
		if (!termsChecked) {
			toast.error('You must agree to the terms and cancellation policy before proceeding.');
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
					name: guestName === '—' ? '' : guestName,
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
	}, [
		Razorpay,
		booking,
		currentUser.email,
		guestName,
		removePendingBooking,
		router,
		termsChecked,
	]);

	if (paymentLoading) {
		return (
			<div className="page-container-wide flex min-h-[55vh] flex-col items-center justify-center gap-4">
				<div className="size-8 animate-spin border-2 border-muted border-t-primary" />
				<p className="label-caps text-muted-foreground">Confirming payment</p>
			</div>
		);
	}

	return (
		<main className="page-container-wide py-10 sm:py-16">
			<button
				type="button"
				onClick={() => void handleBack()}
				className="label-caps mb-8 inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
				Back to Details
			</button>

			<header className="mb-10">
				<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					<span className="md:hidden">Review Booking</span>
					<span className="hidden md:inline">Review your booking</span>
				</h1>
				<p className="mt-2 text-muted-foreground sm:text-lg">
					Please confirm the details below before finalizing your booking.
				</p>
			</header>

			<div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
				<div className="flex flex-col gap-6 lg:col-span-7">
					<section className="border border-structural-border bg-card p-4 sm:p-6">
						<h2 className="font-headline mb-4 border-b border-structural-border pb-3 text-xl font-semibold tracking-tight text-foreground">
							Venue Details
						</h2>
						<div className="flex flex-col gap-4 md:flex-row">
							<div className="relative aspect-4/3 w-full overflow-hidden bg-muted md:aspect-square md:w-[240px] md:shrink-0">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={booking.property.image}
									alt={booking.property.propertyName}
									className="h-full w-full object-cover"
								/>
							</div>
							<div className="flex flex-1 flex-col justify-between gap-4">
								<div>
									<h3 className="font-headline text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
										{booking.property.propertyName}
									</h3>
									<p className="mt-2 flex items-start gap-1.5 text-muted-foreground">
										<MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
										<span>
											{booking.property.address}
											<br />
											{booking.property.city}, {booking.property.country}
										</span>
									</p>
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div className="border border-structural-border bg-secondary/40 p-3">
										<span className="label-caps mb-1 block text-muted-foreground">Capacity</span>
										<span className="text-foreground">
											Up to {booking.property.capacity}
										</span>
									</div>
									<div className="border border-structural-border bg-secondary/40 p-3">
										<span className="label-caps mb-1 block text-muted-foreground">Access</span>
										<span className="text-sm text-foreground">
											{booking.property.checkInTime} – {booking.property.checkOutTime}
										</span>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section className="border border-structural-border bg-card p-4 sm:p-6">
						<h2 className="font-headline mb-4 border-b border-structural-border pb-3 text-xl font-semibold tracking-tight text-foreground">
							Owner information
						</h2>
						<div className="flex items-center gap-4">
							<Avatar className="size-20 shrink-0 border-2 border-primary">
								{booking.owner.avatar ? (
									<AvatarImage
										src={booking.owner.avatar}
										alt=""
										className="rounded-full"
									/>
								) : null}
								<AvatarFallback className="rounded-full bg-ink text-lg font-semibold text-ink-foreground">
									{initials(booking.owner.firstName, booking.owner.lastName)}
								</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="font-headline text-xl font-semibold text-foreground">
									{ownerName}
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">{booking.owner.email}</p>
								{booking.owner.phone ? (
									<p className="text-sm text-muted-foreground">{booking.owner.phone}</p>
								) : null}
							</div>
						</div>
					</section>

					<section className="border border-structural-border bg-card p-4 sm:p-6">
						<div className="mb-4 flex items-end justify-between gap-4 border-b border-structural-border pb-3">
							<h2 className="font-headline text-xl font-semibold tracking-tight text-foreground">
								Your Information
							</h2>
							<Link
								href="/settings"
								className="label-caps text-muted-foreground transition-colors hover:text-foreground"
							>
								Edit
							</Link>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<span className="label-caps mb-1 block text-muted-foreground">
									Booked by
								</span>
								<span className="block text-lg text-foreground">{guestName}</span>
							</div>
							<div>
								<span className="label-caps mb-1 block text-muted-foreground">
									Contact Email
								</span>
								<span className="block text-lg text-foreground">{currentUser.email}</span>
							</div>
							{currentUser.phone ? (
								<div>
									<span className="label-caps mb-1 block text-muted-foreground">
										Phone Number
									</span>
									<span className="block text-lg text-foreground">{currentUser.phone}</span>
								</div>
							) : null}
						</div>
					</section>
				</div>

				<aside className="relative mt-2 lg:col-span-5 lg:mt-0">
					<div className="sticky top-24 flex flex-col gap-4">
						<div className="border border-structural-border bg-card p-6 shadow-sm">
							<div className="mb-6 flex items-center justify-between gap-3">
								<h3 className="font-headline text-xl font-semibold tracking-tight text-foreground">
									Summary
								</h3>
								<span className="border border-primary/40 bg-secondary px-2 py-1 text-[10px] font-semibold tracking-widest text-foreground uppercase">
									Pending Payment
								</span>
							</div>

							<div className="mb-6 space-y-1">
								<div className="flex items-center justify-between gap-3 border-b border-structural-border py-3">
									<div className="flex items-center gap-2 text-muted-foreground">
										<CalendarDays className="size-4 shrink-0" aria-hidden />
										<span>Date</span>
									</div>
									<span className="text-right text-sm font-semibold text-foreground">
										{formatDateRange(booking.startDate, booking.endDate)}
									</span>
								</div>
								<div className="flex items-center justify-between gap-3 border-b border-structural-border py-3">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Clock className="size-4 shrink-0" aria-hidden />
										<span>Access</span>
									</div>
									<span className="text-right text-sm font-semibold text-foreground">
										{booking.property.checkInTime} – {booking.property.checkOutTime}
									</span>
								</div>
								<div className="flex items-center justify-between gap-3 border-b border-structural-border py-3">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Users className="size-4 shrink-0" aria-hidden />
										<span>Capacity</span>
									</div>
									<span className="text-right text-sm font-semibold text-foreground">
										Up to {booking.property.capacity}
									</span>
								</div>
							</div>

							<div className="mb-6 space-y-2 text-sm text-muted-foreground">
								<div className="flex justify-between gap-4">
									<span>Venue price</span>
									<span>
										{formatInr(booking.property.price)} × {days}{' '}
										{days > 1 ? 'days' : 'day'}
									</span>
								</div>
								<div className="flex justify-between gap-4">
									<span>Total due</span>
									<span>{formatInr(booking.totalAmount)}</span>
								</div>
							</div>

							<div className="mb-8 flex items-end justify-between gap-4 border-t border-structural-border pt-4">
								<span className="font-headline text-xl font-semibold text-foreground">
									Total
								</span>
								<span className="font-headline text-3xl font-bold leading-none text-foreground sm:text-4xl">
									{formatInr(booking.totalAmount)}
								</span>
							</div>

							<div className="flex flex-col gap-4">
								<label className="flex cursor-pointer items-start gap-3">
									<span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
										<input
											type="checkbox"
											checked={termsChecked}
											onChange={(event) => setTermsChecked(event.target.checked)}
											className={cn(
												'peer size-5 appearance-none border border-input bg-transparent transition-colors',
												'checked:border-primary checked:bg-primary'
											)}
										/>
										<svg
											viewBox="0 0 16 16"
											className="pointer-events-none absolute size-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
											aria-hidden
										>
											<path
												fill="currentColor"
												d="M6.5 11.2 3.3 8l1.1-1.1 2.1 2.1 4.6-4.6L12.2 5.5 6.5 11.2Z"
											/>
										</svg>
									</span>
									<span className="text-sm leading-relaxed text-muted-foreground">
										I agree to the{' '}
										<Link
											href="/terms-of-service"
											className="text-ink underline underline-offset-4"
										>
											Terms of Service
										</Link>{' '}
										and acknowledge the{' '}
										<Link
											href="/cancel-refund-policy"
											className="text-ink underline underline-offset-4"
										>
											Cancellation Policy
										</Link>
										.
									</span>
								</label>

								<Button
									type="button"
									className="w-full gap-2"
									size="lg"
									onClick={handlePayment}
									disabled={processing || !termsChecked}
								>
									{processing ? 'Processing…' : 'Confirm & Pay'}
									{!processing ? <ArrowRight className="size-4" aria-hidden /> : null}
								</Button>

								<button
									type="button"
									onClick={() => void handleBack()}
									className="label-caps tracking-widest text-muted-foreground transition-colors hover:text-foreground"
								>
									Cancel / Go Back
								</button>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</main>
	);
}
