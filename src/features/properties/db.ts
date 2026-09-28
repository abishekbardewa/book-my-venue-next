import { and, count, desc, eq, gt, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { AmenityTable, BookingTable, PropertyImageTable, PropertyTable, PropertyTagTable, TagTable, UserTable } from '@/drizzle/schema';
import { LISTING_IMAGE_PLACEHOLDER, type AdminListingDetail, type PublicListing } from '@/features/properties/types';
import { deleteReviewsForProperty, listReviewsForProperty } from '@/features/reviews/db';

export type PropertyRow = typeof PropertyTable.$inferSelect;

export type PropertyWithRelations = PropertyRow & {
	amenities: string[];
	tags: string[];
	images: Array<{
		id: string;
		imgUrl: string;
		imagekitFileId: string | null;
		caption: string | null;
	}>;
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
	lat?: string | null;
	lng?: string | null;
	extraInfo?: string | null;
	isDraft: boolean;
	listingStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | null;
	markSubmittedForReview?: boolean;
	tags: string[];
	amenities: string[];
	images?: Array<{
		imgUrl: string;
		imagekitFileId: string;
		caption?: string;
	}>;
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
		lat: input.lat?.trim() ? input.lat.trim() : null,
		lng: input.lng?.trim() ? input.lng.trim() : null,
		extraInfo: input.extraInfo || null,
		isDraft: input.isDraft,
		listingStatus: input.listingStatus,
	};
}

async function syncTagsAndAmenities(propertyId: string, tags: string[], amenities: string[]) {
	await db.delete(PropertyTagTable).where(eq(PropertyTagTable.propertyId, propertyId));
	await db.delete(AmenityTable).where(eq(AmenityTable.propertyId, propertyId));

	const uniqueTags = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
	for (const tagName of uniqueTags) {
		const [existing] = await db.select().from(TagTable).where(eq(TagTable.tagName, tagName)).limit(1);

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
		await db.insert(AmenityTable).values(uniqueAmenities.map((amenityName) => ({ propertyId, amenityName })));
	}
}

async function syncPropertyImages(propertyId: string, images?: Array<{ imgUrl: string; imagekitFileId: string; caption?: string }>) {
	if (images === undefined) {
		return;
	}

	const { deleteImageKitFiles } = await import('@/features/uploads/imagekit');
	const existing = await db.select().from(PropertyImageTable).where(eq(PropertyImageTable.propertyId, propertyId));

	const keepIds = new Set(images.map((image) => image.imagekitFileId));
	const removedIds = existing.map((row) => row.imagekitFileId).filter((fileId): fileId is string => Boolean(fileId) && !keepIds.has(fileId ?? ''));

	await deleteImageKitFiles(removedIds);
	await db.delete(PropertyImageTable).where(eq(PropertyImageTable.propertyId, propertyId));

	if (images.length === 0) {
		return;
	}

	await db.insert(PropertyImageTable).values(
		images.map((image) => ({
			propertyId,
			imgUrl: image.imgUrl,
			imagekitFileId: image.imagekitFileId,
			caption: image.caption || null,
		})),
	);
}

export async function createProperty(ownerId: string, input: PropertyWriteInput) {
	const [property] = await db
		.insert(PropertyTable)
		.values({
			...toColumns(input),
			ownerId,
			listingSubmissionCount: input.markSubmittedForReview || input.listingStatus === 'PENDING_REVIEW' ? 1 : 0,
			listingRejectionReason: null,
			listingRejectionReasonCode: null,
			listingAllowsResubmit: null,
		})
		.returning();

	if (!property) {
		throw new Error('Could not create property');
	}

	await syncTagsAndAmenities(property.id, input.tags, input.amenities);
	await syncPropertyImages(property.id, input.images);
	return property;
}

export async function updateProperty(propertyId: string, ownerId: string, input: PropertyWriteInput) {
	const [property] = await db
		.update(PropertyTable)
		.set({
			...toColumns(input),
			...(input.markSubmittedForReview
				? {
						listingRejectionReason: null,
						listingRejectionReasonCode: null,
						listingAllowsResubmit: null,
						listingSubmissionCount: sql`${PropertyTable.listingSubmissionCount} + 1`,
					}
				: {}),
		})
		.where(and(eq(PropertyTable.id, propertyId), eq(PropertyTable.ownerId, ownerId), eq(PropertyTable.isDeleted, false)))
		.returning();

	if (!property) {
		return null;
	}

	await syncTagsAndAmenities(property.id, input.tags, input.amenities);
	await syncPropertyImages(property.id, input.images);
	return property;
}

export async function getOwnerProperty(propertyId: string, ownerId: string): Promise<PropertyWithRelations | null> {
	const [property] = await db
		.select()
		.from(PropertyTable)
		.where(and(eq(PropertyTable.id, propertyId), eq(PropertyTable.ownerId, ownerId)))
		.limit(1);

	if (!property) {
		return null;
	}

	const amenities = await db.select({ amenityName: AmenityTable.amenityName }).from(AmenityTable).where(eq(AmenityTable.propertyId, propertyId));

	const tags = await db
		.select({ tagName: TagTable.tagName })
		.from(PropertyTagTable)
		.innerJoin(TagTable, eq(PropertyTagTable.tagId, TagTable.id))
		.where(eq(PropertyTagTable.propertyId, propertyId));

	const images = await db
		.select({
			id: PropertyImageTable.id,
			imgUrl: PropertyImageTable.imgUrl,
			imagekitFileId: PropertyImageTable.imagekitFileId,
			caption: PropertyImageTable.caption,
		})
		.from(PropertyImageTable)
		.where(eq(PropertyImageTable.propertyId, propertyId));

	return {
		...property,
		amenities: amenities.map((row) => row.amenityName),
		tags: tags.map((row) => row.tagName),
		images,
	};
}

export async function listOwnerProperties(ownerId: string) {
	const properties = await db.select().from(PropertyTable).where(eq(PropertyTable.ownerId, ownerId)).orderBy(desc(PropertyTable.updatedAt));

	if (properties.length === 0) {
		return [] as OwnerPropertyListItem[];
	}

	const ids = properties.map((property) => property.id);
	const [images, tagRows] = await Promise.all([
		db.select().from(PropertyImageTable).where(inArray(PropertyImageTable.propertyId, ids)),
		db
			.select({
				propertyId: PropertyTagTable.propertyId,
				tagName: TagTable.tagName,
			})
			.from(PropertyTagTable)
			.innerJoin(TagTable, eq(PropertyTagTable.tagId, TagTable.id))
			.where(inArray(PropertyTagTable.propertyId, ids)),
	]);

	const imageByProperty = new Map<string, string>();
	for (const image of images) {
		if (!imageByProperty.has(image.propertyId)) {
			imageByProperty.set(image.propertyId, image.imgUrl);
		}
	}

	const tagsByProperty = new Map<string, string[]>();
	for (const row of tagRows) {
		const list = tagsByProperty.get(row.propertyId) ?? [];
		list.push(row.tagName);
		tagsByProperty.set(row.propertyId, list);
	}

	return properties.map((property) => ({
		...property,
		image: imageByProperty.get(property.id) ?? LISTING_IMAGE_PLACEHOLDER,
		tags: tagsByProperty.get(property.id) ?? [],
	}));
}

export type OwnerPropertyListItem = PropertyRow & {
	image: string;
	tags: string[];
};

export async function softDeleteProperty(propertyId: string, ownerId: string) {
	const blocked = await propertyHasActiveBookings(propertyId);
	if (blocked) {
		return null;
	}

	const [property] = await db
		.update(PropertyTable)
		.set({ isDeleted: true })
		.where(and(eq(PropertyTable.id, propertyId), eq(PropertyTable.ownerId, ownerId), eq(PropertyTable.isDeleted, false)))
		.returning();
	return property ?? null;
}

export async function restoreProperty(propertyId: string, ownerId: string) {
	const [property] = await db
		.update(PropertyTable)
		.set({ isDeleted: false })
		.where(and(eq(PropertyTable.id, propertyId), eq(PropertyTable.ownerId, ownerId), eq(PropertyTable.isDeleted, true)))
		.returning();
	return property ?? null;
}

export async function hardDeleteProperty(propertyId: string, ownerId: string) {
	const blocked = await propertyHasActiveBookings(propertyId);
	if (blocked) {
		return false;
	}

	const [existing] = await db
		.select({ id: PropertyTable.id })
		.from(PropertyTable)
		.where(and(eq(PropertyTable.id, propertyId), eq(PropertyTable.ownerId, ownerId), eq(PropertyTable.isDeleted, true)))
		.limit(1);

	if (!existing) {
		return false;
	}

	const images = await db
		.select({ imagekitFileId: PropertyImageTable.imagekitFileId })
		.from(PropertyImageTable)
		.where(eq(PropertyImageTable.propertyId, propertyId));
	const { deleteImageKitFiles } = await import('@/features/uploads/imagekit');
	await deleteImageKitFiles(images.map((image) => image.imagekitFileId));

	await db.delete(PropertyTagTable).where(eq(PropertyTagTable.propertyId, propertyId));
	await db.delete(AmenityTable).where(eq(AmenityTable.propertyId, propertyId));
	await db.delete(PropertyImageTable).where(eq(PropertyImageTable.propertyId, propertyId));
	await deleteReviewsForProperty(propertyId);
	await db.delete(PropertyTable).where(eq(PropertyTable.id, propertyId));
	return true;
}

async function propertyHasActiveBookings(propertyId: string) {
	const [active] = await db
		.select({ id: BookingTable.id })
		.from(BookingTable)
		.where(and(eq(BookingTable.propertyId, propertyId), inArray(BookingTable.bookingStatus, ['AWAITING_OWNER_APPROVAL', 'CONFIRMED'])))
		.limit(1);
	return Boolean(active);
}

const approvedFilter = and(eq(PropertyTable.isDeleted, false), eq(PropertyTable.isDraft, false), eq(PropertyTable.listingStatus, 'APPROVED'));

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

async function attachListingRelations(properties: (typeof PropertyTable.$inferSelect)[]): Promise<PublicListing[]> {
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
			image: gallery[0] ?? LISTING_IMAGE_PLACEHOLDER,
			images: gallery.length > 0 ? gallery : [LISTING_IMAGE_PLACEHOLDER],
			tags: tagsByProperty.get(property.id) ?? [],
			address: property.address,
			lat: property.lat,
			lng: property.lng,
			description: property.description,
			extraInfo: property.extraInfo ?? '',
			capacity: toCapacity(property.capacity),
			amenities: amenitiesByProperty.get(property.id) ?? [],
			ownerName: owner ? ownerDisplayName(owner.firstName, owner.lastName, owner.email) : 'Owner',
			ownerFirstName: owner?.firstName ?? null,
			ownerLastName: owner?.lastName ?? null,
			ownerId: property.ownerId,
			ownerEmail: owner?.email ?? '',
			ownerPhone: owner?.phone ?? null,
			ownerAvatar: owner?.avatar ?? null,
			checkInTime: property.checkInTime,
			checkOutTime: property.checkOutTime,
			blockingBookings: [],
			reviews: [],
		};
	});
}

export async function listApprovedListings(): Promise<PublicListing[]> {
	const properties = await db.select().from(PropertyTable).where(approvedFilter).orderBy(desc(PropertyTable.updatedAt));

	return attachListingRelations(properties);
}

export async function listApprovedListingsPage(input: { city?: string; q?: string; tag?: string; page: number; limit: number }) {
	const page = Math.max(input.page, 1);
	const limit = Math.max(input.limit, 1);
	const offset = (page - 1) * limit;

	const filters = [approvedFilter];
	const city = input.city?.trim();
	if (city && city !== 'all') {
		filters.push(eq(PropertyTable.city, city));
	}

	const q = input.q?.trim();
	if (q) {
		filters.push(ilike(PropertyTable.propertyName, `%${q}%`));
	}

	const tag = input.tag?.trim();
	if (tag) {
		const tagged = await db
			.select({ propertyId: PropertyTagTable.propertyId })
			.from(PropertyTagTable)
			.innerJoin(TagTable, eq(PropertyTagTable.tagId, TagTable.id))
			.where(eq(TagTable.tagName, tag));
		const taggedIds = tagged.map((row) => row.propertyId);
		if (taggedIds.length === 0) {
			return {
				listings: [] as PublicListing[],
				totalCount: 0,
				page,
				limit,
				hasMore: false,
			};
		}
		filters.push(inArray(PropertyTable.id, taggedIds));
	}

	const where = and(...filters);
	const [[total], properties] = await Promise.all([
		db.select({ value: count() }).from(PropertyTable).where(where),
		db.select().from(PropertyTable).where(where).orderBy(desc(PropertyTable.updatedAt)).limit(limit).offset(offset),
	]);

	const totalCount = total?.value ?? 0;
	const listings = await attachListingRelations(properties);

	return {
		listings,
		totalCount,
		page,
		limit,
		hasMore: offset + listings.length < totalCount,
	};
}

export async function getApprovedListingById(id: string): Promise<PublicListing | null> {
	const [property] = await db
		.select()
		.from(PropertyTable)
		.where(and(eq(PropertyTable.id, id), approvedFilter))
		.limit(1);

	if (!property) {
		return null;
	}

	const [listing] = await attachListingRelations([property]);
	if (!listing) {
		return null;
	}

	const [blockingBookings, reviews] = await Promise.all([
		db
			.select({
				startDate: BookingTable.startDate,
				endDate: BookingTable.endDate,
			})
			.from(BookingTable)
			.where(
				and(
					eq(BookingTable.propertyId, id),
					or(
						inArray(BookingTable.bookingStatus, ['CONFIRMED', 'AWAITING_OWNER_APPROVAL']),
						and(eq(BookingTable.bookingStatus, 'PENDING'), gt(BookingTable.holdExpiresAt, new Date())),
					),
				),
			),
		listReviewsForProperty(id),
	]);

	return {
		...listing,
		blockingBookings: blockingBookings.map((booking) => ({
			startDate: booking.startDate.toISOString(),
			endDate: booking.endDate.toISOString(),
		})),
		reviews,
	};
}

const moderationFilter = and(
	eq(PropertyTable.isDeleted, false),
	eq(PropertyTable.isDraft, false),
	inArray(PropertyTable.listingStatus, ['PENDING_REVIEW', 'APPROVED', 'REJECTED']),
);

export async function getModerationListingById(id: string): Promise<AdminListingDetail | null> {
	const [property] = await db
		.select()
		.from(PropertyTable)
		.where(and(eq(PropertyTable.id, id), moderationFilter))
		.limit(1);

	if (!property) {
		return null;
	}

	const [listing] = await attachListingRelations([property]);
	if (!listing) {
		return null;
	}

	const [owner] = await db.select().from(UserTable).where(eq(UserTable.id, property.ownerId)).limit(1);
	const reviews = await listReviewsForProperty(id);

	return {
		...listing,
		reviews,
		listingStatus: property.listingStatus,
		ownerEmail: owner?.email ?? 'Unknown',
		listingRejectionReason: property.listingRejectionReason,
		listingRejectionReasonCode: property.listingRejectionReasonCode,
		listingAllowsResubmit: property.listingAllowsResubmit,
		listingSubmissionCount: property.listingSubmissionCount,
		listingReviewedAt: property.listingReviewedAt ? property.listingReviewedAt.toISOString() : null,
	};
}

export async function listApprovedListingIds(): Promise<string[]> {
	const rows = await db.select({ id: PropertyTable.id }).from(PropertyTable).where(approvedFilter);
	return rows.map((row) => row.id);
}

export type AdminListingRow = PropertyRow & {
	ownerEmail: string;
	ownerName: string;
	image: string;
	tags: string[];
};

export async function listModerationListings(): Promise<AdminListingRow[]> {
	const properties = await db
		.select()
		.from(PropertyTable)
		.where(
			and(
				eq(PropertyTable.isDeleted, false),
				eq(PropertyTable.isDraft, false),
				inArray(PropertyTable.listingStatus, ['PENDING_REVIEW', 'APPROVED', 'REJECTED']),
			),
		)
		.orderBy(desc(PropertyTable.updatedAt));

	if (properties.length === 0) {
		return [];
	}

	const ids = properties.map((property) => property.id);
	const ownerIds = [...new Set(properties.map((property) => property.ownerId))];
	const [owners, images, tagRows] = await Promise.all([
		db.select().from(UserTable).where(inArray(UserTable.id, ownerIds)),
		db.select().from(PropertyImageTable).where(inArray(PropertyImageTable.propertyId, ids)),
		db
			.select({
				propertyId: PropertyTagTable.propertyId,
				tagName: TagTable.tagName,
			})
			.from(PropertyTagTable)
			.innerJoin(TagTable, eq(PropertyTagTable.tagId, TagTable.id))
			.where(inArray(PropertyTagTable.propertyId, ids)),
	]);
	const ownerById = new Map(owners.map((owner) => [owner.id, owner]));
	const imageByProperty = new Map<string, string>();
	for (const image of images) {
		if (!imageByProperty.has(image.propertyId)) {
			imageByProperty.set(image.propertyId, image.imgUrl);
		}
	}
	const tagsByProperty = new Map<string, string[]>();
	for (const row of tagRows) {
		const list = tagsByProperty.get(row.propertyId) ?? [];
		list.push(row.tagName);
		tagsByProperty.set(row.propertyId, list);
	}

	return properties.map((property) => {
		const owner = ownerById.get(property.ownerId);
		return {
			...property,
			ownerEmail: owner?.email ?? 'Unknown',
			ownerName: owner ? ownerDisplayName(owner.firstName, owner.lastName, owner.email) : 'Owner',
			image: imageByProperty.get(property.id) ?? LISTING_IMAGE_PLACEHOLDER,
			tags: tagsByProperty.get(property.id) ?? [],
		};
	});
}

export async function approvePropertyListing(propertyId: string, adminId: string) {
	const [property] = await db
		.update(PropertyTable)
		.set({
			listingStatus: 'APPROVED',
			listingRejectionReason: null,
			listingRejectionReasonCode: null,
			listingAllowsResubmit: null,
			listingReviewedBy: adminId,
			listingReviewedAt: new Date(),
		})
		.where(
			and(
				eq(PropertyTable.id, propertyId),
				eq(PropertyTable.isDeleted, false),
				eq(PropertyTable.isDraft, false),
				eq(PropertyTable.listingStatus, 'PENDING_REVIEW'),
			),
		)
		.returning();

	return property ?? null;
}

export async function rejectPropertyListing(
	propertyId: string,
	adminId: string,
	input: {
		reasonCode: string;
		reason: string;
		allowsResubmit: boolean;
	},
) {
	const [property] = await db
		.update(PropertyTable)
		.set({
			listingStatus: 'REJECTED',
			listingRejectionReason: input.reason,
			listingRejectionReasonCode: input.reasonCode,
			listingAllowsResubmit: input.allowsResubmit,
			listingReviewedBy: adminId,
			listingReviewedAt: new Date(),
		})
		.where(
			and(
				eq(PropertyTable.id, propertyId),
				eq(PropertyTable.isDeleted, false),
				eq(PropertyTable.isDraft, false),
				eq(PropertyTable.listingStatus, 'PENDING_REVIEW'),
			),
		)
		.returning();

	return property ?? null;
}
