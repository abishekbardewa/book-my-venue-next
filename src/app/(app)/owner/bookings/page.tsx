import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Bookings',
	robots: { index: false, follow: false },
};

export default function OwnerBookingsPage() {
	return (
		<section className="page-container py-10">
			<h1 className="text-2xl font-semibold tracking-tight">Booking</h1>
			<p className="mt-2 text-sm text-muted-foreground">Coming soon</p>
		</section>
	);
}
