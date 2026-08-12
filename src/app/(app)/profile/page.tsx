import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProfileSettings } from '@/features/users/components/ProfileSettings';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export const metadata: Metadata = {
	title: 'Profile',
	robots: { index: false, follow: false },
};

export default async function ProfilePage() {
	const { user } = await getCurrentUser();
	if (!user) {
		redirect('/sign-in');
	}

	return (
		<section className="page-container py-10">
			<ProfileSettings user={user} />
		</section>
	);
}
