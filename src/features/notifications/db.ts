import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { NotificationTable, UserTable } from '@/drizzle/schema';
import type { NotificationItem, NotificationType } from '@/features/notifications/types';

type CreateNotificationInput = {
	userId: string;
	type: NotificationType;
	title: string;
	body: string;
	href?: string | null;
};

function toItem(row: typeof NotificationTable.$inferSelect): NotificationItem {
	return {
		id: row.id,
		type: row.type,
		title: row.title,
		body: row.body,
		href: row.href,
		readAt: row.readAt?.toISOString() ?? null,
		createdAt: row.createdAt.toISOString(),
	};
}

export async function createNotification(input: CreateNotificationInput) {
	const [row] = await db
		.insert(NotificationTable)
		.values({
			userId: input.userId,
			type: input.type,
			title: input.title,
			body: input.body,
			href: input.href ?? null,
		})
		.returning();
	return row ? toItem(row) : null;
}

export async function createNotifications(
	inputs: CreateNotificationInput[]
): Promise<number> {
	if (inputs.length === 0) return 0;
	const rows = await db
		.insert(NotificationTable)
		.values(
			inputs.map((input) => ({
				userId: input.userId,
				type: input.type,
				title: input.title,
				body: input.body,
				href: input.href ?? null,
			}))
		)
		.returning({ id: NotificationTable.id });
	return rows.length;
}

export async function listNotificationsForUser(userId: string, limit = 50) {
	const rows = await db
		.select()
		.from(NotificationTable)
		.where(eq(NotificationTable.userId, userId))
		.orderBy(desc(NotificationTable.createdAt))
		.limit(limit);
	return rows.map(toItem);
}

export async function countUnreadNotifications(userId: string) {
	const rows = await db
		.select({ id: NotificationTable.id })
		.from(NotificationTable)
		.where(
			and(eq(NotificationTable.userId, userId), isNull(NotificationTable.readAt))
		);
	return rows.length;
}

export async function markNotificationRead(userId: string, notificationId: string) {
	const [row] = await db
		.update(NotificationTable)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(NotificationTable.id, notificationId),
				eq(NotificationTable.userId, userId),
				isNull(NotificationTable.readAt)
			)
		)
		.returning();
	return row ? toItem(row) : null;
}

export async function markAllNotificationsRead(userId: string) {
	const rows = await db
		.update(NotificationTable)
		.set({ readAt: new Date() })
		.where(
			and(eq(NotificationTable.userId, userId), isNull(NotificationTable.readAt))
		)
		.returning({ id: NotificationTable.id });
	return rows.length;
}

export async function listPlatformAdminIds() {
	const rows = await db
		.select({ id: UserTable.id })
		.from(UserTable)
		.where(
			and(eq(UserTable.role, 'PLATFORM_ADMIN'), eq(UserTable.isDeleted, false))
		);
	return rows.map((row) => row.id);
}

export async function listNotificationsByIds(ids: string[]) {
	if (ids.length === 0) return [];
	const rows = await db
		.select()
		.from(NotificationTable)
		.where(inArray(NotificationTable.id, ids));
	return rows.map(toItem);
}
