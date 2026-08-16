'use client';

import { useCallback, useEffect, useState } from 'react';
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
	const limit = 5;

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
			<div>
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your bookings</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					A list of all the bookings in your account.
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
				<div className="mt-8 space-y-4">
					{bookings.map((booking) => {
						const payment = booking.payments[0];
						return (
							<article
								key={booking.id}
								className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
							>
								<div className="grid gap-4 bg-secondary/40 p-4 text-sm sm:grid-cols-4 sm:p-5">
									<div>
										<p className="font-medium">Amount Paid</p>
										<div className="mt-1 flex flex-wrap items-center gap-2">
											<span>{payment ? formatInr(payment.amount) : '—'}</span>
											{payment ? <BookingStatusBadge status={payment.status} /> : null}
										</div>
									</div>
									<div>
										<p className="font-medium">Event Date</p>
										<p className="mt-1 text-muted-foreground">
											{formatDateRange(booking.startDate, booking.endDate)}
										</p>
									</div>
									<div>
										<p className="font-medium">Booked On</p>
										<p className="mt-1 text-muted-foreground">
											{new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(
												new Date(booking.bookingDate)
											)}
										</p>
									</div>
									<div className="sm:text-right">
										<p className="font-medium">Booking ID</p>
										<p className="mt-1 text-muted-foreground">
											{booking.id.slice(0, 8).toUpperCase()}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-4 p-4 sm:p-5">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={booking.property.image}
										alt={booking.property.propertyName}
										className="size-20 rounded-lg object-cover"
									/>
									<div className="min-w-0 flex-1">
										<p className="font-medium">{booking.property.propertyName}</p>
										<p className="mt-1 text-sm text-muted-foreground">
											{formatInr(booking.property.price)} per day
										</p>
										<div className="mt-3">
											<BookingStatusBadge status={booking.bookingStatus} />
										</div>
									</div>
									{['AWAITING_OWNER_APPROVAL', 'CONFIRMED'].includes(
										booking.bookingStatus
									) ? (
										<Button
											type="button"
											variant="outline"
											className="border-destructive text-destructive"
											onClick={() => setSelectedId(booking.id)}
										>
											Cancel
										</Button>
									) : null}
								</div>
							</article>
						);
					})}
				</div>
			)}

			{totalCount > limit ? (
				<div className="mt-6 flex justify-end gap-2">
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

			<Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Booking Cancellation</DialogTitle>
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
