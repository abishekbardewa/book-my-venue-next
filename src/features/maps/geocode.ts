import type { NominatimSearchHit, ResolvedLocation } from '@/features/maps/types';

export type { ResolvedLocation, NominatimSearchHit };

export async function reverseGeocode(
	lat: number,
	lng: number
): Promise<ResolvedLocation | null> {
	const response = await fetch(
		`/api/maps/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`
	);
	if (!response.ok) {
		return null;
	}
	const result = (await response.json()) as {
		success?: boolean;
		data?: ResolvedLocation | null;
	};
	return result.data ?? null;
}

export async function searchAddresses(query: string): Promise<NominatimSearchHit[]> {
	const response = await fetch(`/api/maps/search?q=${encodeURIComponent(query)}`);
	if (!response.ok) {
		return [];
	}
	const result = (await response.json()) as {
		success?: boolean;
		data?: NominatimSearchHit[];
	};
	return result.data ?? [];
}
