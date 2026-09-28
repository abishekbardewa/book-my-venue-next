import { NextResponse } from 'next/server';
import { getBookingById } from '@/features/bookings/db';
import { releasePendingBooking } from '@/features/bookings/domain';
import { getCurrentUser } from '@/features/users/getCurrentUser';

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function PUT(_request: Request, { params }: RouteContext) {
	const { userId } = await getCurrentUser();
	if (!userId) {
		return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
	}

	const { id } = await params;
	const booking = await getBookingById(id);
	if (!booking || booking.user.id !== userId) {
		return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
	}

	await releasePendingBooking(id, userId);
	return NextResponse.json({
		message: 'success',
		status: 200,
		success: true,
	});
}
