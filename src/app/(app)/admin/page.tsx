import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'Admin',
	robots: { index: false, follow: false },
};

export default function AdminHomePage() {
	return (
		<section className="page-container py-10">
			<h1 className="text-2xl font-semibold tracking-tight">Admin home</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Platform admin tools will land here.
			</p>
			<Link href="/" className={buttonVariants({ className: 'mt-6' })}>
				Browse venues
			</Link>
		</section>
	);
}
