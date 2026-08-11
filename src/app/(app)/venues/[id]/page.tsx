import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getApprovedVenueById,
	listApprovedVenueIds,
} from '@/features/properties/db';
import { VenueDetailView } from '@/components/venues/VenueDetailView';

type VenuePageProps = {
	params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
	const ids = await listApprovedVenueIds();
	return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
	const { id } = await params;
	const venue = await getApprovedVenueById(id);
	if (!venue) {
		return { title: 'Venue not found' };
	}

	return {
		title: venue.propertyName,
		description: `${venue.propertyName} in ${venue.city}, ${venue.country}`,
		openGraph: {
			title: venue.propertyName,
			description: `${venue.propertyName} in ${venue.city}, ${venue.country}`,
			images: [{ url: venue.image }],
		},
	};
}

export default async function VenueDetailPage({ params }: VenuePageProps) {
	const { id } = await params;
	const venue = await getApprovedVenueById(id);

	if (!venue) {
		notFound();
	}

	return <VenueDetailView venue={venue} />;
}
