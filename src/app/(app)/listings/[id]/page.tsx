import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	getApprovedListingById,
	listApprovedListingIds,
} from '@/features/properties/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';
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
	const [listing, { user }] = await Promise.all([
		getApprovedListingById(id),
		getCurrentUser(),
	]);

	if (!listing) {
		notFound();
	}

	return (
		<ListingDetailView
			listing={listing}
			currentUser={
				user
					? {
							id: user.id,
							role: user.role,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email,
							phone: user.phone,
							avatar: user.avatar,
						}
					: null
			}
		/>
	);
}
