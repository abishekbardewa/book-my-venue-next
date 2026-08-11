import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { UserTable } from '@/drizzle/schema';

export type AppUser = typeof UserTable.$inferSelect;
export type AppUserRole = AppUser['role'];

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
	}
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
