'use client';

import { useMemo, useState } from 'react';
import { formatInr } from '@/lib/format';
import type { PublicVenue } from '@/features/properties/types';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';

type VenueReservationCardProps = {
	venue: PublicVenue;
};

export function VenueReservationCard({ venue }: VenueReservationCardProps) {
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();

	const days = useMemo(() => {
		if (!startDate || !endDate) return 0;
		const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
		return diff > 0 ? diff : 0;
	}, [startDate, endDate]);

	const total = days > 0 ? days * venue.price : venue.price;

	return (
		<aside className="rounded-xl border border-border bg-card p-5 shadow-lg">
			<p className="text-lg font-semibold text-foreground">
				{formatInr(venue.price)}{' '}
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
						disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
							const today = new Date(new Date().setHours(0, 0, 0, 0));
							if (date < today) return true;
							if (startDate) return date <= startDate;
							return false;
						}}
					/>
				</div>
			</div>

			<Button type="button" className="mt-5 w-full" size="lg">
				Reserve
			</Button>

			<div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
				<span className="text-muted-foreground">Total</span>
				<span className="font-semibold text-foreground">{formatInr(total)}</span>
			</div>
		</aside>
	);
}
