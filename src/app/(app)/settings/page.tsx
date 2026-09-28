import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { arePayoutsEnabled } from '@/features/payments/payouts';
import { ProfileSettings } from '@/features/users/components/ProfileSettings';
import type { PublicAppUser } from '@/features/users/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export const metadata: Metadata = {
	title: 'Settings',
	robots: { index: false, follow: false },
};

type SettingsPageProps = {
	searchParams: Promise<{ tab?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
	const { user } = await getCurrentUser();
	if (!user) {
		redirect('/sign-in');
	}

	const params = await searchParams;
	const payoutsEnabled = arePayoutsEnabled();
	const hasPassword = Boolean(user.password);
	const initialTab =
		payoutsEnabled && params.tab === 'payouts' ? 'payouts' : 'account';

	const { password: _password, ...safeUser } = user;

	return (
		<section className="page-container-wide py-10 sm:py-14">
			<ProfileSettings
				user={safeUser as PublicAppUser}
				hasPassword={hasPassword}
				initialTab={initialTab}
				payoutsEnabled={payoutsEnabled}
			/>
		</section>
	);
}
