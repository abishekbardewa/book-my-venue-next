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
	{ key: 'details', label: 'Property details' },
	{ key: 'location', label: 'Location' },
	{ key: 'images', label: 'Images' },
	{ key: 'categories', label: 'Categories & amenities' },
	{ key: 'extra', label: 'Additional info' },
] as const;

export type PropertyFormStepKey = (typeof PROPERTY_FORM_STEPS)[number]['key'];
