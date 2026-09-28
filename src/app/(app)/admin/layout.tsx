import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const { user } = await getCurrentUser();
	if (!user) {
		redirect('/sign-in');
	}
	if (user.role !== 'PLATFORM_ADMIN') {
		redirect('/');
	}
	return children;
}
