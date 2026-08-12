'use client';

import { approveListingAction } from '@/features/admin/actions';
import { RejectListingDialog } from '@/features/admin/components/RejectListingDialog';
import type { AdminListingDetail } from '@/features/properties/types';
import { formatInr } from '@/lib/format';
import { Button } from '@/components/ui/button';

type AdminReviewPanelProps = {
	listing: AdminListingDetail;
};

function statusLabel(status: AdminListingDetail['listingStatus']) {
	switch (status) {
		case 'PENDING_REVIEW':
			return 'Pending review';
		case 'APPROVED':
			return 'Approved';
		case 'REJECTED':
			return 'Rejected';
		default:
			return 'Unknown';
	}
}

export function AdminReviewPanel({ listing }: AdminReviewPanelProps) {
	const isPending = listing.listingStatus === 'PENDING_REVIEW';

	return (
		<aside className="rounded-xl border border-border bg-card p-5 shadow-lg">
			<p className="text-lg font-semibold text-foreground">
				{formatInr(listing.price)}{' '}
				<span className="text-sm font-normal text-muted-foreground">Per Day</span>
			</p>

			<dl className="mt-5 space-y-3 text-sm">
				<div>
					<dt className="text-muted-foreground">Status</dt>
					<dd className="mt-0.5 font-medium text-foreground">
						{statusLabel(listing.listingStatus)}
					</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Owner email</dt>
					<dd className="mt-0.5 break-all text-foreground">{listing.ownerEmail}</dd>
				</div>
				{listing.listingStatus === 'REJECTED' && listing.listingRejectionReason ? (
					<div>
						<dt className="text-muted-foreground">Rejection reason</dt>
						<dd className="mt-0.5 text-destructive">{listing.listingRejectionReason}</dd>
					</div>
				) : null}
				{listing.listingReviewedAt ? (
					<div>
						<dt className="text-muted-foreground">Reviewed</dt>
						<dd className="mt-0.5 text-foreground">
							{new Date(listing.listingReviewedAt).toLocaleString()}
						</dd>
					</div>
				) : null}
			</dl>

			{isPending ? (
				<div className="mt-6 flex flex-wrap gap-2">
					<form action={approveListingAction.bind(null, listing.id)}>
						<Button type="submit" size="sm">
							Approve
						</Button>
					</form>
					<RejectListingDialog listingId={listing.id} propertyName={listing.propertyName} />
				</div>
			) : null}
		</aside>
	);
}
