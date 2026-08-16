import { NextResponse } from 'next/server';
import {
	BookingDomainError,
	createPendingBooking,
} from '@/features/bookings/domain';
import { getCurrentUser } from '@/features/users/getCurrentUser';

export async function POST(request: Request) {
	const { userId, user } = await getCurrentUser();
	if (!userId || !user) {
		return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
	}
	if (user.role !== 'CUSTOMER') {
		return NextResponse.json(
			{ error: 'Only customers can create bookings' },
			{ status: 403 }
		);
	}

	const body = (await request.json()) as {
		propertyId?: string;
		startDate?: string;
		endDate?: string;
	};
	if (!body.propertyId || !body.startDate || !body.endDate) {
		return NextResponse.json({ error: 'Missing booking details' }, { status: 400 });
	}

	try {
		const booking = await createPendingBooking({
			propertyId: body.propertyId,
			startDate: body.startDate,
			endDate: body.endDate,
			userId,
		});

		return NextResponse.json({
			success: true,
			statusCode: 201,
			message: 'Booking held for payment',
			data: {
				bookingId: booking.id,
				holdExpiresAt: booking.holdExpiresAt.toISOString(),
			},
		});
	} catch (error) {
		if (error instanceof BookingDomainError) {
			return NextResponse.json(
				{ success: false, message: error.message },
				{ status: error.statusCode }
			);
		}
		console.error('Could not reserve booking:', error);
		return NextResponse.json(
			{ success: false, message: 'Could not reserve booking' },
			{ status: 500 }
		);
	}
}
