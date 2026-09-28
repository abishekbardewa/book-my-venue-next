'use server';

import { revalidatePath } from 'next/cache';
import { arePayoutsEnabled, setupOwnerPayouts } from '@/features/payments/payouts';
import { payoutSetupSchema } from '@/features/payments/schemas';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { formDataToObject, zodFieldErrors } from '@/lib/forms/formUtils';

export type PayoutSetupActionState = {
	error?: string;
	success?: boolean;
	fieldErrors?: Partial<Record<string, string>>;
	values?: Record<string, string>;
};

export async function setupPayoutsAction(
	_prev: PayoutSetupActionState,
	formData: FormData
): Promise<PayoutSetupActionState> {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return { error: 'Sign in to continue' };
	}
	if (user.role !== 'OWNER' && user.role !== 'PLATFORM_ADMIN') {
		return { error: 'Owner access required' };
	}
	if (!arePayoutsEnabled()) {
		return { error: 'Payouts are not available yet' };
	}

	const values = formDataToObject(formData);
	const parsed = payoutSetupSchema.safeParse(values);
	if (!parsed.success) {
		return {
			fieldErrors: zodFieldErrors(payoutSetupSchema, values),
			values,
		};
	}

	try {
		await setupOwnerPayouts(user, {
			...parsed.data,
			street2: parsed.data.street2 || undefined,
		});
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Could not set up payouts',
			values,
		};
	}

	revalidatePath('/settings');
	revalidatePath('/owner');
	return { success: true };
}
