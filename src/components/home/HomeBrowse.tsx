'use client';

import { useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import type { PublicVenue } from '@/features/properties/types';
import { CategoryStrip } from '@/components/home/CategoryStrip';
import { VenueCard } from '@/components/home/VenueCard';
import { VenueSearch } from '@/components/home/VenueSearch';

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
		<>
			<section className="bg-secondary">
				<div className="page-container-wide space-y-5 py-5 sm:space-y-6 sm:py-7">
					<div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5">
						<VenueSearch className="w-full" />
						<CategoryStrip activeTag={activeTag} onChange={setActiveTag} />
					</div>
				</div>
			</section>

			<section className="page-container-wide bg-background py-8 sm:py-10">
				{venues.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
						<Building2 className="size-10" aria-hidden />
						<p className="text-sm font-medium">Properties Not Found</p>
					</div>
				) : (
					<ul className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
						{venues.map((venue, index) => (
							<li key={venue.id}>
								<VenueCard venue={venue} index={index} />
							</li>
						))}
					</ul>
				)}
			</section>
		</>
	);
}
