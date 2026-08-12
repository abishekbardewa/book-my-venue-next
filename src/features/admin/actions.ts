'use server';

import { revalidatePath } from 'next/cache';
import {
	approvePropertyListing,
	rejectPropertyListing,
} from '@/features/properties/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';

async function requirePlatformAdmin() {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return { error: 'Sign in to continue' as const, userId: null };
	}
	if (user.role !== 'PLATFORM_ADMIN') {
		return { error: 'Admin access required' as const, userId: null };
	}
	return { error: null, userId };
}

export async function approveListingAction(propertyId: string): Promise<void> {
	const auth = await requirePlatformAdmin();
	if (auth.error || !auth.userId) {
		return;
	}

	await approvePropertyListing(propertyId, auth.userId);
	revalidatePath('/admin');
	revalidatePath(`/admin/listings/${propertyId}`);
	revalidatePath(`/listings/${propertyId}`);
	revalidatePath('/');
}

export async function rejectListingAction(
	propertyId: string,
	formData: FormData
): Promise<void> {
	const auth = await requirePlatformAdmin();
	if (auth.error || !auth.userId) {
		return;
	}

	const reason = String(formData.get('reason') ?? '').trim();
	if (!reason) {
		return;
	}

	await rejectPropertyListing(propertyId, auth.userId, reason);
	revalidatePath('/admin');
	revalidatePath(`/admin/listings/${propertyId}`);
	revalidatePath(`/listings/${propertyId}`);
	revalidatePath('/');
}
