'use client';

import { useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import type { PublicListing } from '@/features/properties/types';
import { CategoryStrip } from '@/components/home/CategoryStrip';
import { ListingCard } from '@/components/home/ListingCard';
import { ListingSearch } from '@/components/home/ListingSearch';

type HomeBrowseProps = {
	listings: PublicListing[];
};

export function HomeBrowse({ listings: allListings }: HomeBrowseProps) {
	const [activeTag, setActiveTag] = useState('');

	const listings = useMemo(() => {
		if (!activeTag) return allListings;
		return allListings.filter((listing) => listing.tags.includes(activeTag));
	}, [activeTag, allListings]);

	return (
		<>
			<section className="bg-secondary">
				<div className="page-container-wide space-y-5 py-5 sm:space-y-6 sm:py-7">
					<div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5">
						<ListingSearch className="w-full" />
						<CategoryStrip activeTag={activeTag} onChange={setActiveTag} />
					</div>
				</div>
			</section>

			<section className="page-container-wide bg-background py-8 sm:py-10">
				{listings.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
						<Building2 className="size-10" aria-hidden />
						<p className="text-sm font-medium">Properties Not Found</p>
					</div>
				) : (
					<ul className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
						{listings.map((listing, index) => (
							<li key={listing.id}>
								<ListingCard listing={listing} index={index} />
							</li>
						))}
					</ul>
				)}
			</section>
		</>
	);
}
