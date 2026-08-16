import Link from 'next/link';
import { ArrowLeft, MapPin, Star, Users } from 'lucide-react';
import { formatTagLabel } from '@/lib/format';
import type { PublicListing } from '@/features/properties/types';
import { ListingGallery } from '@/components/listings/ListingGallery';
import { ListingReservationCard } from '@/components/listings/ListingReservationCard';

type ListingDetailViewProps = {
	listing: PublicListing;
	currentUser: {
		id: string;
		role: 'CUSTOMER' | 'OWNER' | 'PLATFORM_ADMIN';
		firstName: string | null;
		lastName: string | null;
		email: string;
		phone: string | null;
		avatar: string | null;
	} | null;
};

export function ListingDetailView({ listing, currentUser }: ListingDetailViewProps) {
	return (
		<div className="page-container space-y-8 py-8">
			<div className="space-y-3">
				<Link
					href="/"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-4" aria-hidden />
					Back to listings
				</Link>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						{listing.propertyName}
					</h1>
					<p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
						<MapPin className="size-4 shrink-0" aria-hidden />
						{listing.city}, {listing.country}
					</p>
				</div>
			</div>

			<ListingGallery propertyName={listing.propertyName} images={listing.images} />

			<div className="grid gap-10 md:grid-cols-7 md:gap-16">
				<div className="space-y-8 md:col-span-4">
					<ul className="flex flex-wrap gap-2">
						{listing.tags.map((tag) => (
							<li
								key={tag}
								className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground capitalize"
							>
								{formatTagLabel(tag)}
							</li>
						))}
					</ul>

					<div className="flex items-center justify-between gap-4 border-b border-border pb-6">
						<div>
							<p className="font-medium text-foreground">Owned By {listing.ownerName}</p>
							<p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
								<Users className="size-4" aria-hidden />
								{listing.capacity} Capacity
							</p>
						</div>
						<div className="flex size-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
							{listing.ownerName.slice(0, 1)}
						</div>
					</div>

					<section className="space-y-2">
						<h2 className="text-xl font-medium text-foreground">Description</h2>
						<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
							{listing.description}
						</p>
					</section>

					<section className="space-y-2">
						<h2 className="text-xl font-medium text-foreground">Address</h2>
						<p className="text-sm text-muted-foreground sm:text-base">{listing.address}</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-medium text-foreground">What this place offers</h2>
						<ul className="grid gap-2 sm:grid-cols-2">
							{listing.amenities.map((item) => (
								<li key={item} className="flex items-center gap-2 text-sm text-foreground">
									<span className="size-1.5 rounded-full bg-primary" aria-hidden />
									{item}
								</li>
							))}
						</ul>
					</section>

					<section className="space-y-2">
						<h2 className="text-xl font-medium text-foreground">Extra Information</h2>
						<p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
							{listing.extraInfo}
						</p>
					</section>
				</div>

				<div className="order-first md:order-last md:col-span-3">
					<div className="md:sticky md:top-24">
						<ListingReservationCard listing={listing} currentUser={currentUser} />
					</div>
				</div>
			</div>

			<section className="space-y-3 border-t border-border pt-8">
				<h2 className="text-xl font-medium text-foreground">Location</h2>
				<div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/50 px-6 text-center text-sm text-muted-foreground sm:h-[360px]">
					Map placeholder — Google Maps will plug in later
				</div>
				<p className="text-sm text-muted-foreground">{listing.address}</p>
			</section>

			<section className="space-y-4 border-t border-border pt-8 pb-4">
				<h2 className="text-xl font-medium text-foreground">Reviews</h2>
				{listing.reviews.length === 0 ? (
					<p className="text-sm text-muted-foreground">No reviews yet.</p>
				) : (
					<ul className="grid gap-4 md:grid-cols-2">
						{listing.reviews.map((review) => (
							<li
								key={review.id}
								className="rounded-3xl border border-border bg-card p-5 shadow-sm"
							>
								<div className="flex items-center justify-between gap-3">
									<p className="font-medium text-foreground">{review.fullName}</p>
									<p className="inline-flex items-center gap-1 text-sm text-foreground">
										<Star className="size-3.5 fill-current" aria-hidden />
										{review.rating}
									</p>
								</div>
								<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
									{review.review}
								</p>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
