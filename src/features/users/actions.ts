'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { completeUserOnboarding, updateUserProfile } from '@/features/users/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { onboardingSchema, profileSchema } from '@/features/users/schemas';
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

export type ProfileActionState = {
	error?: string;
	success?: boolean;
	fieldErrors?: Partial<Record<string, string>>;
	values?: {
		firstName?: string;
		lastName?: string;
		phone?: string;
	};
};

export async function updateProfileAction(
	_prev: ProfileActionState,
	formData: FormData
): Promise<ProfileActionState> {
	const { userId } = await getCurrentUser();
	if (!userId) {
		return { error: 'Sign in to continue' };
	}

	const values = formDataToObject(formData);
	const parsed = profileSchema.safeParse(values);

	if (!parsed.success) {
		return {
			fieldErrors: zodFieldErrors(profileSchema, values),
			values: {
				firstName: values.firstName,
				lastName: values.lastName,
				phone: values.phone,
			},
		};
	}

	try {
		const user = await updateUserProfile(userId, {
			firstName: parsed.data.firstName,
			lastName: parsed.data.lastName,
			phone: parsed.data.phone,
		});

		if (!user) {
			return {
				error: 'Could not update your profile',
				values: {
					firstName: values.firstName,
					lastName: values.lastName,
					phone: values.phone,
				},
			};
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not update your profile';
		if (message.toLowerCase().includes('unique') || message.toLowerCase().includes('duplicate')) {
			return {
				fieldErrors: { phone: 'This phone number is already in use' },
				values: {
					firstName: values.firstName,
					lastName: values.lastName,
					phone: values.phone,
				},
			};
		}

		return {
			error: 'Could not update your profile',
			values: {
				firstName: values.firstName,
				lastName: values.lastName,
				phone: values.phone,
			},
		};
	}

	revalidatePath('/profile');
	return {
		success: true,
		values: {
			firstName: parsed.data.firstName,
			lastName: parsed.data.lastName,
			phone: parsed.data.phone,
		},
	};
}
