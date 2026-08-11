import { cache } from 'react';
import { auth } from '@/auth';
import { getUserById } from '@/features/users/db';

export const getCurrentUser = cache(async () => {
	const session = await auth();
	const userId = session?.user?.id;

	if (!userId) {
		return { userId: null, user: null };
	}

	const user = await getUserById(userId);
	return { userId, user: user ?? null };
});
