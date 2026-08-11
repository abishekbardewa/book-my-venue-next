import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Profile',
	robots: { index: false, follow: false },
};

export default function OwnerProfilePage() {
	return (
		<section className="page-container py-10">
			<h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
			<p className="mt-2 text-sm text-muted-foreground">Coming soon</p>
		</section>
	);
}
