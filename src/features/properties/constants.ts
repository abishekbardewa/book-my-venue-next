export const PROPERTY_CITIES = [
	'Mumbai',
	'Delhi',
	'Bengaluru',
	'Hyderabad',
	'Ahmedabad',
	'Chennai',
	'Kolkata',
	'Surat',
	'Pune',
	'Jaipur',
] as const;

export const PROPERTY_CATEGORIES = [
	{ label: 'Wedding', tagName: 'wedding' },
	{ label: 'Birthday', tagName: 'birthday' },
	{ label: 'Engagement', tagName: 'engagement' },
	{ label: 'Pool Party', tagName: 'pool-party' },
	{ label: 'Cocktail Party', tagName: 'cocktail-party' },
	{ label: 'Corporate Party', tagName: 'corporate-party' },
	{ label: 'Banquet Halls', tagName: 'banquet-halls' },
	{ label: 'Restaurants', tagName: 'restaurants' },
	{ label: 'Farm Houses', tagName: 'farm-houses' },
	{ label: 'Kitty Party', tagName: 'kitty-party' },
] as const;

export const PROPERTY_FORM_STEPS = [
	{ key: 'details', label: 'Property Details', shortLabel: 'Property Details' },
	{ key: 'location', label: 'Venue Location', shortLabel: 'Location' },
	{ key: 'images', label: 'Photos & Media', shortLabel: 'Photos & Media' },
	{ key: 'categories', label: 'Categories & Amenities', shortLabel: 'Categories' },
	{ key: 'extra', label: 'Additional Info', shortLabel: 'Additional Info' },
	{ key: 'review', label: 'Review & Submit', shortLabel: 'Review' },
] as const;

export const SUGGESTED_AMENITIES = [
	'High-Speed WiFi',
	'Climate Control',
	'Parking',
	'Sound System',
	'Projector',
	'Catering Kitchen',
	'Stage',
	'Wheelchair Accessible',
] as const;

export type PropertyFormStepKey = (typeof PROPERTY_FORM_STEPS)[number]['key'];
