import { boolean, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '../schemaHelpers';

export const rolesEnum = pgEnum('roles', ['CUSTOMER', 'OWNER', 'PLATFORM_ADMIN']);

export const UserTable = pgTable('users', {
	id,
	email: varchar().notNull().unique(),
	password: varchar(),
	firstName: varchar(),
	lastName: varchar(),
	phone: varchar().unique(),
	role: rolesEnum().notNull().default('CUSTOMER'),
	avatar: varchar(),
	isOnboarded: boolean().notNull().default(false),
	createdAt,
	updatedAt,
	isDeleted: boolean().notNull().default(false),
});
