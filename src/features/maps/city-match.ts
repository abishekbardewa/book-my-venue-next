import { PROPERTY_CITIES } from '@/features/properties/constants';

const CITY_ALIASES: Record<string, (typeof PROPERTY_CITIES)[number]> = {
	bangalore: 'Bengaluru',
	bengalooru: 'Bengaluru',
	bombay: 'Mumbai',
	calcutta: 'Kolkata',
	madras: 'Chennai',
};

function normalizeCity(value: string) {
	return value
		.trim()
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '');
}

export function matchListingCity(rawCity: string | null | undefined): string | null {
	if (!rawCity?.trim()) {
		return null;
	}

	const normalized = normalizeCity(rawCity);
	const alias = CITY_ALIASES[normalized];
	if (alias) {
		return alias;
	}

	const exact = PROPERTY_CITIES.find((city) => normalizeCity(city) === normalized);
	if (exact) {
		return exact;
	}

	const partial = PROPERTY_CITIES.find((city) => normalized.includes(normalizeCity(city)) || normalizeCity(city).includes(normalized));
	return partial ?? null;
}
