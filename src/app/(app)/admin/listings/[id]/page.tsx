import { notFound } from 'next/navigation';
import { AdminListingDetailView } from '@/features/admin/components/AdminListingDetailView';
import { getModerationListingById } from '@/features/properties/db';

type AdminListingDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function AdminListingDetailPage({
	params,
}: AdminListingDetailPageProps) {
	const { id } = await params;
	const listing = await getModerationListingById(id);

	if (!listing) {
		notFound();
	}

	return <AdminListingDetailView listing={listing} />;
}
