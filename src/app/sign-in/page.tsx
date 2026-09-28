import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { SignInForm } from '@/features/users/components/SignInForm';

export const metadata: Metadata = {
	title: 'Sign in',
	robots: { index: false, follow: false },
};

export default function SignInPage() {
	return (
		<AuthShell
			split
			splitTitle="Welcome back."
			splitDescription="Sign in to manage bookings and discover refined venues."
		>
			<SignInForm />
		</AuthShell>
	);
}
