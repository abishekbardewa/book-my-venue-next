import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import { getBookingById } from '@/features/bookings/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { formatInr } from '@/lib/format';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'Payment successful',
	robots: { index: false, follow: false },
};

type PaymentSuccessPageProps = {
	searchParams: Promise<{ id?: string; fromPayment?: string }>;
};

function formatDateRange(startDate: string, endDate: string) {
	const formatter = new Intl.DateTimeFormat('en-IN', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

export default async function PaymentSuccessPage({
	searchParams,
}: PaymentSuccessPageProps) {
	const { id, fromPayment } = await searchParams;
	const { userId } = await getCurrentUser();
	if (!userId || !id || fromPayment !== '1') {
		redirect('/');
	}

	const booking = await getBookingById(id);
	if (!booking || booking.user.id !== userId) {
		redirect('/');
	}

	const payment = booking.payments[0];

	return (
		<main className="page-container flex min-h-[70vh] items-center justify-center py-12">
			<div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-sm">
				<div className="flex justify-center">
					<CircleCheck className="size-12 text-green-600" aria-hidden />
				</div>
				<div className="mt-4 text-center">
					<h1 className="text-xl font-semibold">Payment successful</h1>
					<h2 className="mt-5 text-lg font-medium">Booking Confirmation</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Dear {booking.user.firstName}, thank you for your booking.
					</p>
				</div>

				<dl className="mt-6 divide-y divide-border rounded-xl border border-border px-3 text-sm">
					<div className="flex justify-between gap-4 py-3">
						<dt className="font-medium">Booking ID</dt>
						<dd>{booking.id.slice(0, 8).toUpperCase()}</dd>
					</div>
					<div className="flex justify-between gap-4 py-3">
						<dt className="font-medium">Property</dt>
						<dd className="text-right">{booking.property.propertyName}</dd>
					</div>
					<div className="flex justify-between gap-4 py-3">
						<dt className="font-medium">Event Date</dt>
						<dd className="text-right">
							{formatDateRange(booking.startDate, booking.endDate)}
						</dd>
					</div>
					<div className="flex justify-between gap-4 py-3">
						<dt className="font-medium">Booking Status</dt>
						<dd>{booking.bookingStatus.replaceAll('_', ' ')}</dd>
					</div>
					<div className="flex justify-between gap-4 py-3">
						<dt className="font-medium">Amount Paid</dt>
						<dd>
							{payment ? formatInr(payment.amount) : '—'}{' '}
							{payment ? `· ${payment.status}` : ''}
						</dd>
					</div>
				</dl>

				<div className="mt-6 text-center text-sm text-muted-foreground">
					<p>
						Your booking is currently{' '}
						<span className="font-medium text-amber-600">
							{booking.bookingStatus.replaceAll('_', ' ')}
						</span>
						.
					</p>
					<p>We will notify you once it is approved.</p>
				</div>

				<div className="mt-8 grid gap-2 sm:grid-cols-2">
					<Link href="/" className={buttonVariants({ variant: 'outline' })}>
						Back to Home
					</Link>
					<Link href="/bookings" className={buttonVariants()}>
						Check Bookings
					</Link>
				</div>
			</div>
		</main>
	);
}
