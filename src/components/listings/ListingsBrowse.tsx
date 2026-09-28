'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2 } from 'lucide-react';
import type { PublicListing } from '@/features/properties/types';
import { EmptyState } from '@/components/common/EmptyState';
import { ListingCard } from '@/components/home/ListingCard';
import { ListingSearch } from '@/components/home/ListingSearch';
import { buildListingsHref } from '@/lib/listings-search';
import { formatTagLabel } from '@/lib/format';

const PAGE_SIZE = 12;

type ListingsResponse = {
	data: PublicListing[];
	totalCount: number;
	hasMore: boolean;
};

export function ListingsBrowse() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const city = searchParams.get('city')?.trim() || 'all';
	const searchQuery = searchParams.get('q')?.trim() || '';
	const activeTag = searchParams.get('tag')?.trim() || '';

	const hasFilters = city !== 'all' || searchQuery.length > 0 || activeTag.length > 0;

	const [listings, setListings] = useState<PublicListing[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const requestIdRef = useRef(0);

	const replaceFilters = useCallback(
		(next: { city?: string; q?: string; tag?: string }) => {
			const nextCity = next.city ?? city;
			const nextQ = next.q ?? searchQuery;
			const nextTag = next.tag ?? activeTag;
			const href = buildListingsHref({
				city: nextCity,
				q: nextQ,
				tag: nextTag,
			});
			const current = buildListingsHref({ city, q: searchQuery, tag: activeTag });
			if (href === current) return;
			router.replace(href);
		},
		[activeTag, city, router, searchQuery]
	);

	const onSearchCommit = useCallback(
		(query: string) => {
			replaceFilters({ q: query });
		},
		[replaceFilters]
	);

	const loadPage = useCallback(
		async (pageToLoad: number, append: boolean) => {
			const requestId = ++requestIdRef.current;
			if (append) setLoadingMore(true);
			else setLoading(true);

			try {
				const params = new URLSearchParams();
				params.set('page', String(pageToLoad));
				params.set('limit', String(PAGE_SIZE));
				if (city !== 'all') params.set('city', city);
				if (searchQuery) params.set('q', searchQuery);
				if (activeTag) params.set('tag', activeTag);

				const response = await fetch(`/api/listings?${params.toString()}`);
				if (!response.ok) throw new Error('Could not load venues');
				const result = (await response.json()) as ListingsResponse;
				if (requestId !== requestIdRef.current) return;

				setTotalCount(result.totalCount);
				setHasMore(result.hasMore);
				setPage(pageToLoad);
				setListings((current) =>
					append ? [...current, ...result.data] : result.data
				);
			} catch {
				if (requestId !== requestIdRef.current) return;
				if (!append) {
					setListings([]);
					setTotalCount(0);
					setHasMore(false);
				}
			} finally {
				if (requestId === requestIdRef.current) {
					setLoading(false);
					setLoadingMore(false);
				}
			}
		},
		[activeTag, city, searchQuery]
	);

	useEffect(() => {
		setListings([]);
		setPage(1);
		setHasMore(true);
		void loadPage(1, false);
	}, [loadPage]);

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasMore || loading || loadingMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					void loadPage(page + 1, true);
				}
			},
			{ rootMargin: '240px 0px' }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [hasMore, loadPage, loading, loadingMore, page]);

	function clearFilters() {
		router.replace('/listings');
	}

	const resultsLabel = (() => {
		const count = `${totalCount} venue${totalCount === 1 ? '' : 's'}`;
		const parts: string[] = [];
		if (city !== 'all') parts.push(`in ${city}`);
		if (activeTag) parts.push(`· ${formatTagLabel(activeTag)}`);
		if (searchQuery) parts.push(`· “${searchQuery}”`);
		return parts.length > 0 ? `${count} ${parts.join(' ')}` : `${count} available`;
	})();

	return (
		<div className="page-container-wide py-10 sm:py-14">
			<header className="border-b border-structural-border pb-8">
				<h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
					Find your venue
				</h1>
				<p className="mt-2 max-w-2xl text-muted-foreground sm:text-lg">
					Filter by city and category, or search for a venue by name.
				</p>

				<div className="mt-8 w-full max-w-4xl">
					<ListingSearch
						listings={listings}
						city={city}
						category={activeTag}
						searchQuery={searchQuery}
						commitMode="submit"
						showCategory
						onCityChange={(nextCity) => {
							replaceFilters({ city: nextCity, q: '', tag: '' });
						}}
						onCategoryChange={(tag) => {
							replaceFilters({ tag });
						}}
						onSearchCommit={onSearchCommit}
					/>
				</div>
			</header>

			<section className="mt-10">
				<div className="mb-8 flex flex-col gap-3 border-b border-structural-border pb-5 sm:flex-row sm:items-end sm:justify-between">
					<h2 className="font-headline text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						{loading && listings.length === 0 ? 'Loading venues…' : resultsLabel}
					</h2>
					{hasFilters ? (
						<button
							type="button"
							onClick={clearFilters}
							className="label-caps text-ink transition-colors hover:text-foreground"
						>
							Clear all
						</button>
					) : null}
				</div>

				{!loading && listings.length === 0 ? (
					<EmptyState
						icon={Building2}
						title={hasFilters ? 'No properties found' : 'No properties yet'}
						description={
							hasFilters
								? 'Try a different city, search term, or category.'
								: 'Approved listings will show up here once owners publish them.'
						}
						action={
							hasFilters ? (
								<button
									type="button"
									onClick={clearFilters}
									className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
								>
									Clear filters
								</button>
							) : null
						}
					/>
				) : (
					<>
						<ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
							{listings.map((listing, index) => (
								<li key={listing.id}>
									<ListingCard listing={listing} index={index} />
								</li>
							))}
						</ul>
						<div ref={sentinelRef} className="h-10 w-full" aria-hidden />
						{loadingMore || (loading && listings.length > 0) ? (
							<p className="label-caps mt-4 text-center text-muted-foreground">
								Loading more
							</p>
						) : null}
						{!hasMore && listings.length > 0 ? (
							<p className="mt-4 text-center text-sm text-muted-foreground">
								You&apos;ve reached the end of the list.
							</p>
						) : null}
					</>
				)}
			</section>
		</div>
	);
}
