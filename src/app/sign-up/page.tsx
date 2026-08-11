import type { Metadata } from 'next';
import { SignUpForm } from '@/features/users/components/SignUpForm';

export const metadata: Metadata = {
	title: 'Sign up',
	robots: { index: false, follow: false },
};

export default function SignUpPage() {
	return (
		<section className="page-container py-10 sm:py-14">
			<div className="mx-auto mb-8 max-w-md text-center">
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create account</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Book venues or list your property.
				</p>
			</div>
			<SignUpForm />
		</section>
	);
}
