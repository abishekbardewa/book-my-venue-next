import type { Metadata } from 'next';
import { HomeBrowse } from '@/components/home/HomeBrowse';
import { listApprovedListings } from '@/features/properties/db';

export const metadata: Metadata = {
	title: 'Book My Venue',
	description: 'Discover and book event venues across India',
	openGraph: {
		title: 'Book My Venue',
		description: 'Discover and book event venues across India',
		type: 'website',
	},
};

export default async function HomePage() {
	const listings = await listApprovedListings();

	return <HomeBrowse listings={listings} />;
}
