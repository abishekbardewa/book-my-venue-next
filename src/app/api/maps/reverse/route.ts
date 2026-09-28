import { NextResponse } from 'next/server';
import { reverseGeocodeNominatim } from '@/features/maps/nominatim';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const lat = Number.parseFloat(searchParams.get('lat') ?? '');
	const lng = Number.parseFloat(searchParams.get('lng') ?? '');

	if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
		return NextResponse.json(
			{ success: false, message: 'lat and lng are required' },
			{ status: 400 }
		);
	}

	try {
		const data = await reverseGeocodeNominatim(lat, lng);
		return NextResponse.json({ success: true, data });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: error instanceof Error ? error.message : 'Reverse geocode failed',
			},
			{ status: 502 }
		);
	}
}
