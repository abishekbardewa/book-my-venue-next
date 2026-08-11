'use client';

import { useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import type { PublicVenue } from '@/features/properties/types';
import { CategoryStrip } from '@/components/home/CategoryStrip';
import { VenueCard } from '@/components/home/VenueCard';

type HomeBrowseProps = {
	venues: PublicVenue[];
};

export function HomeBrowse({ venues: allVenues }: HomeBrowseProps) {
	const [activeTag, setActiveTag] = useState('');

	const venues = useMemo(() => {
		if (!activeTag) return allVenues;
		return allVenues.filter((venue) => venue.tags.includes(activeTag));
	}, [activeTag, allVenues]);

	return (
		<section className="page-container-wide space-y-8 py-10">
			<CategoryStrip activeTag={activeTag} onChange={setActiveTag} />

			{venues.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
					<Building2 className="size-10" aria-hidden />
					<p className="text-sm font-medium">Properties Not Found</p>
				</div>
			) : (
				<ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{venues.map((venue, index) => (
						<li key={venue.id}>
							<VenueCard venue={venue} index={index} />
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
