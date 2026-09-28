'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { arePayoutsEnabled } from '@/features/payments/payouts';
import { completeUserOnboarding, updateUserPassword, updateUserProfile } from '@/features/users/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { changePasswordSchema, onboardingSchema, profileSchema } from '@/features/users/schemas';
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

	if (user.role === 'OWNER' && arePayoutsEnabled()) {
		redirect('/owner?payoutPrompt=1');
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
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
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
		const removeAvatar = values.removeAvatar === 'true';
		const avatarUrl = values.avatarUrl?.trim() || '';
		const avatarImagekitFileId = values.avatarImagekitFileId?.trim() || '';

		if (removeAvatar && user.avatarImagekitFileId) {
			const { deleteImageKitFile } = await import('@/features/uploads/imagekit');
			await deleteImageKitFile(user.avatarImagekitFileId);
		}

		if (avatarUrl && avatarImagekitFileId && user.avatarImagekitFileId) {
			const { deleteImageKitFile } = await import('@/features/uploads/imagekit');
			await deleteImageKitFile(user.avatarImagekitFileId);
		}

		const updated = await updateUserProfile(userId, {
			firstName: parsed.data.firstName,
			lastName: parsed.data.lastName,
			phone: parsed.data.phone,
			...(removeAvatar
				? { avatar: null, avatarImagekitFileId: null }
				: avatarUrl && avatarImagekitFileId
					? { avatar: avatarUrl, avatarImagekitFileId }
					: {}),
		});

		if (!updated) {
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

	revalidatePath('/settings');
	return {
		success: true,
		values: {
			firstName: parsed.data.firstName,
			lastName: parsed.data.lastName,
			phone: parsed.data.phone,
		},
	};
}

export type ChangePasswordActionState = {
	error?: string;
	success?: boolean;
	fieldErrors?: Partial<Record<string, string>>;
};

export async function changePasswordAction(
	_prev: ChangePasswordActionState,
	formData: FormData
): Promise<ChangePasswordActionState> {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return { error: 'Sign in to continue' };
	}

	if (!user.password) {
		return { error: 'Password change is not available for this account' };
	}

	const values = formDataToObject(formData);
	const parsed = changePasswordSchema.safeParse(values);

	if (!parsed.success) {
		return {
			fieldErrors: zodFieldErrors(changePasswordSchema, values),
		};
	}

	const { compare, hash } = await import('bcryptjs');
	const valid = await compare(parsed.data.currentPassword, user.password);
	if (!valid) {
		return {
			fieldErrors: { currentPassword: 'Current password is incorrect' },
		};
	}

	const passwordHash = await hash(parsed.data.newPassword, 12);
	const updated = await updateUserPassword(userId, passwordHash);
	if (!updated) {
		return { error: 'Could not update your password' };
	}

	revalidatePath('/settings');
	return { success: true };
}
