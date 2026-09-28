import { NextResponse } from 'next/server';
import { searchNominatim } from '@/features/maps/nominatim';

export async function GET(request: Request) {
	const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
	if (query.length < 2) {
		return NextResponse.json({ success: true, data: [] });
	}

	try {
		const data = await searchNominatim(query);
		return NextResponse.json({ success: true, data });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: error instanceof Error ? error.message : 'Address search failed',
			},
			{ status: 502 }
		);
	}
}
