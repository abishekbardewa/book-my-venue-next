'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signInAction, type AuthFormState } from '@/features/users/authActions';
import { PasswordInput } from '@/features/users/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthFormState = {};

export function SignInForm() {
	const [state, formAction, pending] = useActionState(signInAction, initialState);

	return (
		<div className="mx-auto w-full max-w-md space-y-6">
			<form key={JSON.stringify(state.values ?? {})} action={formAction} noValidate className="space-y-4">
				<div className="space-y-1.5">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="you@example.com"
						defaultValue={state.values?.email ?? ''}
					/>
					<FieldError message={state.fieldErrors?.email} />
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="password">Password</Label>
					<PasswordInput
						id="password"
						name="password"
						autoComplete="current-password"
						defaultValue={state.values?.password ?? ''}
					/>
					<FieldError message={state.fieldErrors?.password} />
				</div>
				<FieldError message={state.error} />
				<Button type="submit" className="w-full" size="lg" disabled={pending}>
					{pending ? 'Signing in...' : 'Sign in'}
				</Button>
			</form>

			<Button type="button" variant="outline" className="w-full" size="lg" disabled>
				Continue with Google
			</Button>

			<p className="text-center text-sm text-muted-foreground">
				Don't have an account?{' '}
				<Link
					href="/sign-up"
					className="font-medium text-foreground underline-offset-4 hover:underline"
				>
					Sign up
				</Link>
			</p>
		</div>
	);
}
