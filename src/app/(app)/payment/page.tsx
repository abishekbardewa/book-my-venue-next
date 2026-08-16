import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PaymentView } from '@/features/payments/components/PaymentView';
import { getBookingById } from '@/features/bookings/db';
import { expirePendingBooking } from '@/features/bookings/domain';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export const metadata: Metadata = {
	title: 'Confirm and Pay',
	robots: { index: false, follow: false },
};

type PaymentPageProps = {
	searchParams: Promise<{ id?: string }>;
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
	const [{ id }, { user, userId }] = await Promise.all([
		searchParams,
		getCurrentUser(),
	]);
	if (!user) redirect('/sign-in');
	if (!id || !userId) redirect('/');

	await expirePendingBooking(id);
	const booking = await getBookingById(id);
	if (
		!booking ||
		booking.user.id !== userId ||
		booking.bookingStatus !== 'PENDING'
	) {
		redirect('/');
	}

	return (
		<PaymentView
			booking={booking}
			currentUser={{
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
			}}
		/>
	);
}
