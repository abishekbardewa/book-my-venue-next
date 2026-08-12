import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getApprovedListingById,
	listApprovedListingIds,
} from '@/features/properties/db';
import { ListingDetailView } from '@/components/listings/ListingDetailView';

type ListingPageProps = {
	params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
	const ids = await listApprovedListingIds();
	return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
	const { id } = await params;
	const listing = await getApprovedListingById(id);
	if (!listing) {
		return { title: 'Listing not found' };
	}

	return {
		title: listing.propertyName,
		description: `${listing.propertyName} in ${listing.city}, ${listing.country}`,
		openGraph: {
			title: listing.propertyName,
			description: `${listing.propertyName} in ${listing.city}, ${listing.country}`,
			images: [{ url: listing.image }],
		},
	};
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
	const { id } = await params;
	const listing = await getApprovedListingById(id);

	if (!listing) {
		notFound();
	}

	return <ListingDetailView listing={listing} />;
}
