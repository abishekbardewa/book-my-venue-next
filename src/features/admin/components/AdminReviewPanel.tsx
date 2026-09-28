'use client';

import { CheckCircle2, Mail, Phone } from 'lucide-react';
import { approveListingAction } from '@/features/admin/actions';
import { RejectListingDialog } from '@/features/admin/components/RejectListingDialog';
import type { AdminListingDetail } from '@/features/properties/types';
import { formatInr } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminReviewPanelProps = {
	listing: AdminListingDetail;
};

function statusLabel(status: AdminListingDetail['listingStatus']) {
	switch (status) {
		case 'PENDING_REVIEW':
			return 'Pending Review';
		case 'APPROVED':
			return 'Approved';
		case 'REJECTED':
			return 'Rejected';
		default:
			return 'Unknown';
	}
}

function statusTone(status: AdminListingDetail['listingStatus']) {
	switch (status) {
		case 'PENDING_REVIEW':
			return 'border-l-primary bg-secondary/60';
		case 'APPROVED':
			return 'border-l-emerald-700 bg-emerald-600/10';
		case 'REJECTED':
			return 'border-l-destructive bg-destructive/10';
		default:
			return 'border-l-structural-border bg-card';
	}
}

export function AdminReviewPanel({ listing }: AdminReviewPanelProps) {
	const isPending = listing.listingStatus === 'PENDING_REVIEW';

	return (
		<div className="flex flex-col gap-6">
			<div
				className={cn(
					'hidden items-center gap-3 border border-structural-border border-l-4 px-4 py-3 lg:flex',
					statusTone(listing.listingStatus)
				)}
			>
				<div className="flex flex-col">
					<span className="label-caps text-muted-foreground">Current Status</span>
					<span className="font-headline text-xl font-semibold text-foreground">
						{statusLabel(listing.listingStatus)}
					</span>
				</div>
			</div>

			<section className="border border-structural-border bg-card p-5">
				<h3 className="font-headline mb-4 border-b border-structural-border pb-3 text-xl font-semibold text-foreground">
					Review Actions
				</h3>
				<p className="mb-4 text-2xl font-semibold text-foreground">
					{formatInr(listing.price)}{' '}
					<span className="text-sm font-normal text-muted-foreground">/ day</span>
				</p>

				{listing.listingStatus === 'REJECTED' && listing.listingRejectionReason ? (
					<div className="mb-4 space-y-1">
						<p className="text-sm text-destructive">{listing.listingRejectionReason}</p>
						<p className="text-xs text-muted-foreground">
							{listing.listingAllowsResubmit === false
								? 'Final rejection — resubmit not allowed'
								: 'Owner may fix and resubmit'}
						</p>
					</div>
				) : null}

				{listing.listingSubmissionCount > 0 ? (
					<p className="mb-4 text-xs text-muted-foreground">
						Submitted {listing.listingSubmissionCount}{' '}
						{listing.listingSubmissionCount === 1 ? 'time' : 'times'}
					</p>
				) : null}

				{listing.listingReviewedAt ? (
					<p className="mb-4 text-xs text-muted-foreground">
						Reviewed {new Date(listing.listingReviewedAt).toLocaleString('en-IN')}
					</p>
				) : null}

				{isPending ? (
					<div className="flex flex-col gap-3">
						<form action={approveListingAction.bind(null, listing.id)}>
							<Button type="submit" size="lg" className="w-full gap-2">
								<CheckCircle2 className="size-4" aria-hidden />
								Approve Listing
							</Button>
						</form>
						<RejectListingDialog
							listingId={listing.id}
							propertyName={listing.propertyName}
						/>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						No pending actions for this listing.
					</p>
				)}
			</section>

			<section className="border border-structural-border bg-card p-5">
				<h3 className="label-caps mb-4 border-b border-structural-border pb-3 text-foreground">
					Submitted By
				</h3>
				<div className="flex items-center gap-4">
					<div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-card text-lg font-semibold text-foreground">
						{listing.ownerAvatar ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={listing.ownerAvatar}
								alt=""
								className="size-full object-cover"
							/>
						) : (
							listing.ownerName.slice(0, 1).toUpperCase()
						)}
					</div>
					<div>
						<p className="font-headline text-lg font-semibold text-foreground">
							{listing.ownerName}
						</p>
						<p className="text-sm text-muted-foreground">Venue owner</p>
					</div>
				</div>
				<div className="mt-4 space-y-2 border-t border-structural-border pt-4 text-sm">
					<a
						href={`mailto:${listing.ownerEmail}`}
						className="flex items-center gap-2 text-foreground transition-colors hover:text-foreground"
					>
						<Mail className="size-4 text-muted-foreground" aria-hidden />
						{listing.ownerEmail}
					</a>
					{listing.ownerPhone ? (
						<a
							href={`tel:${listing.ownerPhone}`}
							className="flex items-center gap-2 text-foreground transition-colors hover:text-foreground"
						>
							<Phone className="size-4 text-muted-foreground" aria-hidden />
							{listing.ownerPhone}
						</a>
					) : null}
				</div>
			</section>
		</div>
	);
}
