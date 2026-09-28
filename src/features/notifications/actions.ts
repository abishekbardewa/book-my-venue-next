'use server';

import { revalidatePath } from 'next/cache';
import {
	markAllNotificationsRead,
	markNotificationRead,
} from '@/features/notifications/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export async function markNotificationReadAction(notificationId: string) {
	const { userId } = await getCurrentUser();
	if (!userId) return;
	await markNotificationRead(userId, notificationId);
	revalidatePath('/notifications');
	revalidatePath('/', 'layout');
}

export async function markAllNotificationsReadAction() {
	const { userId } = await getCurrentUser();
	if (!userId) return;
	await markAllNotificationsRead(userId);
	revalidatePath('/notifications');
	revalidatePath('/', 'layout');
}
