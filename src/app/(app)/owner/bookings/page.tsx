import type { Metadata } from 'next';
import { OwnerBookings } from '@/features/bookings/components/OwnerBookings';

export const metadata: Metadata = {
	title: 'Manage Bookings',
	robots: { index: false, follow: false },
};

export default function OwnerBookingsPage() {
	return (
		<section className="page-container-wide py-10 sm:py-14">
			<OwnerBookings />
		</section>
	);
}
