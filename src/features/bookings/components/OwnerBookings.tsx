'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
	ArrowRight,
	CalendarDays,
	CalendarX,
	Clock,
	MapPin,
	UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import {
	BOOKING_STATUS_MESSAGES,
	type BookingStatus,
} from '@/features/bookings/constants';
import type { BookingListItem } from '@/features/bookings/types';
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
import { cn } from '@/lib/utils';
import { formatInr } from '@/lib/format';

type StatusFilter = 'ALL' | Exclude<BookingStatus, 'PENDING' | 'FAILED'>;

const FILTERS: { status: StatusFilter; label: string }[] = [
	{ status: 'ALL', label: 'All Bookings' },
	{ status: 'AWAITING_OWNER_APPROVAL', label: 'Pending' },
	{ status: 'CONFIRMED', label: 'Confirmed' },
	{ status: 'COMPLETED', label: 'Completed' },
	{ status: 'CANCELLED', label: 'Cancelled' },
];

type BookingResponse = {
	data: BookingListItem[];
	totalCount: number;
};

type Decision = {
	bookingId: string;
	status: 'CONFIRMED' | 'CANCELLED';
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

function guestName(booking: BookingListItem) {
	const name = `${booking.user.firstName ?? ''} ${booking.user.lastName ?? ''}`.trim();
	return name || booking.user.email;
}

function statusPresentation(status: BookingStatus) {
	switch (status) {
		case 'CONFIRMED':
			return {
				label: 'Confirmed',
				dot: 'bg-emerald-500',
				badge: 'border-structural-border bg-ink text-ink-foreground',
			};
		case 'AWAITING_OWNER_APPROVAL':
			return {
				label: 'Pending Approval',
				dot: 'bg-amber-500',
				badge: 'border-structural-border bg-secondary text-foreground',
			};
		case 'COMPLETED':
			return {
				label: 'Completed',
				dot: 'bg-emerald-500',
				badge: 'border-structural-border bg-card text-foreground',
			};
		case 'CANCELLED':
			return {
				label: 'Cancelled',
				dot: null,
				badge: 'border-destructive/40 bg-destructive/10 text-destructive',
			};
		default:
			return {
				label: status.replaceAll('_', ' '),
				dot: 'bg-muted-foreground',
				badge: 'border-structural-border bg-card text-foreground',
			};
	}
}

function paymentLabel(booking: BookingListItem) {
	const payment = booking.payments[0];
	if (!payment) return 'Payment pending';
	if (payment.status === 'SUCCESS') return 'Paid in Full';
	if (payment.status === 'REFUNDED') return 'Refund Processed';
	return payment.status.replaceAll('_', ' ');
}

export function OwnerBookings() {
	const [status, setStatus] = useState<StatusFilter>('ALL');
	const [bookings, setBookings] = useState<BookingListItem[]>([]);
	const [page, setPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [decision, setDecision] = useState<Decision | null>(null);
	const limit = 6;

	const loadBookings = useCallback(async () => {
		try {
			const response = await fetch(
				`/api/booking/owner-bookings?page=${page}&limit=${limit}&status=${status}`
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

	async function confirmDecision() {
		if (!decision) return;
		setUpdating(true);
		try {
			const response = await fetch(`/api/booking/${decision.bookingId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bookingStatus: decision.status,
					paymentStatus: decision.status === 'CANCELLED' ? 'REFUNDED' : 'SUCCESS',
					role: 'OWNER',
				}),
			});
			const result = (await response.json()) as { success?: boolean; message?: string };
			if (!response.ok || !result.success) {
				throw new Error(result.message ?? 'Could not update booking');
			}
			toast.success(result.message);
			setDecision(null);
			await loadBookings();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Something went wrong');
		} finally {
			setUpdating(false);
		}
	}

	const empty =
		status === 'ALL'
			? {
					title: 'No bookings yet',
					description: 'Reservations for your venues will appear here.',
				}
			: BOOKING_STATUS_MESSAGES[status];
	const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

	return (
		<div>
			<div className="border-b border-structural-border pb-6">
				<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Manage Bookings
				</h1>
				<p className="mt-2 text-muted-foreground sm:text-lg">
					Manage upcoming and past reservations for your venues.
				</p>
			</div>

			<div className="mt-6 flex flex-nowrap gap-2 overflow-x-auto pb-1">
				{FILTERS.map((filter) => {
					const active = status === filter.status;
					return (
						<button
							key={filter.status}
							type="button"
							onClick={() => {
								setLoading(true);
								setStatus(filter.status);
								setPage(1);
							}}
							className={cn(
								'shrink-0 border px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase transition-colors',
								active
									? 'border-foreground bg-foreground text-background'
									: 'border-structural-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground'
							)}
						>
							{filter.label}
						</button>
					);
				})}
			</div>

			{loading ? (
				<div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
					Loading bookings…
				</div>
			) : bookings.length === 0 ? (
				<EmptyState
					icon={CalendarX}
					title={empty.title}
					description={empty.description}
					className="py-20"
				/>
			) : (
				<ul className="mt-8 flex flex-col gap-6">
					{bookings.map((booking) => {
						const payment = booking.payments[0];
						const statusUi = statusPresentation(booking.bookingStatus);
						const cancelled = booking.bookingStatus === 'CANCELLED';
						const awaiting = booking.bookingStatus === 'AWAITING_OWNER_APPROVAL';

						return (
							<li key={booking.id}>
								<article
									className={cn(
										'group flex flex-col overflow-hidden border border-structural-border bg-card transition-[transform,border-color] duration-300 motion-safe:hover:-translate-y-0.5 hover:border-foreground/20 lg:flex-row',
										cancelled && 'opacity-80'
									)}
								>
									<div className="relative h-48 w-full shrink-0 overflow-hidden border-b border-structural-border lg:h-auto lg:w-[360px] lg:border-r lg:border-b-0 xl:w-[400px]">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={booking.property.image}
											alt=""
											className={cn(
												'h-full w-full object-cover transition-transform duration-700 group-hover:scale-105',
												cancelled && 'grayscale opacity-70'
											)}
										/>
										<div className="absolute inset-0 bg-foreground/15 transition-colors group-hover:bg-foreground/5" />
										<div
											className={cn(
												'absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 border px-2.5 py-1',
												statusUi.badge
											)}
										>
											{statusUi.dot ? (
												<span
													className={cn('size-2 shrink-0', statusUi.dot)}
													aria-hidden
												/>
											) : null}
											<span className="text-[10px] font-semibold tracking-widest uppercase">
												{statusUi.label}
											</span>
										</div>
									</div>

									<div className="flex flex-1 flex-col justify-between p-6">
										<div className="mb-6">
											<div className="flex items-start justify-between gap-4">
												<h2
													className={cn(
														'font-headline text-2xl font-semibold tracking-tight text-foreground',
														cancelled && 'text-muted-foreground'
													)}
												>
													{booking.property.propertyName}
												</h2>
												<span className="shrink-0 border border-structural-border px-2 py-1 text-[10px] tracking-wide text-muted-foreground uppercase">
													Ref: #{booking.id.slice(0, 8).toUpperCase()}
												</span>
											</div>
											<p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
												<MapPin className="size-3.5 shrink-0" aria-hidden />
												{booking.property.city || booking.property.address || '—'}
											</p>
										</div>

										<div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-structural-border py-4 md:grid-cols-4">
											<div>
												<p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
													Event Date
												</p>
												<p
													className={cn(
														'flex items-center gap-1.5 text-sm text-foreground',
														cancelled && 'text-muted-foreground line-through'
													)}
												>
													<CalendarDays className="size-3.5 shrink-0" aria-hidden />
													{formatDateRange(booking.startDate, booking.endDate)}
												</p>
											</div>
											<div>
												<p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
													Access
												</p>
												<p className="flex items-center gap-1.5 text-sm text-foreground">
													<Clock className="size-3.5 shrink-0" aria-hidden />
													{booking.property.checkInTime} – {booking.property.checkOutTime}
												</p>
											</div>
											<div>
												<p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
													Capacity
												</p>
												<p className="text-sm text-foreground">
													Up to {booking.property.capacity || '—'}
												</p>
											</div>
											<div>
												<p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
													Customer
												</p>
												<p className="flex items-center gap-1.5 truncate text-sm text-foreground">
													<UserRound className="size-3.5 shrink-0" aria-hidden />
													<span className="truncate">{guestName(booking)}</span>
												</p>
											</div>
										</div>

										<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
											<div>
												<p className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
													Total Amount
												</p>
												<div className="flex flex-wrap items-baseline gap-2">
													<span
														className={cn(
															'font-headline text-xl font-semibold text-foreground',
															cancelled && 'text-muted-foreground line-through'
														)}
													>
														{formatInr(
															payment?.amount ?? booking.totalAmount
														)}
													</span>
													<span className="border border-structural-border px-2 py-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
														{paymentLabel(booking)}
													</span>
												</div>
											</div>

											<div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
												{awaiting ? (
													<>
														<Button
															type="button"
															variant="outline"
															className="flex-1 border-destructive text-destructive md:flex-none"
															onClick={() =>
																setDecision({
																	bookingId: booking.id,
																	status: 'CANCELLED',
																})
															}
														>
															Reject
														</Button>
														<Button
															type="button"
															className="flex-1 md:flex-none"
															onClick={() =>
																setDecision({
																	bookingId: booking.id,
																	status: 'CONFIRMED',
																})
															}
														>
															Accept
														</Button>
													</>
												) : null}
												<Link
													href={`/owner/bookings/${booking.id}`}
													className={cn(
														'inline-flex flex-1 items-center justify-center gap-2 border px-5 py-2.5 text-xs font-semibold tracking-[0.1em] uppercase transition-colors md:flex-none',
														awaiting
															? 'border-structural-border text-foreground hover:border-primary hover:text-foreground'
															: 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
													)}
												>
													View Details
													<ArrowRight className="size-3.5" aria-hidden />
												</Link>
											</div>
										</div>

										{awaiting ? (
											<p className="mt-4 text-xs text-destructive">
												Take action before{' '}
												{new Intl.DateTimeFormat('en-IN', {
													dateStyle: 'medium',
													timeStyle: 'short',
												}).format(
													new Date(
														new Date(booking.bookingDate).getTime() + 86_400_000
													)
												)}
											</p>
										) : null}
									</div>
								</article>
							</li>
						);
					})}
				</ul>
			)}

			{totalCount > limit ? (
				<PaginationControls
					page={page}
					totalPages={totalPages}
					onPageChange={(nextPage) => {
						setLoading(true);
						setPage(nextPage);
					}}
				/>
			) : null}

			<Dialog open={Boolean(decision)} onOpenChange={(open) => !open && setDecision(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{decision?.status === 'CANCELLED'
								? 'Confirm Booking Cancellation'
								: 'Confirm Booking Acceptance'}
						</DialogTitle>
						<DialogDescription>
							{decision?.status === 'CANCELLED'
								? 'Are you sure you want to reject this booking? The payment will be refunded within 7 - 10 business days.'
								: 'Are you sure you want to accept this booking?'}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setDecision(null)}>
							{decision?.status === 'CANCELLED' ? 'No, Keep Booking' : 'I am not sure yet!'}
						</Button>
						<Button
							type="button"
							variant={decision?.status === 'CANCELLED' ? 'destructive' : 'default'}
							disabled={updating}
							onClick={confirmDecision}
						>
							{updating
								? 'Updating…'
								: decision?.status === 'CANCELLED'
									? 'Yes, Cancel Booking'
									: 'Yes, Accept Booking'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
