'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ClipboardList, ImageIcon, MapPin } from 'lucide-react';
import { approveListingAction } from '@/features/admin/actions';
import { RejectListingDialog } from '@/features/admin/components/RejectListingDialog';
import { PROPERTY_CATEGORIES } from '@/features/properties/constants';
import type { AdminListingRow } from '@/features/properties/db';
import { EmptyState } from '@/components/common/EmptyState';
import { Button, buttonVariants } from '@/components/ui/button';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { cn } from '@/lib/utils';

type AdminListingListProps = {
	listings: AdminListingRow[];
};

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const PAGE_SIZE = 20;
const STATUS_TABS: { status: StatusFilter; label: string }[] = [
	{ status: 'all', label: 'All' },
	{ status: 'pending', label: 'Pending' },
	{ status: 'approved', label: 'Approved' },
	{ status: 'rejected', label: 'Rejected' },
];

function statusMeta(listing: AdminListingRow) {
	switch (listing.listingStatus) {
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
				label: 'Unknown',
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

function formatSubmitted(value: Date | string) {
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat('en-IN', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(date);
}

export function AdminListingList({ listings }: AdminListingListProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
	const [page, setPage] = useState(1);

	const counts = useMemo(() => {
		return {
			total: listings.length,
			pending: listings.filter((item) => item.listingStatus === 'PENDING_REVIEW').length,
			approved: listings.filter((item) => item.listingStatus === 'APPROVED').length,
			rejected: listings.filter((item) => item.listingStatus === 'REJECTED').length,
		};
	}, [listings]);

	const rows = useMemo(
		() =>
			listings.filter((listing) => {
				if (statusFilter === 'all') return true;
				return statusMeta(listing).key === statusFilter;
			}),
		[listings, statusFilter]
	);

	const totalPages = Math.max(Math.ceil(rows.length / PAGE_SIZE), 1);
	const currentPage = Math.min(page, totalPages);
	const pagedRows = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE;
		return rows.slice(start, start + PAGE_SIZE);
	}, [currentPage, rows]);

	return (
		<div className="space-y-8">
			<div>
				<div className="mb-8">
					<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
						Listings Management
					</h1>
					<p className="mt-2 text-muted-foreground sm:text-lg">
						Review and manage venue submissions across the platform.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard label="Total Listings" value={counts.total} />
					<StatCard
						label="Pending Review"
						value={counts.pending}
						dotClassName="bg-primary"
						labelClassName="text-ink"
					/>
					<StatCard
						label="Approved"
						value={counts.approved}
						dotClassName="bg-emerald-700"
						labelClassName="text-emerald-800"
					/>
					<StatCard
						label="Rejected"
						value={counts.rejected}
						dotClassName="bg-destructive"
						labelClassName="text-destructive"
					/>
				</div>
			</div>

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
						icon={ClipboardList}
						title={statusFilter !== 'all' ? 'No matches' : 'No submitted listings'}
						description={
							statusFilter !== 'all'
								? 'No listings in this status.'
								: 'Owner submissions will appear here for moderation.'
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
									Owner
								</th>
								<th className="label-caps px-4 py-3 font-semibold text-muted-foreground">
									Category
								</th>
								<th className="label-caps px-4 py-3 font-semibold text-muted-foreground">
									Submitted
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
							{pagedRows.map((listing) => {
								const status = statusMeta(listing);
								return (
									<tr
										key={listing.id}
										className="transition-colors hover:bg-secondary/50"
									>
										<td className="px-4 py-3">
											<div className="flex items-center gap-4">
												<div className="size-12 shrink-0 overflow-hidden border border-structural-border bg-muted">
													{listing.image ? (
														// eslint-disable-next-line @next/next/no-img-element
														<img
															src={listing.image}
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
															status.key === 'rejected' &&
																'opacity-50 line-through'
														)}
													>
														{listing.propertyName}
													</p>
													<p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
														<MapPin className="size-3.5 shrink-0" aria-hidden />
														{listing.city || '—'}
													</p>
													{status.key === 'rejected' &&
													listing.listingRejectionReason ? (
														<p className="mt-1 max-w-xs text-[11px] text-destructive">
															{listing.listingRejectionReason}
														</p>
													) : null}
												</div>
											</div>
										</td>
										<td className="px-4 py-3">
											<p className="font-medium text-foreground">{listing.ownerName}</p>
											<p className="text-xs text-muted-foreground">{listing.ownerEmail}</p>
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{categoryLabel(listing.tags)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											<div>
												{formatSubmitted(listing.updatedAt)}
												{listing.listingSubmissionCount > 0 ? (
													<p className="mt-0.5 text-[11px]">
														{listing.listingSubmissionCount}× submitted
													</p>
												) : null}
											</div>
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
											{status.key === 'rejected' &&
											listing.listingAllowsResubmit === false ? (
												<p className="mt-1 text-[10px] tracking-wide text-destructive uppercase">
													Final
												</p>
											) : null}
										</td>
										<td className="px-4 py-3">
											<div className="flex justify-end gap-2">
												<Link
													href={`/admin/listings/${listing.id}`}
													className={cn(
														buttonVariants({ variant: 'outline', size: 'sm' }),
														listing.listingStatus === 'PENDING_REVIEW' &&
															'border-primary text-ink hover:bg-primary hover:text-primary-foreground'
													)}
												>
													{listing.listingStatus === 'PENDING_REVIEW'
														? 'Review'
														: 'View'}
												</Link>
												{listing.listingStatus === 'PENDING_REVIEW' ? (
													<>
														<form
															action={approveListingAction.bind(null, listing.id)}
														>
															<Button
																type="submit"
																size="sm"
																variant="outline"
																className="size-8 border-emerald-700 p-0 text-emerald-800"
																aria-label="Approve"
															>
																<Check className="size-4" aria-hidden />
															</Button>
														</form>
														<RejectListingDialog
															listingId={listing.id}
															propertyName={listing.propertyName}
															iconOnly
														/>
													</>
												) : null}
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
		<div className="border border-structural-border bg-card p-4 transition-[border-color] duration-200 hover:border-primary/50 sm:p-5">
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
