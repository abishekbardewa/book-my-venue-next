import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '../schemaHelpers';
import { BookingTable } from './booking';
import { PropertyTable } from './property';
import { UserTable } from './user';

export const ReviewTable = pgTable('reviews', {
	id,
	rating: integer().notNull(),
	body: varchar({ length: 250 }).notNull(),
	userId: uuid()
		.notNull()
		.references(() => UserTable.id),
	propertyId: uuid()
		.notNull()
		.references(() => PropertyTable.id),
	bookingId: uuid()
		.notNull()
		.unique()
		.references(() => BookingTable.id, { onDelete: 'cascade' }),
	createdAt,
	updatedAt,
});
