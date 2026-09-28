'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft,
	ArrowRight,
	Mail,
	MapPin,
	Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BookingDetail } from '@/features/bookings/types';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatInr } from '@/lib/format';

type Decision = 'CONFIRMED' | 'CANCELLED';

type OwnerBookingDetailViewProps = {
	booking: BookingDetail;
};

function formatDate(value: string) {
	return new Intl.DateTimeFormat('en-IN', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(new Date(value));
}

function formatDateRange(startDate: string, endDate: string) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	if (start.toDateString() === end.toDateString()) {
		return formatDate(startDate);
	}
	return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function guestName(booking: BookingDetail) {
	const name = `${booking.user.firstName ?? ''} ${booking.user.lastName ?? ''}`.trim();
	return name || booking.user.email;
}

function statusClass(status: BookingDetail['bookingStatus']) {
	switch (status) {
		case 'CONFIRMED':
		case 'COMPLETED':
			return 'border-emerald-700/40 bg-emerald-950/10 text-emerald-800';
		case 'AWAITING_OWNER_APPROVAL':
			return 'border-primary/40 bg-secondary text-foreground';
		case 'CANCELLED':
			return 'border-destructive/40 bg-destructive/10 text-destructive';
		default:
			return 'border-structural-border bg-card text-foreground';
	}
}

export function OwnerBookingDetailView({ booking }: OwnerBookingDetailViewProps) {
	const router = useRouter();
	const [decision, setDecision] = useState<Decision | null>(null);
	const [updating, setUpdating] = useState(false);
	const payment = booking.payments[0];
	const awaiting = booking.bookingStatus === 'AWAITING_OWNER_APPROVAL';
	const canReject =
		awaiting ||
		booking.bookingStatus === 'CONFIRMED';

	async function confirmDecision() {
		if (!decision) return;
		setUpdating(true);
		try {
			const response = await fetch(`/api/booking/${booking.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bookingStatus: decision,
					paymentStatus: decision === 'CANCELLED' ? 'REFUNDED' : 'SUCCESS',
					role: 'OWNER',
				}),
			});
			const result = (await response.json()) as { success?: boolean; message?: string };
			if (!response.ok || !result.success) {
				throw new Error(result.message ?? 'Could not update booking');
			}
			toast.success(result.message);
			setDecision(null);
			router.refresh();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Something went wrong');
		} finally {
			setUpdating(false);
		}
	}

	return (
		<div className="page-container-wide py-10 sm:py-14">
			<header className="mb-10 flex flex-col gap-6 border-b border-structural-border pb-6 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<Link
						href="/owner/bookings"
						className="label-caps mb-4 inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft className="size-3.5" aria-hidden />
						Back to Bookings
					</Link>
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
							Booking Details
						</h1>
						<span
							className={cn(
								'border px-3 py-1 text-[10px] font-semibold tracking-widest uppercase',
								statusClass(booking.bookingStatus)
							)}
						>
							{booking.bookingStatus.replaceAll('_', ' ')}
						</span>
					</div>
					<p className="mt-2 text-muted-foreground sm:text-lg">
						Reference ID:{' '}
						<span className="font-semibold text-foreground">
							#{booking.id.slice(0, 8).toUpperCase()}
						</span>
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{awaiting ? (
						<>
							<Button type="button" onClick={() => setDecision('CONFIRMED')}>
								Accept Booking
							</Button>
							<Button
								type="button"
								variant="outline"
								className="border-destructive text-destructive"
								onClick={() => setDecision('CANCELLED')}
							>
								Reject Booking
							</Button>
						</>
					) : null}
					{canReject && !awaiting ? (
						<Button
							type="button"
							variant="outline"
							className="border-destructive text-destructive"
							onClick={() => setDecision('CANCELLED')}
						>
							Cancel Booking
						</Button>
					) : null}
				</div>
			</header>

			<div className="grid gap-8 lg:grid-cols-12 lg:items-start">
				<div className="flex flex-col gap-10 lg:col-span-8">
					<section className="group relative overflow-hidden border border-structural-border bg-card">
						<div className="relative h-[280px] w-full sm:h-[320px]">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={booking.property.image}
								alt=""
								className="h-full w-full object-cover brightness-75 transition-all duration-700 group-hover:brightness-100"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
							<div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<p className="label-caps mb-2 text-ink">Venue</p>
									<h2 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
										{booking.property.propertyName}
									</h2>
									<p className="mt-2 flex items-center gap-1.5 text-white/80">
										<MapPin className="size-4 shrink-0" aria-hidden />
										{booking.property.address}
										{booking.property.city ? `, ${booking.property.city}` : ''}
									</p>
								</div>
								<Link
									href={`/listings/${booking.property.id}`}
									className="inline-flex items-center gap-2 border border-primary bg-primary px-5 py-2.5 text-xs font-semibold tracking-[0.1em] text-primary-foreground uppercase transition-colors hover:bg-primary/90"
								>
									View Venue
									<ArrowRight className="size-3.5" aria-hidden />
								</Link>
							</div>
						</div>
					</section>

					<section>
						<h3 className="font-headline mb-6 border-b border-structural-border pb-2 text-2xl font-semibold text-foreground">
							Overview
						</h3>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							<div className="border border-structural-border bg-card p-4">
								<p className="label-caps mb-2 text-muted-foreground">Event Date</p>
								<p className="font-semibold text-foreground">
									{formatDateRange(booking.startDate, booking.endDate)}
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{booking.property.checkInTime} – {booking.property.checkOutTime}
								</p>
							</div>
							<div className="border border-structural-border bg-card p-4">
								<p className="label-caps mb-2 text-muted-foreground">Capacity</p>
								<p className="font-semibold text-foreground">
									Up to {booking.property.capacity}
								</p>
								<p className="mt-1 text-sm text-muted-foreground">Venue limit</p>
							</div>
							<div className="border border-structural-border bg-card p-4">
								<p className="label-caps mb-2 text-muted-foreground">Booked On</p>
								<p className="font-semibold text-foreground">
									{formatDate(booking.bookingDate)}
								</p>
								<p className="mt-1 text-sm text-muted-foreground">Via Book My Venue</p>
							</div>
							<div className="border border-structural-border bg-card p-4">
								<p className="label-caps mb-2 text-muted-foreground">Payment</p>
								<p className="font-semibold text-foreground">
									{payment?.status.replaceAll('_', ' ') ?? 'Pending'}
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{formatInr(payment?.amount ?? booking.totalAmount)}
								</p>
							</div>
						</div>
					</section>

					<section>
						<h3 className="font-headline mb-6 border-b border-structural-border pb-2 text-2xl font-semibold text-foreground">
							Participants
						</h3>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="border border-structural-border bg-card p-6">
								<div className="mb-4 flex items-center justify-between border-b border-structural-border pb-3">
									<span className="label-caps text-ink">Customer</span>
									<a
										href={`mailto:${booking.user.email}`}
										className="text-muted-foreground transition-colors hover:text-foreground"
										aria-label="Email customer"
									>
										<Mail className="size-4" aria-hidden />
									</a>
								</div>
								<div>
									<p className="font-headline text-xl font-semibold text-foreground">
										{guestName(booking)}
									</p>
									{booking.user.phone ? (
										<p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
											<Phone className="size-3.5" aria-hidden />
											{booking.user.phone}
										</p>
									) : null}
									<p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
										<Mail className="size-3.5" aria-hidden />
										{booking.user.email}
									</p>
								</div>
							</div>

							<div className="border border-structural-border bg-card p-6">
								<div className="mb-4 border-b border-structural-border pb-3">
									<span className="label-caps text-ink">Venue Manager</span>
								</div>
								<div>
									<p className="font-headline text-xl font-semibold text-foreground">
										{[booking.owner.firstName, booking.owner.lastName]
											.filter(Boolean)
											.join(' ') || 'You'}
									</p>
									{booking.owner.phone ? (
										<p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
											<Phone className="size-3.5" aria-hidden />
											{booking.owner.phone}
										</p>
									) : null}
									<p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
										<Mail className="size-3.5" aria-hidden />
										{booking.owner.email}
									</p>
								</div>
							</div>
						</div>
					</section>
				</div>

				<aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-4">
					<section className="border border-structural-border bg-card p-6">
						<div className="mb-4 flex items-center justify-between border-b border-structural-border pb-2">
							<h3 className="font-headline text-xl font-semibold text-foreground">
								Financials
							</h3>
							<span
								className={cn(
									'border px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase',
									payment?.status === 'SUCCESS'
										? 'border-emerald-700/40 bg-emerald-950/10 text-emerald-800'
										: payment?.status === 'REFUNDED'
											? 'border-structural-border bg-secondary text-muted-foreground'
											: 'border-primary/40 bg-secondary text-foreground'
								)}
							>
								{payment?.status.replaceAll('_', ' ') ?? 'Unpaid'}
							</span>
						</div>
						<div className="mb-6 space-y-3 text-sm">
							<div className="flex justify-between gap-4 text-muted-foreground">
								<span>Venue price</span>
								<span className="text-foreground">
									{formatInr(booking.property.price)} / day
								</span>
							</div>
							<div className="flex justify-between gap-4 text-muted-foreground">
								<span>Total due</span>
								<span className="text-foreground">
									{formatInr(payment?.amount ?? booking.totalAmount)}
								</span>
							</div>
						</div>
						<div className="flex items-center justify-between border-t border-structural-border pt-4">
							<span className="label-caps text-foreground">Total Amount</span>
							<span className="font-headline text-2xl font-bold text-foreground">
								{formatInr(payment?.amount ?? booking.totalAmount)}
							</span>
						</div>
					</section>

					<section className="border border-structural-border bg-card p-6">
						<h3 className="font-headline mb-4 border-b border-structural-border pb-2 text-xl font-semibold text-foreground">
							Actions
						</h3>
						<div className="flex flex-col gap-3">
							<a
								href={`mailto:${booking.user.email}`}
								className="inline-flex w-full items-center justify-center gap-2 border border-primary bg-primary px-4 py-3 text-xs font-semibold tracking-[0.1em] text-primary-foreground uppercase transition-colors hover:bg-primary/90"
							>
								<Mail className="size-4" aria-hidden />
								Contact Customer
							</a>
							<Link
								href={`/listings/${booking.property.id}`}
								className="inline-flex w-full items-center justify-center gap-2 border border-structural-border px-4 py-3 text-xs font-semibold tracking-[0.1em] text-foreground uppercase transition-colors hover:border-primary hover:text-foreground"
							>
								View Venue Listing
							</Link>
						</div>
					</section>
				</aside>
			</div>

			<Dialog open={Boolean(decision)} onOpenChange={(open) => !open && setDecision(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{decision === 'CANCELLED'
								? 'Confirm Booking Cancellation'
								: 'Confirm Booking Acceptance'}
						</DialogTitle>
						<DialogDescription>
							{decision === 'CANCELLED'
								? 'Are you sure you want to cancel/reject this booking? The payment will be refunded within 7 - 10 business days.'
								: 'Are you sure you want to accept this booking?'}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setDecision(null)}>
							Go back
						</Button>
						<Button
							type="button"
							variant={decision === 'CANCELLED' ? 'destructive' : 'default'}
							disabled={updating}
							onClick={confirmDecision}
						>
							{updating
								? 'Updating…'
								: decision === 'CANCELLED'
									? 'Yes, Cancel'
									: 'Yes, Accept'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
