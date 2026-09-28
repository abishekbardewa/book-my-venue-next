import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { OwnerBookingDetailView } from '@/features/bookings/components/OwnerBookingDetailView';
import { getBookingById } from '@/features/bookings/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export const metadata: Metadata = {
	title: 'Booking Details',
	robots: { index: false, follow: false },
};

type OwnerBookingDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function OwnerBookingDetailPage({ params }: OwnerBookingDetailPageProps) {
	const { id } = await params;
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) redirect('/sign-in');
	if (user.role !== 'OWNER' && user.role !== 'PLATFORM_ADMIN') {
		redirect('/');
	}

	const booking = await getBookingById(id);
	if (!booking) notFound();
	if (user.role === 'OWNER' && booking.property.ownerId !== userId) {
		notFound();
	}

	return <OwnerBookingDetailView booking={booking} />;
}
