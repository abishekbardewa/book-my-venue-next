import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { SignUpForm } from '@/features/users/components/SignUpForm';

export const metadata: Metadata = {
	title: 'Sign up',
	robots: { index: false, follow: false },
};

export default function SignUpPage() {
	return (
		<AuthShell split>
			<SignUpForm />
		</AuthShell>
	);
}
