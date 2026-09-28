'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { AuthDivider, authFieldClassName } from '@/components/auth/AuthDivider';
import { signUpAction, type AuthFormState } from '@/features/users/authActions';
import { GoogleSignInButton } from '@/features/users/components/GoogleSignInButton';
import { PasswordInput } from '@/features/users/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthFormState = {};

export function SignUpForm() {
	const [state, formAction, pending] = useActionState(signUpAction, initialState);

	return (
		<div className="w-full">
			<div className="mb-10">
				<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Create account
				</h1>
				<p className="mt-2 text-muted-foreground sm:text-lg">
					Create your exclusive account.
				</p>
			</div>

			<form
				key={JSON.stringify(state.values ?? {})}
				action={formAction}
				noValidate
				className="space-y-8"
			>
				<div className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							placeholder="jane@example.com"
							defaultValue={state.values?.email ?? ''}
							className={authFieldClassName}
						/>
						<FieldError message={state.fieldErrors?.email} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<PasswordInput
							id="password"
							name="password"
							autoComplete="new-password"
							defaultValue={state.values?.password ?? ''}
							className={authFieldClassName}
						/>
						<FieldError message={state.fieldErrors?.password} />
					</div>
				</div>

				<FieldError message={state.error} />

				<div className="pt-1">
					<Button type="submit" className="w-full" size="lg" disabled={pending}>
						{pending ? 'Creating account...' : 'Create Account'}
					</Button>
				</div>
			</form>

			<div className="mt-4 space-y-4">
				<AuthDivider />
				<GoogleSignInButton />
			</div>

			<p className="mt-10 text-center text-muted-foreground">
				Already have an account?{' '}
				<Link
					href="/sign-in"
					className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
