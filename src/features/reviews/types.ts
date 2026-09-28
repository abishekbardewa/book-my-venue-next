export type BookingReview = {
	id: string;
	rating: number;
	body: string;
};

export type ListingReview = {
	id: string;
	fullName: string;
	avatar: string | null;
	rating: number;
	review: string;
	createdAt: string;
};
