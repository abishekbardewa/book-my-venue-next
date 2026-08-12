'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { approveListingAction } from '@/features/admin/actions';
import { RejectListingDialog } from '@/features/admin/components/RejectListingDialog';
import type { AdminListingRow } from '@/features/properties/db';
import { EmptyState } from '@/components/common/EmptyState';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminListingListProps = {
	listings: AdminListingRow[];
};

type TabKey = 'pending' | 'approved' | 'rejected' | 'all';

const TABS: { key: TabKey; label: string }[] = [
	{ key: 'pending', label: 'Pending' },
	{ key: 'approved', label: 'Approved' },
	{ key: 'rejected', label: 'Rejected' },
	{ key: 'all', label: 'All' },
];

function statusLabel(listing: AdminListingRow) {
	switch (listing.listingStatus) {
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

function filterByTab(listings: AdminListingRow[], tab: TabKey) {
	switch (tab) {
		case 'pending':
			return listings.filter((listing) => listing.listingStatus === 'PENDING_REVIEW');
		case 'approved':
			return listings.filter((listing) => listing.listingStatus === 'APPROVED');
		case 'rejected':
			return listings.filter((listing) => listing.listingStatus === 'REJECTED');
		default:
			return listings;
	}
}

function emptyCopy(tab: TabKey) {
	switch (tab) {
		case 'pending':
			return {
				title: 'No listings waiting for review',
				description: 'New owner submissions will show up in this tab.',
			};
		case 'approved':
			return {
				title: 'No approved listings',
				description: 'Approved properties will appear here.',
			};
		case 'rejected':
			return {
				title: 'No rejected listings',
				description: 'Rejected submissions will appear here.',
			};
		default:
			return {
				title: 'No submitted listings yet',
				description: 'Submitted properties will appear here for moderation.',
			};
	}
}

export function AdminListingList({ listings }: AdminListingListProps) {
	const [tab, setTab] = useState<TabKey>('pending');
	const rows = filterByTab(listings, tab);

	return (
		<div className="space-y-4">
			<nav aria-label="Listing filters" className="border-b border-border">
				<ul className="flex gap-1 overflow-x-auto">
					{TABS.map((item) => {
						const active = tab === item.key;
						return (
							<li key={item.key} className="shrink-0">
								<button
									type="button"
									onClick={() => setTab(item.key)}
									className={cn(
										'px-3 py-2 text-sm transition-colors',
										active
											? 'border-b-2 border-foreground font-semibold text-foreground'
											: 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
									)}
								>
									{item.label}
								</button>
							</li>
						);
					})}
				</ul>
			</nav>

			{rows.length === 0 ? (
				<EmptyState
					icon={ClipboardList}
					title={emptyCopy(tab).title}
					description={emptyCopy(tab).description}
					className="py-16"
				/>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border">
					<table className="w-full min-w-[48rem] text-left text-sm">
						<thead className="border-b border-border bg-secondary/40 text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">Property</th>
								<th className="px-4 py-3 font-medium">City</th>
								<th className="px-4 py-3 font-medium">Owner</th>
								<th className="px-4 py-3 font-medium">Status</th>
								<th className="px-4 py-3 font-medium text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((listing) => (
								<tr key={listing.id} className="border-b border-border last:border-b-0">
									<td className="px-4 py-3 align-top">
										<p className="font-medium text-foreground">{listing.propertyName}</p>
										{listing.listingStatus === 'REJECTED' && listing.listingRejectionReason ? (
											<p className="mt-1 text-[11px] text-destructive">
												{listing.listingRejectionReason}
											</p>
										) : null}
									</td>
									<td className="px-4 py-3 align-top text-muted-foreground">
										{listing.city || '—'}
									</td>
									<td className="px-4 py-3 align-top text-muted-foreground">
										<p>{listing.ownerName}</p>
										<p className="text-[11px]">{listing.ownerEmail}</p>
									</td>
									<td className="px-4 py-3 align-top text-muted-foreground">
										{statusLabel(listing)}
									</td>
									<td className="px-4 py-3 align-top">
										<div className="flex flex-wrap justify-end gap-2">
											<Link
												href={`/admin/listings/${listing.id}`}
												className={buttonVariants({ variant: 'outline', size: 'sm' })}
											>
												View
											</Link>
											{listing.listingStatus === 'PENDING_REVIEW' ? (
												<>
													<form action={approveListingAction.bind(null, listing.id)}>
														<Button type="submit" size="sm">
															Approve
														</Button>
													</form>
													<RejectListingDialog
														listingId={listing.id}
														propertyName={listing.propertyName}
													/>
												</>
											) : null}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
