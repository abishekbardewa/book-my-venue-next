import { NextResponse } from 'next/server';
import { listApprovedListingsPage } from '@/features/properties/db';

export async function GET(request: Request) {
	const searchParams = new URL(request.url).searchParams;
	const city = searchParams.get('city')?.trim() || undefined;
	const q = searchParams.get('q')?.trim() || undefined;
	const tag = searchParams.get('tag')?.trim() || undefined;
	const page = Math.max(Number(searchParams.get('page')) || 1, 1);
	const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 12, 1), 48);

	const result = await listApprovedListingsPage({ city, q, tag, page, limit });

	return NextResponse.json({
		message: 'success',
		success: true,
		data: result.listings,
		totalCount: result.totalCount,
		page: result.page,
		limit: result.limit,
		hasMore: result.hasMore,
	});
}
