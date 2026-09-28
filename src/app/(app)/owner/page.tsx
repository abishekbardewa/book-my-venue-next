import type { Metadata } from 'next';
import Link from 'next/link';
import {
	AddPropertyButton,
	PayoutPromptDialog,
} from '@/features/payments/components/OwnerPayoutGates';
import { arePayoutsEnabled, ownerHasActivePayouts } from '@/features/payments/payouts';
import { OwnerPropertyList } from '@/features/properties/components/OwnerPropertyList';
import { listOwnerProperties } from '@/features/properties/db';
import { getCurrentUser } from '@/features/users/getCurrentUser';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
	title: 'Listing Management',
	robots: { index: false, follow: false },
};

type OwnerHomePageProps = {
	searchParams: Promise<{ payoutPrompt?: string }>;
};

export default async function OwnerHomePage({ searchParams }: OwnerHomePageProps) {
	const { userId, user } = await getCurrentUser();
	const properties = userId ? await listOwnerProperties(userId) : [];
	const params = await searchParams;
	const canList = user ? ownerHasActivePayouts(user) : false;
	const showPayoutPrompt =
		arePayoutsEnabled() &&
		Boolean(params.payoutPrompt) &&
		user?.role === 'OWNER' &&
		user.payoutOnboardingStatus === 'NOT_STARTED';

	const active = properties.filter((property) => !property.isDeleted);
	const totalCount = active.length;
	const pendingCount = active.filter(
		(property) => !property.isDraft && property.listingStatus === 'PENDING_REVIEW'
	).length;
	const approvedCount = active.filter(
		(property) => !property.isDraft && property.listingStatus === 'APPROVED'
	).length;
	const rejectedCount = active.filter(
		(property) => !property.isDraft && property.listingStatus === 'REJECTED'
	).length;

	return (
		<section className="page-container-wide space-y-10 py-10 sm:py-14">
			{showPayoutPrompt ? <PayoutPromptDialog open /> : null}

			<div>
				<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
							Listings Management
						</h1>
						<p className="mt-2 text-muted-foreground sm:text-lg">
							Review and manage your venue listings.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Link
							href="/owner/bookings"
							className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
						>
							Manage Bookings
						</Link>
						<AddPropertyButton canList={canList} label="Add Listing" />
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard label="Total Listings" value={totalCount} />
					<StatCard
						label="Pending Review"
						value={pendingCount}
						dotClassName="bg-primary"
						labelClassName="text-ink"
					/>
					<StatCard
						label="Approved"
						value={approvedCount}
						dotClassName="bg-emerald-700"
						labelClassName="text-emerald-800"
					/>
					<StatCard
						label="Rejected"
						value={rejectedCount}
						dotClassName="bg-destructive"
						labelClassName="text-destructive"
					/>
				</div>
			</div>

			<OwnerPropertyList properties={properties} />
		</section>
	);
}

function StatCard({
	label,
	value,
	dotClassName,
	labelClassName,
}: {
	label: string;
	value: number;
	dotClassName?: string;
	labelClassName?: string;
}) {
	return (
		<div className="border border-structural-border bg-card p-4 sm:p-5">
			<p
				className={cn(
					'label-caps mb-2 flex items-center gap-2 text-muted-foreground',
					labelClassName
				)}
			>
				{dotClassName ? (
					<span className={cn('size-2 shrink-0', dotClassName)} aria-hidden />
				) : null}
				{label}
			</p>
			<p className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
				{value}
			</p>
		</div>
	);
}
