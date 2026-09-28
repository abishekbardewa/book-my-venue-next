import { matchListingCity } from '@/features/maps/city-match';
import type { NominatimSearchHit, ResolvedLocation } from '@/features/maps/types';

export type { NominatimSearchHit, ResolvedLocation };

type NominatimAddress = {
	house_number?: string;
	road?: string;
	pedestrian?: string;
	neighbourhood?: string;
	suburb?: string;
	village?: string;
	town?: string;
	city?: string;
	municipality?: string;
	county?: string;
	state_district?: string;
	state?: string;
	postcode?: string;
	country?: string;
};

type NominatimResult = {
	lat: string;
	lon: string;
	display_name?: string;
	address?: NominatimAddress;
};

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'BookMyVenue-Next/1.0 (hobby portfolio; local-dev)';

function cityFromAddress(address: NominatimAddress | undefined): string | null {
	if (!address) return null;
	return (
		address.city ||
		address.town ||
		address.village ||
		address.municipality ||
		address.suburb ||
		address.county ||
		null
	);
}

function streetLine(address: NominatimAddress | undefined): string {
	if (!address) return '';
	const road = address.road || address.pedestrian || '';
	if (address.house_number && road) {
		return `${address.house_number} ${road}`;
	}
	return road;
}

function toResolved(result: NominatimResult): ResolvedLocation {
	const lat = Number.parseFloat(result.lat);
	const lng = Number.parseFloat(result.lon);
	const city = cityFromAddress(result.address);
	const address = result.display_name?.trim() || streetLine(result.address) || '';

	return {
		lat,
		lng,
		address,
		city,
		country: result.address?.country ?? null,
		pincode: result.address?.postcode ?? null,
		matchedListingCity: matchListingCity(city),
	};
}

async function nominatimFetch(path: string, params: Record<string, string>) {
	const url = new URL(path, NOMINATIM_BASE);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}

	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
			'User-Agent': USER_AGENT,
		},
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new Error(`Nominatim request failed (${response.status})`);
	}

	return response.json();
}

export async function reverseGeocodeNominatim(
	lat: number,
	lng: number
): Promise<ResolvedLocation | null> {
	const data = (await nominatimFetch('/reverse', {
		lat: String(lat),
		lon: String(lng),
		format: 'json',
		addressdetails: '1',
	})) as NominatimResult | { error?: string };

	if (!('lat' in data) || !data.lat || !data.lon) {
		return null;
	}

	return toResolved(data);
}

export async function searchNominatim(query: string): Promise<NominatimSearchHit[]> {
	const trimmed = query.trim();
	if (trimmed.length < 2) {
		return [];
	}

	const results = (await nominatimFetch('/search', {
		q: trimmed,
		format: 'json',
		addressdetails: '1',
		limit: '5',
	})) as NominatimResult[];

	if (!Array.isArray(results)) {
		return [];
	}

	return results.map((result) => {
		const resolved = toResolved(result);
		const label = result.display_name?.trim() || resolved.address;
		return {
			lat: resolved.lat,
			lng: resolved.lng,
			label,
			address: label,
			city: resolved.city,
			country: resolved.country,
			pincode: resolved.pincode,
			matchedListingCity: resolved.matchedListingCity,
		};
	});
}
