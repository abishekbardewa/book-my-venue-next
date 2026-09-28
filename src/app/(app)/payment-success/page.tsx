import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, CircleCheck } from 'lucide-react';
import { getBookingById } from '@/features/bookings/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { formatInr } from '@/lib/format';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
	const statusLabel = booking.bookingStatus.replaceAll('_', ' ');

	return (
		<main className="page-container-wide flex min-h-[70vh] items-center justify-center py-12 sm:py-16">
			<div className="w-full max-w-2xl border border-structural-border bg-card">
				<div className="border-b border-structural-border px-6 py-10 text-center sm:px-10">
					<div className="mx-auto flex size-14 items-center justify-center border border-structural-border bg-secondary">
						<CircleCheck className="size-7 text-primary" aria-hidden strokeWidth={1.5} />
					</div>
					<p className="label-caps mt-6 text-ink tracking-[0.15em]">Confirmed payment</p>
					<h1 className="mt-3 font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
						Payment successful
					</h1>
					<p className="mt-2 text-muted-foreground sm:text-lg">
						Dear {booking.user.firstName ?? 'there'}, thank you for your booking.
					</p>
				</div>

				<div className="border-b border-structural-border p-6 sm:p-8">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={booking.property.image}
							alt={booking.property.propertyName}
							className="h-40 w-full object-cover sm:h-36 sm:w-44 sm:shrink-0"
						/>
						<div className="min-w-0 flex-1">
							<p className="label-caps text-muted-foreground">
								REF · {booking.id.slice(0, 8).toUpperCase()}
							</p>
							<h2 className="mt-2 font-headline text-2xl font-semibold tracking-tight text-foreground">
								{booking.property.propertyName}
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								{formatDateRange(booking.startDate, booking.endDate)}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{booking.property.checkInTime} – {booking.property.checkOutTime}
							</p>
						</div>
					</div>

					<div className="mt-6 flex items-end justify-between gap-4 border-t border-structural-border pt-5">
						<div>
							<p className="label-caps text-muted-foreground">Total Amount</p>
							<p className="mt-1 font-headline text-2xl font-semibold text-foreground">
								{payment ? formatInr(payment.amount) : formatInr(booking.totalAmount)}
							</p>
						</div>
						<span className="border border-structural-border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
							{payment?.status === 'SUCCESS' ? 'Paid' : payment?.status ?? '—'}
						</span>
					</div>
				</div>

				<div className="space-y-3 px-6 py-6 text-center text-sm text-muted-foreground sm:px-10">
					<p>
						Your booking is currently{' '}
						<span className="font-semibold text-foreground">{statusLabel}</span>.
					</p>
					<p>We will notify you once the owner responds.</p>
				</div>

				<div className="grid gap-3 border-t border-structural-border p-6 sm:grid-cols-2 sm:p-8">
					<Link href="/bookings" className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
						View Bookings
						<ArrowRight className="size-4" aria-hidden />
					</Link>
					<Link
						href="/"
						className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
					>
						Back to Home
					</Link>
				</div>
			</div>
		</main>
	);
}
