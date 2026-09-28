import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { OnboardingForm } from '@/features/users/components/OnboardingForm';
import { getPostAuthPath } from '@/features/users/postAuthPath';

export const metadata: Metadata = {
	title: 'Complete your profile',
	robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		redirect('/sign-in');
	}

	if (user.isOnboarded) {
		redirect(getPostAuthPath(user));
	}

	return (
		<AuthShell className="bg-background">
			<OnboardingForm user={user} />
		</AuthShell>
	);
}
