import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ownerHasActivePayouts } from '@/features/payments/payouts';
import { PropertyForm } from '@/features/properties/components/PropertyForm';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export const metadata: Metadata = {
	title: 'Add property',
	robots: { index: false, follow: false },
};

export default async function NewPropertyPage() {
	const { user } = await getCurrentUser();
	if (!user || !ownerHasActivePayouts(user)) {
		redirect('/owner');
	}

	return (
		<section className="page-container-wide py-10 sm:py-14">
			<PropertyForm />
		</section>
	);
}
