import type { Metadata } from 'next';
import { OwnerBookings } from '@/features/bookings/components/OwnerBookings';

export const metadata: Metadata = {
	title: 'Bookings',
	robots: { index: false, follow: false },
};

export default function OwnerBookingsPage() {
	return (
		<section className="page-container py-10">
			<OwnerBookings />
		</section>
	);
}
