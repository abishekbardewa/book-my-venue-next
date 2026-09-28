import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ListingsBrowse } from '@/components/listings/ListingsBrowse';

export const metadata: Metadata = {
	title: 'Listings',
	description: 'Browse and filter curated event venues across India',
	openGraph: {
		title: 'Listings | Book My Venue',
		description: 'Browse and filter curated event venues across India',
		type: 'website',
	},
};

export default function ListingsPage() {
	return (
		<Suspense
			fallback={
				<div className="page-container-wide flex min-h-[40vh] items-center justify-center py-16">
					<p className="label-caps text-muted-foreground">Loading venues</p>
				</div>
			}
		>
			<ListingsBrowse />
		</Suspense>
	);
}
