import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PropertyForm } from '@/features/properties/components/PropertyForm';
import { getOwnerProperty } from '@/features/properties/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export const metadata: Metadata = {
	title: 'Edit property',
	robots: { index: false, follow: false },
};

type EditPropertyPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
	const { id } = await params;
	const { userId } = await getCurrentUser();
	if (!userId) {
		redirect('/sign-in');
	}

	const property = await getOwnerProperty(id, userId);
	if (!property || property.isDeleted) {
		notFound();
	}

	return (
		<section className="page-container py-10">
			<PropertyForm
				initialValues={{
					id: property.id,
					propertyName: property.propertyName,
					description: property.description ?? '',
					capacity: property.capacity ?? '',
					price: property.price ?? '',
					checkInTime: property.checkInTime ?? '',
					checkOutTime: property.checkOutTime ?? '',
					address: property.address ?? '',
					city: property.city ?? '',
					country: property.country ?? 'India',
					pincode: property.pincode ?? '',
					extraInfo: property.extraInfo ?? '',
					tags: property.tags,
					amenities: property.amenities,
				}}
			/>
		</section>
	);
}
