import type { Metadata } from 'next';
import { AdminListingList } from '@/features/admin/components/AdminListingList';
import { listModerationListings } from '@/features/properties/db';

export const metadata: Metadata = {
	title: 'Listings Management',
	robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
	const listings = await listModerationListings();

	return (
		<section className="page-container-wide py-10 sm:py-14">
			<AdminListingList listings={listings} />
		</section>
	);
}
