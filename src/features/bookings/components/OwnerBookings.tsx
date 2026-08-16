'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarX } from 'lucide-react';
import { toast } from 'sonner';
import {
	BOOKING_STATUS_MESSAGES,
	type BookingStatus,
} from '@/features/bookings/constants';
import type { BookingListItem } from '@/features/bookings/types';
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
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

type Decision = {
	bookingId: string;
	status: 'CONFIRMED' | 'CANCELLED';
};

function formatDateRange(startDate: string, endDate: string) {
	const formatter = new Intl.DateTimeFormat('en-IN', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

export function OwnerBookings() {
	const [status, setStatus] =
		useState<Exclude<BookingStatus, 'PENDING' | 'FAILED'>>('AWAITING_OWNER_APPROVAL');
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

	const empty = BOOKING_STATUS_MESSAGES[status];
	const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

	return (
		<div>
			<div>
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bookings</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					A list of all the bookings of your properties.
				</p>
			</div>

			<nav className="mt-8 border-b border-border" aria-label="Booking status">
				<ul className="flex gap-1 overflow-x-auto">
					{TABS.map((tab) => (
						<li key={tab.status}>
							<button
								type="button"
								onClick={() => {
									setLoading(true);
									setStatus(tab.status);
									setPage(1);
								}}
								className={cn(
									'whitespace-nowrap border-b-2 px-3 py-2 text-sm',
									status === tab.status
										? 'border-foreground font-semibold text-foreground'
										: 'border-transparent text-muted-foreground'
								)}
							>
								{tab.label}
							</button>
						</li>
					))}
				</ul>
			</nav>

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
				<ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{bookings.map((booking) => {
						const payment = booking.payments[0];
						return (
							<li
								key={booking.id}
								className="overflow-hidden rounded-xl border border-border bg-card"
							>
								<Link
									href={`/listings/${booking.property.id}`}
									className="flex items-center gap-4 border-b border-border bg-secondary/40 p-5"
								>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={booking.property.image}
										alt={booking.property.propertyName}
										className="size-12 rounded-lg object-cover"
									/>
									<div>
										<p className="font-medium">{booking.property.propertyName}</p>
										<p className="text-sm text-muted-foreground">
											{payment ? formatInr(payment.amount) : '—'} paid
										</p>
									</div>
								</Link>

								<div className="space-y-5 p-5 text-sm">
									<dl className="divide-y divide-border rounded-xl border border-border px-3">
										<div className="flex justify-between gap-4 py-2.5">
											<dt className="text-muted-foreground">Booking ID</dt>
											<dd>{booking.id.slice(0, 8).toUpperCase()}</dd>
										</div>
										<div className="flex justify-between gap-4 py-2.5">
											<dt className="text-muted-foreground">Event Date</dt>
											<dd className="text-right">
												{formatDateRange(booking.startDate, booking.endDate)}
											</dd>
										</div>
										<div className="flex justify-between gap-4 py-2.5">
											<dt className="text-muted-foreground">Amount Paid</dt>
											<dd className="flex flex-wrap items-center justify-end gap-2">
												{payment ? formatInr(payment.amount) : '—'}
												{payment ? <BookingStatusBadge status={payment.status} /> : null}
											</dd>
										</div>
										<div className="flex justify-between gap-4 py-2.5">
											<dt className="text-muted-foreground">Booking Status</dt>
											<dd>
												<BookingStatusBadge status={booking.bookingStatus} />
											</dd>
										</div>
									</dl>

									<div>
										<h2 className="font-medium">Customer Info</h2>
										<div className="mt-2 text-muted-foreground">
											<p>
												{booking.user.firstName} {booking.user.lastName}
											</p>
											<p>{booking.user.email}</p>
											<p>{booking.user.phone}</p>
										</div>
									</div>

									{booking.bookingStatus === 'AWAITING_OWNER_APPROVAL' ? (
										<>
											<p className="text-xs font-medium text-destructive">
												Take action before:{' '}
												{new Intl.DateTimeFormat('en-IN', {
													dateStyle: 'medium',
													timeStyle: 'short',
												}).format(
													new Date(new Date(booking.bookingDate).getTime() + 86_400_000)
												)}
											</p>
											<div className="grid grid-cols-2 gap-2">
												<Button
													type="button"
													variant="outline"
													className="border-green-600 text-green-700"
													onClick={() =>
														setDecision({
															bookingId: booking.id,
															status: 'CONFIRMED',
														})
													}
												>
													Accept
												</Button>
												<Button
													type="button"
													variant="outline"
													className="border-destructive text-destructive"
													onClick={() =>
														setDecision({
															bookingId: booking.id,
															status: 'CANCELLED',
														})
													}
												>
													Reject
												</Button>
											</div>
										</>
									) : null}
								</div>
							</li>
						);
					})}
				</ul>
			)}

			{totalCount > limit ? (
				<div className="mt-6 flex justify-center gap-2">
					<Button
						type="button"
						variant="outline"
						disabled={page <= 1}
						onClick={() => {
							setLoading(true);
							setPage((value) => value - 1);
						}}
					>
						Previous
					</Button>
					<Button
						type="button"
						variant="outline"
						disabled={page >= totalPages}
						onClick={() => {
							setLoading(true);
							setPage((value) => value + 1);
						}}
					>
						Next
					</Button>
				</div>
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
