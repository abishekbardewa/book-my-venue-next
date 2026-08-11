import type { Metadata } from 'next';
import { SignInForm } from '@/features/users/components/SignInForm';

export const metadata: Metadata = {
	title: 'Sign in',
	robots: { index: false, follow: false },
};

export default function SignInPage() {
	return (
		<section className="page-container py-10 sm:py-14">
			<div className="mx-auto mb-8 max-w-md text-center">
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Sign in</h1>
				<p className="mt-2 text-sm text-muted-foreground">Welcome back to Book My Venue.</p>
			</div>
			<SignInForm />
		</section>
	);
}
