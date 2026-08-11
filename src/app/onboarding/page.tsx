import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
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
		<section className="page-container py-10 sm:py-14">
			<div className="mx-auto mb-8 max-w-lg text-center">
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Complete your profile</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Add a few details so we can set up your account.
				</p>
			</div>
			<OnboardingForm user={user} />
		</section>
	);
}
