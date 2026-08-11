import type { Metadata } from 'next';
import Link from 'next/link';
import { OwnerPropertyList } from '@/features/properties/components/OwnerPropertyList';
import { listOwnerProperties } from '@/features/properties/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'Owner',
	robots: { index: false, follow: false },
};

export default async function OwnerHomePage() {
	const { userId } = await getCurrentUser();
	const properties = userId ? await listOwnerProperties(userId) : [];

	return (
		<section className="page-container space-y-8 py-10">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Your properties</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Save drafts anytime. Submit a listing when you are ready for review.
					</p>
				</div>
				<Link href="/owner/properties/new" className={buttonVariants()}>
					Add property
				</Link>
			</div>
			<OwnerPropertyList properties={properties} />
		</section>
	);
}
