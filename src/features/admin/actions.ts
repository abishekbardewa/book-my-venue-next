'use server';

import { revalidatePath } from 'next/cache';
import {
	notifyListingApproved,
	notifyListingRejected,
} from '@/features/notifications/emit';
import {
	approvePropertyListing,
	rejectPropertyListing,
} from '@/features/properties/db';
import {
	formatListingRejectionMessage,
	getListingRejectionReason,
	type ListingRejectionReasonCode,
} from '@/features/properties/rejectionReasons';
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

	const property = await approvePropertyListing(propertyId, auth.userId);
	if (!property) {
		return;
	}

	try {
		await notifyListingApproved(propertyId);
	} catch (error) {
		console.error('Could not notify listing approved:', error);
	}

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

	const reasonCode = String(formData.get('reasonCode') ?? '').trim();
	const note = String(formData.get('reasonNote') ?? '').trim();
	const reason = getListingRejectionReason(reasonCode);
	if (!reason) {
		return;
	}
	if (reason.code === 'OTHER' && !note) {
		return;
	}

	const displayReason = formatListingRejectionMessage(
		reason.code as ListingRejectionReasonCode,
		note
	);

	const property = await rejectPropertyListing(propertyId, auth.userId, {
		reasonCode: reason.code,
		reason: displayReason,
		allowsResubmit: reason.allowsResubmit,
	});
	if (!property) {
		return;
	}

	try {
		await notifyListingRejected(propertyId, displayReason);
	} catch (error) {
		console.error('Could not notify listing rejected:', error);
	}

	revalidatePath('/admin');
	revalidatePath(`/admin/listings/${propertyId}`);
	revalidatePath(`/listings/${propertyId}`);
	revalidatePath('/owner');
	revalidatePath('/');
}
