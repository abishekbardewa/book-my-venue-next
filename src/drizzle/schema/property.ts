import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '../schemaHelpers';
import { UserTable } from './user';

export const listingStatusEnum = pgEnum('listing_status', [
	'PENDING_REVIEW',
	'APPROVED',
	'REJECTED',
]);

export const PropertyTable = pgTable('properties', {
	id,
	propertyName: varchar().notNull(),
	description: varchar({ length: 600 }).notNull(),
	capacity: varchar().notNull(),
	price: varchar().notNull(),
	checkInTime: varchar().notNull(),
	checkOutTime: varchar().notNull(),
	address: varchar({ length: 300 }).notNull(),
	city: varchar().notNull(),
	country: varchar().notNull(),
	pincode: varchar(),
	lat: varchar(),
	lng: varchar(),
	extraInfo: varchar({ length: 400 }),
	isDraft: boolean().notNull().default(false),
	listingStatus: listingStatusEnum(),
	listingRejectionReason: text(),
	listingReviewedBy: uuid().references(() => UserTable.id),
	listingReviewedAt: timestamp({ withTimezone: true }),
	ownerId: uuid()
		.notNull()
		.references(() => UserTable.id),
	createdAt,
	updatedAt,
	isDeleted: boolean().notNull().default(false),
});

export const PropertyImageTable = pgTable('property_images', {
	id,
	imgUrl: varchar().notNull(),
	caption: varchar(),
	propertyId: uuid()
		.notNull()
		.references(() => PropertyTable.id),
});

export const AmenityTable = pgTable('amenities', {
	id,
	amenityName: varchar().notNull(),
	propertyId: uuid()
		.notNull()
		.references(() => PropertyTable.id),
});

export const TagTable = pgTable('tags', {
	id,
	tagName: varchar().notNull(),
});

export const PropertyTagTable = pgTable('property_tags', {
	id,
	propertyId: uuid()
		.notNull()
		.references(() => PropertyTable.id),
	tagId: uuid()
		.notNull()
		.references(() => TagTable.id),
});
