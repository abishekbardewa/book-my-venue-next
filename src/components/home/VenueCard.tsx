import Image from 'next/image';
import Link from 'next/link';
import { formatInr } from '@/lib/format';
import type { PublicVenue } from '@/features/properties/types';

type VenueCardProps = {
	venue: PublicVenue;
	index: number;
};

export function VenueCard({ venue, index }: VenueCardProps) {
	return (
		<Link
			href={`/venues/${venue.id}`}
			className="venue-card group block overflow-hidden rounded-lg border border-border/60 bg-card transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:bg-secondary/40 hover:shadow-md"
			style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }}
		>
			<div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
				<Image
					src={venue.image}
					alt={venue.propertyName}
					fill
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
					className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
				/>
			</div>
			<div className="space-y-1 p-3">
				<h3 className="text-base font-medium tracking-normal text-foreground">
					{venue.propertyName}
				</h3>
				<p className="text-sm text-muted-foreground">
					{venue.city}, {venue.country}
				</p>
				<p className="text-sm font-medium text-foreground">
					{formatInr(venue.price)}{' '}
					<span className="font-normal text-muted-foreground">per day</span>
				</p>
			</div>
		</Link>
	);
}
