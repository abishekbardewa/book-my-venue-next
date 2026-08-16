import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CustomerBookings } from '@/features/bookings/components/CustomerBookings';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export const metadata: Metadata = {
	title: 'My Bookings',
	robots: { index: false, follow: false },
};

export default async function CustomerBookingsPage() {
	const { user } = await getCurrentUser();
	if (!user) redirect('/sign-in');
	if (user.role !== 'CUSTOMER') redirect('/');

	return (
		<section className="page-container py-10">
			<CustomerBookings />
		</section>
	);
}
