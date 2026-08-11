import type { AppUserRole } from '@/features/users/db';

export function getPostAuthPath(user: { isOnboarded: boolean; role: AppUserRole }) {
	if (!user.isOnboarded) {
		return '/onboarding';
	}

	switch (user.role) {
		case 'OWNER':
			return '/owner';
		case 'PLATFORM_ADMIN':
			return '/admin';
		default:
			return '/';
	}
}
