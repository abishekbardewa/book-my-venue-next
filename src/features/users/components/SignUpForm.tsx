'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signUpAction, type AuthFormState } from '@/features/users/authActions';
import { PasswordInput } from '@/features/users/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthFormState = {};

export function SignUpForm() {
	const [state, formAction, pending] = useActionState(signUpAction, initialState);

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
						autoComplete="new-password"
						defaultValue={state.values?.password ?? ''}
					/>
					<FieldError message={state.fieldErrors?.password} />
				</div>
				<FieldError message={state.error} />
				<Button type="submit" className="w-full" size="lg" disabled={pending}>
					{pending ? 'Creating account...' : 'Create account'}
				</Button>
			</form>

			<Button type="button" variant="outline" className="w-full" size="lg" disabled>
				Continue with Google
			</Button>

			<p className="text-center text-sm text-muted-foreground">
				Already have an account?{' '}
				<Link
					href="/sign-in"
					className="font-medium text-foreground underline-offset-4 hover:underline"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
