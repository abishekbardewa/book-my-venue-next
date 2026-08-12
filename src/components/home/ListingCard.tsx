import Image from 'next/image';
import Link from 'next/link';
import { formatInr } from '@/lib/format';
import type { PublicListing } from '@/features/properties/types';

type ListingCardProps = {
	listing: PublicListing;
	index: number;
};

export function ListingCard({ listing, index }: ListingCardProps) {
	return (
		<Link
			href={`/listings/${listing.id}`}
			className="listing-card group block"
			style={{ animationDelay: `${Math.min(index, 9) * 50}ms` }}
		>
			<div className="relative mb-2 aspect-[20/19] overflow-hidden rounded-xl bg-muted">
				<Image
					src={listing.image}
					alt={listing.propertyName}
					fill
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 16vw"
					className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
				/>
			</div>
			<div className="space-y-0.5 px-0.5">
				<h3 className="truncate text-sm font-medium tracking-normal text-foreground">
					{listing.propertyName}
				</h3>
				<p className="truncate text-[13px] text-muted-foreground">
					{listing.city}, {listing.country}
				</p>
				<p className="pt-0.5 text-[13px] text-foreground">
					<span className="font-medium">{formatInr(listing.price)}</span>{' '}
					<span className="text-muted-foreground">per day</span>
				</p>
			</div>
		</Link>
	);
}
