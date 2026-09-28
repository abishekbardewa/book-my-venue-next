'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, CalendarX, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import {
	BOOKING_STATUS_MESSAGES,
	type BookingStatus,
} from '@/features/bookings/constants';
import type { BookingListItem } from '@/features/bookings/types';
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { PaginationControls } from '@/components/ui/pagination-controls';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ReviewDialog } from '@/features/reviews/components/ReviewDialog';
import { cn } from '@/lib/utils';
import { formatInr } from '@/lib/format';

const TABS: { status: Exclude<BookingStatus, 'PENDING' | 'FAILED'>; label: string }[] = [
	{ status: 'AWAITING_OWNER_APPROVAL', label: 'Awaiting approval' },
	{ status: 'CONFIRMED', label: 'Confirmed' },
	{ status: 'CANCELLED', label: 'Cancelled' },
	{ status: 'COMPLETED', label: 'Completed' },
];

type BookingResponse = {
	data: BookingListItem[];
	totalCount: number;
};

function formatDateRange(startDate: string, endDate: string) {
	const formatter = new Intl.DateTimeFormat('en-IN', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

export function CustomerBookings() {
	const [status, setStatus] =
		useState<Exclude<BookingStatus, 'PENDING' | 'FAILED'>>('AWAITING_OWNER_APPROVAL');
	const [bookings, setBookings] = useState<BookingListItem[]>([]);
	const [page, setPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [cancelling, setCancelling] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [reviewBooking, setReviewBooking] = useState<BookingListItem | null>(null);
	const limit = 6;

	const loadBookings = useCallback(async () => {
		try {
			const response = await fetch(
				`/api/booking/customer-bookings?page=${page}&limit=${limit}&status=${status}`
			);
			if (!response.ok) throw new Error('Could not load bookings');
			const result = (await response.json()) as BookingResponse;
			setBookings(result.data);
			setTotalCount(result.totalCount);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not load bookings');
		} finally {
			setLoading(false);
		}
	}, [page, status]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- fetch completion synchronizes remote booking state
		void loadBookings();
	}, [loadBookings]);

	async function cancelBooking() {
		if (!selectedId) return;
		setCancelling(true);
		try {
			const response = await fetch(`/api/booking/${selectedId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bookingStatus: 'CANCELLED',
					paymentStatus: 'REFUNDED',
					role: 'CUSTOMER',
				}),
			});
			const result = (await response.json()) as { success?: boolean; message?: string };
			if (!response.ok || !result.success) {
				throw new Error(result.message ?? 'Could not cancel booking');
			}
			toast.success('Booking is cancelled');
			setSelectedId(null);
			await loadBookings();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Something went wrong');
		} finally {
			setCancelling(false);
		}
	}

	const empty = BOOKING_STATUS_MESSAGES[status];
	const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

	return (
		<div>
			<header className="border-b border-structural-border pb-6">
				<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Your bookings
				</h1>
				<p className="mt-2 text-muted-foreground sm:text-lg">
					A list of all the bookings in your account.
				</p>
			</header>

			<nav className="mt-8 flex flex-nowrap gap-2 overflow-x-auto pb-1" aria-label="Booking status">
				{TABS.map((tab) => (
					<button
						key={tab.status}
						type="button"
						onClick={() => {
							setLoading(true);
							setStatus(tab.status);
							setPage(1);
						}}
						className={cn(
							'shrink-0 border px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase transition-colors',
							status === tab.status
								? 'border-foreground bg-foreground text-background'
								: 'border-structural-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground'
						)}
					>
						{tab.label}
					</button>
				))}
			</nav>

			{loading ? (
				<div className="flex min-h-64 items-center justify-center">
					<p className="label-caps text-muted-foreground">Loading bookings</p>
				</div>
			) : bookings.length === 0 ? (
				<EmptyState
					icon={CalendarX}
					title={empty.title}
					description={empty.description}
					className="py-20"
				/>
			) : (
				<div className="mt-8 space-y-6">
					{bookings.map((booking) => {
						const payment = booking.payments[0];
						const cancelled = booking.bookingStatus === 'CANCELLED';

						return (
							<article
								key={booking.id}
								className={cn(
									'group flex flex-col overflow-hidden border border-structural-border bg-card transition-[transform,border-color] duration-300 motion-safe:hover:-translate-y-0.5 hover:border-ink/30 lg:flex-row',
									cancelled && 'opacity-75'
								)}
							>
								<div className="relative h-48 w-full shrink-0 overflow-hidden border-b border-structural-border lg:h-auto lg:w-[340px] lg:border-r lg:border-b-0 xl:w-[400px]">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={booking.property.image}
										alt={booking.property.propertyName}
										className={cn(
											'h-full w-full object-cover transition-transform duration-700 group-hover:scale-105',
											cancelled && 'grayscale'
										)}
									/>
									<div className="absolute top-4 left-4 z-10">
										<BookingStatusBadge status={booking.bookingStatus} />
									</div>
								</div>

								<div className="flex flex-1 flex-col justify-between p-5 sm:p-6 lg:p-8">
									<div>
										<div className="flex flex-wrap items-start justify-between gap-3">
											<h3 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
												{booking.property.propertyName}
											</h3>
											<span className="border border-structural-border px-2 py-1 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
												REF · {booking.id.slice(0, 8).toUpperCase()}
											</span>
										</div>
										<p className="mt-2 text-sm text-muted-foreground">
											{formatInr(booking.property.price)} per day
										</p>
									</div>

									<div className="my-6 grid grid-cols-2 gap-4 border-y border-structural-border py-5 md:grid-cols-4">
										<div>
											<p className="label-caps text-[10px] text-muted-foreground">
												Event Date
											</p>
											<p className="mt-1.5 flex items-start gap-1.5 text-sm text-foreground">
												<CalendarDays className="mt-0.5 size-3.5 shrink-0" aria-hidden />
												<span>{formatDateRange(booking.startDate, booking.endDate)}</span>
											</p>
										</div>
										<div>
											<p className="label-caps text-[10px] text-muted-foreground">
												Booked On
											</p>
											<p className="mt-1.5 text-sm text-foreground">
												{new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(
													new Date(booking.bookingDate)
												)}
											</p>
										</div>
										<div>
											<p className="label-caps text-[10px] text-muted-foreground">
												Amount Paid
											</p>
											<p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-foreground">
												<CreditCard className="size-3.5 shrink-0" aria-hidden />
												{payment ? formatInr(payment.amount) : '—'}
											</p>
										</div>
										<div>
											<p className="label-caps text-[10px] text-muted-foreground">
												Payment
											</p>
											<div className="mt-1.5">
												{payment ? (
													<BookingStatusBadge status={payment.status} />
												) : (
													<span className="text-sm text-muted-foreground">—</span>
												)}
											</div>
										</div>
									</div>

									<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
										<div>
											<p className="label-caps text-[10px] text-muted-foreground">
												Total Amount
											</p>
											<p className="mt-1 font-headline text-2xl font-semibold text-foreground">
												{formatInr(booking.totalAmount)}
											</p>
										</div>
										<div className="flex flex-wrap gap-2">
											{['AWAITING_OWNER_APPROVAL', 'CONFIRMED'].includes(
												booking.bookingStatus
											) ? (
												<Button
													type="button"
													variant="outline"
													className="border-destructive text-destructive hover:bg-destructive/5"
													onClick={() => setSelectedId(booking.id)}
												>
													Cancel
												</Button>
											) : null}
											{booking.bookingStatus === 'COMPLETED' &&
											booking.reviewWindowOpen ? (
												<Button
													type="button"
													variant="outline"
													onClick={() => setReviewBooking(booking)}
												>
													{booking.review ? 'Edit Review' : 'Add Review'}
												</Button>
											) : null}
										</div>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}

			{totalCount > limit ? (
				<PaginationControls
					page={page}
					totalPages={totalPages}
					align="end"
					onPageChange={(nextPage) => {
						setLoading(true);
						setPage(nextPage);
					}}
				/>
			) : null}

			{reviewBooking ? (
				<ReviewDialog
					key={reviewBooking.id}
					open
					bookingId={reviewBooking.id}
					existing={reviewBooking.review}
					onClose={() => setReviewBooking(null)}
					onSaved={() => {
						setReviewBooking(null);
						void loadBookings();
					}}
				/>
			) : null}

			<Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
				<DialogContent className="rounded-none border-structural-border">
					<DialogHeader>
						<DialogTitle className="font-headline">Confirm Booking Cancellation</DialogTitle>
						<DialogDescription>
							Are you sure you want to cancel this booking? The payment will be refunded
							within 7 business days.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setSelectedId(null)}>
							No, Keep Booking
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={cancelling}
							onClick={cancelBooking}
						>
							{cancelling ? 'Cancelling…' : 'Yes, Cancel Booking'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
