'use client';

import { useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import type { PublicListing } from '@/features/properties/types';
import { EmptyState } from '@/components/common/EmptyState';
import { CategoryStrip } from '@/components/home/CategoryStrip';
import { ListingCard } from '@/components/home/ListingCard';
import { ListingSearch } from '@/components/home/ListingSearch';

type HomeBrowseProps = {
	listings: PublicListing[];
};

export function HomeBrowse({ listings: allListings }: HomeBrowseProps) {
	const [city, setCity] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTag, setActiveTag] = useState('');

	const hasFilters = city !== 'all' || searchQuery.length > 0 || activeTag.length > 0;

	const listings = useMemo(() => {
		return allListings.filter((listing) => {
			if (city !== 'all' && listing.city !== city) return false;
			if (
				searchQuery &&
				!listing.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return false;
			}
			if (activeTag && !listing.tags.includes(activeTag)) return false;
			return true;
		});
	}, [activeTag, allListings, city, searchQuery]);

	function handleCityChange(nextCity: string) {
		setCity(nextCity);
		setSearchQuery('');
		setActiveTag('');
	}

	function clearFilters() {
		setCity('all');
		setSearchQuery('');
		setActiveTag('');
	}

	return (
		<>
			<section className="bg-secondary">
				<div className="page-container-wide space-y-5 py-5 sm:space-y-6 sm:py-7">
					<div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 overflow-visible">
						<ListingSearch
							className="relative z-20 w-full"
							listings={allListings}
							city={city}
							searchQuery={searchQuery}
							onCityChange={handleCityChange}
							onSearchCommit={setSearchQuery}
						/>
						<CategoryStrip activeTag={activeTag} onChange={setActiveTag} />
					</div>
				</div>
			</section>

			<section className="page-container-wide bg-background py-8 sm:py-10">
				{listings.length === 0 ? (
					<EmptyState
						icon={Building2}
						title={hasFilters ? 'No properties found' : 'No properties yet'}
						description={
							hasFilters
								? 'Try a different city, search term, or category.'
								: 'Approved listings will show up here once owners publish them.'
						}
						action={
							hasFilters ? (
								<button
									type="button"
									onClick={clearFilters}
									className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
								>
									Clear filters
								</button>
							) : null
						}
					/>
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
