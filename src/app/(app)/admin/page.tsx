import type { Metadata } from 'next';
import { AdminListingList } from '@/features/admin/components/AdminListingList';
import { listModerationListings } from '@/features/properties/db';

export const metadata: Metadata = {
	title: 'Admin',
	robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
	const listings = await listModerationListings();

	return (
		<section className="page-container space-y-8 py-10">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Listing moderation</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Review submitted properties. Approved listings appear on the public site.
				</p>
			</div>
			<AdminListingList listings={listings} />
		</section>
	);
}
