import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { formatInr, formatTagLabel } from '@/lib/format';
import type { PublicListing } from '@/features/properties/types';

type ListingCardProps = {
	listing: PublicListing;
	index: number;
};

export function ListingCard({ listing, index }: ListingCardProps) {
	const category = listing.tags[0] ? formatTagLabel(listing.tags[0]) : null;
	const avgRating =
		listing.reviews.length > 0
			? listing.reviews.reduce((sum, review) => sum + review.rating, 0) /
				listing.reviews.length
			: null;

	return (
		<Link
			href={`/listings/${listing.id}`}
			className="listing-card group flex h-full flex-col overflow-hidden border border-structural-border bg-card transition-[transform,border-color,box-shadow] duration-300 motion-safe:hover:-translate-y-0.5 hover:border-primary"
			style={{ animationDelay: `${Math.min(index, 9) * 50}ms` }}
		>
			<div className="relative h-64 w-full overflow-hidden bg-muted">
				<Image
					src={listing.image}
					alt={listing.propertyName}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
					className="object-cover transition-transform duration-700 group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-foreground/10 transition-opacity duration-300 group-hover:opacity-0" />
				{category ? (
					<span className="absolute top-4 left-4 border border-structural-border bg-card px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-ink uppercase">
						{category}
					</span>
				) : null}
			</div>

			<div className="flex flex-1 flex-col gap-3 p-5">
				<div className="flex items-start justify-between gap-3">
					<h3 className="font-headline truncate text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-ink">
						{listing.propertyName}
					</h3>
					{avgRating !== null ? (
						<span className="shrink-0 text-xs font-semibold text-foreground">
							{avgRating.toFixed(1)}
							<span className="font-normal text-muted-foreground">
								{' '}
								({listing.reviews.length})
							</span>
						</span>
					) : null}
				</div>

				<p className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<MapPin className="size-3.5 shrink-0" aria-hidden />
					{listing.city}, {listing.country}
				</p>

				<div className="mt-auto flex items-end justify-between gap-3 border-t border-structural-border pt-4">
					<p className="text-sm text-foreground">
						<span className="font-headline text-lg font-semibold">
							{formatInr(listing.price)}
						</span>{' '}
						<span className="text-muted-foreground">/ day</span>
					</p>
					<span className="label-caps text-[10px] text-muted-foreground">
						{listing.capacity} guests
					</span>
				</div>
			</div>
		</Link>
	);
}
