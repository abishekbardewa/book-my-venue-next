import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export async function OnboardingGuard({ children }: { children: React.ReactNode }) {
	const { userId, user } = await getCurrentUser();
	if (!userId) {
		return children;
	}

	if (user && !user.isOnboarded) {
		redirect('/onboarding');
	}

	return children;
}
