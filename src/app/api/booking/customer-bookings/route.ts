import { NextResponse } from 'next/server';
import { BOOKING_STATUSES, type BookingStatus } from '@/features/bookings/constants';
import { listCustomerBookings } from '@/features/bookings/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export async function GET(request: Request) {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
	}
	if (user.role !== 'CUSTOMER') {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	const searchParams = new URL(request.url).searchParams;
	const requestedStatus = searchParams.get('status') ?? 'AWAITING_OWNER_APPROVAL';
	const status = BOOKING_STATUSES.includes(requestedStatus as BookingStatus)
		? (requestedStatus as BookingStatus)
		: 'AWAITING_OWNER_APPROVAL';
	const page = Math.max(Number(searchParams.get('page')) || 1, 1);
	const limit = Math.max(Number(searchParams.get('limit')) || 5, 1);
	const result = await listCustomerBookings({ userId, status, page, limit });

	return NextResponse.json({
		message: 'success',
		data: result.bookings,
		status: 200,
		success: true,
		totalCount: result.totalCount,
		page,
		limit,
	});
}
