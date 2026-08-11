import type { Metadata } from 'next';
import { PropertyForm } from '@/features/properties/components/PropertyForm';

export const metadata: Metadata = {
	title: 'Add property',
	robots: { index: false, follow: false },
};

export default function NewPropertyPage() {
	return (
		<section className="page-container py-10">
			<PropertyForm />
		</section>
	);
}
