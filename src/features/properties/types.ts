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
