export type PublicListing = {
	id: string;
	propertyName: string;
	city: string;
	country: string;
	price: number;
	image: string;
	tags: string[];
	images: string[];
	address: string;
	description: string;
	extraInfo: string;
	capacity: number;
	amenities: string[];
	ownerName: string;
	ownerFirstName: string | null;
	ownerLastName: string | null;
	ownerId: string;
	ownerEmail: string;
	ownerPhone: string | null;
	ownerAvatar: string | null;
	checkInTime: string;
	checkOutTime: string;
	/** Booking ranges that block the calendar (old property.detail include). */
	blockingBookings: {
		startDate: string;
		endDate: string;
	}[];
	reviews: {
		id: string;
		fullName: string;
		rating: number;
		review: string;
		createdAt: string;
	}[];
};

export type AdminListingDetail = PublicListing & {
	listingStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | null;
	ownerEmail: string;
	listingRejectionReason: string | null;
	listingReviewedAt: string | null;
};

export const LISTING_IMAGE_PLACEHOLDER =
	'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
