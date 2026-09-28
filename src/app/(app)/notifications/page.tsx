import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { NotificationsView } from '@/features/notifications/components/NotificationsView';
import { listNotificationsForUser } from '@/features/notifications/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export const metadata: Metadata = {
	title: 'Notifications',
	robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
	const { user, userId } = await getCurrentUser();
	if (!user || !userId) redirect('/sign-in');

	const notifications = await listNotificationsForUser(userId);

	return <NotificationsView notifications={notifications} />;
}
