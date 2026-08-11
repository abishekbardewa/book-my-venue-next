'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
	createProperty,
	getOwnerProperty,
	hardDeleteProperty,
	restoreProperty,
	softDeleteProperty,
	updateProperty,
} from '@/features/properties/db';
import {
	propertyDraftSchema,
	propertySubmitSchema,
	type PropertyFormValues,
} from '@/features/properties/schemas';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export type PropertyActionState = {
	error?: string;
	fieldErrors?: Partial<Record<string, string>>;
	propertyId?: string;
};

async function requireOwner() {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return { error: 'Sign in to continue' as const, userId: null, user: null };
	}
	if (user.role !== 'OWNER' && user.role !== 'PLATFORM_ADMIN') {
		return { error: 'Owner access required' as const, userId: null, user: null };
	}
	return { error: null, userId, user };
}

function toFieldErrors(error: {
	issues: { path: (string | number)[]; message: string }[];
}): Partial<Record<string, string>> {
	const fieldErrors: Partial<Record<string, string>> = {};
	for (const issue of error.issues) {
		const field = issue.path[0];
		if (typeof field === 'string' && !fieldErrors[field]) {
			fieldErrors[field] = issue.message;
		}
	}
	return fieldErrors;
}

export async function savePropertyDraftAction(
	values: PropertyFormValues
): Promise<PropertyActionState> {
	const auth = await requireOwner();
	if (auth.error || !auth.userId) {
		return { error: auth.error ?? 'Sign in to continue' };
	}

	const parsed = propertyDraftSchema.safeParse(values);
	if (!parsed.success) {
		return { fieldErrors: toFieldErrors(parsed.error) };
	}

	const payload = {
		...parsed.data,
		isDraft: true as const,
		listingStatus: null,
	};

	try {
		if (parsed.data.id) {
			const existing = await getOwnerProperty(parsed.data.id, auth.userId);
			if (!existing || existing.isDeleted) {
				return { error: 'Property not found' };
			}
			const updated = await updateProperty(parsed.data.id, auth.userId, payload);
			if (!updated) {
				return { error: 'Could not save draft' };
			}
			revalidatePath('/owner');
			revalidatePath(`/owner/properties/${updated.id}/edit`);
			return { propertyId: updated.id };
		}

		const created = await createProperty(auth.userId, payload);
		revalidatePath('/owner');
		return { propertyId: created.id };
	} catch {
		return { error: 'Could not save draft' };
	}
}

export async function submitPropertyForReviewAction(
	values: PropertyFormValues
): Promise<PropertyActionState> {
	const auth = await requireOwner();
	if (auth.error || !auth.userId) {
		return { error: auth.error ?? 'Sign in to continue' };
	}

	const parsed = propertySubmitSchema.safeParse(values);
	if (!parsed.success) {
		return { fieldErrors: toFieldErrors(parsed.error) };
	}

	const payload = {
		...parsed.data,
		isDraft: false as const,
		listingStatus: 'PENDING_REVIEW' as const,
	};

	try {
		if (parsed.data.id) {
			const existing = await getOwnerProperty(parsed.data.id, auth.userId);
			if (!existing || existing.isDeleted) {
				return { error: 'Property not found' };
			}
			const updated = await updateProperty(parsed.data.id, auth.userId, payload);
			if (!updated) {
				return { error: 'Could not submit property' };
			}
			revalidatePath('/owner');
			redirect('/owner');
		}

		await createProperty(auth.userId, payload);
		revalidatePath('/owner');
		redirect('/owner');
	} catch (error) {
		if (error && typeof error === 'object' && 'digest' in error) {
			throw error;
		}
		return { error: 'Could not submit property' };
	}
}

export async function archivePropertyAction(propertyId: string): Promise<PropertyActionState> {
	const auth = await requireOwner();
	if (auth.error || !auth.userId) {
		return { error: auth.error ?? 'Sign in to continue' };
	}

	const property = await softDeleteProperty(propertyId, auth.userId);
	if (!property) {
		return { error: 'Property not found' };
	}
	revalidatePath('/owner');
	return { propertyId: property.id };
}

export async function restorePropertyAction(propertyId: string): Promise<PropertyActionState> {
	const auth = await requireOwner();
	if (auth.error || !auth.userId) {
		return { error: auth.error ?? 'Sign in to continue' };
	}

	const property = await restoreProperty(propertyId, auth.userId);
	if (!property) {
		return { error: 'Property not found' };
	}
	revalidatePath('/owner');
	return { propertyId: property.id };
}

export async function deletePropertyForeverAction(
	propertyId: string
): Promise<PropertyActionState> {
	const auth = await requireOwner();
	if (auth.error || !auth.userId) {
		return { error: auth.error ?? 'Sign in to continue' };
	}

	const deleted = await hardDeleteProperty(propertyId, auth.userId);
	if (!deleted) {
		return { error: 'Only archived properties can be permanently deleted' };
	}
	revalidatePath('/owner');
	return {};
}
