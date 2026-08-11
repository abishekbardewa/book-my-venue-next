import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
	const { user } = await getCurrentUser();
	if (!user) {
		redirect('/sign-in');
	}
	if (user.role !== 'OWNER' && user.role !== 'PLATFORM_ADMIN') {
		redirect('/');
	}
	return children;
}
