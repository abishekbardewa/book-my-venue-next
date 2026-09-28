'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format as formatDate, isSameDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Shield, Star } from 'lucide-react';
import { toast } from 'sonner';
import { formatInr } from '@/lib/format';
import type { PublicListing } from '@/features/properties/types';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';

type ListingReservationCardProps = {
	listing: PublicListing;
	currentUser: {
		id: string;
		role: 'CUSTOMER' | 'OWNER' | 'PLATFORM_ADMIN';
		firstName: string | null;
		lastName: string | null;
		email: string;
		phone: string | null;
		avatar: string | null;
	} | null;
};

function getDatesBetween(startDate: string | Date, endDate: string | Date) {
	const dates: Date[] = [];
	const current = new Date(startDate);
	current.setHours(0, 0, 0, 0);
	const end = new Date(endDate);
	end.setHours(0, 0, 0, 0);

	while (current <= end) {
		dates.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}
	return dates;
}

export function ListingReservationCard({
	listing,
	currentUser,
}: ListingReservationCardProps) {
	const router = useRouter();
	const [range, setRange] = useState<DateRange | undefined>();
	const [saving, setSaving] = useState(false);

	const startDate = range?.from;
	const endDate = range?.to;

	const disabledDates = useMemo(() => {
		return listing.blockingBookings.flatMap((booking) =>
			getDatesBetween(booking.startDate, booking.endDate)
		);
	}, [listing.blockingBookings]);

	const canBook = currentUser?.role === 'CUSTOMER';
	const bookingLocked = Boolean(currentUser && !canBook);

	const isDisabledDate = (date: Date) => {
		if (bookingLocked) return true;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (date < today) return true;
		return disabledDates.some((disabled) => isSameDay(disabled, date));
	};

	const rangeIncludesBlocked = (from: Date, to: Date) => {
		return getDatesBetween(from, to).some((date) =>
			disabledDates.some((disabled) => isSameDay(disabled, date))
		);
	};

	const days = useMemo(() => {
		if (!startDate || !endDate) return 0;
		const diff = Math.round(
			(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
		);
		return diff >= 0 ? diff + 1 : 0;
	}, [startDate, endDate]);

	const total = days > 0 ? days * listing.price : listing.price;
	const avgRating =
		listing.reviews.length > 0
			? listing.reviews.reduce((sum, review) => sum + review.rating, 0) /
				listing.reviews.length
			: null;

	function handleRangeSelect(next: DateRange) {
		if (!next.from || !next.to) return undefined;

		if (rangeIncludesBlocked(next.from, next.to)) {
			toast.error('Selected dates include unavailable days');
			return { from: next.from, to: undefined };
		}

		setRange(next);
		return next;
	}

	async function reserve() {
		if (!currentUser) {
			router.push('/sign-in');
			return;
		}
		if (!canBook) {
			toast.error('Only customers are allowed to book a property');
			return;
		}
		if (!startDate || !endDate) {
			toast.error('Select your booking dates');
			return;
		}

		setSaving(true);
		try {
			const response = await fetch('/api/booking/reserve', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					propertyId: listing.id,
					startDate: formatDate(startDate, 'yyyy-MM-dd'),
					endDate: formatDate(endDate, 'yyyy-MM-dd'),
				}),
			});
			const result = (await response.json()) as {
				success?: boolean;
				message?: string;
				data?: { bookingId: string };
			};

			if (!response.ok || !result.success || !result.data) {
				throw new Error(result.message ?? 'Could not reserve these dates');
			}

			router.push(`/payment?id=${result.data.bookingId}`);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Could not reserve these dates'
			);
			setSaving(false);
		}
	}

	return (
		<aside className="flex flex-col gap-6 border border-structural-border bg-card p-6 shadow-sm sm:p-7">
			<div className="flex items-end justify-between gap-4 border-b border-structural-border pb-5">
				<div>
					<span className="font-headline text-3xl font-bold tracking-tight text-foreground">
						{formatInr(listing.price)}
					</span>
					<span className="ml-1 text-muted-foreground">/ day</span>
				</div>
				{avgRating !== null ? (
					<span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
						<Star className="size-4 fill-primary text-primary" aria-hidden />
						{avgRating.toFixed(1)}
					</span>
				) : (
					<span className="inline-flex items-center gap-1 text-xs tracking-wide text-muted-foreground uppercase">
						<Shield className="size-3.5 text-primary" aria-hidden />
						Verified
					</span>
				)}
			</div>

			<div className="border border-structural-border p-3">
				<p className="label-caps text-[10px] text-muted-foreground">Dates</p>
				<DateRangePicker
					id="booking-dates"
					range={range}
					onSelect={handleRangeSelect}
					disabled={isDisabledDate}
					triggerDisabled={bookingLocked}
					placeholder="Add dates"
					className="mt-1.5 h-auto border-0 bg-transparent p-0 px-0 shadow-none hover:bg-transparent has-[>svg]:px-0"
				/>
			</div>
			<Button
				type="button"
				className="w-full"
				size="lg"
				onClick={reserve}
				disabled={saving || bookingLocked}
			>
				{saving ? 'Saving...' : 'Reserve'}
			</Button>
			<p className="text-center text-sm text-muted-foreground">
				{bookingLocked
					? 'Only customers are allowed to book'
					: "You won't be charged yet"}
			</p>

			<div className="space-y-3 border-t border-structural-border pt-5 text-sm">
				<div className="flex justify-between gap-4 text-muted-foreground">
					<span>
						{formatInr(listing.price)} × {days > 0 ? days : 1}{' '}
						{(days > 0 ? days : 1) === 1 ? 'day' : 'days'}
					</span>
					<span>{formatInr(total)}</span>
				</div>
				<div className="flex justify-between gap-4 border-t border-structural-border pt-4 font-headline text-lg font-semibold text-foreground">
					<span>Total</span>
					<span>{formatInr(total)}</span>
				</div>
			</div>
		</aside>
	);
}
