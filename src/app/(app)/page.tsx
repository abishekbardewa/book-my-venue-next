import type { Metadata } from 'next';
import { HomeBrowse } from '@/components/home/HomeBrowse';
import { HomeHero } from '@/components/home/HomeHero';
import { listApprovedVenues } from '@/features/properties/db';

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
	const venues = await listApprovedVenues();

	return (
		<>
			<HomeHero />
			<HomeBrowse venues={venues} />
		</>
	);
}
