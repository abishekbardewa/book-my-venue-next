'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ImageIcon, MapPin } from 'lucide-react';
import {
	archivePropertyAction,
	deletePropertyForeverAction,
	restorePropertyAction,
} from '@/features/properties/actions';
import { PROPERTY_CATEGORIES } from '@/features/properties/constants';
import type { OwnerPropertyListItem } from '@/features/properties/db';
import { canResubmitRejectedListing } from '@/features/properties/rejectionReasons';
import { EmptyState } from '@/components/common/EmptyState';
import { Button, buttonVariants } from '@/components/ui/button';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { cn } from '@/lib/utils';

type OwnerPropertyListProps = {
	properties: OwnerPropertyListItem[];
};

type StatusFilter = 'all' | 'draft' | 'pending' | 'approved' | 'rejected' | 'archive';

const PAGE_SIZE = 20;
const STATUS_TABS: { status: StatusFilter; label: string }[] = [
	{ status: 'all', label: 'All' },
	{ status: 'pending', label: 'Pending' },
	{ status: 'approved', label: 'Approved' },
	{ status: 'rejected', label: 'Rejected' },
	{ status: 'draft', label: 'Draft' },
	{ status: 'archive', label: 'Archived' },
];

function statusMeta(property: OwnerPropertyListItem) {
	if (property.isDeleted) {
		return {
			key: 'archive' as const,
			label: 'Archived',
			className: 'border-structural-border bg-secondary/50 text-muted-foreground',
		};
	}
	if (property.isDraft) {
		return {
			key: 'draft' as const,
			label: 'Draft',
			className: 'border-structural-border bg-secondary/50 text-muted-foreground',
		};
	}
	switch (property.listingStatus) {
		case 'PENDING_REVIEW':
			return {
				key: 'pending' as const,
				label: 'Pending',
				className: 'border-primary/30 bg-secondary text-foreground',
			};
		case 'APPROVED':
			return {
				key: 'approved' as const,
				label: 'Approved',
				className: 'border-emerald-600/30 bg-emerald-600/10 text-emerald-800',
			};
		case 'REJECTED':
			return {
				key: 'rejected' as const,
				label: 'Rejected',
				className: 'border-destructive/30 bg-destructive/10 text-destructive',
			};
		default:
			return {
				key: 'pending' as const,
				label: 'Submitted',
				className: 'border-structural-border bg-secondary/50 text-muted-foreground',
			};
	}
}

function categoryLabel(tags: string[]) {
	if (tags.length === 0) return '—';
	return tags
		.map(
			(tag) =>
				PROPERTY_CATEGORIES.find((category) => category.tagName === tag)?.label ?? tag
		)
		.join(' / ');
}

function formatUpdated(value: Date | string) {
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat('en-IN', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(date);
}

function matchesFilter(property: OwnerPropertyListItem, filter: StatusFilter) {
	const meta = statusMeta(property);
	if (filter === 'all') return !property.isDeleted;
	if (filter === 'archive') return property.isDeleted;
	return meta.key === filter && !property.isDeleted;
}

export function OwnerPropertyList({ properties }: OwnerPropertyListProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [page, setPage] = useState(1);

	const rows = useMemo(
		() => properties.filter((property) => matchesFilter(property, statusFilter)),
		[properties, statusFilter]
	);

	const totalPages = Math.max(Math.ceil(rows.length / PAGE_SIZE), 1);
	const currentPage = Math.min(page, totalPages);
	const pagedRows = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE;
		return rows.slice(start, start + PAGE_SIZE);
	}, [currentPage, rows]);

	return (
		<div className="space-y-6">
			<nav
				className="flex flex-nowrap gap-2 overflow-x-auto pb-1"
				aria-label="Listing status"
			>
				{STATUS_TABS.map((tab) => {
					const active = statusFilter === tab.status;
					return (
						<button
							key={tab.status}
							type="button"
							onClick={() => {
								setStatusFilter(tab.status);
								setPage(1);
							}}
							className={cn(
								'shrink-0 border px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase transition-colors',
								active
									? 'border-foreground bg-foreground text-background'
									: 'border-structural-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground'
							)}
						>
							{tab.label}
						</button>
					);
				})}
			</nav>

			{rows.length === 0 ? (
				<div className="border border-structural-border bg-card">
					<EmptyState
						icon={ImageIcon}
						title={statusFilter !== 'all' ? 'No matches' : 'No venues yet'}
						description={
							statusFilter !== 'all'
								? 'No listings in this status.'
								: 'Add your first listing to get started.'
						}
						className="py-16"
					/>
				</div>
			) : (
				<div className="overflow-x-auto border border-structural-border bg-card">
					<table className="w-full min-w-[800px] border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-structural-border bg-secondary/60">
								<th className="label-caps px-4 py-3 font-semibold text-muted-foreground">
									Venue Name & Details
								</th>
								<th className="label-caps px-4 py-3 font-semibold text-muted-foreground">
									Category
								</th>
								<th className="label-caps px-4 py-3 font-semibold text-muted-foreground">
									Updated
								</th>
								<th className="label-caps px-4 py-3 font-semibold text-muted-foreground">
									Status
								</th>
								<th className="label-caps px-4 py-3 text-right font-semibold text-muted-foreground">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-structural-border">
							{pagedRows.map((property) => {
								const status = statusMeta(property);
								return (
									<tr
										key={property.id}
										className="group transition-colors hover:bg-secondary/50"
									>
										<td className="px-4 py-3">
											<div className="flex items-center gap-4">
												<div className="size-12 shrink-0 overflow-hidden border border-structural-border bg-muted">
													{property.image ? (
														// eslint-disable-next-line @next/next/no-img-element
														<img
															src={property.image}
															alt=""
															className="size-full object-cover"
														/>
													) : (
														<div className="flex size-full items-center justify-center text-muted-foreground">
															<ImageIcon className="size-4" aria-hidden />
														</div>
													)}
												</div>
												<div>
													<p
														className={cn(
															'font-semibold text-foreground',
															status.key === 'rejected' && 'opacity-50 line-through'
														)}
													>
														{property.propertyName}
													</p>
													<p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
														<MapPin className="size-3.5 shrink-0" aria-hidden />
														{property.city || '—'}
													</p>
													{status.key === 'rejected' &&
													property.listingRejectionReason ? (
														<p className="mt-1 max-w-xs text-[11px] text-destructive">
															{property.listingRejectionReason}
															{property.listingAllowsResubmit === false
																? ' (final)'
																: ''}
														</p>
													) : null}
												</div>
											</div>
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{categoryLabel(property.tags)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatUpdated(property.updatedAt)}
										</td>
										<td className="px-4 py-3">
											<span
												className={cn(
													'inline-block border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
													status.className
												)}
											>
												{status.label}
											</span>
										</td>
										<td className="px-4 py-3">
											<div className="flex justify-end gap-2">
												{!property.isDeleted ? (
													<>
														{property.listingStatus === 'REJECTED' &&
														!canResubmitRejectedListing(
															property.listingAllowsResubmit
														) ? (
															<span className="inline-flex items-center px-2 text-xs text-muted-foreground">
																Cannot resubmit
															</span>
														) : (
															<Link
																href={`/owner/properties/${property.id}/edit`}
																className={cn(
																	buttonVariants({
																		variant: 'outline',
																		size: 'sm',
																	}),
																	'border-primary text-ink hover:bg-primary hover:text-primary-foreground'
																)}
															>
																{property.isDraft
																	? 'Continue'
																	: property.listingStatus === 'REJECTED'
																		? 'Fix & resubmit'
																		: 'Edit'}
															</Link>
														)}
														<form
															action={archivePropertyAction.bind(null, property.id)}
														>
															<Button type="submit" variant="outline" size="sm">
																Archive
															</Button>
														</form>
													</>
												) : (
													<>
														<form
															action={restorePropertyAction.bind(null, property.id)}
														>
															<Button type="submit" variant="outline" size="sm">
																Restore
															</Button>
														</form>
														<form
															action={deletePropertyForeverAction.bind(
																null,
																property.id
															)}
														>
															<Button type="submit" variant="destructive" size="sm">
																Delete
															</Button>
														</form>
													</>
												)}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{rows.length > 0 ? (
				<>
					<p className="text-sm text-muted-foreground">
						Showing {(currentPage - 1) * PAGE_SIZE + 1}–
						{Math.min(currentPage * PAGE_SIZE, rows.length)} of {rows.length}{' '}
						{rows.length === 1 ? 'entry' : 'entries'}
					</p>
					<PaginationControls
						page={currentPage}
						totalPages={totalPages}
						align="end"
						className="mt-4"
						onPageChange={setPage}
					/>
				</>
			) : null}
		</div>
	);
}
