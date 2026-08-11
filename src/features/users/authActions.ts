'use server';

import { hash } from 'bcryptjs';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { signIn } from '@/auth';
import { createCredentialUser, getUserByEmail } from '@/features/users/db';
import { getPostAuthPath } from '@/features/users/postAuthPath';
import { formDataToObject, zodFieldErrors } from '@/lib/forms/formUtils';

const signUpSchema = z.object({
	email: z.string().trim().email('Enter a valid email'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signInSchema = z.object({
	email: z.string().trim().email('Enter a valid email'),
	password: z.string().min(1, 'Password is required'),
});

export type AuthFormValues = {
	email?: string;
	password?: string;
};

export type AuthFormState = {
	error?: string;
	fieldErrors?: Partial<Record<string, string>>;
	values?: AuthFormValues;
};

export async function signUpAction(
	_prev: AuthFormState,
	formData: FormData
): Promise<AuthFormState> {
	const values = formDataToObject(formData);
	const parsed = signUpSchema.safeParse(values);

	if (!parsed.success) {
		return {
			fieldErrors: zodFieldErrors(signUpSchema, values),
			values: { email: values.email, password: values.password },
		};
	}

	const email = parsed.data.email.toLowerCase();
	const existing = await getUserByEmail(email);
	if (existing) {
		return {
			fieldErrors: { email: 'An account with this email already exists' },
			values: { email: values.email, password: values.password },
		};
	}

	const password = await hash(parsed.data.password, 12);
	await createCredentialUser({ email, password });

	try {
		await signIn('credentials', {
			email,
			password: parsed.data.password,
			redirectTo: '/onboarding',
		});
	} catch (error) {
		if (error instanceof AuthError) {
			return {
				error: 'Account created, but sign-in failed. Try signing in.',
				values: { email: values.email },
			};
		}
		throw error;
	}

	return {};
}

export async function signInAction(
	_prev: AuthFormState,
	formData: FormData
): Promise<AuthFormState> {
	const values = formDataToObject(formData);
	const parsed = signInSchema.safeParse(values);

	if (!parsed.success) {
		return {
			fieldErrors: zodFieldErrors(signInSchema, values),
			values: { email: values.email, password: values.password },
		};
	}

	const email = parsed.data.email.toLowerCase();

	try {
		const result = await signIn('credentials', {
			email,
			password: parsed.data.password,
			redirect: false,
		});

		if (result?.error) {
			return {
				error: 'Invalid email or password',
				values: { email: values.email, password: values.password },
			};
		}
	} catch (error) {
		if (error instanceof AuthError) {
			return {
				error: 'Invalid email or password',
				values: { email: values.email, password: values.password },
			};
		}
		throw error;
	}

	const user = await getUserByEmail(email);
	if (!user || user.isDeleted) {
		return {
			error: 'Invalid email or password',
			values: { email: values.email, password: values.password },
		};
	}

	redirect(getPostAuthPath(user));
}
