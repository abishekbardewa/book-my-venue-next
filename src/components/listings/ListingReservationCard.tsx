'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format as formatDate, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { formatInr } from '@/lib/format';
import type { PublicListing } from '@/features/properties/types';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';

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
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	const [saving, setSaving] = useState(false);

	const disabledDates = useMemo(() => {
		return listing.blockingBookings.flatMap((booking) =>
			getDatesBetween(booking.startDate, booking.endDate)
		);
	}, [listing.blockingBookings]);

	const isDisabledDate = (date: Date) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (date < today) return true;
		return disabledDates.some((disabled) => isSameDay(disabled, date));
	};

	const days = useMemo(() => {
		if (!startDate || !endDate) return 0;
		const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
		return diff >= 0 ? diff + 1 : 0;
	}, [startDate, endDate]);

	const total = days > 0 ? days * listing.price : listing.price;
	const canBook = currentUser?.role === 'CUSTOMER';

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
		<aside className="rounded-xl border border-border bg-card p-5 shadow-lg">
			<p className="text-lg font-semibold text-foreground">
				{formatInr(listing.price)}{' '}
				<span className="text-sm font-normal text-muted-foreground">Per Day</span>
			</p>

			<div className="mt-5 grid gap-3 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="start-date">Start date</Label>
					<DatePicker
						id="start-date"
						date={startDate}
						onSelect={(date) => {
							setStartDate(date);
							if (date && endDate && endDate <= date) {
								setEndDate(undefined);
							}
						}}
						placeholder="Start date"
						disabled={isDisabledDate}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="end-date">End date</Label>
					<DatePicker
						id="end-date"
						date={endDate}
						onSelect={setEndDate}
						placeholder="End date"
						disabled={(date) => {
							if (isDisabledDate(date)) return true;
							if (startDate) return date < startDate;
							return false;
						}}
					/>
				</div>
			</div>

			<Button
				type="button"
				className="mt-5 w-full"
				size="lg"
				onClick={reserve}
				disabled={saving || Boolean(currentUser && !canBook)}
			>
				{saving ? 'Saving...' : 'Reserve'}
			</Button>
			{currentUser && !canBook ? (
				<p className="mt-2 text-center text-xs text-muted-foreground">
					Only customers are allowed to book a property
				</p>
			) : null}

			<div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
				<span className="text-muted-foreground">Total</span>
				<span className="font-semibold text-foreground">{formatInr(total)}</span>
			</div>
		</aside>
	);
}
