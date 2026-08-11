'use server';

import { redirect } from 'next/navigation';
import { completeUserOnboarding } from '@/features/users/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { onboardingSchema } from '@/features/users/schemas';
import { getPostAuthPath } from '@/features/users/postAuthPath';
import { formDataToObject, zodFieldErrors } from '@/lib/forms/formUtils';

export type OnboardingActionState = {
	error?: string;
	fieldErrors?: Partial<Record<string, string>>;
	values?: {
		firstName?: string;
		lastName?: string;
		phone?: string;
		role?: string;
	};
};

export async function completeOnboardingAction(
	_prev: OnboardingActionState,
	formData: FormData
): Promise<OnboardingActionState> {
	const { userId } = await getCurrentUser();
	if (!userId) {
		return { error: 'Sign in to continue' };
	}

	const values = formDataToObject(formData);
	const parsed = onboardingSchema.safeParse(values);

	if (!parsed.success) {
		return {
			fieldErrors: zodFieldErrors(onboardingSchema, values),
			values: {
				firstName: values.firstName,
				lastName: values.lastName,
				phone: values.phone,
				role: values.role,
			},
		};
	}

	let user;
	try {
		user = await completeUserOnboarding(userId, {
			firstName: parsed.data.firstName,
			lastName: parsed.data.lastName,
			phone: parsed.data.phone || null,
			role: parsed.data.role,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not update your profile';
		if (message.toLowerCase().includes('unique') || message.toLowerCase().includes('duplicate')) {
			return {
				fieldErrors: { phone: 'This phone number is already in use' },
				values: {
					firstName: values.firstName,
					lastName: values.lastName,
					phone: values.phone,
					role: values.role,
				},
			};
		}

		return {
			error: 'Could not update your profile',
			values: {
				firstName: values.firstName,
				lastName: values.lastName,
				phone: values.phone,
				role: values.role,
			},
		};
	}

	if (!user) {
		return { error: 'Could not update your profile' };
	}

	redirect(getPostAuthPath(user));
}
