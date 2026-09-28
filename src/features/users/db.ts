import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { UserTable } from '@/drizzle/schema';

export type AppUser = typeof UserTable.$inferSelect;
export type AppUserRole = AppUser['role'];
export type PublicAppUser = Omit<AppUser, 'password'>;

export async function getUserById(id: string) {
	return db.query.UserTable.findFirst({
		where: eq(UserTable.id, id),
	});
}

export async function getUserByEmail(email: string) {
	return db.query.UserTable.findFirst({
		where: eq(UserTable.email, email),
	});
}

export async function findOrCreateGoogleUser(input: { email: string; firstName?: string | null; lastName?: string | null; avatar?: string | null }) {
	const email = input.email.toLowerCase();
	const existing = await getUserByEmail(email);
	if (existing) {
		if (existing.isDeleted) return null;
		if (existing.isOnboarded) return existing;

		const firstName = existing.firstName || input.firstName || null;
		const lastName = existing.lastName || input.lastName || null;
		const avatar = existing.avatar || input.avatar || null;
		if (firstName === existing.firstName && lastName === existing.lastName && avatar === existing.avatar) {
			return existing;
		}

		const [updated] = await db.update(UserTable).set({ firstName, lastName, avatar }).where(eq(UserTable.id, existing.id)).returning();
		return updated ?? existing;
	}

	try {
		const [created] = await db
			.insert(UserTable)
			.values({
				email,
				password: null,
				firstName: input.firstName || null,
				lastName: input.lastName || null,
				avatar: input.avatar || null,
				isOnboarded: false,
			})
			.returning();
		return created ?? null;
	} catch {
		const raced = await getUserByEmail(email);
		if (!raced || raced.isDeleted) return null;
		return raced;
	}
}

export async function createCredentialUser(input: { email: string; password: string }) {
	const [user] = await db
		.insert(UserTable)
		.values({
			email: input.email,
			password: input.password,
			isOnboarded: false,
		})
		.returning();

	return user;
}

export async function completeUserOnboarding(
	userId: string,
	input: {
		firstName: string;
		lastName: string;
		phone?: string | null;
		role: 'CUSTOMER' | 'OWNER';
	},
) {
	const [user] = await db
		.update(UserTable)
		.set({
			firstName: input.firstName,
			lastName: input.lastName,
			phone: input.phone || null,
			role: input.role,
			isOnboarded: true,
		})
		.where(eq(UserTable.id, userId))
		.returning();

	return user;
}

export async function updateUserProfile(
	userId: string,
	input: {
		firstName: string;
		lastName: string;
		phone: string;
		avatar?: string | null;
		avatarImagekitFileId?: string | null;
	},
) {
	const [user] = await db
		.update(UserTable)
		.set({
			firstName: input.firstName,
			lastName: input.lastName,
			phone: input.phone,
			...(input.avatar !== undefined ? { avatar: input.avatar } : {}),
			...(input.avatarImagekitFileId !== undefined ? { avatarImagekitFileId: input.avatarImagekitFileId } : {}),
		})
		.where(eq(UserTable.id, userId))
		.returning();

	return user;
}

export async function updateUserPassword(userId: string, passwordHash: string) {
	const [user] = await db.update(UserTable).set({ password: passwordHash }).where(eq(UserTable.id, userId)).returning();

	return user;
}
