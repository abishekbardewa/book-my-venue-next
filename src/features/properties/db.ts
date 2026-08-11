import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import {
	AmenityTable,
	PropertyImageTable,
	PropertyTable,
	PropertyTagTable,
	TagTable,
	UserTable,
} from '@/drizzle/schema';
import {
	VENUE_IMAGE_PLACEHOLDER,
	type PublicVenue,
} from '@/features/properties/types';

export type PropertyRow = typeof PropertyTable.$inferSelect;

export type PropertyWithRelations = PropertyRow & {
	amenities: string[];
	tags: string[];
};

type PropertyWriteInput = {
	propertyName: string;
	description?: string | null;
	capacity?: string | null;
	price?: string | null;
	checkInTime?: string | null;
	checkOutTime?: string | null;
	address?: string | null;
	city?: string | null;
	country?: string | null;
	pincode?: string | null;
	extraInfo?: string | null;
	isDraft: boolean;
	listingStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | null;
	tags: string[];
	amenities: string[];
};

function toColumns(input: PropertyWriteInput) {
	return {
		propertyName: input.propertyName,
		description: input.description?.trim() ? input.description : '',
		capacity: input.capacity?.trim() ? input.capacity : '',
		price: input.price?.trim() ? input.price : '',
		checkInTime: input.checkInTime?.trim() ? input.checkInTime : '',
		checkOutTime: input.checkOutTime?.trim() ? input.checkOutTime : '',
		address: input.address?.trim() ? input.address : '',
		city: input.city?.trim() ? input.city : '',
		country: input.country?.trim() ? input.country : 'India',
		pincode: input.pincode || null,
		extraInfo: input.extraInfo || null,
		isDraft: input.isDraft,
		listingStatus: input.listingStatus,
	};
}

async function syncTagsAndAmenities(
	propertyId: string,
	tags: string[],
	amenities: string[]
) {
	await db.delete(PropertyTagTable).where(eq(PropertyTagTable.propertyId, propertyId));
	await db.delete(AmenityTable).where(eq(AmenityTable.propertyId, propertyId));

	const uniqueTags = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
	for (const tagName of uniqueTags) {
		const [existing] = await db
			.select()
			.from(TagTable)
			.where(eq(TagTable.tagName, tagName))
			.limit(1);

		let tagId = existing?.id;
		if (!tagId) {
			const [created] = await db.insert(TagTable).values({ tagName }).returning({ id: TagTable.id });
			tagId = created?.id;
		}
		if (tagId) {
			await db.insert(PropertyTagTable).values({ propertyId, tagId });
		}
	}

	const uniqueAmenities = [...new Set(amenities.map((item) => item.trim()).filter(Boolean))];
	if (uniqueAmenities.length > 0) {
		await db.insert(AmenityTable).values(
			uniqueAmenities.map((amenityName) => ({ propertyId, amenityName }))
		);
	}
}

export async function createProperty(ownerId: string, input: PropertyWriteInput) {
	const [property] = await db
		.insert(PropertyTable)
		.values({
			...toColumns(input),
			ownerId,
		})
		.returning();

	if (!property) {
		throw new Error('Could not create property');
	}

	await syncTagsAndAmenities(property.id, input.tags, input.amenities);
	return property;
}

export async function updateProperty(
	propertyId: string,
	ownerId: string,
	input: PropertyWriteInput
) {
	const [property] = await db
		.update(PropertyTable)
		.set(toColumns(input))
		.where(
			and(
				eq(PropertyTable.id, propertyId),
				eq(PropertyTable.ownerId, ownerId),
				eq(PropertyTable.isDeleted, false)
			)
		)
		.returning();

	if (!property) {
		return null;
	}

	await syncTagsAndAmenities(property.id, input.tags, input.amenities);
	return property;
}

export async function getOwnerProperty(
	propertyId: string,
	ownerId: string
): Promise<PropertyWithRelations | null> {
	const [property] = await db
		.select()
		.from(PropertyTable)
		.where(and(eq(PropertyTable.id, propertyId), eq(PropertyTable.ownerId, ownerId)))
		.limit(1);

	if (!property) {
		return null;
	}

	const amenities = await db
		.select({ amenityName: AmenityTable.amenityName })
		.from(AmenityTable)
		.where(eq(AmenityTable.propertyId, propertyId));

	const tags = await db
		.select({ tagName: TagTable.tagName })
		.from(PropertyTagTable)
		.innerJoin(TagTable, eq(PropertyTagTable.tagId, TagTable.id))
		.where(eq(PropertyTagTable.propertyId, propertyId));

	return {
		...property,
		amenities: amenities.map((row) => row.amenityName),
		tags: tags.map((row) => row.tagName),
	};
}

export async function listOwnerProperties(ownerId: string) {
	return db
		.select()
		.from(PropertyTable)
		.where(eq(PropertyTable.ownerId, ownerId))
		.orderBy(desc(PropertyTable.updatedAt));
}

export async function softDeleteProperty(propertyId: string, ownerId: string) {
	const [property] = await db
		.update(PropertyTable)
		.set({ isDeleted: true })
		.where(
			and(
				eq(PropertyTable.id, propertyId),
				eq(PropertyTable.ownerId, ownerId),
				eq(PropertyTable.isDeleted, false)
			)
		)
		.returning();
	return property ?? null;
}

export async function restoreProperty(propertyId: string, ownerId: string) {
	const [property] = await db
		.update(PropertyTable)
		.set({ isDeleted: false })
		.where(
			and(
				eq(PropertyTable.id, propertyId),
				eq(PropertyTable.ownerId, ownerId),
				eq(PropertyTable.isDeleted, true)
			)
		)
		.returning();
	return property ?? null;
}

export async function hardDeleteProperty(propertyId: string, ownerId: string) {
	const [existing] = await db
		.select({ id: PropertyTable.id })
		.from(PropertyTable)
		.where(
			and(
				eq(PropertyTable.id, propertyId),
				eq(PropertyTable.ownerId, ownerId),
				eq(PropertyTable.isDeleted, true)
			)
		)
		.limit(1);

	if (!existing) {
		return false;
	}

	await db.delete(PropertyTagTable).where(eq(PropertyTagTable.propertyId, propertyId));
	await db.delete(AmenityTable).where(eq(AmenityTable.propertyId, propertyId));
	await db.delete(PropertyImageTable).where(eq(PropertyImageTable.propertyId, propertyId));
	await db.delete(PropertyTable).where(eq(PropertyTable.id, propertyId));
	return true;
}

const approvedFilter = and(
	eq(PropertyTable.isDeleted, false),
	eq(PropertyTable.isDraft, false),
	eq(PropertyTable.listingStatus, 'APPROVED')
);

function toPrice(value: string) {
	const parsed = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
	return Number.isFinite(parsed) ? parsed : 0;
}

function toCapacity(value: string) {
	const parsed = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
	return Number.isFinite(parsed) ? parsed : 0;
}

function ownerDisplayName(firstName: string | null, lastName: string | null, email: string) {
	const name = [firstName, lastName].filter(Boolean).join(' ').trim();
	return name || email.split('@')[0] || 'Owner';
}

async function attachVenueRelations(
	properties: (typeof PropertyTable.$inferSelect)[]
): Promise<PublicVenue[]> {
	if (properties.length === 0) {
		return [];
	}

	const ids = properties.map((property) => property.id);
	const ownerIds = [...new Set(properties.map((property) => property.ownerId))];

	const [images, amenities, tagRows, owners] = await Promise.all([
		db.select().from(PropertyImageTable).where(inArray(PropertyImageTable.propertyId, ids)),
		db.select().from(AmenityTable).where(inArray(AmenityTable.propertyId, ids)),
		db
			.select({
				propertyId: PropertyTagTable.propertyId,
				tagName: TagTable.tagName,
			})
			.from(PropertyTagTable)
			.innerJoin(TagTable, eq(PropertyTagTable.tagId, TagTable.id))
			.where(inArray(PropertyTagTable.propertyId, ids)),
		db.select().from(UserTable).where(inArray(UserTable.id, ownerIds)),
	]);

	const imagesByProperty = new Map<string, string[]>();
	for (const image of images) {
		const list = imagesByProperty.get(image.propertyId) ?? [];
		list.push(image.imgUrl);
		imagesByProperty.set(image.propertyId, list);
	}

	const amenitiesByProperty = new Map<string, string[]>();
	for (const amenity of amenities) {
		const list = amenitiesByProperty.get(amenity.propertyId) ?? [];
		list.push(amenity.amenityName);
		amenitiesByProperty.set(amenity.propertyId, list);
	}

	const tagsByProperty = new Map<string, string[]>();
	for (const row of tagRows) {
		const list = tagsByProperty.get(row.propertyId) ?? [];
		list.push(row.tagName);
		tagsByProperty.set(row.propertyId, list);
	}

	const ownerById = new Map(owners.map((owner) => [owner.id, owner]));

	return properties.map((property) => {
		const gallery = imagesByProperty.get(property.id) ?? [];
		const owner = ownerById.get(property.ownerId);
		return {
			id: property.id,
			propertyName: property.propertyName,
			city: property.city,
			country: property.country,
			price: toPrice(property.price),
			image: gallery[0] ?? VENUE_IMAGE_PLACEHOLDER,
			images: gallery.length > 0 ? gallery : [VENUE_IMAGE_PLACEHOLDER],
			tags: tagsByProperty.get(property.id) ?? [],
			address: property.address,
			description: property.description,
			extraInfo: property.extraInfo ?? '',
			capacity: toCapacity(property.capacity),
			amenities: amenitiesByProperty.get(property.id) ?? [],
			ownerName: owner
				? ownerDisplayName(owner.firstName, owner.lastName, owner.email)
				: 'Owner',
			reviews: [],
		};
	});
}

export async function listApprovedVenues(): Promise<PublicVenue[]> {
	const properties = await db
		.select()
		.from(PropertyTable)
		.where(approvedFilter)
		.orderBy(desc(PropertyTable.updatedAt));

	return attachVenueRelations(properties);
}

export async function getApprovedVenueById(id: string): Promise<PublicVenue | null> {
	const [property] = await db
		.select()
		.from(PropertyTable)
		.where(and(eq(PropertyTable.id, id), approvedFilter))
		.limit(1);

	if (!property) {
		return null;
	}

	const [venue] = await attachVenueRelations([property]);
	return venue ?? null;
}

export async function listApprovedVenueIds(): Promise<string[]> {
	const rows = await db
		.select({ id: PropertyTable.id })
		.from(PropertyTable)
		.where(approvedFilter);
	return rows.map((row) => row.id);
}
