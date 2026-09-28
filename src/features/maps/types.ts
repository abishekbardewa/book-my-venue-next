export type ResolvedLocation = {
	lat: number;
	lng: number;
	address: string;
	city: string | null;
	country: string | null;
	pincode: string | null;
	matchedListingCity: string | null;
};

export type NominatimSearchHit = {
	lat: number;
	lng: number;
	label: string;
	address: string;
	city: string | null;
	country: string | null;
	pincode: string | null;
	matchedListingCity: string | null;
};
