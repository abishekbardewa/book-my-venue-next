export const LISTING_REJECTION_REASONS = [
	{
		code: 'INCOMPLETE_DETAILS',
		label: 'Incomplete or unclear venue details',
		allowsResubmit: true,
	},
	{
		code: 'POOR_PHOTOS',
		label: 'Photos missing, low quality, or don’t show the space',
		allowsResubmit: true,
	},
	{
		code: 'UNCLEAR_PRICING',
		label: 'Pricing unclear or unrealistic',
		allowsResubmit: true,
	},
	{
		code: 'WRONG_CATEGORY',
		label: 'Wrong category / tags for this venue',
		allowsResubmit: true,
	},
	{
		code: 'LOCATION_ISSUE',
		label: 'Address or location details incomplete / incorrect',
		allowsResubmit: true,
	},
	{
		code: 'POLICY_VIOLATION',
		label: 'Violates platform listing policies',
		allowsResubmit: false,
	},
	{
		code: 'FAKE_OR_MISLEADING',
		label: 'Fake, duplicate, or misleading listing',
		allowsResubmit: false,
	},
	{
		code: 'OTHER',
		label: 'Other',
		allowsResubmit: true,
	},
] as const;

export type ListingRejectionReasonCode = (typeof LISTING_REJECTION_REASONS)[number]['code'];

export function getListingRejectionReason(code: string) {
	return LISTING_REJECTION_REASONS.find((reason) => reason.code === code) ?? null;
}

export function formatListingRejectionMessage(code: ListingRejectionReasonCode, note?: string) {
	const reason = getListingRejectionReason(code);
	if (!reason) return note?.trim() || 'Listing rejected';
	const trimmed = note?.trim();
	if (!trimmed) return reason.label;
	if (reason.code === 'OTHER') return trimmed;
	return `${reason.label}. ${trimmed}`;
}

export function canResubmitRejectedListing(listingAllowsResubmit: boolean | null) {
	return listingAllowsResubmit !== false;
}
