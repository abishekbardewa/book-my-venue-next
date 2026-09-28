'use client';

import { toast } from 'sonner';
import { reverseGeocode } from '@/features/maps/geocode';
import { matchListingCity } from '@/features/maps/city-match';

export async function resolveNearbyListingCity(): Promise<string | null> {
	if (!navigator.geolocation) {
		toast.error('Geolocation is not supported in this browser');
		return null;
	}

	try {
		const position = await new Promise<GeolocationPosition>((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject, {
				enableHighAccuracy: false,
				timeout: 12_000,
				maximumAge: 60_000,
			});
		});

		const { latitude, longitude } = position.coords;
		const resolved = await reverseGeocode(latitude, longitude);
		const city = resolved?.matchedListingCity ?? matchListingCity(resolved?.city) ?? resolved?.city;

		if (!city) {
			toast.error('Could not determine your city from this location');
			return null;
		}

		const matched = matchListingCity(city);
		if (!matched) {
			toast.error(`No listings filter for “${city}” yet. Pick a city from the list.`);
			return null;
		}

		toast.success(`Showing venues in ${matched}`);
		return matched;
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error) {
			toast.error('Location permission denied or unavailable');
		} else {
			toast.error('Could not reverse-geocode your location');
		}
		return null;
	}
}
