'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	archivePropertyAction,
	deletePropertyForeverAction,
	restorePropertyAction,
} from '@/features/properties/actions';
import { Building2 } from 'lucide-react';
import type { PropertyRow } from '@/features/properties/db';
import { EmptyState } from '@/components/common/EmptyState';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type OwnerPropertyListProps = {
	properties: PropertyRow[];
};

type TabKey = 'all' | 'listings' | 'draft' | 'archive';

const TABS: { key: TabKey; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'listings', label: 'Listings' },
	{ key: 'draft', label: 'Draft' },
	{ key: 'archive', label: 'Archive' },
];

function statusLabel(property: PropertyRow) {
	if (property.isDeleted) {
		return 'Archived';
	}
	if (property.isDraft) {
		return 'Draft';
	}
	switch (property.listingStatus) {
		case 'PENDING_REVIEW':
			return 'Pending review';
		case 'APPROVED':
			return 'Approved';
		case 'REJECTED':
			return 'Rejected';
		default:
			return 'Submitted';
	}
}

function filterByTab(properties: PropertyRow[], tab: TabKey) {
	switch (tab) {
		case 'listings':
			return properties.filter((property) => !property.isDeleted && !property.isDraft);
		case 'draft':
			return properties.filter((property) => !property.isDeleted && property.isDraft);
		case 'archive':
			return properties.filter((property) => property.isDeleted);
		default:
			return properties;
	}
}

function emptyCopy(tab: TabKey) {
	switch (tab) {
		case 'listings':
			return {
				title: 'No listings yet',
				description: 'Submit a property for review to see it here.',
			};
		case 'draft':
			return {
				title: 'No drafts yet',
				description: 'Saved drafts will appear in this tab.',
			};
		case 'archive':
			return {
				title: 'No archived properties',
				description: 'Archived properties will show up here.',
			};
		default:
			return {
				title: 'No properties yet',
				description: 'Add your first property to get started.',
			};
	}
}

export function OwnerPropertyList({ properties }: OwnerPropertyListProps) {
	const [tab, setTab] = useState<TabKey>('all');
	const rows = filterByTab(properties, tab);

	return (
		<div className="space-y-4">
			<nav aria-label="Property filters" className="border-b border-border">
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
					icon={Building2}
					title={emptyCopy(tab).title}
					description={emptyCopy(tab).description}
					className="py-16"
				/>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border">
					<table className="w-full min-w-[40rem] text-left text-sm">
						<thead className="border-b border-border bg-secondary/40 text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">Property</th>
								<th className="px-4 py-3 font-medium">City</th>
								<th className="px-4 py-3 font-medium">Status</th>
								<th className="px-4 py-3 font-medium text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((property) => (
								<tr key={property.id} className="border-b border-border last:border-b-0">
									<td className="px-4 py-3 align-top">
										<p className="font-medium text-foreground">{property.propertyName}</p>
										{property.listingStatus === 'REJECTED' && property.listingRejectionReason ? (
											<p className="mt-1 text-[11px] text-destructive">
												{property.listingRejectionReason}
											</p>
										) : null}
									</td>
									<td className="px-4 py-3 align-top text-muted-foreground">
										{property.city || '—'}
									</td>
									<td className="px-4 py-3 align-top text-muted-foreground">
										{statusLabel(property)}
									</td>
									<td className="px-4 py-3 align-top">
										<div className="flex flex-wrap justify-end gap-2">
											{!property.isDeleted && (
												<Link
													href={`/owner/properties/${property.id}/edit`}
													className={buttonVariants({ variant: 'outline', size: 'sm' })}
												>
													{property.isDraft ? 'Continue' : 'Edit'}
												</Link>
											)}
											{!property.isDeleted ? (
												<form action={archivePropertyAction.bind(null, property.id)}>
													<Button type="submit" variant="outline" size="sm">
														Archive
													</Button>
												</form>
											) : (
												<>
													<form action={restorePropertyAction.bind(null, property.id)}>
														<Button type="submit" variant="outline" size="sm">
															Restore
														</Button>
													</form>
													<form action={deletePropertyForeverAction.bind(null, property.id)}>
														<Button type="submit" variant="destructive" size="sm">
															Delete forever
														</Button>
													</form>
												</>
											)}
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
